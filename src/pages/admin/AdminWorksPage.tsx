import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { teamTypeLabel, type Work } from '../../data/works';

const ADMIN_LIST_COLUMNS = 'id, title, team_name, team_type, genres, created_at';

export function AdminWorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from('project_with_genres')
      .select(ADMIN_LIST_COLUMNS)
      .order('created_at', { ascending: false });

    if (loadError) {
      setError('출품작을 불러오지 못했습니다.');
      setWorks([]);
    } else {
      setError(null);
      setWorks((data ?? []) as Work[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(work: Work) {
    if (!work.id) return;
    if (!window.confirm(`'${work.title ?? '제목 없음'}' 을(를) 삭제할까요? 되돌릴 수 없습니다.`)) return;

    setDeletingId(work.id);
    // 반환값은 정리해야 할 Storage 경로 배열이다. 이걸 지우지 않으면 고아 파일이 남는다.
    const { data: files, error: deleteError } = await supabase.rpc('delete_project', {
      p_id: work.id,
    });

    if (deleteError) {
      setError('삭제에 실패했습니다. 권한을 확인해 주세요.');
      setDeletingId(null);
      return;
    }

    if (files?.length) {
      await supabase.storage.from('files').remove(files);
    }

    setDeletingId(null);
    await load();
  }

  return (
    <section className="admin-page">
      <div className="admin-page__head">
        <h1 className="admin-page__title">출품작 관리</h1>
        <Link to="/admin/works/new" className="admin-button">
          새 출품작 등록
        </Link>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      {loading ? (
        <p className="admin-state">불러오는 중입니다...</p>
      ) : works.length === 0 ? (
        <p className="admin-state">등록된 출품작이 없습니다.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>제목</th>
              <th>팀</th>
              <th>부문</th>
              <th>장르</th>
              <th aria-label="관리" />
            </tr>
          </thead>
          <tbody>
            {works.map((work) => (
              <tr key={work.id}>
                <td>{work.title ?? '-'}</td>
                <td>{work.team_name ?? '-'}</td>
                <td>{teamTypeLabel(work.team_type)}</td>
                <td>{work.genres?.join(', ') || '-'}</td>
                <td className="admin-table__actions">
                  <Link to={`/admin/works/${work.id}`} className="admin-button admin-button--ghost">
                    수정
                  </Link>
                  <button
                    type="button"
                    className="admin-button admin-button--danger"
                    onClick={() => void handleDelete(work)}
                    disabled={deletingId === work.id}
                  >
                    {deletingId === work.id ? '삭제 중...' : '삭제'}
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
