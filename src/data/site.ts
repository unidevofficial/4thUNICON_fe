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

/** 스폰서 박스에 표시하는 출품작 수. DB 등록 건수와 별개로 수동 관리한다. */
export const WORK_COUNT = 86;

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
 * 후원사. **배열 순서가 곧 후원 순서**이므로 임의로 정렬하지 않는다.
 * 개수를 바꾸면 로고 그리드가 자동으로 줄바꿈한다.
 */
export const SUPPORTERS: { name: string; logo: string | null; href: string | null }[] = [
  { name: '한국콘텐츠진흥원', logo: '/images/sponsors/kocca.png', href: 'https://www.kocca.kr/' },
  { name: '에피드게임즈', logo: '/images/sponsors/epidgames.png', href: 'https://www.epidgames.com/' },
  { name: '크래프톤', logo: '/images/sponsors/krafton.webp', href: 'https://www.krafton.com/' },
  { name: '한국모바일게임협회', logo: '/images/sponsors/kmga.png', href: 'https://www.k-mga.or.kr/' },
  { name: '디벨로켓', logo: '/images/sponsors/develrocket.png', href: 'https://www.kiweb.or.kr/' },
  { name: '코그', logo: '/images/sponsors/kog.png', href: 'https://www.kog.co.kr/' },
  { name: '뒤끝', logo: '/images/sponsors/thebackend.png', href: 'https://www.thebackend.io/' },
  { name: '넥슨', logo: '/images/sponsors/nexon.png', href: 'https://www.nexon.com/' },
  { name: '컴투스', logo: '/images/sponsors/com2us.png', href: 'https://www.com2us.com/' },
  { name: '저승협회', logo: '/images/sponsors/jeoseung.png', href: 'https://x.com/HellAssociation' },
  { name: '리자드스무디', logo: '/images/sponsors/lizardsmoothie.png', href: 'https://lizardsmoothie.com/' },
  { name: '바삭한소프트', logo: '/images/sponsors/basaksoft.png', href: 'https://basakansoft.com/' },
];

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

/** null 로 두면 참가작품 페이지에 플레이스홀더가 대신 표시된다. */
export const BOOTH_MAP_IMAGE: string | null = '/images/booth_map.png';
