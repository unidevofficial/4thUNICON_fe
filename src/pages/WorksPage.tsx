import { useState } from 'react';
import { ImageFrame } from '../components/ImageFrame';
import { SectionBadge } from '../components/SectionBadge';
import { SubPageLayout } from '../components/SubPageLayout';
import { BOOTH_MAP_IMAGE } from '../data/site';
import { GENRE_OPTIONS, SORT_OPTIONS, TEAM_TYPE_OPTIONS, WORKS } from '../data/works';

export function WorksPage() {
  // TODO(행사 정보 미확정): 참가작 데이터(WORKS)에 장르/팀 유형/등록일이 채워지면
  // 아래 상태값으로 검색·필터·정렬 파이프라인을 연결한다.
  const [keyword, setKeyword] = useState('');
  const [genre, setGenre] = useState('');
  const [teamType, setTeamType] = useState('');
  const [sort, setSort] = useState('random');

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
                {GENRE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
                onChange={(event) => setSort(event.target.value)}
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

        <div className="works-grid">
          {WORKS.map((work) => (
            <article key={work.id} className="works-card">
              <div
                className="works-card__thumb"
                style={
                  work.thumbnail
                    ? {
                        backgroundImage: `url(${work.thumbnail})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : undefined
                }
              />
              <div className="works-card__body">
                <p className="works-card__genre">{work.genre}</p>
                <p className="works-card__team">
                  {/* TODO(행사 정보 미확정): 팀 로고가 준비되면 기본 UNIDEV 로고를 교체한다. */}
                  <img src="/images/Unidev.png" alt="" className="works-card__team-icon" />
                  {work.team}
                </p>
                <p className="works-card__desc">{work.description}</p>
                <p className="works-card__link">
                  링크:{' '}
                  {/* TODO(행사 정보 미확정): 출품작 링크가 확정되면 앵커로 렌더링된다. */}
                  {work.link ? (
                    <a href={work.link} target="_blank" rel="noopener noreferrer">
                      바로가기
                    </a>
                  ) : (
                    <span>바로가기</span>
                  )}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SubPageLayout>
  );
}
