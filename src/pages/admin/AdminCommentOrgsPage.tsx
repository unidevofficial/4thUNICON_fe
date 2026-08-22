import { useCallback, useEffect, useState } from 'react';
import { requireSupabase } from '../../lib/supabase';

type CommentOrg = {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  comment_count: number;
  created_at: string;
};

/** 코드는 관리자가 눈으로 읽고 단체에 전달해야 해서 평문으로 보관/표시한다. */
const CODE_PATTERN = /^[0-9A-Za-z]{4,20}$/;

type Draft = {
  /** 신규 등록이면 null. */
  id: string | null;
  name: string;
  code: string;
};

const EMPTY_DRAFT: Draft = { id: null, name: '', code: '' };

export function AdminCommentOrgsPage() {
  const [orgs, setOrgs] = useState<CommentOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const { data, error: loadError } = await requireSupabase().rpc('admin_list_comment_orgs');

    if (loadError) {
      setError('단체 목록을 불러오지 못했습니다.');
      setOrgs([]);
    } else {
      setError(null);
      setOrgs((data ?? []) as CommentOrg[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;

    const name = draft.name.trim();
    const code = draft.code.trim();

    // 서버에서도 같은 규칙을 검사하지만, 왕복 없이 바로 알려준다.
    if (!name) {
      setError('단체명을 입력해 주세요.');
      return;
    }
    if (!CODE_PATTERN.test(code)) {
      setError('코드는 영문/숫자 4~20자로 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    const { error: saveError } = await requireSupabase().rpc('admin_upsert_comment_org', {
      ...(draft.id ? { p_id: draft.id } : {}),
      p_name: name,
      p_code: code,
    });
    setSubmitting(false);

    if (saveError) {
      // 중복 단체명/코드 등은 서버 메시지가 그대로 쓸 만하다.
      setError(saveError.message);
      return;
    }

    setError(null);
    setDraft(null);
    await load();
  }

  async function toggleActive(org: CommentOrg) {
    const next = !org.is_active;
    setOrgs((prev) =>
      prev.map((item) => (item.id === org.id ? { ...item, is_active: next } : item)),
    );

    const { error: updateError } = await requireSupabase().rpc('admin_upsert_comment_org', {
      p_id: org.id,
      p_name: org.name,
      p_code: org.code,
      p_is_active: next,
    });

    if (updateError) {
      setError('활성 상태를 변경하지 못했습니다.');
      setOrgs((prev) =>
        prev.map((item) => (item.id === org.id ? { ...item, is_active: !next } : item)),
      );
    }
  }

  async function remove(org: CommentOrg) {
    if (!window.confirm(`'${org.name}' 단체를 삭제할까요?`)) return;

    const { error: deleteError } = await requireSupabase().rpc('admin_delete_comment_org', {
      p_id: org.id,
    });

    if (deleteError) {
      // 코멘트가 남아 있으면 서버가 건수를 담아 막는다.
      setError(deleteError.message);
      return;
    }

    setError(null);
    await load();
  }

  return (
    <section className="admin-page">
      <div className="admin-page__head">
        <h1 className="admin-page__title">단체 코드 관리</h1>
        <button
          type="button"
          className="admin-button"
          onClick={() => {
            setDraft(EMPTY_DRAFT);
            setError(null);
          }}
        >
          새 단체 등록
        </button>
      </div>

      <p className="admin-state">
        여기 등록된 코드를 참가작품 페이지에서 입력하면 코멘트 모드가 활성화됩니다.
      </p>

      {error ? <p className="admin-error">{error}</p> : null}

      {draft ? (
        <form className="admin-form" onSubmit={save}>
          <label className="admin-field">
            <span className="admin-field__label">단체명</span>
            <input
              className="admin-field__input"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              maxLength={40}
              autoFocus
            />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">코드 (영문/숫자 4~20자)</span>
            <input
              className="admin-field__input"
              value={draft.code}
              onChange={(event) => setDraft({ ...draft, code: event.target.value })}
              maxLength={20}
              autoComplete="off"
            />
          </label>
          <div className="admin-form__actions">
            <button type="submit" className="admin-button" disabled={submitting}>
              {submitting ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              className="admin-button admin-button--ghost"
              onClick={() => setDraft(null)}
            >
              취소
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <p className="admin-state">불러오는 중입니다...</p>
      ) : orgs.length === 0 ? (
        <p className="admin-state">등록된 단체가 없습니다.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>단체명</th>
              <th>코드</th>
              <th>활성</th>
              <th>코멘트</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr key={org.id}>
                <td>{org.name}</td>
                <td>
                  <code>{org.code}</code>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={org.is_active}
                    onChange={() => void toggleActive(org)}
                    aria-label={`${org.name} 활성 여부`}
                  />
                </td>
                <td>{org.comment_count}</td>
                <td className="admin-table__actions">
                  <button
                    type="button"
                    className="admin-button admin-button--ghost"
                    onClick={() => {
                      setDraft({ id: org.id, name: org.name, code: org.code });
                      setError(null);
                    }}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className="admin-button admin-button--danger"
                    onClick={() => void remove(org)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
