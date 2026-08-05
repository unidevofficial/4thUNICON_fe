import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../data/site';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  // 헤더 바깥을 클릭하면 모바일 메뉴를 닫는다.
  useEffect(() => {
    if (!isOpen) return;
    const onDocumentClick = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, [isOpen]);

  return (
    <header ref={headerRef} className={`header${isOpen ? ' is-open' : ''}`}>
      <div className="header__inner">
        <Link to="/" className="header__logo">
          <img src="/images/Unidev.png" alt="UNIDEV" className="header__logo-img" />
        </Link>
        <button
          className="header__menu-btn"
          type="button"
          aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isOpen}
          aria-controls="header-nav"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="header__menu-bar" />
          <span className="header__menu-bar" />
          <span className="header__menu-bar" />
        </button>
        <nav className="header__nav" id="header-nav">
          {NAV_ITEMS.map((item) => {
            // 해시 링크(UNICON)는 원본과 동일하게 활성 표시하지 않는다.
            const isActive = !item.to.includes('#') && item.to === pathname;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`header__nav-link${isActive ? ' header__nav-link--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
