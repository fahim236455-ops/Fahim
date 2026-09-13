import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Phone, Mail, Lock, Gift, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20">
          EA
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          নতুন অ্যাকাউন্ট তৈরি করুন
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          {settings?.brandName || 'Earnora'}-তে ফ্রি একাউন্ট খুলে এখনই আয় শুরু করুন
        </p>
      </div>

      {/* Register Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-md space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">আপনার পুরো নাম:</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="যেমন: ফাহিম আহমেদ"
                className="w-full text-xs font-medium pl-9 p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">মোবাইল নম্বর (১১ ডিজিট):</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="01712345678"
                className="w-full text-xs font-medium pl-9 p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">ইমেইল অ্যাড্রেস:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs font-medium pl-9 p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর):</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs font-medium pl-9 p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">পাসওয়ার্ড নিশ্চিত করুন:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs font-medium pl-9 p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Referral Code (optional) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>রেফারেল কোড (ঐচ্ছিক):</span>
              <span className="text-[11px] text-amber-700 font-semibold">বোনাস কোড</span>
            </label>
            <div className="relative">
              <Gift className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="যেমন: FPB101"
                className="w-full text-xs font-mono font-bold pl-9 p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'রেজিস্ট্রেশন সম্পন্ন করুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Login link */}
        <div className="text-center pt-2 text-xs text-slate-600 border-t border-slate-100">
          ইতিমধ্যে একাউন্ট আছে?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-emerald-600 hover:text-emerald-700 underline"
          >
            লগইন করুন
          </button>
        </div>
      </div>
    </div>
  );
};
