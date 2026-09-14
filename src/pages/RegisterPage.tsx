import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Phone, Mail, Lock, Gift, ArrowRight, ArrowLeft } from 'lucide-react';

import { Logo } from '../components/Logo';

interface RegisterPageProps {
  onNavigate: (route: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register, settings, showToast } = useApp();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Extract ?ref= from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) {
        setReferralCode(ref.trim());
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phoneNumber || !email || !password) {
      showToast('সকল আবশ্যকীয় তথ্য পূরণ করুন', 'error');
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(phoneNumber.replace(/\s+/g, ''))) {
      showToast('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('পাসওয়ার্ড ও নিশ্চিত পাসওয়ার্ড মিলছে না', 'error');
      return;
    }

    try {
      setLoading(true);
      await register({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        referralCode: referralCode.trim() || undefined,
      });
      onNavigate('dashboard');
    } catch (err: any) {
      showToast(err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b18] flex flex-col justify-center px-4 py-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-sky-600/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Back to Home */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="self-start mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>হোম পেজে ফিরে যান</span>
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8 flex flex-col items-center">
          <Logo size={72} variant="stacked" className="mb-2 drop-shadow-md" />
          <h1 className="text-lg font-black text-white tracking-tight drop-shadow-md">
            নতুন অ্যাকাউন্ট তৈরি করুন
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Earnora-তে ফ্রি একাউন্ট খুলে এখনই আয় শুরু করুন
          </p>
        </div>

        {/* Register Card */}
        <div className="glass-panel-dark rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/20 border border-sky-500/20 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block tracking-wide">আপনার পুরো নাম:</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="যেমন: ফাহিম আহমেদ"
                  className="w-full text-sm font-medium pl-10 pr-3 py-3 rounded-xl bg-[#0a1128] border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50 shadow-inner transition-all"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block tracking-wide">মোবাইল নম্বর (১১ ডিজিট):</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="01712345678"
                  className="w-full text-sm font-medium pl-10 pr-3 py-3 rounded-xl bg-[#0a1128] border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50 shadow-inner transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block tracking-wide">ইমেইল অ্যাড্রেস:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-sm font-medium pl-10 pr-3 py-3 rounded-xl bg-[#0a1128] border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50 shadow-inner transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block tracking-wide">পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর):</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm font-medium pl-10 pr-3 py-3 rounded-xl bg-[#0a1128] border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50 shadow-inner transition-all"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block tracking-wide">পাসওয়ার্ড নিশ্চিত করুন:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm font-medium pl-10 pr-3 py-3 rounded-xl bg-[#0a1128] border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50 shadow-inner transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-sky-500/25 border border-sky-400/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'রেজিস্ট্রেশন সম্পন্ন করুন'}</span>
              <ArrowRight className="w-4 h-4 drop-shadow-md" />
            </button>
          </form>

          {/* Login link */}
          <div className="text-center pt-3 text-xs text-slate-400 border-t border-white/5 font-medium">
            ইতিমধ্যে একাউন্ট আছে?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-bold text-sky-400 hover:text-sky-300 cursor-pointer transition-colors"
            >
              লগইন করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
