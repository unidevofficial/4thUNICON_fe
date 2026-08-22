import { useEffect, useRef, useState } from 'react';
import { SectionBadge } from './SectionBadge';
import { useCommentMode } from '../hooks/useCommentMode';

/**
 * '참가 작품' 배지를 감싸, 더블클릭하면 숨겨져 있던 코드 입력란이 열린다.
 * 일반 관람객에게는 존재 자체가 드러나지 않아야 해서 힌트를 노출하지 않는다.
 */
export function CommentModeToggle({ children }: { children: React.ReactNode }) {
  const { session, activate, deactivate } = useCommentMode();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    const message = await activate(code);
    setSubmitting(false);

    if (message) {
      setError(message);
      return;
    }
    setError(null);
    setCode('');
    setOpen(false);
  }

  return (
    <div className="comment-mode">
      {/* 더블클릭 전용 트리거. 키보드 사용자를 위한 대체 수단은 두지 않는다(숨은 기능이므로). */}
      <div
        className="comment-mode__trigger"
        onDoubleClick={() => setOpen((prev) => !prev)}
        title=""
      >
        <SectionBadge>{children}</SectionBadge>
      </div>

      {session ? (
        <p className="comment-mode__status">
          <strong>{session.orgName}</strong> 코멘트 모드가 활성화되어 있습니다.
          <button type="button" className="comment-mode__link" onClick={deactivate}>
            해제
          </button>
        </p>
      ) : null}

      {open && !session ? (
        <form className="comment-mode__form" onSubmit={handleSubmit}>
          <label className="comment-mode__label" htmlFor="comment-mode-code">
            코드를 입력해서 코멘트 모드 활성화
          </label>
          <div className="comment-mode__row">
            <input
              id="comment-mode-code"
              ref={inputRef}
              type="password"
              className="comment-mode__input"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setError(null);
              }}
              autoComplete="off"
              placeholder="소속 코드"
            />
            <button type="submit" className="comment-mode__submit" disabled={submitting}>
              {submitting ? '확인 중...' : '활성화'}
            </button>
          </div>
          {error ? (
            <p className="comment-mode__error" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
