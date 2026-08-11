import { Navigate, Route, Routes } from 'react-router-dom';
import { ScrollManager } from './components/ScrollManager';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { OverviewPage } from './pages/OverviewPage';
import { WorkDetailPage } from './pages/WorkDetailPage';
import { WorksPage } from './pages/WorksPage';

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
