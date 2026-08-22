import { Route, Routes } from 'react-router-dom';
import { AdminGuard } from './components/AdminGuard';
import { ScrollManager } from './components/ScrollManager';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OverviewPage } from './pages/OverviewPage';
import { WorkDetailPage } from './pages/WorkDetailPage';
import { WorksPage } from './pages/WorksPage';
import { AdminCommentOrgsPage } from './pages/admin/AdminCommentOrgsPage';
import { AdminInquiriesPage } from './pages/admin/AdminInquiriesPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminWorkFormPage } from './pages/admin/AdminWorkFormPage';
import { AdminWorksPage } from './pages/admin/AdminWorksPage';

export function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/works" element={<WorksPage />} />
        <Route path="/works/:id" element={<WorkDetailPage />} />
        <Route path="/about" element={<AboutPage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<AdminWorksPage />} />
          <Route path="works/new" element={<AdminWorkFormPage />} />
          <Route path="works/:id" element={<AdminWorkFormPage />} />
          <Route path="inquiries" element={<AdminInquiriesPage />} />
          <Route path="comment-orgs" element={<AdminCommentOrgsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
