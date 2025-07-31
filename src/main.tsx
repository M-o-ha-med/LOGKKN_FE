import { StrictMode , Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/loginPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import LandingPage from './pages/LandingPage.tsx';
import ArticlePage from './pages/ArticlePage.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx'
import PrivateRoute from './utils/PrivateRoute.tsx';
import PublicRoute from './utils/PublicRoute.tsx';
import { RecoilRoot } from 'recoil';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement); // Create root

root.render( // Use render to update app
  <StrictMode>
		<RecoilRoot>
		 <BrowserRouter>
				<Routes>
					<Route path="/admin"  element={
						<Suspense fallback={<p>Loading Cik !</p>}>
							<PrivateRoute/>
						</Suspense>
					}>
						<Route path="dashboard" element={<AdminPage />} />
						<Route path="articles" element={<AdminPage />} />
						<Route path="articles/new" element={<AdminPage />} />
						<Route path="articles/update/:slug" element={<AdminPage />} />
					</Route>


					
					<Route element={
						<Suspense fallback={<p>Loading Cik !</p>}>
							<PublicRoute/>
						</Suspense>
					}>
					<Route path="/" element={<LandingPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/logs/:slug" element={<ArticlePage />} />
					<Route path="/login/forget" element={<ResetPasswordPage />} />
				</Route>
					
				</Routes>
		  </BrowserRouter>
		</RecoilRoot>
  </StrictMode>
);