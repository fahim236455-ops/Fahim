import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../lib/api';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Wallet,
  Send,
  Youtube,
  Briefcase,
  Users,
  Keyboard,
  CheckSquare,
  FileCode2,
  ClipboardCheck,
  GraduationCap,
  Calculator,
  Mail,
  ThumbsUp,
  Camera,
  Instagram,
  Share2,
  ShoppingBag,
  RotateCw,
  HelpCircle,
  Ticket,
  Coins,
  Target,
  Trophy,
  Banknote,
  UserPlus,
  Award,
  Calendar,
  Star,
  Laptop,
  ShoppingCart,
  ShieldCheck,
  Gift,
  Heart,
  HandHeart,
  Sparkles,
  Smartphone,
  CheckCircle,
  ArrowDownCircle,
  Clock,
  History,
} from 'lucide-react';
import { DashboardModals } from '../components/DashboardModals';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, settings, refreshUser, showToast } = useApp();

  // Balance tap reveal state
  const [showBalance, setShowBalance] = useState(false);

  // Active modal state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Dismissed popup notice state
  const [dismissedNotice, setDismissedNotice] = useState(false);

  // Social services info state (Gmail, Facebook, Instagram)
  const [socialInfo, setSocialInfo] = useState<{
    gmail?: { rate: number; active: boolean; title: string };
    facebook?: { rate: number; active: boolean; title: string };
    instagram?: { rate: number; active: boolean; title: string };
  } | null>(null);

  useEffect(() => {
    fetch('/api/social-sell/info')
      .then((r) => r.json())
      .then((data) => setSocialInfo(data))
      .catch(() => {});
  }, []);

  // Auto-hide balance after 4.5 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showBalance) {
      timer = setTimeout(() => {
        setShowBalance(false);
      }, 4500);
    }
    return () => clearTimeout(timer);
  }, [showBalance]);

  const toggleBalance = () => {
    setShowBalance((prev) => !prev);
  };

  // Daily Checkin / Mission Handler
  const handleDailyCheckin = async () => {
    try {
      const res = await fetchApi<{ message: string; balance: number }>('/tasks/daily-checkin', {
        method: 'POST',
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.55 },
      });

      showToast(res.message || 'দৈনিক উপস্থিতি মিশন বোনাস সফলভাবে যোগ হয়েছে!', 'success');
      await refreshUser();
    } catch (err: any) {
      showToast(err.message || 'আজকের দৈনিক মিশন আগেই সম্পন্ন করা হয়েছে।', 'info');
    }
  };

  const brandName = settings?.brandName || 'Earnora';
  const announcementText = settings?.announcement || 'Welcome to Earnora. Refer your friends to earn more! Complete tasks daily to get instant bKash/Nagad payout!';
  const telegramLink = settings?.telegramChannelUrl || settings?.supportTelegram || 'https://t.me/fahimpaybd';
  const youtubeLink = settings?.heroVideoUrl || 'https://youtube.com';

  return (
    <div className="max-w-md mx-auto px-3.5 py-3 space-y-3.5 pb-24 font-['Hind_Siliguri',sans-serif]">
      {/* Dynamic Popup Notice Modal (when configured from Admin Panel) */}
      {settings?.popupNotice?.enabled && !dismissedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl relative space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-amber-300">
                {settings.popupNotice.title || 'গুরুত্বপূর্ণ নোটিশ'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {settings.popupNotice.message || 'সকল ইউজারদের অবগতির জন্য জানানো যাচ্ছে যে কাজ সঠিকভাবে সম্পন্ন করুন।'}
              </p>
            </div>

            <button
              onClick={() => setDismissedNotice(true)}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow-md active:scale-98 transition-all cursor-pointer"
            >
              ঠিক আছে, বুঝেছি
            </button>
          </div>
        </div>
      )}

      {/* 1. TOP NOTICE / MARQUEE TICKER */}
      <div className="bg-slate-900/90 rounded-full px-3.5 py-2 border border-slate-800 shadow-md flex items-center gap-2.5 overflow-hidden">
        <Volume2 className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="inline-block animate-marquee text-xs font-semibold text-slate-300">
            {announcementText}
          </div>
        </div>
      </div>

      {/* 2. HERO PROMOTIONAL BANNER */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-r from-slate-900 via-slate-950 to-amber-950/40 text-white p-4 border border-amber-500/30">
        {/* Background decorative lighting */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-500/10 rounded-full blur-xl pointer-events-none -ml-8 -mb-8" />

        <div className="relative z-10 flex items-center justify-between gap-2">
          {/* Left Text Content */}
          <div className="space-y-1.5 max-w-[62%]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wide">
                {brandName}
              </span>
              <span className="text-[9px] text-amber-200/80 font-medium hidden sm:inline">
                Trusted Digital Platform
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-black text-amber-300 leading-tight">
              প্রতিদিন ৪০০-৫০০৳ ইনকাম করুন!
            </h2>

            <p className="text-[10px] text-slate-300 leading-snug">
              ছোট ছোট কাজ করে, প্রতিদিন ঘরে বসেই গড়ে তুলুন আপনার বাড়তি আয়!
            </p>

            <div className="flex items-center gap-2 pt-1 text-[9px] text-slate-400 font-medium">
              <span className="flex items-center gap-0.5 text-emerald-400">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                100% Secure
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-amber-400">
                <CheckCircle className="w-3 h-3 text-amber-400" />
                Fast Payment
              </span>
            </div>
          </div>

          {/* Right Phone Mockup Graphic */}
          <div className="relative shrink-0">
            <div className="w-24 bg-slate-950 border-2 border-amber-500/40 rounded-xl p-1.5 shadow-2xl rotate-2 hover:rotate-0 transition-transform">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center text-white">
                <span className="text-[8px] block font-bold text-amber-400">{brandName}</span>
                <span className="text-[7px] text-slate-400 block">Your Balance</span>
                <span className="text-[11px] font-black block text-amber-300">৳ {(user?.balance ?? 482.5).toFixed(2)}</span>
                <div className="mt-1 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-[7px] py-0.5 rounded shadow-xs">
                  আজই আয় করুন
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. "আমার ওয়ালেট ও উইথড্র" CARD */}
      <div className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shadow-inner">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">আমার ওয়ালেট</h3>
              <p className="text-[10px] text-slate-400 font-medium">কারেন্ট ব্যালেন্স</p>
            </div>
          </div>

          {/* Right Tap Button */}
          <button
            onClick={toggleBalance}
            className={`rounded-full py-1.5 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer ${
              showBalance
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-slate-950/20 flex items-center justify-center text-[10px]">
              ৳
            </div>
            <span>
              {showBalance
                ? `৳ ${(user?.balance ?? 0).toFixed(2)}`
                : 'ব্যালেন্স দেখতে ট্যাপ করুন'}
            </span>
          </button>
        </div>

        {/* Quick Action: Withdraw Button */}
        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>বিকাশ • নগদ • রকেট</span>
          </div>
          <button
            onClick={() => onNavigate('withdraw')}
            className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold py-1.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>উইথড্র করুন (Withdraw)</span>
          </button>
        </div>
      </div>

      {/* 4. SOCIAL PILL BUTTONS (Telegram & YouTube) */}
      <div className="grid grid-cols-2 gap-2.5">
        <a
          href={telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-sky-500/40 rounded-2xl py-2 px-3 flex items-center justify-center gap-2 text-xs font-bold shadow-md active:scale-98 transition-all"
        >
          <Send className="w-4 h-4 text-[#0088cc]" />
          <span>Telegram</span>
        </a>

        <a
          href={youtubeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-red-500/40 rounded-2xl py-2 px-3 flex items-center justify-center gap-2 text-xs font-bold shadow-md active:scale-98 transition-all"
        >
          <Youtube className="w-4 h-4 text-red-500" />
          <span>YouTube</span>
        </a>
      </div>

      {/* SPECIAL SOCIAL SERVICES (Gmail, Facebook, Instagram) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-4 bg-gradient-to-b from-amber-400 to-emerald-400 rounded-full" />
            <h3 className="text-xs font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>সোশ্যাল সার্ভিস ও কাজ</span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                ৩টি লাইভ সার্ভিস
              </span>
            </h3>
          </div>
          <span className="text-[10px] text-amber-400/90 font-medium">ইনস্ট্যান্ট কাজ ও পেমেন্ট</span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {/* 1. Gmail Service */}
          <div
            onClick={() => onNavigate('gmail-sell')}
            className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 rounded-2xl p-2.5 sm:p-3 border border-red-500/30 hover:border-red-500/70 shadow-md transition-all flex flex-col items-center justify-between text-center group cursor-pointer active:scale-95 min-h-[114px] relative overflow-hidden"
          >
            <div className="absolute top-1.5 right-1.5">
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-500/30 shadow-xs">
                ৳{socialInfo?.gmail?.rate !== undefined ? socialInfo.gmail.rate.toFixed(2) : '14.00'}
              </span>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform mt-1 shadow-inner">
              <Mail className="w-5 h-5" />
            </div>
            <div className="w-full mt-1.5">
              <span className="text-[11px] sm:text-xs font-bold text-white group-hover:text-amber-300 block truncate">
                Gmail Service
              </span>
              <span className="text-[9px] text-slate-400 block truncate mt-0.5">
                জিমেইল সেল ও কাজ
              </span>
            </div>
          </div>

          {/* 2. Facebook Service */}
          <div
            onClick={() => onNavigate('facebook-sell')}
            className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 rounded-2xl p-2.5 sm:p-3 border border-blue-500/30 hover:border-blue-500/70 shadow-md transition-all flex flex-col items-center justify-between text-center group cursor-pointer active:scale-95 min-h-[114px] relative overflow-hidden"
          >
            <div className="absolute top-1.5 right-1.5">
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-500/30 shadow-xs">
                ৳{socialInfo?.facebook?.rate !== undefined ? socialInfo.facebook.rate.toFixed(2) : '4.50'}
              </span>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform mt-1 shadow-inner">
              <ThumbsUp className="w-5 h-5" />
            </div>
            <div className="w-full mt-1.5">
              <span className="text-[11px] sm:text-xs font-bold text-white group-hover:text-amber-300 block truncate">
                Facebook Service
              </span>
              <span className="text-[9px] text-slate-400 block truncate mt-0.5">
                ফেসবুক সেল ও কাজ
              </span>
            </div>
          </div>

          {/* 3. Instagram Service */}
          <div
            onClick={() => onNavigate('instagram-sell')}
            className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 rounded-2xl p-2.5 sm:p-3 border border-pink-500/30 hover:border-pink-500/70 shadow-md transition-all flex flex-col items-center justify-between text-center group cursor-pointer active:scale-95 min-h-[114px] relative overflow-hidden"
          >
            <div className="absolute top-1.5 right-1.5">
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-500/30 shadow-xs">
                ৳{socialInfo?.instagram?.rate !== undefined ? socialInfo.instagram.rate.toFixed(2) : '2.50'}
              </span>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform mt-1 shadow-inner">
              <Instagram className="w-5 h-5" />
            </div>
            <div className="w-full mt-1.5">
              <span className="text-[11px] sm:text-xs font-bold text-white group-hover:text-amber-300 block truncate">
                Instagram Service
              </span>
              <span className="text-[9px] text-slate-400 block truncate mt-0.5">
                ইনস্টাগ্রাম সেল ও কাজ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. CATEGORY 1: EASY EARNING */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 px-0.5">
          <div className="w-1.5 h-4 bg-amber-400 rounded-full" />
          <h3 className="text-xs font-bold text-slate-200 tracking-tight">Easy Earning & Tasks</h3>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* 1. Micro Job */}
          <div
            onClick={() => onNavigate('tasks')}
            className="bg-slate-900 hover:bg-slate-800/80 rounded-2xl p-2.5 border border-slate-800 shadow-md hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-sky-400">
              <Briefcase className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-amber-300 leading-tight truncate w-full">
              Micro Job
            </span>
          </div>

          {/* 2. Job Post */}
          <div
            onClick={() => onNavigate('job-post')}
            className="bg-slate-900 hover:bg-slate-800/80 rounded-2xl p-2.5 border border-slate-800 shadow-md hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-amber-400">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-amber-300 leading-tight truncate w-full">
              Job Post
            </span>
          </div>

          {/* 3. Daily Bonus */}
          <div
            onClick={handleDailyCheckin}
            className="bg-slate-900 hover:bg-slate-800/80 rounded-2xl p-2.5 border border-slate-800 shadow-md hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-amber-400">
              <ClipboardCheck className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-amber-300 leading-tight truncate w-full">
              Daily Bonus
            </span>
          </div>

          {/* 4. Task Status */}
          <div
            onClick={() => onNavigate('pending-status')}
            className="bg-slate-900 hover:bg-slate-800/80 rounded-2xl p-2.5 border border-slate-800 shadow-md hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-sky-400">
              <Clock className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-amber-300 leading-tight truncate w-full">
              Task Status
            </span>
          </div>

          {/* 5. Leaderboard */}
          <div
            onClick={() => onNavigate('leadership')}
            className="bg-slate-900 hover:bg-slate-800/80 rounded-2xl p-2.5 border border-slate-800 shadow-md hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-yellow-400">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-amber-300 leading-tight truncate w-full">
              Leaderboard
            </span>
          </div>

          {/* 6. Referral Team */}
          <div
            onClick={() => onNavigate('team')}
            className="bg-slate-900 hover:bg-slate-800/80 rounded-2xl p-2.5 border border-slate-800 shadow-md hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-purple-400">
              <UserPlus className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-amber-300 leading-tight truncate w-full">
              My Team
            </span>
          </div>

          {/* 7. Earnings History */}
          <div
            onClick={() => onNavigate('income-history')}
            className="bg-slate-900 hover:bg-slate-800/80 rounded-2xl p-2.5 border border-slate-800 shadow-md hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-emerald-400">
              <Banknote className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-emerald-300 leading-tight truncate w-full">
              Income History
            </span>
          </div>

          {/* 8. Withdraw History */}
          <div
            onClick={() => onNavigate('withdraw-history')}
            className="bg-slate-900 hover:bg-slate-800/80 rounded-2xl p-2.5 border border-slate-800 shadow-md hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-teal-400">
              <History className="w-5 h-5 text-teal-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-teal-300 leading-tight truncate w-full">
              Withdraw History
            </span>
          </div>
        </div>
      </div>

      {/* 6. CATEGORY 2: SERVICES & REWARDS */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 px-0.5">
          <div className="w-1.5 h-4 bg-amber-400 rounded-full" />
          <h3 className="text-xs font-bold text-slate-200 tracking-tight">Services & Rewards</h3>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* 1. Target & Bonus */}
          <div
            onClick={() => setActiveModal('target')}
            className="bg-slate-900 hover:bg-slate-800/80 rounded-2xl p-2.5 border border-slate-800 shadow-md hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-rose-400">
              <Target className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-amber-300 leading-tight truncate w-full">
              Target
            </span>
          </div>

          {/* 2. Gift Code */}
          <div
            onClick={() => setActiveModal('gift-code')}
            className="bg-slate-900 hover:bg-slate-800/80 rounded-2xl p-2.5 border border-slate-800 shadow-md hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-emerald-400">
              <Gift className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-amber-300 leading-tight truncate w-full">
              Gift Code
            </span>
          </div>

          {/* 3. Live Support */}
          <div
            onClick={() => onNavigate('support')}
            className="bg-slate-900 hover:bg-slate-800/80 rounded-2xl p-2.5 border border-slate-800 shadow-md hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-sky-400">
              <HelpCircle className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-amber-300 leading-tight truncate w-full">
              Live Support
            </span>
          </div>

          {/* 4. Digital Service */}
          <div
            onClick={() => onNavigate('system-closed')}
            className="bg-slate-900 hover:bg-slate-800/80 rounded-2xl p-2.5 border border-slate-800 shadow-md hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-cyan-400">
              <Laptop className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-amber-300 leading-tight truncate w-full">
              Digital Service
            </span>
          </div>

          {/* 5. Paid VPN */}
          <div
            onClick={() => onNavigate('system-closed')}
            className="bg-slate-900 hover:bg-slate-800/80 rounded-2xl p-2.5 border border-slate-800 shadow-md hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-teal-400">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-amber-300 leading-tight truncate w-full">
              Paid VPN
            </span>
          </div>

          {/* 6. Reselling */}
          <div
            onClick={() => onNavigate('system-closed')}
            className="bg-slate-900 hover:bg-slate-800/80 rounded-2xl p-2.5 border border-slate-800 shadow-md hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-slate-300">
              <ShoppingCart className="w-5 h-5 text-slate-300" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-amber-300 leading-tight truncate w-full">
              Reselling
            </span>
          </div>

          {/* 7. Love Mall */}
          <div
            onClick={() => onNavigate('system-closed')}
            className="bg-slate-900 hover:bg-slate-800/80 rounded-2xl p-2.5 border border-slate-800 shadow-md hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-pink-400">
              <Heart className="w-5 h-5 text-pink-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-amber-300 leading-tight truncate w-full">
              Love Mall
            </span>
          </div>

          {/* 8. Humanitarian */}
          <div
            onClick={() => onNavigate('system-closed')}
            className="bg-slate-900 hover:bg-slate-800/80 rounded-2xl p-2.5 border border-slate-800 shadow-md hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-amber-400">
              <HandHeart className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-amber-300 leading-tight truncate w-full">
              Humanitarian
            </span>
          </div>
        </div>
      </div>

      {/* 9. BRAND FOOTER */}
      <footer className="pt-6 pb-4 text-center space-y-2">
        <h4 className="text-xs font-black tracking-widest uppercase text-slate-400">
          EARNORA
        </h4>
        <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500">
          <button
            onClick={() => setActiveModal('privacy')}
            className="hover:text-amber-400 transition-colors underline"
          >
            Privacy Policy
          </button>
          <span>|</span>
          <button
            onClick={() => setActiveModal('terms')}
            className="hover:text-amber-400 transition-colors underline"
          >
            Terms & Condition
          </button>
        </div>
      </footer>

      {/* 10. INTERACTIVE DASHBOARD MODALS */}
      <DashboardModals
        type={activeModal}
        onClose={() => setActiveModal(null)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
