import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedAdminRoute } from './components/admin/ProtectedAdminRoute';

import { HomePage } from './pages/public/HomePage';
import { BrowsePage } from './pages/public/BrowsePage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { TermsPage } from './pages/public/TermsPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminResourcesPage } from './pages/admin/AdminResourcesPage';
import { AdminResourceFormPage } from './pages/admin/AdminResourceFormPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes */}
          <Route path='/' element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path='resources' element={<BrowsePage />} />
            <Route path='about' element={<AboutPage />} />
            <Route path='contact' element={<ContactPage />} />
            <Route path='privacy' element={<PrivacyPage />} />
            <Route path='terms' element={<TermsPage />} />
          </Route>

          {/* Admin Login Route (Public within admin domain) */}
          <Route path='/admin/login' element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route path='/admin' element={<ProtectedAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path='resources' element={<AdminResourcesPage />} />
              <Route path='resources/new' element={<AdminResourceFormPage />} />
              <Route path='resources/:id/edit' element={<AdminResourceFormPage />} />
              <Route path='reports' element={<AdminReportsPage />} />
            </Route>
          </Route>

          {/* 404 Catch All */}
          <Route path='*' element={<PublicLayout />}>
            <Route path='*' element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
