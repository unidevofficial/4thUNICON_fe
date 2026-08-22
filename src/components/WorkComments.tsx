import { useCallback, useEffect, useState } from 'react';
import { requireSupabase } from '../lib/supabase';
import { useCommentMode, type CommentSession } from '../hooks/useCommentMode';

const PAGE_SIZE = 10;
const MAX_CONTENT = 300;
const MAX_JOB = 15;

type CommentRow = {
  id: string;
  org_name: string | null;
  job_title: string | null;
  content: string;
  is_edited: boolean;
  created_at: string;
  total_count: number;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

/** 숫자 4자리만 남긴다. PIN 입력란 공용. */
function toPin(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

export function WorkComments({ projectId }: { projectId: string }) {
  const { session } = useCommentMode();

  // 코드가 없으면 섹션 자체를 렌더링하지 않는다.
  if (!session) return null;

  return <CommentsPanel projectId={projectId} session={session} />;
}

function CommentsPanel({ projectId, session }: { projectId: string; session: CommentSession }) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [content, setContent] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [hideOrg, setHideOrg] = useState(false);
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [issuedPin, setIssuedPin] = useState<string | null>(null);

  const load = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      const { data, error } = await requireSupabase().rpc('list_comments', {
        p_code: session.code,
        p_project_id: projectId,
        p_page: targetPage,
        p_page_size: PAGE_SIZE,
      });

      if (error) {
        setLoadError('코멘트를 불러오지 못했습니다.');
        setComments([]);
        setTotal(0);
      } else {
        const rows = (data ?? []) as CommentRow[];
        setLoadError(null);
        setComments(rows);
        setTotal(rows[0]?.total_count ?? 0);
      }
      setLoading(false);
    },
    [projectId, session.code],
  );

  useEffect(() => {
    void load(page);
  }, [load, page]);

  useEffect(() => {
    setPage(1);
  }, [projectId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setFormError('코멘트를 입력해 주세요.');
      return;
    }
    if (pin && pin.length !== 4) {
      setFormError('비밀번호는 숫자 4자리여야 합니다.');
      return;
    }

    setSubmitting(true);
    const { data, error } = await requireSupabase().rpc('add_comment', {
      p_code: session.code,
      p_project_id: projectId,
      p_content: trimmed,
      p_job_title: jobTitle.trim() || undefined,
      p_hide_org: hideOrg,
      p_edit_pin: pin || undefined,
    });
    setSubmitting(false);

    if (error) {
      setFormError(error.message || '코멘트를 등록하지 못했습니다.');
      return;
    }

    // 비워둔 채 제출하면 서버가 만든 PIN 을 한 번만 보여준다. 이걸 놓치면 수정/삭제가 불가능하다.
    const created = data?.[0];
    setIssuedPin(!pin && created ? created.edit_pin : null);

    setContent('');
    setJobTitle('');
    setHideOrg(false);
    setPin('');
    setFormError(null);

    if (page === 1) void load(1);
    else setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="work-detail__panel work-comments" aria-labelledby="work-comments-title">
      <h2 id="work-comments-title">코멘트</h2>

      <form className="work-comments__form" onSubmit={handleSubmit}>
        <div className="work-comments__form-row">
          <div className="work-comments__field">
            <label className="work-comments__label" htmlFor="comment-org">
              소속
            </label>
            <input
              id="comment-org"
              type="text"
              className="work-comments__input"
              value={session.orgName}
              readOnly
              disabled
            />
          </div>

          <label className="work-comments__checkbox">
            <input
              type="checkbox"
              checked={hideOrg}
              onChange={(event) => setHideOrg(event.target.checked)}
            />
            소속 숨김
          </label>

          <div className="work-comments__field">
            <label className="work-comments__label" htmlFor="comment-job">
              직군
            </label>
            <input
              id="comment-job"
              type="text"
              className="work-comments__input"
              value={jobTitle}
              maxLength={MAX_JOB}
              placeholder="선택 입력"
              onChange={(event) => setJobTitle(event.target.value.slice(0, MAX_JOB))}
            />
          </div>

          <div className="work-comments__field work-comments__field--pin">
            <label className="work-comments__label" htmlFor="comment-pin">
              비밀번호
            </label>
            <input
              id="comment-pin"
              type="password"
              inputMode="numeric"
              className="work-comments__input"
              value={pin}
              placeholder="****"
              autoComplete="off"
              onChange={(event) => setPin(toPin(event.target.value))}
            />
          </div>
        </div>

        <textarea
          className="work-comments__textarea"
          value={content}
          maxLength={MAX_CONTENT}
          rows={4}
          placeholder="작품에 대한 코멘트를 남겨 주세요."
          onChange={(event) => setContent(event.target.value.slice(0, MAX_CONTENT))}
        />

        <div className="work-comments__form-foot">
          <span className="work-comments__count">
            {content.length} / {MAX_CONTENT}
          </span>
          <button type="submit" className="work-comments__submit" disabled={submitting}>
            {submitting ? '등록 중...' : '코멘트 등록'}
          </button>
        </div>

        {formError ? (
          <p className="work-comments__error" role="alert">
            {formError}
          </p>
        ) : null}

        {issuedPin ? (
          <p className="work-comments__notice" role="status">
            비밀번호를 입력하지 않아 <strong>{issuedPin}</strong> 로 설정했습니다. 수정·삭제할 때
            필요하니 기억해 주세요. 이 안내는 다시 표시되지 않습니다.
            <button
              type="button"
              className="comment-mode__link"
              onClick={() => setIssuedPin(null)}
            >
              확인
            </button>
          </p>
        ) : null}
      </form>

      {loading ? (
        <p className="work-comments__state">코멘트를 불러오는 중입니다...</p>
      ) : loadError ? (
        <p className="work-comments__error" role="alert">
          {loadError}
        </p>
      ) : comments.length === 0 ? (
        <p className="work-comments__state">아직 등록된 코멘트가 없습니다.</p>
      ) : (
        <>
          <ul className="work-comments__list">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                code={session.code}
                onChanged={() => void load(page)}
                onDeleted={() => {
                  // 마지막 항목을 지웠고 첫 페이지가 아니면 앞 페이지로 물러난다.
                  if (comments.length === 1 && page > 1) setPage(page - 1);
                  else void load(page);
                }}
              />
            ))}
          </ul>

          {totalPages > 1 ? (
            <nav className="work-comments__pager" aria-label="코멘트 페이지">
              <button
                type="button"
                className="work-comments__page-button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                이전
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                <button
                  key={number}
                  type="button"
                  className={`work-comments__page-button${
                    number === page ? ' work-comments__page-button--active' : ''
                  }`}
                  onClick={() => setPage(number)}
                  aria-current={number === page ? 'page' : undefined}
                >
                  {number}
                </button>
              ))}
              <button
                type="button"
                className="work-comments__page-button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                다음
              </button>
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}

type CommentItemProps = {
  comment: CommentRow;
  code: string;
  onChanged: () => void;
  onDeleted: () => void;
};

function CommentItem({ comment, code, onChanged, onDeleted }: CommentItemProps) {
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view');
  const [draft, setDraft] = useState(comment.content);
  const [draftJob, setDraftJob] = useState(comment.job_title ?? '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function reset() {
    setMode('view');
    setPin('');
    setError(null);
    setDraft(comment.content);
    setDraftJob(comment.job_title ?? '');
  }

  async function handleUpdate(event: React.FormEvent) {
    event.preventDefault();
    if (pin.length !== 4) {
      setError('비밀번호 4자리를 입력해 주세요.');
      return;
    }
    setBusy(true);
    const { error: rpcError } = await requireSupabase().rpc('update_comment', {
      p_code: code,
      p_comment_id: comment.id,
      p_edit_pin: pin,
      p_content: draft.trim(),
      p_job_title: draftJob.trim() || undefined,
      // 서버가 소속명을 지운 채 내려주므로, 숨김 상태였는지는 org_name 유무로 되돌린다.
      p_hide_org: comment.org_name === null,
    });
    setBusy(false);

    if (rpcError) {
      setError(rpcError.message || '수정하지 못했습니다.');
      return;
    }
    reset();
    onChanged();
  }

  async function handleDelete(event: React.FormEvent) {
    event.preventDefault();
    if (pin.length !== 4) {
      setError('비밀번호 4자리를 입력해 주세요.');
      return;
    }
    setBusy(true);
    const { error: rpcError } = await requireSupabase().rpc('delete_comment', {
      p_code: code,
      p_comment_id: comment.id,
      p_edit_pin: pin,
    });
    setBusy(false);

    if (rpcError) {
      setError(rpcError.message || '삭제하지 못했습니다.');
      return;
    }
    onDeleted();
  }

  return (
    <li className="work-comments__item">
      <div className="work-comments__meta">
        <span className="work-comments__author">{comment.org_name ?? '익명'}</span>
        {comment.job_title ? (
          <span className="work-comments__job">{comment.job_title}</span>
        ) : null}
        <span className="work-comments__date">{formatDate(comment.created_at)}</span>
      </div>

      {mode === 'edit' ? (
        <form className="work-comments__inline-form" onSubmit={handleUpdate}>
          <input
            type="text"
            className="work-comments__input"
            value={draftJob}
            maxLength={MAX_JOB}
            placeholder="직군 (선택)"
            onChange={(event) => setDraftJob(event.target.value.slice(0, MAX_JOB))}
          />
          <textarea
            className="work-comments__textarea"
            value={draft}
            maxLength={MAX_CONTENT}
            rows={3}
            onChange={(event) => setDraft(event.target.value.slice(0, MAX_CONTENT))}
          />
          <div className="work-comments__inline-foot">
            <input
              type="password"
              inputMode="numeric"
              className="work-comments__input work-comments__input--pin"
              value={pin}
              placeholder="****"
              autoComplete="off"
              onChange={(event) => setPin(toPin(event.target.value))}
            />
            <button type="submit" className="work-comments__submit" disabled={busy}>
              {busy ? '저장 중...' : '저장'}
            </button>
            <button type="button" className="comment-mode__link" onClick={reset}>
              취소
            </button>
          </div>
          {error ? (
            <p className="work-comments__error" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      ) : mode === 'delete' ? (
        <form className="work-comments__inline-form" onSubmit={handleDelete}>
          <p className="work-comments__confirm">삭제하려면 비밀번호를 입력해 주세요.</p>
          <div className="work-comments__inline-foot">
            <input
              type="password"
              inputMode="numeric"
              className="work-comments__input work-comments__input--pin"
              value={pin}
              placeholder="****"
              autoComplete="off"
              onChange={(event) => setPin(toPin(event.target.value))}
            />
            <button
              type="submit"
              className="work-comments__submit work-comments__submit--danger"
              disabled={busy}
            >
              {busy ? '삭제 중...' : '삭제'}
            </button>
            <button type="button" className="comment-mode__link" onClick={reset}>
              취소
            </button>
          </div>
          {error ? (
            <p className="work-comments__error" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      ) : (
        <>
          <p className="work-comments__content">
            {comment.content}
            {comment.is_edited ? <span className="work-comments__edited"> (수정됨)</span> : null}
          </p>
          <div className="work-comments__actions">
            <button type="button" className="comment-mode__link" onClick={() => setMode('edit')}>
              수정
            </button>
            <button type="button" className="comment-mode__link" onClick={() => setMode('delete')}>
              삭제
            </button>
          </div>
        </>
      )}
    </li>
  );
}
