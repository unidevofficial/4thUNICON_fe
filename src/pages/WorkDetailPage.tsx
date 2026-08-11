import { Link, useParams } from 'react-router-dom';
import { SectionBadge } from '../components/SectionBadge';
import { SubPageLayout } from '../components/SubPageLayout';
import { WORKS } from '../data/works';

const TEAM_TYPE_LABEL = {
  challenger: '챌린저',
  rookie: '루키',
} as const;

const PLATFORM_LABEL = {
  pc: 'PC',
  mobile: '모바일',
  web: 'Web',
} as const;

export function WorkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const work = WORKS.find((item) => item.id === id);

  if (!work) {
    return (
      <SubPageLayout titleImage="/images/WorksTitle.png" titleAlt="참가작품">
        <section className="works-section work-detail work-detail--empty">
          <SectionBadge>작품을 찾을 수 없습니다</SectionBadge>
          <p>요청한 참가 작품이 없거나 주소가 잘못되었습니다.</p>
          <Link to="/works" className="work-detail__back-link">
            참가 작품 목록으로 돌아가기
          </Link>
        </section>
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout titleImage="/images/WorksTitle.png" titleAlt="참가작품">
      <section className="works-section work-detail">
        <SectionBadge>작품 상세</SectionBadge>

        <Link to="/works" className="work-detail__back-link">
          ← 참가 작품 목록
        </Link>

        <article className="work-detail__card">
          {work.bannerImage ? (
            <img src={work.bannerImage} alt={`${work.title} 대표 이미지`} className="work-detail__banner" />
          ) : (
            <div className="work-detail__banner work-detail__banner--placeholder" aria-hidden="true" />
          )}

          <div className="work-detail__content">
            <div className="work-detail__tags">
              <span>{TEAM_TYPE_LABEL[work.teamType]}</span>
              {work.genres.map((genre) => (
                <span key={genre}>{genre}</span>
              ))}
              {work.platforms.map((platform) => (
                <span key={platform}>{PLATFORM_LABEL[platform]}</span>
              ))}
            </div>

            <h2 className="work-detail__title">{work.title}</h2>
            <p className="work-detail__team">
              <img
                src={work.teamLogo ?? '/images/Unidev.png'}
                alt=""
                className="works-card__team-icon"
              />
              {work.teamName ?? '팀명 미정'}
            </p>
            <p className="work-detail__description">
              {work.description ?? '작품 설명이 준비 중입니다.'}
            </p>

            {work.videoUrl || work.downloadUrl ? (
              <div className="work-detail__actions">
                {work.videoUrl ? (
                  <a href={work.videoUrl} target="_blank" rel="noopener noreferrer">
                    작품 영상 보기
                  </a>
                ) : null}
                {work.downloadUrl ? (
                  <a href={work.downloadUrl} target="_blank" rel="noopener noreferrer">
                    작품 다운로드
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </article>
      </section>
    </SubPageLayout>
  );
}
