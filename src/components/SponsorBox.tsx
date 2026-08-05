import { MAIN_SPONSOR, SUPPORTERS } from '../data/site';

/**
 * 주최 / 메인 스폰서 / 후원사 박스. 메인 페이지와 행사 개요 페이지에서 공유한다.
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

          <p className="sponsor__label">메인 스폰서</p>
          {/* TODO(행사 정보 미확정): MAIN_SPONSOR가 확정되면 로고 이미지로 대체된다. */}
          {MAIN_SPONSOR ? (
            <img
              src={MAIN_SPONSOR.logo}
              alt={MAIN_SPONSOR.name}
              className="sponsor__logo sponsor__logo--main"
            />
          ) : (
            <div className="sponsor__logo sponsor__logo--main placeholder-box">
              메인 스폰서 로고
            </div>
          )}

          <p className="sponsor__label">후원사</p>
          {/* TODO(행사 정보 미확정): SUPPORTERS 확정 시 로고 목록이 렌더링된다.
              원본 시안도 후원사 자리는 비어 있으므로 현재는 아무것도 그리지 않는다. */}
          {SUPPORTERS.map((supporter) =>
            supporter.logo ? (
              <img
                key={supporter.name}
                src={supporter.logo}
                alt={supporter.name}
                className="sponsor__logo sponsor__logo--main"
              />
            ) : null,
          )}
        </div>
      </div>
    </section>
  );
}
