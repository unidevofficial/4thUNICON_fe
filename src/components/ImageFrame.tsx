type ImageFrameProps = {
  /** 이미지 경로. null이면 플레이스홀더 박스를 렌더링한다. */
  src: string | null;
  alt: string;
  placeholderLabel: string;
  /** 프레임에 추가로 붙일 클래스 (예: 'overview-map') */
  className?: string;
};

/**
 * 흰 프레임 안에 이미지를 보여주는 공용 박스 (부스 배치도 / 오시는 길 지도).
 * 원본의 onerror 인라인 스크립트를 대체한다.
 */
export function ImageFrame({ src, alt, placeholderLabel, className }: ImageFrameProps) {
  return (
    <div className={`works-booth${className ? ` ${className}` : ''}`}>
      <div className="works-booth__frame">
        {src ? (
          <img src={src} alt={alt} className="works-booth__img" />
        ) : (
          // TODO(행사 정보 미확정): 이미지 경로가 채워지면 위 img로 렌더링된다.
          <div className="works-booth__placeholder" style={{ display: 'flex' }}>
            <span>{placeholderLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
