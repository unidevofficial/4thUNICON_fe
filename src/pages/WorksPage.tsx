import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageFrame } from '../components/ImageFrame';
import { SectionBadge } from '../components/SectionBadge';
import { SubPageLayout } from '../components/SubPageLayout';
import { BOOTH_MAP_IMAGE } from '../data/site';
import { GENRE_OPTIONS, SORT_OPTIONS, TEAM_TYPE_OPTIONS, WORKS } from '../data/works';

function shuffleWorks() {
  const shuffled = [...WORKS];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

export function WorksPage() {
  const [keyword, setKeyword] = useState('');
  const [genre, setGenre] = useState('');
  const [teamType, setTeamType] = useState('');
  const [sort, setSort] = useState('random');
  const [randomizedWorks] = useState(shuffleWorks);

  const normalizedKeyword = keyword.trim().toLowerCase();
  const baseWorks = sort === 'random' ? randomizedWorks : WORKS;
  const filteredWorks = baseWorks.filter((work) => {
    const matchesKeyword =
      normalizedKeyword === '' ||
      work.title.toLowerCase().includes(normalizedKeyword) ||
      (work.teamName ?? '').toLowerCase().includes(normalizedKeyword);
    const matchesGenre = genre === '' || work.genres.includes(genre);
    const matchesTeamType = teamType === '' || work.teamType === teamType;

    return matchesKeyword && matchesGenre && matchesTeamType;
  });

  const displayedWorks =
    sort === 'name'
      ? [...filteredWorks].sort((a, b) => a.title.localeCompare(b.title, 'ko'))
      : sort === 'newest'
        ? [...filteredWorks].sort(
            (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
          )
        : filteredWorks;

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
          {displayedWorks.map((work) => (
            <Link
              key={work.id}
              to={`/works/${work.id}`}
              className="works-card"
              aria-label={`${work.title} 상세 페이지로 이동`}
            >
              <div
                className="works-card__thumb"
                style={
                  work.bannerImage
                    ? {
                        backgroundImage: `url(${work.bannerImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : undefined
                }
              />
              <div className="works-card__body">
                <p className="works-card__title">{work.title}</p>
                <p className="works-card__team">
                  <img
                    src={work.teamLogo ?? '/images/Unidev.png'}
                    alt={`${work.teamName ?? '참가팀'} 로고`}
                    className="works-card__team-icon"
                  />
                  {work.teamName ?? '팀명 미정'}
                </p>
                <p className="works-card__desc">{work.description}</p>
                <p className="works-card__link">
                  링크:{' '}
                  {/* TODO(디자인팀 확인): 장르 표시 영역인지 상세 페이지 안내 영역인지 확인한다. */}
                  <span>바로가기</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
        {displayedWorks.length === 0 ? (
          <p className="works-empty" role="status">
            검색 조건에 맞는 참가 작품이 없습니다.
          </p>
        ) : null}
      </section>
    </SubPageLayout>
  );
}
