import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import HomePage from './pages/HomePage.jsx';
import SectionPage from './pages/SectionPage.jsx';
import ApPage from './pages/ApPage.jsx';
import DistrictPage from './pages/DistrictPage.jsx';
import OtherPage from './pages/OtherPage.jsx';
import OtherCategoryPage from './pages/OtherCategoryPage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import EpaperPage from './pages/EpaperPage.jsx';
import AdminPage from './admin/AdminPage.jsx';
import Footer from './components/Footer.jsx';

const App = () => {
  const location = useLocation();
  const showFooter = !location.pathname.startsWith('/admin');

  return (
    <div className="app-shell">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/amaravati" element={<SectionPage categoryType="amaravati" />} />
        <Route path="/ap" element={<ApPage />} />
        <Route path="/district/:id" element={<DistrictPage />} />
        <Route path="/international" element={<SectionPage categoryType="international" />} />
        <Route path="/national" element={<SectionPage categoryType="national" />} />
        <Route path="/sports" element={<SectionPage categoryType="sports" />} />
        <Route path="/cinema" element={<SectionPage categoryType="cinema" />} />
        <Route path="/other" element={<OtherPage />} />
        <Route path="/other/:id" element={<OtherCategoryPage />} />
        <Route path="/articles/:id" element={<ArticlePage />} />
        <Route path="/epaper" element={<EpaperPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      {showFooter ? <Footer /> : null}
    </div>
  );
};

export default App;
