import { useEffect } from 'react';

/** 원본 정적 페이지에서 <body class="..."> 로 걸려 있던 클래스를 라우트별로 재현한다. */
export function useBodyClass(className: string | null): void {
  useEffect(() => {
    if (!className) return;
    document.body.classList.add(className);
    return () => {
      document.body.classList.remove(className);
    };
  }, [className]);
}
