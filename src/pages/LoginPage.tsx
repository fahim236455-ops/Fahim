import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

import { Logo } from '../components/Logo';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, settings, showToast } = useApp();
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
      {/* Back to Home */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="self-start mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>হোম পেজে ফিরে যান</span>
      </button>

      {/* Brand Header */}
      <div className="text-center space-y-2 mb-6 flex flex-col items-center">
        <Logo size={72} variant="stacked" className="mb-2" />
        <p className="text-xs text-slate-500 font-medium">
          আপনার অ্যাকাউন্টে লগইন করে আয় শুরু করুন
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-md space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">ইমেইল অথবা মোবাইল নম্বর:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@fahimpaybd.com অথবা 01712345678"
                className="w-full text-xs font-medium pl-9 p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">পাসওয়ার্ড:</label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold"
              >
                ভুলে গেছেন?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs font-medium pl-9 p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50"
          >
            <span>{loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Register link */}
        <div className="text-center pt-2 text-xs text-slate-600">
          নতুন একাউন্ট করতে চান?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-emerald-600 hover:text-emerald-700 underline"
          >
            রেজিস্ট্রেশন করুন
          </button>
        </div>
      </div>
    </div>
  );
};
