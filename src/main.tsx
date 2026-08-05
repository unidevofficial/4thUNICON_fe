import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';

// 원본 style.css / works.css를 그대로 옮긴 파일 (에셋 경로만 절대경로로 조정)
import './styles/style.css';
import './styles/works.css';
// 미확정 콘텐츠용 플레이스홀더 스타일 (원본 CSS를 건드리지 않기 위해 분리)
import './styles/placeholders.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
