import { SectionBadge } from '../components/SectionBadge';
import { SponsorBox } from '../components/SponsorBox';
import { SubPageLayout } from '../components/SubPageLayout';
import { EVENT, VENUE_MAP_EMBED_URL} from '../data/site';

export function OverviewPage() {
  return (
    <SubPageLayout
      titleImage="/images/OverviewTitle.png"
      titleAlt="행사 개요"
      showMerry
    >
      {/* ── 행사 정보 ── */}
      <section className="works-section" id="info">
        <SectionBadge>행사 정보</SectionBadge>
        <p className="overview-info">
          <span className="overview-info__line">
            UNICON은 대학생 개발자들이 한 해 동안 준비한 프로젝트를
          </span>
          <span className="overview-info__line">
            선보이는 국내 최대 규모의 대학생 개발 전시회입니다.
          </span>
        </p>
      </section>

      {/* ── 행사 일정 ── */}
      <section className="works-section" id="schedule">
        <SectionBadge>행사일정표</SectionBadge>
        {/* TODO(행사 정보 미확정): 세부 일정이 확정되면 Schedule.svg를 갱신한다. */}
        <img
          src="/images/Schedule.svg"
          alt="행사일정표: 10:00 개회식, 10:30 게임 시연, 17:00 시상 및 폐막식"
          className="overview-schedule-img"
          draggable={false}
        />
      </section>

      {/* ── 오시는 길 ── */}
      <section className="works-section" id="location">
        <SectionBadge>오시는 길</SectionBadge>
        <div className="hero__info overview-location">
          <p className="hero__info-item hero__info-item--place">
            <img
              src="/images/MapIcon.png"
              alt=""
              className="hero__icon-img hero__icon-img--map"
            />
            {EVENT.place}
          </p>
        </div>
        <div className="works-booth overview-map">
          <div className="works-booth__frame">
            <iframe 
              src={VENUE_MAP_EMBED_URL}
              className="overview-map__iframe"
              title="경기창조경제혁신센터 위치 지도"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"/>
          </div>
        </div>
      </section>

      {/* ── 주최 및 스폰서 ── */}
      <section className="works-section works-section--list overview-sponsor" id="sponsors">
        <SectionBadge wide>주최 및 스폰서</SectionBadge>
        <div className="overview-sponsor__wrap">
          <SponsorBox />
        </div>
      </section>
    </SubPageLayout>
  );
}
