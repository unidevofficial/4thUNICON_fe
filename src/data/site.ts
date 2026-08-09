/**
 * 사이트 전역에서 공유하는 고정 정보.
 * 아직 확정되지 않은 행사 고유 정보는 null로 두고 UI에서 플레이스홀더로 처리한다.
 */

export const CONTACT_EMAIL = 'officialunidev@gmail.com';

export const EVENT = {
  date: '2026.08.25 (화) 10:00 ~ 18:00',
  place: '경기창조경제혁신센터 국제회의장',
} as const;

export type NavItem = {
  label: string;
  to: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'UNICON', to: '/#unicon' },
  { label: '행사 개요', to: '/overview' },
  { label: '참가작품', to: '/works' },
  { label: 'UNIDEV 소개', to: '/about' },
];

export const FOOTER_LINKS: NavItem[] = [
  { label: '행사 개요', to: '/overview' },
  { label: '참가 작품', to: '/works' },
  { label: 'UNIDEV 소개', to: '/about' },
];

/**
 * TODO(행사 정보 미확정): 메인 스폰서가 확정되면 name/logo를 채운다.
 * logo에 경로를 넣으면 스폰서 박스와 푸터에 자동 반영된다. (예: '/images/main-sponsor.png')
 */
export const MAIN_SPONSOR: { name: string; logo: string } | null = null;

/**
 * TODO(행사 정보 미확정): 후원사 목록이 확정되면 배열을 채운다.
 */
export const SUPPORTERS: { name: string; logo: string | null }[] = [];

/**
 * TODO(행사 정보 미확정): 공식 SNS 계정 URL이 확정되면 href를 채운다.
 * href가 null이면 링크가 비활성 상태로 렌더링된다.
 */
export const SOCIAL_LINKS: {
  label: string;
  icon: string;
  href: string | null;
}[] = [
  { label: '카카오톡', icon: '/images/icon-kakao.png', href: "https://pf.kakao.com/_LxgSvn" },
  { label: '인스타그램', icon: '/images/icon-instagram.png', href: "https://www.instagram.com/unidev.official" },
];

/**
 * TODO(행사 정보 미확정): UNIDEV 외부 링크 URL이 확정되면 href를 채운다.
 */
export const ABOUT_EXTERNAL_LINKS: { label: string; href: string | null }[] = [
  { label: 'UNIDEV 공식 홈페이지', href: null },
  { label: '카카오톡 채널', href: "https://pf.kakao.com/_LxgSvn" },
  { label: 'Instagram', href: "https://www.instagram.com/unidev.official" },
];

/**
 * TODO(행사 정보 미확정): 부스 배치도 이미지가 나오면 경로를 채운다. (예: '/images/booth-map.png')
 */
export const BOOTH_MAP_IMAGE: string | null = null;

/**
 * Google 지도 삽입용 URL
 */
export const VENUE_MAP_EMBED_URL =
"https://www.google.com/maps/embed?pb=!1m5!3m3!1m2!1s0x357ca7e540109215%3A0x7efba1ae147d3d1f!2z6rK96riw7LC97KGw6rK97KCc7ZiB7Iug7IS87YSw!5e0!3m2!1sko!2skr!4v1786300831324!5m2!1sko!2skr"
