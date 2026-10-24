import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { UserLayout } from '../layouts/UserLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Route Guards
import { RequireAuth, RequireAdmin } from './guards';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { AboutPage } from '../pages/public/AboutPage';
import { PrivacyPage } from '../pages/public/PrivacyPage';
import { TermsPage } from '../pages/public/TermsPage';

// Auth Pages
import { WelcomePage } from '../pages/auth/WelcomePage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { VerifyOtpPage } from '../pages/auth/VerifyOtpPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';

// Referral Pages
import { ReferralLandingPage } from '../pages/registration/ReferralLandingPage';
import { DonorRegistrationPage } from '../pages/registration/DonorRegistrationPage';
import { RegistrationReviewPage } from '../pages/registration/RegistrationReviewPage';
import { RegistrationSuccessPage } from '../pages/registration/RegistrationSuccessPage';

// Donor App Pages
import { DonorDashboardPage } from '../pages/app/DonorDashboardPage';
import { MyDonorsPage } from '../pages/app/MyDonorsPage';
import { DonorDetailsPage } from '../pages/app/DonorDetailsPage';
import { ReferralCenterPage } from '../pages/app/ReferralCenterPage';
import { ShareReferralPage } from '../pages/app/ShareReferralPage';
import { NotificationsPage } from '../pages/app/NotificationsPage';
import { ProfilePage } from '../pages/app/ProfilePage';
import { EditProfilePage } from '../pages/app/EditProfilePage';
import { SettingsPage } from '../pages/app/SettingsPage';
import { PrivacySettingsPage } from '../pages/app/PrivacySettingsPage';
import { HelpSupportPage } from '../pages/app/HelpSupportPage';

// Admin Pages
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminDonorsPage } from '../pages/admin/AdminDonorsPage';
import { AdminReferralsPage } from '../pages/admin/AdminReferralsPage';
import { AdminConsentsPage } from '../pages/admin/AdminConsentsPage';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

// Error Pages
import { NotFoundPage } from '../pages/errors/NotFoundPage';
import { UnauthorizedPage } from '../pages/errors/UnauthorizedPage';

export const router = createBrowserRouter([
  // Public Routes (Marketing, Policy, Info)
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },

      // Referral Flow Routes inside PublicLayout (Crucial precedence: success route before dynamic parameter)
      { path: 'join/success', element: <RegistrationSuccessPage /> },
      { path: 'join/:referralCode', element: <ReferralLandingPage /> },
      { path: 'join/:referralCode/register', element: <DonorRegistrationPage /> },
      { path: 'join/:referralCode/review', element: <RegistrationReviewPage /> },
    ],
  },

  // Auth Routes
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'welcome', element: <WelcomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'verify-otp', element: <VerifyOtpPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // Donor App Protected Routes
  {
    path: '/app',
    element: (
      <RequireAuth>
        <UserLayout />
      </RequireAuth>
    ),
    children: [
      { path: 'dashboard', element: <DonorDashboardPage /> },
      { path: 'donors', element: <MyDonorsPage /> },
      { path: 'donors/:id', element: <DonorDetailsPage /> },
      { path: 'referrals', element: <ReferralCenterPage /> },
      { path: 'referrals/share', element: <ShareReferralPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'profile/edit', element: <EditProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'settings/privacy', element: <PrivacySettingsPage /> },
      { path: 'help', element: <HelpSupportPage /> },
    ],
  },

  // Admin Login (Dedicated Unprotected Route)
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },

  // Admin Protected Routes
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'donors', element: <AdminDonorsPage /> },
      { path: 'referrals', element: <AdminReferralsPage /> },
      { path: 'consents', element: <AdminConsentsPage /> },
      { path: 'audit-logs', element: <AdminAuditLogsPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ],
  },

  // Errors & Fallbacks
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
