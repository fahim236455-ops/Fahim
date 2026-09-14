import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Mail, ArrowRight, ArrowLeft, Sun, Moon } from 'lucide-react';

import { Logo } from '../components/Logo';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, settings, showToast, isDarkMode, toggleDarkMode } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('অনুগ্রহ করে সকল তথ্য পূরণ করুন', 'error');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      onNavigate('dashboard');
    } catch (err: any) {
      showToast(err.message || 'লগইন ব্যর্থ হয়েছে', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center px-4 py-8 relative overflow-hidden transition-colors ${
      isDarkMode ? 'bg-[#060b18] text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Background glow effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-sky-600/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Top Header Bar with Back Button & Theme Toggle */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোম পেজে ফিরে যান</span>
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-white dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 shadow-xs transition-colors cursor-pointer"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8 flex flex-col items-center">
          <Logo size={72} variant="stacked" className="mb-2 drop-shadow-md" />
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium tracking-wide">
            আপনার অ্যাকাউন্টে লগইন করে আয় শুরু করুন
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#0c1222]/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-200 dark:border-sky-500/20 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block tracking-wide">
                ইমেইল অথবা মোবাইল নম্বর:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@fahimpaybd.com অথবা 01712345678"
                  className="w-full text-sm font-semibold pl-10 pr-3 py-3 rounded-xl bg-slate-50 dark:bg-[#0a1128] border border-slate-300 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">
                  পাসওয়ার্ড:
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-bold transition-colors"
                >
                  ভুলে গেছেন?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm font-semibold pl-10 pr-3 py-3 rounded-xl bg-slate-50 dark:bg-[#0a1128] border border-slate-300 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-sky-500/25 border border-sky-400/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>লগইন করুন</span>
                  <ArrowRight className="w-4 h-4 drop-shadow-md" />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="text-center pt-3 text-xs text-slate-600 dark:text-slate-400 font-medium border-t border-slate-200 dark:border-slate-800">
            নতুন একাউন্ট করতে চান?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer ml-1 transition-colors"
            >
              রেজিস্ট্রেশন করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
