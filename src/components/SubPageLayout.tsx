import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import { Merry } from './Merry';
import { useBodyClass } from '../hooks/useBodyClass';

type SubPageLayoutProps = {
  /** 배너 타이틀 이미지 */
  titleImage: string;
  titleAlt: string;
  /** 배너 타이틀 아래 보조 문구 (UNIDEV 소개 페이지에만 사용) */
  lead?: string;
  /** 푸터 직전 회전목마 노출 여부 (행사 개요 페이지에만 사용) */
  showMerry?: boolean;
  children: ReactNode;
};

/**
 * 서브페이지(참가작품 / 행사 개요 / UNIDEV 소개) 공통 레이아웃.
 * 배너 → 스크롤탭 → 콘텐츠 순서와 z-index 스택은 works.css에 강하게 결합돼 있으므로
 * DOM 구조를 그대로 유지한다.
 */
export function SubPageLayout({
  titleImage,
  titleAlt,
  lead,
  showMerry = false,
  children,
}: SubPageLayoutProps) {
  useBodyClass('works-page');

  const content = (
    <>
      <div className="works-bg">
        <section className="works-banner">
          <div className="works-banner__inner">
            <h1 className="works-banner__title">
              <img
                src={titleImage}
                alt={titleAlt}
                className="works-banner__title-img"
                draggable={false}
              />
            </h1>
            {lead ? <p className="about-banner__lead">{lead}</p> : null}
          </div>
        </section>

        <div className="works-banner__tab-anchor" aria-hidden="true">
          <div className="works-banner__tab">
            <img
              src="/images/ScrollTab2.png"
              alt=""
              className="works-banner__tab-img"
              width={1443}
              height={96}
            />
          </div>
        </div>

        <div className="works-content-bg">{children}</div>

        {showMerry ? <Merry /> : null}
      </div>

      <Footer />
    </>
  );

  return (
    <>
      <Header />
      {/* 회전목마가 있는 페이지는 배경이 푸터 아래로 넘치지 않도록 page-shell로 클립한다. */}
      {showMerry ? <div className="page-shell">{content}</div> : content}
    </>
  );
}
