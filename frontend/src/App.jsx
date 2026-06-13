import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { SkeletonGrid } from './components/SkeletonCard.jsx';
import { analyticsApi } from './services/api.js';
import { useSeo } from './utils/seo.js';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const SectionPage = lazy(() => import('./pages/SectionPage.jsx'));
const ApPage = lazy(() => import('./pages/ApPage.jsx'));
const DistrictPage = lazy(() => import('./pages/DistrictPage.jsx'));
const OtherPage = lazy(() => import('./pages/OtherPage.jsx'));
const OtherCategoryPage = lazy(() => import('./pages/OtherCategoryPage.jsx'));
const ArticlePage = lazy(() => import('./pages/ArticlePage.jsx'));
const EpaperPage = lazy(() => import('./pages/EpaperPage.jsx'));
const AdminPage = lazy(() => import('./admin/AdminPage.jsx'));
const AdminLogin = lazy(() => import('./admin/AdminLogin.jsx'));

const VISITOR_KEY = 'visitor-id';
const VISIT_DAY_KEY = 'last-visit-day';
const SESSION_KEY = 'session-id';

const getOrCreateVisitorId = () => {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = `v-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
};

const getOrCreateSessionId = () => {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const showFooter = !isAdminRoute;
  const showHeader = !isAdminRoute;
  const pageTitle = isAdminRoute ? 'Admin Dashboard | Greater Today' : 'Greater Today News';
  useSeo({
    title: pageTitle,
    description: 'Bilingual Telugu and English news with e-paper editions.'
  });

  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();
    const today = new Date().toISOString().slice(0, 10);
    const lastVisitDay = localStorage.getItem(VISIT_DAY_KEY);

    if (lastVisitDay !== today) {
      analyticsApi
        .track({ type: 'visit', visitorId, sessionId, path: location.pathname, referrer: document.referrer || '' })
        .catch(() => {});
      localStorage.setItem(VISIT_DAY_KEY, today);
    }

    analyticsApi
      .track({ type: 'pageview', visitorId, sessionId, path: location.pathname + location.search, referrer: document.referrer || '' })
      .catch(() => {});
  }, [location.pathname, location.search]);

  return (
    <div className="app-shell">
      {showHeader ? <Header /> : null}
      <Suspense fallback={<main className="page"><section className="article-grid"><SkeletonGrid count={6} /></section></main>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/amaravati" element={<SectionPage categoryType="amaravati" />} />
          <Route path="/ap" element={<ApPage />} />
          <Route path="/district/:id" element={<DistrictPage />} />
          <Route path="/international" element={<SectionPage categoryType="international" />} />
          <Route path="/national" element={<SectionPage categoryType="national" />} />
          <Route path="/editorial" element={<SectionPage categoryType="editorial" />} />
          <Route path="/sports" element={<SectionPage categoryType="sports" />} />
          <Route path="/cinema" element={<SectionPage categoryType="cinema" />} />
          <Route path="/special" element={<SectionPage categoryType="special" />} />
          <Route path="/special/health" element={<SectionPage categoryType="special" subcategory="health" />} />
          <Route path="/special/women" element={<SectionPage categoryType="special" subcategory="women" />} />
          <Route path="/special/devotional" element={<SectionPage categoryType="special" subcategory="devotional" />} />
          <Route path="/special/crime" element={<SectionPage categoryType="special" subcategory="crime" />} />
          <Route path="/other" element={<OtherPage />} />
          <Route path="/other/:id" element={<OtherCategoryPage />} />
          <Route path="/articles/:id" element={<ArticlePage />} />
          <Route path="/epaper" element={<EpaperPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Suspense>
      {showFooter ? <Footer /> : null}
    </div>
  );
};

export default App;
