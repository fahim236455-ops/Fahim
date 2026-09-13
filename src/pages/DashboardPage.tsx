import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Volume2,
  Wallet,
  ArrowDownCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { ActionGrid } from '../components/ActionGrid';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, settings } = useApp();

  // Balance tap reveal state
  const [showBalance, setShowBalance] = useState(false);

  // Dismissed popup notice state
  const [dismissedNotice, setDismissedNotice] = useState(false);

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

  const brandName = settings?.brandName || 'EARNORA';
  const announcementText =
    settings?.announcement ||
    'আমাদের ওয়েবসাইটে স্বাগতম! সঠিকভাবে কাজ সম্পন্ন করুন এবং প্রতিদিন ২০০-৫০০ টাকা আয় করুন। যেকোনো প্রয়োজনে হেল্প সেন্টারে যোগাযোগ করুন।';

  const balance = user?.balance ?? 39.0;

  return (
    <div className="max-w-md mx-auto px-4 py-3.5 space-y-3.5 pb-24 font-['Hind_Siliguri',sans-serif] text-slate-100">
      {/* 0. Dynamic Popup Notice Modal (If enabled by admin) */}
      {settings?.popupNotice?.enabled && !dismissedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#0a1224] border border-amber-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 relative text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">
                {settings.popupNotice.title || 'জরুরি বিজ্ঞপ্তি'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {settings.popupNotice.message || 'সকল ইউজারদের অবগতির জন্য জানানো যাচ্ছে যে কাজ সঠিকভাবে সম্পন্ন করুন।'}
              </p>
            </div>

            <button
              onClick={() => setDismissedNotice(true)}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow-lg active:scale-98 transition-all cursor-pointer"
            >
              ঠিক আছে, বুঝেছি
            </button>
          </div>
        </div>
      )}

      {/* 1. TOP NOTICE / MARQUEE TICKER */}
      <div className="bg-[#0b1329] rounded-full px-4 py-2 border border-slate-800 shadow-md flex items-center gap-2.5 overflow-hidden">
        <Volume2 className="w-4 h-4 text-sky-400 shrink-0" />
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="inline-block animate-marquee text-xs font-semibold text-slate-300">
            {announcementText}
          </div>
        </div>
      </div>

      {/* 2. HERO BANNER CARD (Exact match to screenshot) */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0d162c] via-[#091124] to-[#0d162c] border border-amber-500/40 p-4 shadow-xl relative overflow-hidden flex items-center justify-between gap-3">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Left Content */}
        <div className="space-y-1.5 flex-1 z-10">
          <div className="flex items-center gap-1.5">
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              {brandName}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Trusted Digital Platform</span>
          </div>

          <h2 className="text-sm sm:text-base font-black text-amber-400 leading-tight">
            প্রতিদিন ৪০০-৫০০৳ ইনকাম করুন!
          </h2>

          <p className="text-[11px] text-slate-300 leading-snug">
            ছোট ছোট কাজ করে, প্রতিদিন ঘরে বসেই গড়ে তুলুন আপনার বাড়তি আয়!
          </p>

          <div className="flex items-center gap-3 pt-0.5 text-[10px] text-emerald-400 font-semibold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              100% Secure
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Fast Payment
            </span>
          </div>
        </div>

        {/* Right Mini Card */}
        <div className="w-28 shrink-0 bg-[#060b18]/90 border border-amber-500/40 rounded-xl p-2.5 text-center space-y-1 shadow-lg z-10">
          <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block">
            {brandName}
          </span>
          <span className="text-[10px] text-slate-400 block font-medium">Your Balance</span>
          <div className="text-xs font-black text-amber-400">
            ৳ {balance.toFixed(2)}
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="w-full mt-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-[10px] font-bold py-1 px-1 rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer block truncate"
          >
            আজকের আয় করুন
          </button>
        </div>
      </div>

      {/* 3. WALLET CARD (আমার ওয়ালেট) */}
      <div className="bg-[#0b1329] rounded-2xl p-3.5 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          {/* Left Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-inner">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">আমার ওয়ালেট</h3>
              <p className="text-[10px] text-slate-400 font-medium">কারেন্ট ব্যালেন্স</p>
            </div>
          </div>

          {/* Right Button: ব্যালেন্স দেখতে ট্যাপ করুন */}
          <button
            onClick={toggleBalance}
            className={`rounded-full py-1.5 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer ${
              showBalance
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black'
            }`}
          >
            <span className="text-xs">💰</span>
            <span>
              {showBalance ? `৳ ${balance.toFixed(2)}` : 'ব্যালেন্স দেখতে ট্যাপ করুন'}
            </span>
          </button>
        </div>

        {/* Bottom Row: বিকাশ • নগদ • রকেট and উইথড্র বাটন */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-300 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>বিকাশ • নগদ • রকেট</span>
          </div>

          <button
            onClick={() => onNavigate('withdraw')}
            className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 text-xs font-black py-1.5 px-3 rounded-full flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
            <span>উইথড্র করুন (Withdraw)</span>
          </button>
        </div>
      </div>

      {/* 4. ACTION GRID (Social, Services, Easy Earning, Rewards) */}
      <ActionGrid onNavigate={onNavigate} />

      {/* 5. BRAND FOOTER */}
      <footer className="pt-4 pb-2 text-center space-y-1.5">
        <h4 className="text-xs font-black tracking-widest uppercase text-slate-400">
          {brandName}
        </h4>
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <button
            onClick={() => onNavigate('support')}
            className="hover:text-amber-400 transition-colors underline cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>|</span>
          <button
            onClick={() => onNavigate('support')}
            className="hover:text-amber-400 transition-colors underline cursor-pointer"
          >
            Terms & Condition
          </button>
        </div>
      </footer>
    </div>
  );
};
