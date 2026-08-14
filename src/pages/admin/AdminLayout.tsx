import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export function AdminLayout() {
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin">
      <header className="admin__header">
        <nav className="admin__nav">
          <NavLink to="/admin" end className="admin__nav-link">
            출품작 관리
          </NavLink>
          <NavLink to="/admin/inquiries" className="admin__nav-link">
            문의 관리
          </NavLink>
        </nav>
        <button type="button" className="admin-button admin-button--ghost" onClick={handleSignOut}>
          로그아웃
        </button>
      </header>

      <main className="admin__body">
        <Outlet />
      </main>
    </div>
  );
}
