import { Link, useNavigate } from 'react-router-dom';
import { CONTACT_EMAIL, FOOTER_LINKS, SOCIAL_LINKS, SUPPORTERS } from '../data/site';

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__columns">
          <div className="footer__col">
            <h3 className="footer__heading">바로가기</h3>
            <ul className="footer__list">
              {FOOTER_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col footer__col--sponsors">
            <h3 className="footer__heading">후원사</h3>
            {SUPPORTERS.length === 0 ? (
              <p className="footer__text">-</p>
            ) : (
              // 세로로 6개씩 채운 뒤 다음 열로 넘어간다 (column 방향 + 높이 제한).
              <ul className="footer__sponsors">
                {SUPPORTERS.map((supporter) => (
                  <li key={supporter.name}>
                    {supporter.href ? (
                      <a
                        href={supporter.href}
                        className="footer__link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {supporter.name}
                      </a>
                    ) : (
                      <span className="footer__text">{supporter.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="footer__col footer__col--contact">
            <h3 className="footer__heading">문의처</h3>
            <p className="footer__text">E-MAIL: {CONTACT_EMAIL}</p>
          </div>
        </div>

        <div className="footer__brand">
          {/* 관리자 페이지 숨은 진입점. 일반 방문자가 실수로 누르지 않도록 더블클릭으로만 동작한다. */}
          <img
            src="/images/UnidevFooter.png"
            alt="UNIDEV"
            className="footer__logo"
            onDoubleClick={() => navigate('/admin')}
          />
          <p className="footer__email">이메일 : {CONTACT_EMAIL}</p>
          <div className="footer__social">
            {SOCIAL_LINKS.map((social) => {
              const icon = (
                <img src={social.icon} alt={social.label} className="footer__social-icon" />
              );
              // TODO(행사 정보 미확정): href가 채워지면 링크로 렌더링된다.
              return social.href ? (
                <a
                  key={social.label}
                  href={social.href}
                  className="footer__social-link"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {icon}
                </a>
              ) : (
                <span key={social.label} className="footer__social-link" aria-label={social.label}>
                  {icon}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__bottom-inner">
          <p className="footer__copyright">&copy; 2026 UNIDEV. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
