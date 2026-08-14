import { Fragment, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Tables } from '../../types/database.types';

type Inquiry = Tables<'inquiry'>;

function formatDate(value: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    void (async () => {
      const { data, error: loadError } = await supabase
        .from('inquiry')
        .select('*')
        .order('created_at', { ascending: false });

      if (!alive) return;
      if (loadError) {
        setError('문의를 불러오지 못했습니다.');
      } else {
        setInquiries(data ?? []);
      }
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  async function toggleChecked(inquiry: Inquiry) {
    const next = !inquiry.is_checked;
    // 낙관적 업데이트 후 실패하면 되돌린다.
    setInquiries((prev) =>
      prev.map((item) => (item.id === inquiry.id ? { ...item, is_checked: next } : item)),
    );

    const { error: updateError } = await supabase
      .from('inquiry')
      .update({ is_checked: next })
      .eq('id', inquiry.id);

    if (updateError) {
      setError('확인 상태를 변경하지 못했습니다.');
      setInquiries((prev) =>
        prev.map((item) => (item.id === inquiry.id ? { ...item, is_checked: !next } : item)),
      );
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page__head">
        <h1 className="admin-page__title">문의 관리</h1>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      {loading ? (
        <p className="admin-state">불러오는 중입니다...</p>
      ) : inquiries.length === 0 ? (
        <p className="admin-state">등록된 문의가 없습니다.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>확인</th>
              <th>제목</th>
              <th>이름</th>
              <th>연락처</th>
              <th>등록일</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <Fragment key={inquiry.id}>
                <tr
                  className={`admin-table__row${inquiry.is_checked ? ' is-checked' : ''}`}
                  onClick={() => setOpenId(openId === inquiry.id ? null : inquiry.id)}
                >
                  <td onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={Boolean(inquiry.is_checked)}
                      onChange={() => void toggleChecked(inquiry)}
                      aria-label="확인 처리"
                    />
                  </td>
                  <td>{inquiry.title}</td>
                  <td>{inquiry.name}</td>
                  <td>
                    {inquiry.email}
                    {inquiry.phone ? ` / ${inquiry.phone}` : ''}
                  </td>
                  <td>{formatDate(inquiry.created_at)}</td>
                </tr>
                {openId === inquiry.id ? (
                  <tr>
                    <td colSpan={5} className="admin-table__detail">
                      {inquiry.content}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
