import type { Tables } from '../types/database.types';

/**
 * 출품작. `project_with_genres` 뷰의 Row를 그대로 쓴다.
 * 뷰는 컬럼이 전부 nullable로 생성되므로(뷰의 한계) 렌더링 시 fallback이 필요하다.
 */
export type Work = Tables<'project_with_genres'>;

/**
 * 목록 카드가 실제로 그리는 컬럼만. 전체 컬럼(작년 68개 기준 108KB) 대신 23KB 수준으로 줄인다.
 * gallery_images 처럼 상세에서만 쓰는 큰 컬럼은 제외한다.
 */
export const WORK_LIST_COLUMNS =
  'id, title, team_name, team_type, banner_image, genres, description, download_url, video_url, created_at';

export const TEAM_TYPE_OPTIONS = [
  { value: 'challenger', label: '챌린저' },
  { value: 'rookie', label: '루키' },
] as const;

export type TeamType = (typeof TEAM_TYPE_OPTIONS)[number]['value'];

/**
 * 폼 라벨과 저장값을 분리한다.
 * DB에 CHECK 제약이 없어서 대소문자가 섞이면 필터가 조용히 깨진다. 저장은 항상 소문자.
 */
export const PLATFORM_OPTIONS = [
  { value: 'pc', label: 'PC' },
  { value: 'mobile', label: '모바일' },
  { value: 'web', label: 'Web' },
] as const;

export type Platform = (typeof PLATFORM_OPTIONS)[number]['value'];

export const SORT_OPTIONS = [
  { value: 'random', label: '랜덤 정렬' },
  { value: 'name', label: '이름순' },
  { value: 'newest', label: '최신순' },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export function teamTypeLabel(value: string | null): string {
  return TEAM_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? '';
}

/** 목록 응답에서 장르 옵션을 동적으로 만든다. genre 테이블(46건)을 따로 조회할 필요가 없다. */
export function collectGenres(works: Work[]): string[] {
  const seen = new Set<string>();
  for (const work of works) {
    for (const genre of work.genres ?? []) seen.add(genre);
  }
  return [...seen].sort((a, b) => a.localeCompare(b, 'ko'));
}

/** mulberry32. 시드가 같으면 항상 같은 수열을 낸다. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 시드 기반 Fisher-Yates. 원본 배열은 건드리지 않는다.
 *
 * 서버 `order by random()`은 요청마다 순서가 바뀌고, Math.random 셔플은 상세 페이지를
 * 갔다 오면 컴포넌트가 다시 마운트되며 순서가 뒤집힌다. 시드를 저장해 두면 같은 목록에
 * 대해 항상 같은 순서가 나온다.
 *
 * 서버 응답 순서 자체가 달라져도 결과가 같도록 id로 먼저 정규화한 뒤 섞는다.
 */
export function seededShuffle<T extends { id: string | null }>(items: T[], seed: number): T[] {
  const result = [...items].sort((a, b) => (a.id ?? '').localeCompare(b.id ?? ''));
  const random = createRandom(seed);
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
