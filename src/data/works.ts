export type TeamType = 'challenger' | 'rookie';

export type Platform = 'pc' | 'mobile' | 'web';

export type Work = {
  id: string;
  title: string;
  description: string | null;
  teamType: TeamType;
  teamName: string | null;
  teamLogo: string | null;
  genres: string[];
  platforms: Platform[];
  videoUrl: string | null;
  bannerImage: string | null;
  galleryImages: string[];
  downloadUrl: string | null;
  createdAt: string;
};

const PLACEHOLDER_GENRES = ['액션', 'RPG', '퍼즐'] as const;

/**
 * TODO(행사 정보 미확정): 참가작 목록이 확정되면 이 배열을 실제 데이터로 교체한다.
 * 현재 6개 항목은 원본 시안의 카드 배치를 유지하기 위한 플레이스홀더다.
 */
export const WORKS: Work[] = Array.from({ length: 6 }, (_, index) => ({
  id: `placeholder-${index + 1}`,
  title: `작품명 ${index + 1}`,
  description: '작품 설명이 들어갑니다. 간단한 소개 텍스트입니다.',
  teamType: index % 2 === 0 ? 'challenger' : 'rookie',
  teamName: `팀명 ${index + 1}`,
  teamLogo: null,
  genres: [PLACEHOLDER_GENRES[index % PLACEHOLDER_GENRES.length]],
  platforms: index === 0 ? ['pc', 'web'] : [],
  // TODO(실제 참가작 반영): 첫 번째 항목의 URL은 영상 임베드 확인용 테스트 값이다.
  videoUrl:
    index === 0 ? 'https://www.youtube.com/watch?v=V6HThHb14Ho' : null,
  // TODO(실제 참가작 반영): 첫 번째 항목의 이미지는 상세 기능 확인용 테스트 값이다.
  bannerImage: index === 0 ? '/images/banner.png' : null,
  galleryImages:
    index === 0
      ? ['/images/banner.png', '/images/AboutLogo.png', '/images/UniconLogo.png']
      : [],
  // TODO(실제 참가작 반영): 첫 번째 항목의 경로는 다운로드 버튼 확인용 테스트 값이다.
  downloadUrl: index === 0 ? '/images/banner.png' : null,
  createdAt: `2026-08-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
}));

/** TODO(행사 정보 미확정): 실제 출품작 장르가 확정되면 옵션을 교체한다. */
export const GENRE_OPTIONS = [
  { value: '액션', label: '액션' },
  { value: 'RPG', label: 'RPG' },
  { value: '퍼즐', label: '퍼즐' },
];

/** TODO(행사 정보 미확정): 참가팀 유형 분류가 확정되면 옵션을 교체한다. */
export const TEAM_TYPE_OPTIONS = [
  { value: 'challenger', label: '챌린저' },
  { value: 'rookie', label: '루키' },
];

export const SORT_OPTIONS = [
  { value: 'random', label: '랜덤 정렬' },
  { value: 'name', label: '이름순' },
  { value: 'newest', label: '최신순' },
];
