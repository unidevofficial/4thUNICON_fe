# 4th UNICON — React 리메이크

기존 정적 HTML 페이지(`../index.html`, `../overview.html`, `../works.html`, `../about.html`)를
TypeScript + React 기반으로 옮긴 프로젝트입니다. **원본 파일은 수정하지 않습니다.**

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 타입체크 + 프로덕션 빌드
npm run preview  # 빌드 결과 확인
```

## 구조

```
public/images, public/fonts   원본 에셋 복사본
src/styles/style.css          원본 style.css (에셋 경로만 절대경로로 조정)
src/styles/works.css          원본 works.css (동일)
src/styles/placeholders.css   미확정 콘텐츠 플레이스홀더 전용 (신규)
src/components/               공용 컴포넌트
src/pages/                    라우트별 페이지
src/data/                     행사 정보 / 참가작 데이터
```

### 디자인 보존 원칙

- `style.css` / `works.css`는 **원본을 그대로 복사**했습니다. 변경한 것은
  `url('images/...')` → `url('/images/...')` 경로뿐입니다.
- JSX의 DOM 구조와 클래스 순서도 원본 HTML과 1:1로 맞췄습니다.
  `.sponsor__logo--host + .sponsor__label`, `.about-links__list > li:not(.about-links__sep)`,
  `.sponsor__label:first-child` 처럼 **인접/순서 선택자에 의존하는 CSS가 있으므로
  요소 순서를 바꾸면 레이아웃이 깨집니다.**

### 중복 제거

| 컴포넌트 | 대체한 원본 중복 |
|---|---|
| `Header` | 4개 HTML의 헤더 마크업 + `script.js`의 햄버거 메뉴 |
| `Footer` | 4개 HTML에 복붙돼 있던 47줄 푸터 |
| `SubPageLayout` | overview / works / about의 배너·스크롤탭·배경 스택 |
| `SponsorBox` | index / overview의 스폰서 박스 |
| `SectionBadge` | 각 섹션 제목 배지 |
| `ImageFrame` | 부스 배치도 / 오시는 길 지도 프레임 (`onerror` 인라인 스크립트 대체) |
| `Merry` | index / overview의 회전목마 |

## 미확정 콘텐츠 (TODO)

행사 고유 정보 중 아직 확정되지 않은 값은 `src/data/site.ts`, `src/data/works.ts`에
`null` 또는 플레이스홀더로 모아 두고 `TODO(행사 정보 미확정)` 주석을 달았습니다.
값을 채우면 UI가 자동으로 실제 콘텐츠로 전환됩니다.

- `MAIN_SPONSOR` — 메인 스폰서 (원본에서 `main-sponsor.png`가 없어 깨진 이미지로 노출되던 부분)
- `SUPPORTERS` — 후원사 목록
- `SOCIAL_LINKS[].href` — 카카오톡 / 인스타그램 URL
- `ABOUT_EXTERNAL_LINKS[].href` — UNIDEV 외부 링크
- `BOOTH_MAP_IMAGE` — 부스 배치도 이미지
- `VENUE_MAP_IMAGE` — 오시는 길 지도 이미지
- `WORKS` — 참가작 목록 (현재 6개 플레이스홀더로 원본 카드 배치 유지)
- `WorksPage`의 검색/장르/팀 유형/정렬 — 실제 참가작 메타데이터가 들어오면 연결

## 라우팅

원본의 `.html` 링크를 SPA 라우트로 옮겼습니다.

| 원본 | 라우트 |
|---|---|
| `index.html` | `/` |
| `overview.html` | `/overview` |
| `works.html` | `/works` |
| `about.html` | `/about` |

`BrowserRouter`를 쓰므로 정적 호스팅 시 모든 경로를 `index.html`로 폴백하도록
서버(또는 호스팅 설정)를 구성해야 합니다.
