export type Work = {
  id: string;
  /** 썸네일 경로. null이면 빈 썸네일 박스(원본 디자인과 동일)로 렌더링된다. */
  thumbnail: string | null;
  genre: string;
  team: string;
  description: string;
  link: string | null;
};

/**
 * TODO(행사 정보 미확정): 참가작 목록이 확정되면 이 배열을 실제 데이터로 교체한다.
 * 현재 6개 항목은 원본 시안의 카드 배치를 유지하기 위한 플레이스홀더다.
 */
export const WORKS: Work[] = Array.from({ length: 6 }, (_, index) => ({
  id: `placeholder-${index + 1}`,
  thumbnail: null,
  genre: '장르명',
  team: '팀명 팀원명',
  description: '작품 설명이 들어갑니다. 간단한 소개 텍스트입니다.',
  link: null,
}));

/** TODO(행사 정보 미확정): 실제 출품작 장르가 확정되면 옵션을 교체한다. */
export const GENRE_OPTIONS = [
  { value: 'action', label: '액션' },
  { value: 'rpg', label: 'RPG' },
  { value: 'puzzle', label: '퍼즐' },
];

/** TODO(행사 정보 미확정): 참가팀 유형 분류가 확정되면 옵션을 교체한다. */
export const TEAM_TYPE_OPTIONS = [
  { value: 'student', label: '학생' },
  { value: 'indie', label: '인디' },
];

export const SORT_OPTIONS = [
  { value: 'random', label: '랜덤 정렬' },
  { value: 'name', label: '이름순' },
  { value: 'newest', label: '최신순' },
];
