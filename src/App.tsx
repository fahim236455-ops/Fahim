import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/ToastContainer';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { TeamPage } from './pages/TeamPage';
import { IncomeHistoryPage } from './pages/IncomeHistoryPage';
import { WithdrawHistoryPage } from './pages/WithdrawHistoryPage';
import { PendingStatusPage } from './pages/PendingStatusPage';
import { SupportPage } from './pages/SupportPage';
import { AccountPage } from './pages/AccountPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { LandingPage } from './pages/LandingPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { LeadershipPage } from './pages/LeadershipPage';
import { GmailSellPage } from './pages/GmailSellPage';
import { FacebookSellPage } from './pages/FacebookSellPage';
import { InstagramSellPage } from './pages/InstagramSellPage';
import { SystemClosedPage } from './pages/SystemClosedPage';
import { JobPostPage } from './pages/JobPostPage';
import { Logo } from './components/Logo';

function AppContent() {
  const { user, isLoading, isAdmin, settings } = useApp();

  // Route state
  const getInitialRoute = () => {
    if (typeof window === 'undefined') return 'dashboard';
    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    const path = window.location.pathname.replace(/^\//, '').trim() || 'dashboard';
    const effective = hash || path;

    if (effective === 'admin' || effective === 'admin/panel') return 'admin';
    if (effective === 'admin/login' || effective === 'admin-login') return 'admin-login';
    if (effective === 'login') return 'login';
    if (effective === 'register') return 'register';
    if (effective === 'forgot-password') return 'forgot-password';
    if (effective === 'tasks') return 'tasks';
    if (effective === 'job-post' || effective === 'post-job') return 'job-post';
    if (effective === 'withdraw') return 'withdraw';
    if (effective === 'team') return 'team';
    if (effective === 'income-history') return 'income-history';
    if (effective === 'withdraw-history') return 'withdraw-history';
    if (effective === 'pending-status') return 'pending-status';
    if (effective === 'leadership') return 'leadership';
    if (effective === 'gmail-sell') return 'gmail-sell';
    if (effective === 'facebook-sell') return 'facebook-sell';
    if (effective === 'instagram-sell') return 'instagram-sell';
    if (effective === 'system-closed') return 'system-closed';
    if (effective === 'support') return 'support';
    if (effective === 'account') return 'account';
    return 'dashboard';
  };

  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      const targetPath = route === 'dashboard' ? '/' : `/${route}`;
      window.history.pushState({}, '', targetPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Show loading spinner while initial session check is ongoing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center">
          <Logo size={68} variant="stacked" />
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-400 font-sans tracking-wide">লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
      </div>
    );
  }

  // Admin routes
  if (currentRoute === 'admin-login') {
    return (
      <>
        <ToastContainer />
        <AdminLoginPage onNavigate={navigate} />
      </>
    );
  }

  if (currentRoute === 'admin') {
    return (
      <>
        <ToastContainer />
        <AdminPanelPage onNavigate={navigate} />
      </>
    );
  }

  // System Maintenance Mode Enforcement (when enabled from Admin Panel)
  if (settings?.maintenanceMode?.enabled && !isAdmin) {
    return (
      <>
        <ToastContainer />
        <SystemClosedPage onNavigate={navigate} />
      </>
    );
  }

  // Public unauthenticated routes
  if (currentRoute === 'login' && !user) {
    return (
      <>
        <ToastContainer />
        <LoginPage onNavigate={navigate} />
      </>
    );
  }

  if (currentRoute === 'register' && !user) {
    return (
      <>
        <ToastContainer />
        <RegisterPage onNavigate={navigate} />
      </>
    );
  }

  if (currentRoute === 'forgot-password' && !user) {
    return (
      <>
        <ToastContainer />
        <ForgotPasswordPage onNavigate={navigate} />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <ToastContainer />
        <LandingPage onNavigate={navigate} />
      </>
    );
  }

  // System Closed Standalone View (Matches SmallGigWork exact full-page snapshot)
  if (currentRoute === 'system-closed') {
    return (
      <>
        <ToastContainer />
        <SystemClosedPage onNavigate={navigate} />
      </>
    );
  }

  // Authenticated App Shell with Header and Bottom Navigation
  return (
    <div className="min-h-screen bg-slate-950 font-['Hind_Siliguri',sans-serif] text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <ToastContainer />

      <Header onNavigate={navigate} currentRoute={currentRoute} />

      <main className="min-h-[calc(100vh-120px)]">
        {currentRoute === 'dashboard' && <DashboardPage onNavigate={navigate} />}
        {currentRoute === 'tasks' && <TasksPage onNavigate={navigate} />}
        {currentRoute === 'job-post' && <JobPostPage onNavigate={navigate} />}
        {currentRoute === 'withdraw' && <WithdrawPage onNavigate={navigate} />}
        {currentRoute === 'team' && <TeamPage />}
        {currentRoute === 'income-history' && <IncomeHistoryPage onNavigate={navigate} />}
        {currentRoute === 'withdraw-history' && <WithdrawHistoryPage onNavigate={navigate} />}
        {currentRoute === 'pending-status' && <PendingStatusPage onNavigate={navigate} />}
        {currentRoute === 'leadership' && <LeadershipPage onNavigate={navigate} />}
        {currentRoute === 'gmail-sell' && <GmailSellPage onNavigate={navigate} />}
        {currentRoute === 'facebook-sell' && <FacebookSellPage onNavigate={navigate} />}
        {currentRoute === 'instagram-sell' && <InstagramSellPage onNavigate={navigate} />}
        {currentRoute === 'support' && <SupportPage onNavigate={navigate} />}
        {currentRoute === 'account' && <AccountPage onNavigate={navigate} />}
      </main>

      <BottomNav currentRoute={currentRoute} onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
