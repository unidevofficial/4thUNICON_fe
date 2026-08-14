# 4th UNICON

UNIDEV 4회 UNICON 행사 웹사이트. React + TypeScript + Vite, 백엔드는 Supabase.

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 타입체크 + 프로덕션 빌드
npm run preview  # 빌드 결과 확인
```

### 환경변수

`.env.example`을 `.env`로 복사해 Supabase 값을 채웁니다.

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**anon 키만 사용합니다.** service_role 키는 RLS를 통째로 우회하는 마스터 키라 정적 호스팅 번들에 절대 넣지 않습니다.

배포 시에는 GitHub 리포지토리 **Settings → Secrets and variables → Actions → Variables** 에 같은 이름으로 등록해야 합니다. 워크플로우가 `${{ vars.* }}` 로 참조하는데, 값이 없으면 에러 없이 빈 문자열이 되어 빌드는 성공하지만 사이트가 흰 화면이 됩니다.

## 구조

```
src/components/     공용 컴포넌트 (Header, Footer, SubPageLayout, AdminGuard 등)
src/pages/          공개 페이지 (/, /overview, /works, /about, 404)
src/pages/admin/    관리자 페이지
src/hooks/          useWorks, useAdminSession 등
src/data/           행사 정보(site.ts), 출품작 타입·상수(works.ts)
src/lib/supabase.ts Supabase 클라이언트, Storage 경로 → 공개 URL 변환
src/types/          DB에서 생성된 타입 (수동 수정 금지)
src/styles/         style.css, works.css (시안 원본), 그 외 기능별 분리
```

### 디자인 보존 원칙

`style.css` / `works.css` 는 디자인 시안 기준 파일입니다. `.sponsor__logo--host + .sponsor__label`, `.sponsor__label:first-child`, `.about-links__list > li:not(.about-links__sep)` 처럼 **인접/순서 선택자에 의존하는 규칙이 있어 DOM 요소 순서를 바꾸면 레이아웃이 깨집니다.**

신규 기능 스타일은 원본을 건드리지 않도록 별도 파일(`admin.css`, `notfound.css`, `placeholders.css`)로 분리합니다.

## 라우팅

| 라우트 | 설명 |
|---|---|
| `/` | 메인 |
| `/overview` | 행사 개요 |
| `/works` | 출품작 목록 |
| `/about` | UNIDEV 소개 |
| `/admin/login` | 관리자 로그인 |
| `/admin` | 출품작 관리 (목록/등록/수정/삭제) |
| `/admin/inquiries` | 문의 관리 |

`BrowserRouter`를 쓰므로 정적 호스팅에서는 모든 경로를 `index.html`로 폴백해야 합니다. 배포 워크플로우가 `dist/404.html`을 생성해 처리합니다.

## Supabase

스키마·RLS·RPC 상세는 [`docs/supabase-integration.md`](docs/supabase-integration.md) 참고.

주의할 점만 옮기면:

- `team_type` 은 `challenger` / `rookie`. CHECK 제약이 있어 다른 값은 등록이 실패합니다.
- `platform` 은 소문자 `pc` / `mobile` / `web`. **CHECK 제약이 없어 DB가 막아주지 않으므로** 폼 라벨과 저장값을 분리합니다 (`PLATFORM_OPTIONS`).
- 출품작 삭제는 `delete_project` RPC가 **정리해야 할 Storage 경로 배열을 반환**합니다. 이걸 Storage에서 지우지 않으면 고아 파일이 쌓입니다.
- 이미지 업로드 경로에는 `crypto.randomUUID()` prefix를 붙입니다. 같은 이름으로 덮어쓰면 CDN 캐시 때문에 옛 이미지가 계속 보입니다.
- 관리자 권한의 실제 통제는 RLS가 합니다. `AdminGuard` / `is_admin()` 은 화면 진입을 막는 UI 편의 장치일 뿐입니다.

- 권한은 **GRANT(테이블 단위) → RLS(행 단위)** 2단 관문입니다. RLS 정책이 있어도 GRANT가 없으면 정책은 실행조차 안 됩니다. 실제로 이것 때문에 출품작 조회가 전부 막혔던 적이 있습니다.

### 관리자 계정 추가

계정은 이미 1개 생성되어 있습니다. 추가할 때는 Dashboard만으로는 부족하고 두 단계가 필요합니다.

1. Authentication → Users → Add user (**Auto Confirm User** 체크)
2. 생성된 uuid를 `admin` 테이블에 연결

```sql
insert into public.admin (user_id, auth_user_id)
values ('officialunidev@gmail.com', '<복사한_uuid>');
```

2번을 빼면 로그인은 되지만 "관리자 권한이 없는 계정입니다" 화면이 뜹니다. 

### 타입 재생성

스키마를 바꾼 뒤에는 다시 생성합니다.

```bash
npx supabase gen types typescript --project-id wrmmtlzhuhwmcyrhwhiq > src/types/database.types.ts
```

## 미확정 콘텐츠

아직 확정되지 않은 행사 정보는 `src/data/site.ts` 에 `null` 또는 플레이스홀더로 모아 두고 `TODO(행사 정보 미확정)` 주석을 달았습니다. 값을 채우면 UI가 자동으로 전환됩니다.

- `SUPPORTERS` — 후원사 (현재 그리드 확인용 플레이스홀더 12개)
- `SOCIAL_LINKS[].href` — 카카오톡 / 인스타그램 URL
- `ABOUT_EXTERNAL_LINKS[].href` — UNIDEV 외부 링크
- `BOOTH_MAP_IMAGE` — 부스 배치도 이미지

출품작(`project`)은 아직 0건이라 `/works` 는 빈 상태로 표시됩니다. `/admin` 에서 등록하면 반영됩니다.
