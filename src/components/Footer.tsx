import { Link } from 'react-router-dom';
import {
  CONTACT_EMAIL,
  FOOTER_LINKS,
  MAIN_SPONSOR,
  SOCIAL_LINKS,
  SUPPORTERS,
} from '../data/site';

export function Footer() {
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

          <div className="footer__col">
            <h3 className="footer__heading">메인 스폰서</h3>
            {/* TODO(행사 정보 미확정): MAIN_SPONSOR가 확정되기 전까지 '-'로 표기한다. */}
            <p className="footer__text">{MAIN_SPONSOR?.name ?? '-'}</p>
          </div>

          <div className="footer__col">
            <h3 className="footer__heading">후원사</h3>
            {/* TODO(행사 정보 미확정): SUPPORTERS가 확정되기 전까지 '-'로 표기한다. */}
            {SUPPORTERS.length === 0 ? (
              <p className="footer__text">-</p>
            ) : (
              SUPPORTERS.map((supporter) => (
                <p key={supporter.name} className="footer__text">
                  {supporter.name}
                </p>
              ))
            )}
          </div>

          <div className="footer__col footer__col--contact">
            <h3 className="footer__heading">문의처</h3>
            <p className="footer__text">E-MAIL: {CONTACT_EMAIL}</p>
          </div>
        </div>

        <div className="footer__brand">
          <img src="/images/UnidevFooter.png" alt="UNIDEV" className="footer__logo" />
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
