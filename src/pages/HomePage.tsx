import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Merry } from '../components/Merry';
import { SponsorBox } from '../components/SponsorBox';
import { EVENT } from '../data/site';

export function HomePage() {
  return (
    <>
      <Header />

      {/* page-bg + footer를 감싸 MainBg02가 푸터 아래로 넘치지 않게 클립 */}
      <div className="page-shell">
        <div className="page-bg">
          <img
            src="/images/LeftHorse.png"
            alt=""
            className="page-bg__deco page-bg__deco--left"
            aria-hidden="true"
            draggable={false}
          />
          <img
            src="/images/RightHorse.png"
            alt=""
            className="page-bg__deco page-bg__deco--right"
            aria-hidden="true"
            draggable={false}
          />

          <main className="hero" id="unicon">
            <div className="hero__inner">
              <picture>
                <source srcSet="/images/UniconLogo.webp" type="image/webp" />
                <img src="/images/UniconLogo.png" alt="4th UNICON" className="hero__title" />
              </picture>

              <div className="hero__info">
                <p className="hero__info-item">
                  <img src="/images/DayIcon.png" alt="" className="hero__icon-img" />
                  {EVENT.date}
                </p>
                <p className="hero__info-item hero__info-item--place">
                  <img
                    src="/images/MapIcon.png"
                    alt=""
                    className="hero__icon-img hero__icon-img--map"
                  />
                  {EVENT.place}
                </p>
              </div>

              <p className="hero__desc">
                UNICON은 매년 대학생 개발자들의 작품을 선보이는
                <br />
                국내 최대 규모의 대학생 게임 전시회입니다.
              </p>
            </div>
          </main>

          <SponsorBox />

          <Merry />
        </div>

        <Footer />
      </div>
    </>
  );
}
