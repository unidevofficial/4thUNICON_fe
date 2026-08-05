import { Fragment } from 'react';
import { SectionBadge } from '../components/SectionBadge';
import { SubPageLayout } from '../components/SubPageLayout';
import { ABOUT_EXTERNAL_LINKS } from '../data/site';

const STATS = [
  { value: '150+', label: ['UNICON', '출품작 수'] },
  { value: '25+', label: ['UNIJAM', '작품 수'] },
  { value: '25', label: ['소속', '동아리'] },
  { value: '1300+', label: ['커뮤니티', '멤버 수'] },
];

const ACTIVITIES = [
  '전국 대학생 게임 개발 동아리 연합 전시회 UNICON 개최',
  '전국 대학생 게임 개발 동아리 연합 게임잼 UNIJAM 개최',
  '대학생 게임 개발자 네트워킹 및 커뮤니티 운영',
  '멘토링 프로그램, 스터디 및 세미나 운영',
];

export function AboutPage() {
  return (
    <SubPageLayout
      titleImage="/images/AboutTitle.png"
      titleAlt="UNIDEV 소개"
      lead="성장과 네트워킹을 돕는 대학생 커뮤니티입니다."
    >
      <section className="works-section about-intro" id="about">
        <SectionBadge>UNIDEV란?</SectionBadge>

        <img src="/images/AboutLogo.png" alt="UNIDEV" className="about-logo" draggable={false} />
        <p className="about-logo__tagline">대학생 개발자 커뮤니티</p>

        <div className="about-grid">
          <div className="about-col">
            <div className="about-block">
              <h2 className="about-heading">설립 목적</h2>
              <p className="about-text">
                2023년부터 대학생 개발자들의 성장과 네트워킹을 지원하며, 매년
                <br className="about-br-desktop" />
                혁신적인 프로젝트들을 발굴하고 전시하는 플랫폼을 제공하고 있습니다.
              </p>
            </div>
            <div className="about-block">
              <h2 className="about-heading">주요 활동</h2>
              <ul className="about-list">
                {ACTIVITIES.map((activity) => (
                  <li key={activity}>{activity}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="about-col">
            <div className="about-block">
              <h2 className="about-heading">비전</h2>
              <p className="about-text">
                대학생 개발자들이 자신의 아이디어를 현실로 만들고,
                <br className="about-br-desktop" />
                동료들과 함께 성장할 수 있는 생태계를 구축합니다.
              </p>
            </div>
            <div className="about-block">
              <h2 className="about-heading">성과</h2>
              <div className="about-stats" role="list">
                {STATS.map((stat) => (
                  <div key={stat.value + stat.label.join()} className="about-stat" role="listitem">
                    <p className="about-stat__value">{stat.value}</p>
                    <p className="about-stat__label">
                      {stat.label[0]}
                      <br />
                      {stat.label[1]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="about-links">
          <h2 className="about-heading">외부 링크</h2>
          <ul className="about-links__list">
            {ABOUT_EXTERNAL_LINKS.map((link, index) => {
              const inner = (
                <>
                  {link.label}
                  <img
                    src="/images/icon-external.svg"
                    alt=""
                    className="about-links__icon"
                    width={24}
                    height={24}
                    draggable={false}
                  />
                </>
              );
              return (
                <Fragment key={link.label}>
                  {index > 0 ? <li className="about-links__sep" aria-hidden="true" /> : null}
                  <li>
                    {/* TODO(행사 정보 미확정): href가 채워지면 링크로 렌더링된다. */}
                    {link.href ? (
                      <a
                        href={link.href}
                        className="about-links__item"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {inner}
                      </a>
                    ) : (
                      <span className="about-links__item">{inner}</span>
                    )}
                  </li>
                </Fragment>
              );
            })}
          </ul>
        </div>
      </section>
    </SubPageLayout>
  );
}
