import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { WorkComments } from '../components/WorkComments';
import { PLATFORM_OPTIONS, teamTypeLabel, type Work } from '../data/works';
import { useBodyClass } from '../hooks/useBodyClass';
import { getPublicUrl, supabase } from '../lib/supabase';

type DetailState = {
  work: Work | null;
  loading: boolean;
  error: string | null;
};

function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return getPublicUrl(path);
}

function getPlatformLabel(value: string): string {
  return PLATFORM_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function getYouTubeEmbedUrl(videoUrl: string | null | undefined): string | null {
  if (!videoUrl || videoUrl === 'about:blank') return null;

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
  const [state, setState] = useState<DetailState>({
    work: null,
    loading: true,
    error: null,
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useBodyClass('works-page');

  useEffect(() => {
    if (!id || !supabase) {
      setState({ work: null, loading: false, error: null });
      return;
    }

    let alive = true;
    setState({ work: null, loading: true, error: null });

    void supabase
      .from('project_with_genres')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) {
          setState({ work: null, loading: false, error: error.message });
          return;
        }
        setState({ work: data, loading: false, error: null });
      });

    return () => {
      alive = false;
    };
  }, [id]);

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

  const { work, loading, error } = state;
  const bannerUrl = getMediaUrl(work?.banner_image) ?? '/images/banner.png';
  const gallery = (work?.gallery_images ?? [])
    .map((path) => getMediaUrl(path))
    .filter((path): path is string => Boolean(path));
  const genres = work?.genres ?? [];
  const platforms = work?.platform ?? [];
  const embedUrl = getYouTubeEmbedUrl(work?.video_url);

  return (
    <>
      <Header />
      <main className="work-detail-page">
        <div className="work-detail__shell">
          {loading ? (
            <section className="work-detail-state" aria-live="polite">
              <p className="work-detail-state__title">작품 정보를 불러오는 중입니다.</p>
            </section>
          ) : error ? (
            <section className="work-detail-state work-detail-state--error" role="alert">
              <p className="work-detail-state__title">작품 정보를 불러오지 못했습니다.</p>
              <p>잠시 후 다시 시도해 주세요.</p>
            </section>
          ) : !work ? (
            <section className="work-detail-state">
              <p className="work-detail-state__title">작품을 찾을 수 없습니다.</p>
              <p>삭제된 작품이거나 주소가 올바르지 않습니다.</p>
            </section>
          ) : (
            <article className="work-detail">
              <section className="work-detail__hero" aria-labelledby="work-detail-title">
                <img
                  src={bannerUrl}
                  alt={work.banner_image ? `${work.title ?? '참가 작품'} 대표 이미지` : ''}
                  className="work-detail__hero-image"
                />
                <div className="work-detail__hero-overlay" />
                <div className="work-detail__hero-copy">
                  <h1 id="work-detail-title" className="work-detail__title">
                    {work.title ?? '제목 미정'}
                  </h1>
                  <div className="work-detail__tags" aria-label="작품 분류">
                    {work.team_type ? <span>{teamTypeLabel(work.team_type)}</span> : null}
                    {genres.length > 0 ? <span>장르: {genres.join(', ')}</span> : null}
                    {platforms.length > 0 ? (
                      <span>플랫폼: {platforms.map(getPlatformLabel).join(', ')}</span>
                    ) : null}
                  </div>
                </div>

                <div className="work-detail__scroll-tab" aria-hidden="true">
                  <img src="/images/ScrollTab2.png" alt="" width={1443} height={96} />
                </div>
              </section>

              <div className="work-detail__content-bg">
                <div className="work-detail__content">
                  <Link to="/works" className="work-detail__back-link">
                    <span aria-hidden="true">‹</span> 참가 작품 목록
                  </Link>

                  <div
                    className={`work-detail__overview${
                      embedUrl ? ' work-detail__overview--with-video' : ''
                    }`}
                  >
                    <section className="work-detail__panel work-detail__introduction">
                      <h2>프로젝트 소개</h2>
                      <p>{work.description || '작품 설명이 준비 중입니다.'}</p>

                      {embedUrl ? (
                        <div className="work-detail__video">
                          <iframe
                            src={embedUrl}
                            title={`${work.title ?? '참가 작품'} 영상`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          />
                        </div>
                      ) : null}
                    </section>

                    <aside className="work-detail__panel work-detail__facts" aria-label="작품 기본 정보">
                      <dl>
                        <div>
                          <dt>팀 이름</dt>
                          <dd>{work.team_name || '-'}</dd>
                        </div>
                        <div>
                          <dt>참가팀 종류</dt>
                          <dd>{teamTypeLabel(work.team_type)}</dd>
                        </div>
                        <div>
                          <dt>장르</dt>
                          <dd>{genres.join(', ') || '-'}</dd>
                        </div>
                        <div>
                          <dt>플랫폼</dt>
                          <dd>{platforms.map(getPlatformLabel).join(', ') || '-'}</dd>
                        </div>
                      </dl>

                      {work.video_url || work.download_url ? (
                        <div className="work-detail__actions">
                          {work.video_url ? (
                            <a href={work.video_url} target="_blank" rel="noopener noreferrer">
                              영상 링크 열기 <span aria-hidden="true">↗</span>
                            </a>
                          ) : null}
                          {work.download_url ? (
                            <a href={work.download_url} target="_blank" rel="noopener noreferrer">
                              작품 다운로드 <span aria-hidden="true">↗</span>
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                    </aside>
                  </div>

                  <section className="work-detail__gallery" aria-labelledby="work-gallery-title">
                    <h2 id="work-gallery-title">갤러리</h2>
                    {gallery.length > 0 ? (
                      <div className="work-detail__gallery-grid">
                        {gallery.map((imageUrl, index) => (
                          <button
                            key={`${imageUrl}-${index}`}
                            type="button"
                            className="work-detail__gallery-item"
                            onClick={() => setSelectedImage(imageUrl)}
                            aria-label={`${work.title ?? '참가 작품'} 갤러리 이미지 ${index + 1} 크게 보기`}
                          >
                            <img
                              src={imageUrl}
                              alt={`${work.title ?? '참가 작품'} 갤러리 이미지 ${index + 1}`}
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="work-detail__media-empty">등록된 갤러리 이미지가 없습니다.</p>
                    )}
                  </section>

                  {work.id ? <WorkComments projectId={work.id} /> : null}
                </div>
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />

      {selectedImage && work ? (
        <div
          className="work-gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${work.title ?? '참가 작품'} 갤러리 이미지 크게 보기`}
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
            <img src={selectedImage} alt={`${work.title ?? '참가 작품'} 갤러리 확대 이미지`} />
          </div>
        </div>
      ) : null}
    </>
  );
}
