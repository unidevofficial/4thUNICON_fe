import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 라우트 전환 시 스크롤 위치를 정리한다.
 * 해시가 있으면 해당 섹션으로, 없으면 페이지 최상단으로 이동한다.
 * (부드러운 스크롤은 style.css의 `html { scroll-behavior: smooth }`가 담당)
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return null;
}
