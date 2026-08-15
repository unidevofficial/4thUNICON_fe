import { SUPPORTERS } from '../data/site';

/**
 * 주최 / 후원사 박스. 메인 페이지와 행사 개요 페이지에서 공유한다.
 *
 * 주의: style.css의 `.sponsor__logo--host + .sponsor__label`,
 * `.sponsor__label:first-child` 등 인접 선택자가 있으므로 DOM 순서를 바꾸지 말 것.
 */
export function SponsorBox() {
  return (
    <section className="sponsor">
      <div className="sponsor__box">
        <div className="sponsor__box-chrome" aria-hidden="true">
          <div className="sponsor__box-chrome-fill" />
          <div className="sponsor__box-chrome-frame" />
        </div>
        <div className="sponsor__content">
          <p className="sponsor__label">주최</p>
          <img
            src="/images/Unidev.png"
            alt="UNIDEV"
            className="sponsor__logo sponsor__logo--host"
          />

          <p className="sponsor__label">후원사</p>
          {/* 좁은 화면에서는 auto-fit이 열 수를 줄여 넘치는 로고를 다음 줄로 내린다. */}
          <ul className="sponsor__logos">
            {SUPPORTERS.map((supporter) => (
              <li key={supporter.name} className="sponsor__logos-item">
                {supporter.logo ? (
                  <img
                    src={supporter.logo}
                    alt={supporter.name}
                    className="sponsor__logo sponsor__logo--supporter"
                  />
                ) : (
                  <span className="sponsor__logo--supporter placeholder-box">
                    {supporter.name}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <p className="sponsor__label">개인 후원</p>
          <p className="sponsor__patron">
            <span className="sponsor__patron-affiliation">전북대학교 컴퓨터인공지능학부</span>
            <span className="sponsor__patron-name">
              윤수경<span className="sponsor__patron-title">교수님</span>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
