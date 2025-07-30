import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/loginPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import LandingPage from './pages/LandingPage.tsx';
import ArticlePage from './pages/ArticlePage.tsx';
import { RecoilRoot } from 'recoil';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
			<Route path="/logs/:slug" element={<ArticlePage />} />
          </Route>

          {/* Private Routes */}
          <Route path="/admin">
            <Route path="dashboard" element={<AdminPage />} />
            <Route path="articles" element={<AdminPage />} />
            <Route path="articles/new" element={<AdminPage />} />
            <Route path="articles/update/:slug" element={<AdminPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  </StrictMode>
);
