import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CommentModeToggle } from '../components/CommentModeToggle';
import { ImageFrame } from '../components/ImageFrame';
import { SectionBadge } from '../components/SectionBadge';
import { SubPageLayout } from '../components/SubPageLayout';
import { BOOTH_MAP_IMAGE } from '../data/site';
import {
  SORT_OPTIONS,
  TEAM_TYPE_OPTIONS,
  collectGenres,
  seededShuffle,
  teamTypeLabel,
  type SortValue,
  type Work,
} from '../data/works';
import { useWorks } from '../hooks/useWorks';
import { getPublicUrl } from '../lib/supabase';

/** 이 수 이하면 아직 등록이 진행 중이라고 보고 목록 아래에 안내를 덧붙인다. */
const PARTIAL_WORKS_THRESHOLD = 50;

/**
 * 썸네일을 뷰포트 진입 전 얼마나 앞서 받아둘지. 카드 한 장 높이가 대략 380px이라
 * 800px이면 두 줄 정도를 미리 확보해 스크롤 중 배경만 보이는 순간이 거의 없다.
 * (0으로 두면 화면에 들어온 뒤 받기 시작해 매번 전환이 눈에 띈다.)
 */
const THUMB_PRELOAD_MARGIN = '800px 0px';

/**
 * 정렬 방식과 랜덤 시드는 탭이 살아있는 동안 유지한다.
 * 상세 페이지를 갔다 오면 WorksPage가 다시 마운트되므로, state만으로는
 * 정렬이 초기화되고 랜덤 순서도 새로 섞인다. localStorage가 아닌 session인 이유는
 * 다음에 새로 방문했을 때는 다시 랜덤이어야 하기 때문.
 */
const SORT_STORAGE_KEY = 'works:sort';
const SEED_STORAGE_KEY = 'works:seed';

function readStoredSort(): SortValue {
  const saved = sessionStorage.getItem(SORT_STORAGE_KEY);
  return SORT_OPTIONS.some((option) => option.value === saved) ? (saved as SortValue) : 'random';
}

function readStoredSeed(): number {
  const saved = Number(sessionStorage.getItem(SEED_STORAGE_KEY));
  if (Number.isFinite(saved) && saved > 0) return saved;

  const seed = Math.floor(Math.random() * 2 ** 32) || 1;
  sessionStorage.setItem(SEED_STORAGE_KEY, String(seed));
  return seed;
}

/**
 * 참가작 썸네일. 52장을 한 번에 받으면 첫 화면이 느려져서
 * 화면 근처에 온 것만 background-image를 붙인다.
 * 붙이기 전에는 카드 CSS의 분홍 그라데이션이 그대로 자리를 지킨다.
 */
function WorkThumb({ src }: { src: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // 한 번 띄운 뒤에는 필터로 카드가 재배치돼도 다시 감시하지 않는다.
    if (!src || shown) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: THUMB_PRELOAD_MARGIN },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [src, shown]);

  return (
    <div
      ref={ref}
      className="works-card__thumb"
      style={
        src && shown
          ? {
              backgroundImage: `url(${src})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
            }
          : undefined
      }
    />
  );
}

function sortWorks(works: Work[], sort: SortValue, order: Map<string, number>): Work[] {
  const sorted = [...works];
  if (sort === 'name') {
    sorted.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'ko'));
  } else if (sort === 'newest') {
    sorted.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
  } else {
    // 세션 내내 고정된 셔플 순서를 그대로 따른다 (필터를 바꿔도 카드가 뒤섞이지 않게)
    sorted.sort((a, b) => (order.get(a.id ?? '') ?? 0) - (order.get(b.id ?? '') ?? 0));
  }
  return sorted;
}

export function WorksPage() {
  const { works, loading, error } = useWorks();

  const [keyword, setKeyword] = useState('');
  const [genre, setGenre] = useState('');
  const [teamType, setTeamType] = useState('');
  const [sort, setSort] = useState<SortValue>(readStoredSort);
  const [seed] = useState(readStoredSeed);

  // 장르 옵션은 목록 응답에서 뽑는다 (genre 테이블 별도 조회 불필요)
  const genreOptions = useMemo(() => collectGenres(works), [works]);

  // 시드가 같으면 목록이 같은 한 순서도 같다 (상세를 갔다 와도 유지)
  const randomOrder = useMemo(() => {
    const map = new Map<string, number>();
    seededShuffle(works, seed).forEach((work, index) => map.set(work.id ?? '', index));
    return map;
  }, [works, seed]);

  const visibleWorks = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    const filtered = works.filter((work) => {
      if (genre && !(work.genres ?? []).includes(genre)) return false;
      if (teamType && work.team_type !== teamType) return false;
      if (!q) return true;
      const haystack = `${work.title ?? ''} ${work.team_name ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
    return sortWorks(filtered, sort, randomOrder);
  }, [works, keyword, genre, teamType, sort, randomOrder]);

  return (
    <SubPageLayout titleImage="/images/WorksTitle.png" titleAlt="참가작품">
      {/* ── 부스 배치도 ── */}
      <section className="works-section" id="booth-map">
        <SectionBadge>부스 배치도</SectionBadge>
        <ImageFrame
          src={BOOTH_MAP_IMAGE}
          alt="부스 배치도"
          placeholderLabel="부스 배치도 이미지"
        />
        {/* 좁은 화면에서는 도면 글자가 뭉개져 원본을 따로 열 수 있게 한다. */}
        {BOOTH_MAP_IMAGE ? (
          <a
            className="works-booth__zoom"
            href={BOOTH_MAP_IMAGE}
            target="_blank"
            rel="noopener noreferrer"
          >
            배치도 원본 크게 보기
          </a>
        ) : null}
      </section>

      {/* ── 참가 작품 ── */}
      <section className="works-section works-section--list" id="works-list">
        <CommentModeToggle>참가 작품</CommentModeToggle>

        <div className="works-filters">
          <div className="works-search">
            <input
              type="search"
              className="works-search__input"
              placeholder="팀명, 출품작 이름으로 검색..."
              aria-label="작품 검색"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
          <div className="works-filters__row">
            <div className="works-filter">
              <label className="works-filter__label" htmlFor="filter-genre">
                장르
              </label>
              <select
                id="filter-genre"
                className="works-filter__select"
                value={genre}
                onChange={(event) => setGenre(event.target.value)}
              >
                <option value="">전체</option>
                {genreOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="works-filter">
              <label className="works-filter__label" htmlFor="filter-team">
                참가팀 유형
              </label>
              <select
                id="filter-team"
                className="works-filter__select"
                value={teamType}
                onChange={(event) => setTeamType(event.target.value)}
              >
                <option value="">전체</option>
                {TEAM_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="works-filter">
              <label className="works-filter__label" htmlFor="filter-sort">
                정렬 방식
              </label>
              <select
                id="filter-sort"
                className="works-filter__select"
                value={sort}
                onChange={(event) => {
                  const next = event.target.value as SortValue;
                  setSort(next);
                  sessionStorage.setItem(SORT_STORAGE_KEY, next);
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="works-state">참가작품을 불러오는 중입니다...</p>
        ) : error ? (
          <p className="works-state works-state--error">
            참가작품을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </p>
        ) : works.length === 0 ? (
          // 등록된 작품이 0건이면 "검색 결과 없음"이 아니라 아직 준비 중이라는 뜻이다.
          <div className="works-pending">
            <img
              src="/images/yellow_a_frame.png"
              alt=""
              aria-hidden="true"
              className="works-pending__icon"
            />
            <p className="works-pending__title">참가작품 준비중입니다</p>
            <p className="works-pending__desc">
              출품작 등록이 마무리되는 대로 이곳에서 공개됩니다.
            </p>
          </div>
        ) : visibleWorks.length === 0 ? (
          <p className="works-state">조건에 맞는 작품이 없습니다.</p>
        ) : (
          <div className="works-grid">
            {visibleWorks.map((work) => {
              if (!work.id) return null;
              const thumbnail = getPublicUrl(work.banner_image);
              return (
                <Link
                  key={work.id}
                  to={`/works/${work.id}`}
                  className="works-card"
                  aria-label={`${work.title ?? '참가 작품'} 상세 페이지로 이동`}
                >
                  <WorkThumb src={thumbnail} />
                  <div className="works-card__body">
                    <h2 className="works-card__title">{work.title ?? '제목 미정'}</h2>
                    <p className="works-card__team">
                      <svg
                        className="works-card__team-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      {work.team_name || '팀명 미정'}
                    </p>
                    <p className="works-card__desc">
                      {work.description || '작품 설명이 준비 중입니다.'}
                    </p>
                    <div className="works-card__meta">
                      <span>장르: {(work.genres ?? []).join(', ') || '-'}</span>
                      <span>참가 부문: {teamTypeLabel(work.team_type) || '-'}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/*
          등록 작품이 아직 다 차지 않은 동안에는 목록 아래에 추가 예정 안내를 덧붙인다.
          (0건일 때는 위의 준비중 안내가 이미 같은 역할을 한다.)
        */}
        {!loading && !error && works.length > 0 && works.length <= PARTIAL_WORKS_THRESHOLD ? (
          <div className="works-pending">
            <img
              src="/images/yellow_a_frame.png"
              alt=""
              aria-hidden="true"
              className="works-pending__icon"
            />
            <p className="works-pending__title">작품 정보 추가 중!</p>
          </div>
        ) : null}
      </section>
    </SubPageLayout>
  );
}
