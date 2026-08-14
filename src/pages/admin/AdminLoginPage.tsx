import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      setSubmitting(false);
      return;
    }

    // 관리자 여부는 가드에서 다시 판정한다.
    navigate('/admin', { replace: true });
  }

  return (
    <main className="admin-login">
      <form className="admin-login__form" onSubmit={handleSubmit}>
        <h1 className="admin-login__title">관리자 로그인</h1>

        <label className="admin-field">
          <span className="admin-field__label">이메일</span>
          <input
            type="email"
            className="admin-field__input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="admin-field">
          <span className="admin-field__label">비밀번호</span>
          <input
            type="password"
            className="admin-field__input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error ? <p className="admin-error">{error}</p> : null}

        <button type="submit" className="admin-button" disabled={submitting}>
          {submitting ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </main>
  );
}
