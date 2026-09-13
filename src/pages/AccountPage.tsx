import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../lib/api';
import {
  User,
  Mail,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  Camera,
  Trash2,
  CheckCircle2,
  Lock,
  Phone,
  Copy,
  Check,
  Share2,
  Gift,
  Sparkles,
} from 'lucide-react';

interface AccountPageProps {
  onNavigate: (route: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { user, showToast, isAdmin, refreshUser, settings } = useApp();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const referralCode = user?.referralCode || 'FPB101';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const referralLink = `${origin}/register?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    showToast('রেফারেল লিংক ক্লিপবোর্ডে কপি করা হয়েছে!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    showToast(`রেফারেল কোড (${referralCode}) কপি করা হয়েছে!`, 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${settings?.brandName || 'Earnora'} - ঘরে বসে আয় করুন`,
          text: `${settings?.brandName || 'Earnora'}-এ জয়েন করুন এবং প্রতিদিন ২০০-৫০০ টাকা আয় করুন। আমার রেফারেল লিংক:`,
          url: referralLink,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleUpdateInformation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword.length < 6) {
      showToast('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', 'error');
      return;
    }

    try {
      setSubmitting(true);
      let message = '';

      // Update full name and phone number
      if ((fullName && fullName !== user?.fullName) || (phoneNumber && phoneNumber !== user?.phoneNumber)) {
        const res = await fetchApi<{ message: string }>('/user/update-profile', {
          method: 'PUT',
          body: JSON.stringify({ fullName, phoneNumber }),
        });
        message += res.message + ' ';
        await refreshUser();
      }

      // Update password
      if (newPassword) {
        const res = await fetchApi<{ message: string }>('/auth/change-password', {
          method: 'POST',
          body: JSON.stringify({ newPassword }),
        });
        message += res.message;
        setNewPassword('');
      }

      if (message) {
        showToast(message.trim(), 'success');
      } else {
        showToast('কোনো তথ্য পরিবর্তন করা হয়নি।', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'আপডেট ব্যর্থ হয়েছে।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনার অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলতে চান?')) {
      showToast('অ্যাকাউন্ট ডিলিট রিকোয়েস্ট অ্যাডমিন প্যানেলে পাঠানো হয়েছে।', 'info');
    }
  };

  const userInitial = user?.fullName?.trim()?.charAt(0)?.toUpperCase() || 'F';

  return (
    <div className="min-h-screen bg-[#060b18] text-slate-100 pb-24 font-['Hind_Siliguri',sans-serif]">
      {/* Header */}
      <div className="pt-5 pb-3 text-center">
        <h1 className="text-base sm:text-lg font-black text-white tracking-tight">আমার প্রোফাইল ও অ্যাকাউন্ট</h1>
        <p className="text-xs text-slate-400">ব্যক্তিগত তথ্য ও রেফারেল সেটিংস পরিচালনা করুন</p>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-4">
        {/* 1. UNIQUE REFERRAL LINK & CODE CARD (With Copy to Clipboard Button) */}
        <div className="bg-[#0b1329] border border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-3.5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-white">আমার রেফারেল লিংক</h2>
                <p className="text-[11px] text-slate-400">লিংক শেয়ার করে প্রতি রেফারে ৳৫০ বোনাস পান</p>
              </div>
            </div>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
              ৳৫০ বোনাস
            </span>
          </div>

          {/* Referral Code Chip */}
          <div className="flex items-center justify-between bg-[#060b18] rounded-xl p-2.5 border border-slate-800">
            <span className="text-xs text-slate-300">
              রেফারেল কোড: <strong className="text-amber-400 font-mono text-sm ml-1">{referralCode}</strong>
            </span>
            <button
              onClick={handleCopyCode}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'কপি হয়েছে' : 'কোড কপি'}</span>
            </button>
          </div>

          {/* Referral Link & Copy to Clipboard Button */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 block">
              ইউনিক রেফারেল লিংক:
            </label>
            <div className="flex items-center gap-2 bg-[#060b18] rounded-xl p-1.5 border border-slate-800 focus-within:border-amber-500/60 transition-colors">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="bg-transparent text-xs text-amber-200 font-mono flex-1 outline-none truncate px-2 selection:bg-amber-500/30"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black px-3.5 py-2 rounded-lg flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer shadow-md"
                title="ক্লিপবোর্ডে কপি করুন"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'কপি হয়েছে' : 'Copy Link'}</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold p-2 rounded-lg flex items-center shrink-0 transition-colors border border-slate-700 cursor-pointer"
                title="শেয়ার করুন"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. MAIN EDIT PROFILE CARD */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-emerald-400 bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-white text-2xl font-black shadow-inner overflow-hidden">
                {userInitial}
              </div>
              <button
                type="button"
                onClick={() => showToast('ফটো পরিবর্তন অপশনটি শীঘ্রই আসছে।', 'info')}
                className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-full border-2 border-[#0b1329] shadow-md hover:scale-105 transition-transform cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">প্রোফাইল পিকচার</p>
          </div>

          <form onSubmit={handleUpdateInformation} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">পুরো নাম (Full Name)</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#060b18] border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="আপনার পুরো নাম"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">ফোন নম্বর (Phone Number)</label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#060b18] border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 transition-colors font-mono"
                  placeholder="017XXXXXXXX"
                />
              </div>
            </div>

            {/* Email (Immutable) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">ইমেইল (অপরিবর্তনীয়)</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type="email"
                  readOnly
                  value={user?.email || ''}
                  className="w-full pl-10 pr-24 py-2.5 bg-[#060b18]/60 border border-slate-800/80 rounded-xl text-xs sm:text-sm text-slate-500 cursor-not-allowed focus:outline-none font-mono"
                />
                <div className="absolute right-3.5 flex items-center gap-1.5 text-slate-500">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold">Locked</span>
                </div>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">নতুন পাসওয়ার্ড (পরিবর্তন না করতে চাইলে খালি রাখুন)</label>
              <div className="relative flex items-center">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#060b18] border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-600 font-mono"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 p-1 text-slate-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm py-3 rounded-xl shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'সংরক্ষণ করা হচ্ছে...' : 'তথ্য আপডেট করুন'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 3. ADMIN QUICK ACCESS (If Admin) */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-amber-500/15 via-[#0b1329] to-amber-500/10 rounded-2xl p-4 border border-amber-500/40 shadow-lg space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-amber-300">এডমিন কন্ট্রোল প্যানেল</h3>
                <p className="text-[11px] text-slate-400">সকল ইউজার, উইথড্র ও সিস্টেম পরিচালনা</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('admin')}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>এডমিন পোর্টালে প্রবেশ করুন</span>
            </button>
          </div>
        )}

        {/* 4. DELETE ACCOUNT CARD */}
        <div className="bg-rose-950/20 rounded-2xl p-4 border border-rose-900/40 flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-rose-400">অ্যাকাউন্ট ডিলিট</h3>
            <p className="text-[11px] text-slate-400">স্থায়ীভাবে অ্যাকাউন্ট মুছে ফেলতে আবেদন করুন</p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
