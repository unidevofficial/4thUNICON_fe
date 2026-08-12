import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

export function NotFoundPage() {
  return (
    <>
      <Header />

      <div className="page-shell">
        <main className="notfound">
          <img
            src="/images/yellow_a_frame.png"
            alt=""
            className="notfound__icon"
            aria-hidden="true"
            draggable={false}
          />
          <p className="notfound__message">아직 준비중이거나, 존재하지 않는 페이지입니다.</p>
          <Link to="/" className="notfound__button">
            메인으로 돌아가기
          </Link>
        </main>

        <Footer />
      </div>
    </>
  );
}
