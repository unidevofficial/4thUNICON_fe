import { useEffect, useState } from 'react';
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

function getYouTubeEmbedUrl(videoUrl: string | null) {
  if (!videoUrl) return null;

  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.replace(/^www\./, '');
    let videoId = '';

    if (hostname === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] ?? '';
    } else if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com')) {
      if (url.pathname === '/watch') {
        videoId = url.searchParams.get('v') ?? '';
      } else if (url.pathname.startsWith('/shorts/') || url.pathname.startsWith('/embed/')) {
        videoId = url.pathname.split('/')[2] ?? '';
      }
    }

    return /^[A-Za-z0-9_-]{11}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
}

export function WorkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const work = WORKS.find((item) => item.id === id);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedImage(null);
  }, [id]);

  useEffect(() => {
    if (!selectedImage) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedImage(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [selectedImage]);

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

  const embedUrl = getYouTubeEmbedUrl(work.videoUrl);

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

            {embedUrl ? (
              <section className="work-detail__video" aria-labelledby="work-video-title">
                <h3 id="work-video-title">작품 영상</h3>
                <div className="work-detail__video-frame">
                  <iframe
                    src={embedUrl}
                    title={`${work.title} 작품 영상`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </section>
            ) : null}

            {work.videoUrl || work.downloadUrl ? (
              <div className="work-detail__actions">
                {work.videoUrl ? (
                  <a href={work.videoUrl} target="_blank" rel="noopener noreferrer">
                    작품 영상 보기
                  </a>
                ) : null}
                {work.downloadUrl ? (
                  <a href={work.downloadUrl} target="_blank" rel="noopener noreferrer" download>
                    작품 다운로드
                  </a>
                ) : null}
              </div>
            ) : null}

            <section className="work-detail__gallery" aria-labelledby="work-gallery-title">
              <h3 id="work-gallery-title">갤러리</h3>
              {work.galleryImages.length > 0 ? (
                <div className="work-detail__gallery-grid">
                  {work.galleryImages.map((imageUrl, index) => (
                    <button
                      key={`${imageUrl}-${index}`}
                      type="button"
                      className="work-detail__gallery-item"
                      onClick={() => setSelectedImage(imageUrl)}
                      aria-label={`${work.title} 갤러리 이미지 ${index + 1} 크게 보기`}
                    >
                      <img src={imageUrl} alt={`${work.title} 갤러리 이미지 ${index + 1}`} />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="work-detail__media-empty">등록된 갤러리 이미지가 없습니다.</p>
              )}
            </section>
          </div>
        </article>
      </section>

      {selectedImage ? (
        <div
          className="work-gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${work.title} 갤러리 이미지 크게 보기`}
          onClick={() => setSelectedImage(null)}
        >
          <div className="work-gallery-modal__content" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="work-gallery-modal__close"
              onClick={() => setSelectedImage(null)}
              aria-label="확대 이미지 닫기"
              autoFocus
            >
              ×
            </button>
            <img src={selectedImage} alt={`${work.title} 갤러리 확대 이미지`} />
          </div>
        </div>
      ) : null}
    </SubPageLayout>
  );
}
