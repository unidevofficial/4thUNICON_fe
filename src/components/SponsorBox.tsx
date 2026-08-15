import { SUPPORTERS } from '../data/site';

/**
 * 셀 높이를 그대로 쓰면 가로로 긴 로고가 정사각 로고보다 훨씬 넓게 그려져
 * 시각적 크기가 제각각이 된다. 렌더 면적이 비슷해지도록 높이를 1/√비율로 줄인다.
 */
function applyOpticalScale(img: HTMLImageElement | null) {
  if (!img) return;
  const apply = () => {
    const ratio = img.naturalWidth / img.naturalHeight;
    if (!ratio) return;
    img.style.setProperty('--logo-scale', String(Math.min(1, 1 / Math.sqrt(ratio))));
  };
  // 캐시된 이미지는 load 이벤트가 이미 지나갔을 수 있다.
  if (img.complete) apply();
  else img.addEventListener('load', apply, { once: true });
}

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
                    ref={applyOpticalScale}
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
