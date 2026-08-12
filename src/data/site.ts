/**
 * 사이트 전역에서 공유하는 고정 정보.
 * 아직 확정되지 않은 행사 고유 정보는 null로 두고 UI에서 플레이스홀더로 처리한다.
 */

export const CONTACT_EMAIL = 'officialunidev@gmail.com';

export const EVENT = {
  date: '2026.08.25 (화) 10:00 ~ 18:00',
  place: '경기창조경제혁신센터 B2 국제회의장',
  address: '경기도 성남시 분당구 대왕판교로645번길 12 1F KR 5F 경기창조경제혁신센터',
} as const;

/** 오시는 길 구글맵 임베드 URL (API 키 없이 동작하는 공개 임베드). */
export const VENUE_MAP_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(
  EVENT.address,
)}&hl=ko&z=17&output=embed`;

/** 구글맵 새 탭에서 열기용 링크. */
export const VENUE_MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  EVENT.address,
)}`;

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
 * TODO(행사 정보 미확정): 후원사가 확정되면 name/logo를 실제 값으로 교체한다.
 * 지금은 그리드 레이아웃 확인용 플레이스홀더 12개. 개수를 바꾸면 그리드가 자동으로 줄바꿈한다.
 */
export const SUPPORTERS: { name: string; logo: string | null }[] = Array.from(
  { length: 12 },
  (_, index) => ({ name: `후원사 ${index + 1}`, logo: '/images/Unidev.png' }),
);

/**
 * TODO(행사 정보 미확정): 공식 SNS 계정 URL이 확정되면 href를 채운다.
 * href가 null이면 링크가 비활성 상태로 렌더링된다.
 */
export const SOCIAL_LINKS: {
  label: string;
  icon: string;
  href: string | null;
}[] = [
  { label: '카카오톡', icon: '/images/icon-kakao.png', href: 'https://pf.kakao.com/_LxgSvn' },
  { label: '인스타그램', icon: '/images/icon-instagram.png', href: 'https://www.instagram.com/unidev.official' },
];

/**
 * TODO(행사 정보 미확정): UNIDEV 외부 링크 URL이 확정되면 href를 채운다.
 */
export const ABOUT_EXTERNAL_LINKS: { label: string; href: string | null }[] = [
  { label: 'UNIDEV 공식 홈페이지', href: 'https://www.unidev.kr/' },
  { label: '카카오톡 채널', href: 'https://pf.kakao.com/_LxgSvn' },
  { label: 'Instagram', href: 'https://www.instagram.com/unidev.official' },
];

/**
 * TODO(행사 정보 미확정): 부스 배치도 이미지가 나오면 경로를 채운다. (예: '/images/booth-map.png')
 */
export const BOOTH_MAP_IMAGE: string | null = null;
