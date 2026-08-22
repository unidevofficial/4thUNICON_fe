import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * location.key별 스크롤 위치. 새로고침으로 살아난 히스토리 항목에도 복원이 되도록
 * 메모리 대신 sessionStorage에 둔다.
 */
const POSITION_KEY_PREFIX = 'scroll:';

function savePosition(key: string, top: number) {
  sessionStorage.setItem(POSITION_KEY_PREFIX + key, String(top));
}

function loadPosition(key: string): number | null {
  const raw = sessionStorage.getItem(POSITION_KEY_PREFIX + key);
  if (raw === null) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * 목록은 데이터를 받은 뒤에야 높이가 생긴다. 복원 시점에 문서가 아직 짧으면
 * 스크롤이 잘려버리므로, 목표 위치에 닿을 때까지 재시도한다.
 * 프레임 수가 아닌 시간으로 재는 이유는 목록 조회가 느릴 때도 버텨야 하기 때문.
 */
const RESTORE_TIMEOUT_MS = 3000;

function restoreScroll(top: number) {
  const deadline = performance.now() + RESTORE_TIMEOUT_MS;
  let frame = 0;

  const tick = () => {
    // 부드러운 스크롤(style.css의 scroll-behavior: smooth)이 걸리면 복원이 눈에 띈다.
    window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });

    if (Math.abs(window.scrollY - top) < 2 || performance.now() > deadline) return;
    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

/**
 * 라우트 전환 시 스크롤 위치를 정리한다.
 * 뒤로/앞으로 가기(POP)면 이전에 보던 위치로, 그 외에는 해시 섹션 또는 최상단으로 이동한다.
 * (부드러운 스크롤은 style.css의 `html { scroll-behavior: smooth }`가 담당)
 */
export function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();

  /*
   * 브라우저 기본 복원은 SPA에서 목록이 그려지기 전에 실행돼 위치가 잘리고,
   * 그때 발생한 scroll 이벤트가 우리가 저장해 둔 값을 덮어쓴다. 복원은 아래에서 직접 한다.
   */
  useEffect(() => {
    if (!('scrollRestoration' in history)) return;
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    return () => {
      history.scrollRestoration = previous;
    };
  }, []);

  // 지금 화면의 스크롤 위치를 계속 기록해 둔다. 이동 직전에만 읽으면 이미 늦다.
  useEffect(() => {
    const save = () => savePosition(key, window.scrollY);
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [key]);

  useEffect(() => {
    if (navigationType === 'POP') {
      const saved = loadPosition(key);
      if (saved !== null) return restoreScroll(saved);
    }

    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash, key, navigationType]);

  return null;
}
