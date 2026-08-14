import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminSession } from '../hooks/useAdminSession';

/**
 * 관리자 라우트 가드. 화면 진입만 막을 뿐 실제 권한 통제는 RLS가 한다.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { signedIn, isAdmin, loading } = useAdminSession();
  const location = useLocation();

  if (loading) {
    return <p className="admin-state">확인 중입니다...</p>;
  }

  if (!signedIn) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return (
      <div className="admin-state admin-state--error">
        <p>관리자 권한이 없는 계정입니다.</p>
      </div>
    );
  }

  return <>{children}</>;
}
