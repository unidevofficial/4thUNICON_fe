import { Route, Routes } from 'react-router-dom';
import { ScrollManager } from './components/ScrollManager';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OverviewPage } from './pages/OverviewPage';
import { WorksPage } from './pages/WorksPage';

export function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/works" element={<WorksPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
