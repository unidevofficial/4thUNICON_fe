# Supabase 연동 (4th-unicon)

프론트엔드 연동은 **완료된 상태**다. 이 문서는 스키마·API·제약사항 레퍼런스이자, 연동 과정에서 실제로 걸렸던 함정들의 기록이다.

스키마 변경 작업은 `C:\Project\4thUNICON_supabase` 쪽에서 진행했다.

---

## 1. 접속 정보

| 항목 | 값 |
|---|---|
| Project ref | `wrmmtlzhuhwmcyrhwhiq` |
| Project URL | `https://wrmmtlzhuhwmcyrhwhiq.supabase.co` |
| anon key | 로컬 `.env` / GitHub Variables 참고 |

> 작년 프로젝트(`unicon` / ref `worambglnevbonzeeiun`)는 **읽기 전용**이다. 절대 쓰기 작업을 하지 않는다.

anon key는 번들에 그대로 노출되는 게 **정상**이다. 공개를 전제로 설계된 키이고 실제 권한은 RLS가 통제한다.
service_role 키는 RLS를 통째로 우회하므로 프론트에 절대 두지 않는다.

### 배포 환경변수

GitHub 리포지토리 → Settings → Secrets and variables → Actions → **Variables** 탭에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 등록.

워크플로우가 `${{ vars.* }}` 로 참조하므로 **Secrets 탭에 넣으면 빈 값이 된다.** `${{ vars.X }}` 는 없는 변수를 조용히 빈 문자열로 치환하기 때문에 빌드는 초록불로 성공하는데 사이트만 죽는다. 실제로 이 문제로 한 번 흰 화면이 났다.

---

## 2. 스키마

테이블 5개 + 뷰 1개. 작년 구조를 그대로 이관했다.

### `project` — 출품작

| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | uuid | PK |
| `title` | text | **필수** |
| `team_name` | text | nullable |
| `team_type` | text | **필수**, `'challenger'` \| `'rookie'` (CHECK 제약) |
| `description` | text | nullable |
| `platform` | text[] | `pc` / `mobile` / `web` (**제약 없음**, 주의사항 참고) |
| `video_url` | text | nullable |
| `download_url` | text | nullable |
| `banner_image` | text | nullable, Storage 경로 |
| `gallery_images` | text[] | nullable, Storage 경로 배열 |
| `created_at` / `updated_at` | timestamptz | `updated_at`은 트리거로 자동 갱신 |

### `genre` / `project_genre`

- `genre.name` 은 unique. 현재 **46건**(작년 마스터 데이터)
- `project_genre` 는 N:M 연결 테이블. `project` 삭제 시 CASCADE

### `project_with_genres` — 뷰 (조회는 이걸 쓴다)

`project` 전체 컬럼 + `genres text[]`(장르명) + `genre_ids uuid[]`. 조인이 되어 있어 프론트에서 조인할 필요가 없다.

**뷰의 컬럼은 전부 nullable로 타입 생성된다**(뷰의 한계). 렌더링 시 fallback이 필요하다.

### `inquiry` — 문의

`name`, `email`, `phone?`, `title`, `content`, `is_checked`(기본 false).
등록은 누구나 가능, 조회/수정/삭제는 관리자만.

### `admin`

관리자 화이트리스트. `user_id`(이메일), `auth_user_id`(→ `auth.users`).
비밀번호는 Supabase Auth가 관리하므로 이 테이블엔 없다.

### 현재 데이터 상태

`project` 0건 / `genre` 46건 / `inquiry` 0건 / 관리자 1명.

---

## 3. 권한은 2단 관문 — GRANT + RLS

연동 중 가장 크게 막혔던 지점이라 따로 정리한다.

```
요청 → [1관문: GRANT] 이 역할이 이 테이블을 만질 수 있나?  (테이블 단위)
     → [2관문: RLS]   만질 수 있다면 어느 '행'까지?        (행 단위)
```

RLS 정책이 아무리 `Anyone can view projects` 여도 **GRANT가 없으면 1관문에서 잘려 정책은 실행조차 안 된다.** 초기 상태가 정확히 이랬고 (`anon`에 `TRIGGER`/`TRUNCATE`/`REFERENCES` 만 있고 `SELECT` 없음), `permission denied for view project_with_genres` 로 출품작 목록이 전부 죽어 있었다.

적용한 GRANT (**적용 완료**):

```sql
-- 공개 읽기
grant select on public.project, public.genre, public.project_genre, public.project_with_genres to anon, authenticated;
grant insert on public.inquiry to anon, authenticated;

-- 로그인 사용자 쓰기 (실제 관리자 여부는 RLS가 계속 판정)
grant insert, update, delete on public.project, public.genre, public.project_genre to authenticated;
grant select, update, delete on public.inquiry to authenticated;
grant select, insert, update, delete on public.admin to authenticated;
```

GRANT를 준다고 보안이 뚫리는 게 아니다. 2관문 RLS가 그대로 살아 있어서, 로그인한 일반 사용자가 `upsert_project` 를 불러도 `is_admin()` 이 false면 정책에서 막힌다. **GRANT는 RLS가 일할 기회를 주는 역할이다.**

> `is_admin()` 만 `SECURITY DEFINER` 라 GRANT를 우회한다. 그래서 GRANT가 없던 시절에도 라우트 가드는 멀쩡히 동작해 문제가 없어 보였다. `upsert_project` / `delete_project` 는 `SECURITY DEFINER` 가 **아니므로** 호출자 권한으로 실행된다.

확인 쿼리:

```sql
select table_name, grantee, string_agg(privilege_type, ',' order by privilege_type) as privs
from information_schema.role_table_grants
where table_schema='public' and grantee in ('anon','authenticated')
  and privilege_type in ('SELECT','INSERT','UPDATE','DELETE')
group by table_name, grantee order by table_name, grantee;
```

---

## 4. 공개 페이지 — 조회

### 정책: 전체를 한 번에 받고 프론트에서 필터링

작년 68개 기준 실측: 전체 컬럼 108KB vs 목록용 컬럼만 **23KB**(gzip ~7KB). 검색어마다 API를 호출하는 것보다 낫다.

- **랜덤 정렬**: 서버 `order by random()` 은 요청마다 순서가 바뀌어 필터 변경 시 카드가 전부 뒤섞인다. 클라에서 한 번 셔플해 세션 내내 고정 (`shuffle()` + `useMemo`)
- **한글 부분검색**: `ilike '%...%'` 는 어차피 인덱스를 못 탄다
- **장르 필터**: 클라에선 `genres.includes(g)` 한 줄

### 구현 위치

| 파일 | 역할 |
|---|---|
| `src/hooks/useWorks.ts` | 목록 1회 조회 → `{ works, loading, error }` |
| `src/data/works.ts` | `Work` 타입, `WORK_LIST_COLUMNS`, 옵션 상수, `collectGenres()`, `shuffle()` |
| `src/pages/WorksPage.tsx` | 클라이언트 필터·정렬, 로딩/에러/빈 상태 |

장르 드롭다운은 `genre` 테이블(46건)을 따로 조회하지 않고 목록 응답의 `genres` 를 flat + unique 해서 만든다 (`collectGenres`).

### 상세 (딥링크 지원 시)

```ts
const { data, error } = await supabase
  .from('project_with_genres').select('*').eq('id', id).single();
```

SPA fallback(`404.html`)이 워크플로우에 있으므로 딥링크는 동작한다.

### 이미지 URL

DB에는 Storage **경로**만 저장된다. `src/lib/supabase.ts` 의 `getPublicUrl()` 로 변환한다.

---

## 5. 관리자 페이지

| 라우트 | 파일 |
|---|---|
| `/admin/login` | `pages/admin/AdminLoginPage.tsx` |
| `/admin` | `pages/admin/AdminWorksPage.tsx` (목록/삭제) |
| `/admin/works/new`, `/admin/works/:id` | `pages/admin/AdminWorkFormPage.tsx` |
| `/admin/inquiries` | `pages/admin/AdminInquiriesPage.tsx` |

가드는 `components/AdminGuard.tsx` + `hooks/useAdminSession.ts`.

### 인증

작년의 자체 로그인(`admin_login()` + bcrypt 컬럼)은 **제거했다.** service_role 키를 프론트에 두면 RLS를 통째로 우회하는 마스터 키가 공개 번들에 박히기 때문이다.

```ts
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signOut();
const { data: isAdmin } = await supabase.rpc('is_admin');
```

`session` 만 확인하면 "로그인은 됐지만 관리자가 아닌" 계정도 통과한다. 진입 판정은 `is_admin()` 으로 한다. 단 이건 UI 편의일 뿐이고 **실제 차단은 RLS가 한다.**

`onAuthStateChange` 를 구독해 로그인/로그아웃 직후 가드가 즉시 반영되게 해 두었다.

### 등록 / 수정 — `upsert_project`

장르 upsert → project 저장 → project_genre 연결을 **한 트랜잭션**으로 처리한다.
`p_id` 를 넘기면 수정, 생략하면 신규. 반환값은 project id.

```ts
const { data: projectId, error } = await supabase.rpc('upsert_project', {
  ...(id ? { p_id: id } : {}),   // 수정일 때만
  p_title: title,                 // 필수
  p_team_type: teamType,          // 필수: 'challenger' | 'rookie'
  p_team_name: teamName,
  p_description: description,
  p_platform: ['pc', 'web'],      // 소문자!
  p_video_url: videoUrl,
  p_download_url: downloadUrl,
  p_banner_image: bannerPath,     // Storage 경로
  p_gallery_images: galleryPaths,
  p_genres: ['퍼즐', '액션'],      // 장르"명" 배열. 없는 건 자동 생성
});
```

`p_genres` 동작: 앞뒤 공백 trim, 빈 문자열 무시, 중복 제거. `genre` 테이블에 없는 이름은 자동 생성되므로 폼의 "Enter로 추가" 방식과 그대로 맞는다. 수정 시 배열에서 빠진 장르는 연결이 자동 해제된다(장르 자체는 남음).

### 삭제 — `delete_project`

```ts
const { data: files, error } = await supabase.rpc('delete_project', { p_id: id });
if (files?.length) {
  await supabase.storage.from('files').remove(files);
}
```

**반환값은 정리해야 할 Storage 경로 배열이다.** `project_genre` 는 FK CASCADE로 자동 삭제되지만 Storage 파일은 DB와 별개라, 이 호출을 빼먹으면 고아 파일이 쌓여 용량만 먹는다.

### 이미지 업로드

`files` 버킷 (public). 읽기 전체 공개, 쓰기/삭제는 관리자만 — 버킷·정책 모두 설정 완료.

```ts
const path = `banner/${crypto.randomUUID()}-${safeName}`;
await supabase.storage.from('files')
  .upload(path, file, { cacheControl: '31536000', upsert: false });
```

uuid prefix 필수. 같은 이름으로 덮어쓰면 CDN 캐시 때문에 옛 이미지가 계속 보인다.
파일명은 영숫자·점·하이픈만 남기고 치환한다(Storage 키에 못 쓰는 문자가 섞이면 업로드 실패).

### 문의 관리

```ts
const { data } = await supabase.from('inquiry')
  .select('*').order('created_at', { ascending: false });

await supabase.from('inquiry').update({ is_checked: true }).eq('id', id);
```

확인 처리는 낙관적 업데이트 후 실패 시 롤백한다.

---

## 6. 주의사항

1. **anon 키만 사용한다.** service_role 키를 쓰는 순간 RLS·Storage 정책이 전부 무의미해진다.
2. **`platform` 은 소문자 `pc` / `mobile` / `web`.** CHECK 제약이 없어 DB가 막아주지 않는다. 폼 라벨(`PC`/`모바일`/`Web`)과 저장값을 분리할 것 (`PLATFORM_OPTIONS`). 대소문자가 섞이면 필터가 조용히 깨진다.
3. **`team_type` 은 `challenger` / `rookie`.** CHECK 제약이 있어 다른 값은 에러가 난다.
4. 쓰기가 RLS에 막히면 조용히 실패하지 않고 에러가 반환된다. `error` 를 항상 확인할 것.
5. 스키마를 바꾸면 타입을 재생성한다.
   ```bash
   npx supabase gen types typescript --project-id wrmmtlzhuhwmcyrhwhiq > src/types/database.types.ts
   ```
6. `src/data/site.ts` 의 후원사·SNS·부스 배치도는 DB와 무관한 별개 정보다.
7. 이미지 용량/리사이즈 최적화는 **보류 중**인 주제다. 별도 논의 전까지 건드리지 않는다.
8. `JWT issued at future` 에러가 간헐적으로 뜨면 로컬 시계와 서버 간 skew다. 코드 문제가 아니며 재시도하면 통과한다.

---

## 7. 관리자 계정

**생성 완료** (1명, `admin` 테이블 연결 확인됨).

추가로 만들 때는 두 단계가 필요하다.

1. Dashboard → Authentication → Users → **Add user** (**Auto Confirm User** 체크. 안 하면 확인 메일을 받아야 로그인 가능)
2. 생성된 uuid를 `admin` 테이블에 연결

```sql
insert into public.admin (user_id, auth_user_id)
values ('officialunidev@gmail.com', '<복사한_uuid>');
```

`user_id` 는 식별용 텍스트이고 실제 판정에 쓰이는 건 `auth_user_id` 다:

```sql
select exists (select 1 from public.admin a where a.auth_user_id = auth.uid());
```

**2번을 빼면 로그인은 되지만 "관리자 권한이 없는 계정입니다" 화면이 뜬다.**

첫 관리자는 SQL Editor에서 넣어야 한다. 앱에서는 "이미 관리자여야 관리자를 추가할 수 있다"는 순환에 걸리지만, SQL Editor는 특권 역할로 실행되어 RLS를 우회한다.

**권장**: Authentication → Sign In / Providers → Email → *Allow new users to sign up* 끄기. 안 끄면 누구나 `signUp()` 으로 계정을 만들 수 있다. `admin` 에 없으면 권한은 없지만 계정 무한 생성은 막는 게 좋다.
