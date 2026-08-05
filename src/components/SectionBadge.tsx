type SectionBadgeProps = {
  children: React.ReactNode;
  /** 텍스트가 긴 배지(예: '주최 및 스폰서')에 사용하는 넓은 변형 */
  wide?: boolean;
};

export function SectionBadge({ children, wide = false }: SectionBadgeProps) {
  return (
    <div className={`works-section__badge${wide ? ' works-section__badge--wide' : ''}`}>
      <img
        src="/images/SectionBadge.svg"
        alt=""
        className="works-section__badge-img"
        aria-hidden="true"
        draggable={false}
      />
      <span className="works-section__badge-text">{children}</span>
    </div>
  );
}
