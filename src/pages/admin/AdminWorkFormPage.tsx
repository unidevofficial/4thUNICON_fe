import { useEffect, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPublicUrl, supabase } from '../../lib/supabase';
import { PLATFORM_OPTIONS, TEAM_TYPE_OPTIONS, type Platform, type TeamType } from '../../data/works';

/**
 * 같은 파일명으로 덮어쓰면 CDN 캐시 때문에 옛 이미지가 계속 보인다. uuid를 붙여 충돌을 피한다.
 * 키에 쓸 수 없는 문자가 섞이면 업로드가 실패하므로 파일명은 영숫자·점·하이픈만 남긴다.
 */
async function uploadImage(folder: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.]+/g, '-');
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage
    .from('files')
    .upload(path, file, { cacheControl: '31536000', upsert: false });
  if (error) throw error;
  return path;
}

export function AdminWorkFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [teamType, setTeamType] = useState<TeamType>('challenger');
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<Platform[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [genreDraft, setGenreDraft] = useState('');

  const [loading, setLoading] = useState(isEdit);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;

    void (async () => {
      const { data, error: loadError } = await supabase
        .from('project_with_genres')
        .select('*')
        .eq('id', id)
        .single();

      if (!alive) return;
      if (loadError || !data) {
        setError('출품작을 불러오지 못했습니다.');
        setLoading(false);
        return;
      }

      setTitle(data.title ?? '');
      setTeamType((data.team_type as TeamType) ?? 'challenger');
      setTeamName(data.team_name ?? '');
      setDescription(data.description ?? '');
      setPlatform((data.platform ?? []) as Platform[]);
      setVideoUrl(data.video_url ?? '');
      setDownloadUrl(data.download_url ?? '');
      setBannerImage(data.banner_image);
      setGalleryImages(data.gallery_images ?? []);
      setGenres(data.genres ?? []);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  function togglePlatform(value: Platform) {
    setPlatform((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  }

  function handleGenreKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    // 폼 제출을 막고 태그만 추가한다.
    event.preventDefault();
    const value = genreDraft.trim();
    if (!value || genres.includes(value)) {
      setGenreDraft('');
      return;
    }
    setGenres((prev) => [...prev, value]);
    setGenreDraft('');
  }

  async function handleBannerChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setBannerImage(await uploadImage('banner', file));
    } catch {
      setError('배너 이미지 업로드에 실패했습니다.');
    }
    setUploading(false);
    event.target.value = '';
  }

  async function handleGalleryChange(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const paths = await Promise.all(files.map((file) => uploadImage('gallery', file)));
      setGalleryImages((prev) => [...prev, ...paths]);
    } catch {
      setError('갤러리 이미지 업로드에 실패했습니다.');
    }
    setUploading(false);
    event.target.value = '';
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: saveError } = await supabase.rpc('upsert_project', {
      // p_id 를 넘기면 수정, 생략하면 신규 등록.
      ...(id ? { p_id: id } : {}),
      p_title: title.trim(),
      p_team_type: teamType,
      p_team_name: teamName.trim(),
      p_description: description.trim(),
      p_platform: platform,
      p_video_url: videoUrl.trim(),
      p_download_url: downloadUrl.trim(),
      p_banner_image: bannerImage ?? undefined,
      p_gallery_images: galleryImages,
      p_genres: genres,
    });

    if (saveError) {
      setError('저장에 실패했습니다. 입력값과 권한을 확인해 주세요.');
      setSubmitting(false);
      return;
    }

    navigate('/admin', { replace: true });
  }

  if (loading) {
    return <p className="admin-state">불러오는 중입니다...</p>;
  }

  const bannerPreview = getPublicUrl(bannerImage);

  return (
    <section className="admin-page">
      <div className="admin-page__head">
        <h1 className="admin-page__title">{isEdit ? '출품작 수정' : '새 출품작 등록'}</h1>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label className="admin-field">
          <span className="admin-field__label">제목 *</span>
          <input
            className="admin-field__input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>

        <label className="admin-field">
          <span className="admin-field__label">부문 *</span>
          <select
            className="admin-field__input"
            value={teamType}
            onChange={(event) => setTeamType(event.target.value as TeamType)}
          >
            {TEAM_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span className="admin-field__label">팀명</span>
          <input
            className="admin-field__input"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
          />
        </label>

        <label className="admin-field">
          <span className="admin-field__label">설명</span>
          <textarea
            className="admin-field__input admin-field__input--area"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
          />
        </label>

        <fieldset className="admin-field">
          <legend className="admin-field__label">플랫폼</legend>
          <div className="admin-checks">
            {PLATFORM_OPTIONS.map((option) => (
              <label key={option.value} className="admin-check">
                <input
                  type="checkbox"
                  checked={platform.includes(option.value)}
                  onChange={() => togglePlatform(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="admin-field">
          <span className="admin-field__label">장르 (Enter로 추가)</span>
          <input
            className="admin-field__input"
            value={genreDraft}
            onChange={(event) => setGenreDraft(event.target.value)}
            onKeyDown={handleGenreKeyDown}
            placeholder="예: 퍼즐"
          />
          {genres.length > 0 ? (
            <ul className="admin-tags">
              {genres.map((genre) => (
                <li key={genre} className="admin-tag">
                  <span>{genre}</span>
                  <button
                    type="button"
                    onClick={() => setGenres((prev) => prev.filter((item) => item !== genre))}
                    aria-label={`${genre} 제거`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <label className="admin-field">
          <span className="admin-field__label">영상 URL</span>
          <input
            className="admin-field__input"
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="https://"
          />
        </label>

        <label className="admin-field">
          <span className="admin-field__label">다운로드 URL</span>
          <input
            className="admin-field__input"
            value={downloadUrl}
            onChange={(event) => setDownloadUrl(event.target.value)}
            placeholder="https://"
          />
        </label>

        <div className="admin-field">
          <span className="admin-field__label">배너 이미지</span>
          <input type="file" accept="image/*" onChange={handleBannerChange} />
          {bannerPreview ? (
            <div className="admin-thumbs">
              <div className="admin-thumb">
                <img src={bannerPreview} alt="배너 미리보기" />
                <button type="button" onClick={() => setBannerImage(null)} aria-label="배너 제거">
                  ×
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="admin-field">
          <span className="admin-field__label">갤러리 이미지</span>
          <input type="file" accept="image/*" multiple onChange={handleGalleryChange} />
          {galleryImages.length > 0 ? (
            <div className="admin-thumbs">
              {galleryImages.map((path) => (
                <div key={path} className="admin-thumb">
                  <img src={getPublicUrl(path) ?? ''} alt="갤러리 미리보기" />
                  <button
                    type="button"
                    onClick={() => setGalleryImages((prev) => prev.filter((item) => item !== path))}
                    aria-label="이미지 제거"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {error ? <p className="admin-error">{error}</p> : null}

        <div className="admin-form__actions">
          <button
            type="button"
            className="admin-button admin-button--ghost"
            onClick={() => navigate('/admin')}
          >
            취소
          </button>
          <button type="submit" className="admin-button" disabled={submitting || uploading}>
            {uploading ? '업로드 중...' : submitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </section>
  );
}
