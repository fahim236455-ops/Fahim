import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/Logo';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (route: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { adminLogin, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('অনুগ্রহ করে অ্যাডমিন ইমেইল ও পাসওয়ার্ড প্রদান করুন।', 'error');
      return;
    }

    try {
      setLoading(true);
      await adminLogin(email.trim(), password);
      onNavigate('admin');
    } catch (err: any) {
      showToast(err.message || 'অ্যাডমিন লগইন ব্যর্থ হয়েছে। সঠিক তথ্য প্রদান করুন।', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center px-4 py-8 max-w-md mx-auto font-['Hind_Siliguri',sans-serif]">
      {/* Brand Header */}
      <div className="text-center space-y-2 mb-6 flex flex-col items-center">
        <div className="relative mb-2">
          <Logo size={60} variant="icon" />
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full border-2 border-slate-950 shadow-md">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Logo variant="wordmark" />
        </div>
        <h1 className="text-sm font-bold text-amber-400 tracking-wide">
          অ্যাডমিন সিকিউর কন্ট্রোল প্যানেল
        </h1>
        <p className="text-[11px] text-slate-400 font-medium">
          প্রশাসনিক সিকিউরিটি গেটওয়ে (ম্যানেজমেন্ট পোর্টাল)
        </p>
      </div>

      {/* Admin Login Card */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-4">
        {/* Security Alert Header */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-300 leading-relaxed">
            এই পোর্টালটি শুধুমাত্র অনুমোদিত অ্যাডমিনদের ব্যবহারের জন্য সংরক্ষিত। সমস্ত লগইন প্রচেষ্টা এবং আইপি রেকর্ড পর্যবেক্ষণ করা হয়।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 block">
              অ্যাডমিনিস্ট্রেটর ইমেইল:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="আপনার অ্যাডমিন ইমেইল টাইপ করুন..."
                className="w-full text-xs font-medium pl-9 p-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 block">
              সিক্রেট মাস্টার পাসওয়ার্ড:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড টাইপ করুন..."
                className="w-full text-xs font-medium pl-9 pr-10 p-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors p-0.5"
                title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm py-3 rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'সুরক্ষিত যাচাই হচ্ছে...' : 'অ্যাডমিন প্যানেলে প্রবেশ করুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800/80">
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center justify-center gap-1.5 mx-auto py-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ইউজার ড্যাশবোর্ডে ফিরে যান</span>
          </button>
        </div>
      </div>
    </div>
  );
};
