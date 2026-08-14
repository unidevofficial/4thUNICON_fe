import { useMemo, useState } from 'react';
import { ImageFrame } from '../components/ImageFrame';
import { SectionBadge } from '../components/SectionBadge';
import { SubPageLayout } from '../components/SubPageLayout';
import { BOOTH_MAP_IMAGE } from '../data/site';
import {
  SORT_OPTIONS,
  TEAM_TYPE_OPTIONS,
  collectGenres,
  shuffle,
  type SortValue,
  type Work,
} from '../data/works';
import { useWorks } from '../hooks/useWorks';
import { getPublicUrl } from '../lib/supabase';

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
  const [sort, setSort] = useState<SortValue>('random');

  // 장르 옵션은 목록 응답에서 뽑는다 (genre 테이블 별도 조회 불필요)
  const genreOptions = useMemo(() => collectGenres(works), [works]);

  // 랜덤 순서는 데이터를 받은 시점에 한 번만 정하고 이후 고정
  const randomOrder = useMemo(() => {
    const map = new Map<string, number>();
    shuffle(works).forEach((work, index) => map.set(work.id ?? '', index));
    return map;
  }, [works]);

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
      </section>

      {/* ── 참가 작품 ── */}
      <section className="works-section works-section--list" id="works-list">
        <SectionBadge>참가 작품</SectionBadge>

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
                onChange={(event) => setSort(event.target.value as SortValue)}
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
        ) : visibleWorks.length === 0 ? (
          <p className="works-state">
            {works.length === 0
              ? '아직 등록된 참가작품이 없습니다.'
              : '조건에 맞는 작품이 없습니다.'}
          </p>
        ) : (
          <div className="works-grid">
            {visibleWorks.map((work) => {
              const thumbnail = getPublicUrl(work.banner_image);
              // 다운로드가 우선, 없으면 영상. 둘 다 없으면 비활성 텍스트로 남긴다.
              const link = work.download_url ?? work.video_url;
              return (
                <article key={work.id} className="works-card">
                  <div
                    className="works-card__thumb"
                    style={
                      thumbnail
                        ? {
                            backgroundImage: `url(${thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : undefined
                    }
                  />
                  <div className="works-card__body">
                    <p className="works-card__genre">{(work.genres ?? []).join(', ')}</p>
                    <p className="works-card__team">
                      {/* DB에 팀 로고 컬럼이 없어 기본 UNIDEV 로고를 유지한다. */}
                      <img src="/images/Unidev.png" alt="" className="works-card__team-icon" />
                      {work.team_name ?? ''}
                    </p>
                    <p className="works-card__title">{work.title ?? ''}</p>
                    <p className="works-card__desc">{work.description ?? ''}</p>
                    <p className="works-card__link">
                      링크:{' '}
                      {link ? (
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          바로가기
                        </a>
                      ) : (
                        <span>바로가기</span>
                      )}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </SubPageLayout>
  );
}
