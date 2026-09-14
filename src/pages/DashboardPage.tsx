import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Volume2,
  Wallet,
  ArrowDownCircle,
  CheckCircle2
} from 'lucide-react';
import { ActionGrid } from '../components/ActionGrid';
import { SiteNoticeModal } from '../components/SiteNoticeModal';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, settings } = useApp();

  // Balance tap reveal state
  const [showBalance, setShowBalance] = useState(false);

  // Popup notice state (shows every visit if enabled)
  const [showNotice, setShowNotice] = useState(true);

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

  const balance = user?.balance ?? 0.00;

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-24 font-['Hind_Siliguri',sans-serif] text-slate-100">
      <SiteNoticeModal
        isOpen={Boolean(settings?.popupNotice?.enabled && showNotice)}
        onClose={() => setShowNotice(false)}
      />

      {/* 1. ANNOUNCEMENT MARQUEE PILL */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-full px-4 py-2.5 flex items-center gap-2.5 overflow-hidden">
        <Volume2 className="w-4 h-4 text-sky-400 shrink-0" />
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="inline-block animate-marquee text-[11px] font-semibold text-slate-300">
            {announcementText}
          </div>
        </div>
      </div>

      {/* 2. HERO BANNER CARD (Premium Glass & Glow) */}
      <div className="rounded-[16px] bg-[#0c1222] border border-[#1e293b] p-4 relative overflow-hidden flex items-center justify-between gap-3">
        {/* Left Content */}
        <div className="space-y-1.5 flex-1 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              {brandName}
            </span>
            <span className="text-[9px] text-slate-400 font-medium tracking-wide">Trusted Digital Platform</span>
          </div>
          <h2 className="text-sm font-black text-amber-400 leading-tight">
            প্রতিদিন ৪০০-৫০০৳ ইনকাম করুন!
          </h2>
          <p className="text-[10px] text-slate-300 leading-snug">
            ছোট ছোট কাজ করে, প্রতিদিন ঘরে বসেই গড়ে তুলুন আপনার বাড়তি আয়!
          </p>
          <div className="flex items-center gap-3 pt-1 text-[9px] text-emerald-400 font-medium">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              100% Secure
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Fast Payment
            </span>
          </div>
        </div>

        {/* Right Mini Card */}
        <div className="w-[100px] shrink-0 bg-[#060b14] border border-[#1e293b] rounded-xl p-2.5 text-center space-y-1 z-10">
          <span className="text-[9px] text-amber-500 font-black uppercase tracking-wider block">
            {brandName}
          </span>
          <span className="text-[9px] text-slate-400 block">Your Balance</span>
          <div className="text-sm font-black text-amber-400">
            ৳ {balance.toFixed(2)}
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="w-full mt-1 bg-amber-500 hover:bg-amber-600 text-slate-900 text-[9px] font-bold py-1.5 rounded-lg active:scale-95 cursor-pointer block truncate transition-colors"
          >
            আজকের আয় করুন
          </button>
        </div>
      </div>

      {/* 3. WALLET CARD (আমার ওয়ালেট) */}
      <div className="bg-[#0c1222] rounded-[16px] p-4 border border-[#1e293b] space-y-3 relative">
        <div className="flex items-center justify-between z-10 relative">
          {/* Left Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#1e293b] border border-[#334155] flex items-center justify-center text-amber-400">
              <Wallet className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">আমার ওয়ালেট</h3>
              <p className="text-[10px] text-slate-400">কারেন্ট ব্যালেন্স</p>
            </div>
          </div>
          {/* Right Button: ব্যালেন্স দেখতে ট্যাপ করুন */}
          <button
            onClick={toggleBalance}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg py-1.5 px-3 text-[10px] font-bold flex items-center gap-1.5 active:scale-95 cursor-pointer transition-colors"
          >
            <span>💰</span>
            <span>
              {showBalance ? `৳ ${balance.toFixed(2)}` : 'ব্যালেন্স দেখতে ট্যাপ করুন'}
            </span>
          </button>
        </div>

        {/* Bottom Row: বিকাশ • নগদ • রকেট and উইথড্র বাটন */}
        <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between z-10 relative">
          <div className="text-[10px] text-slate-300 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>বিকাশ • নগদ • রকেট</span>
          </div>
          <button
            onClick={() => onNavigate('withdraw')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 active:scale-95 transition-colors cursor-pointer"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>উইথড্র করুন (Withdraw)</span>
          </button>
        </div>
      </div>

      {/* 5. ACTION GRID */}
      <ActionGrid onNavigate={onNavigate} />

      {/* 6. BRAND FOOTER */}
      <footer className="pt-4 pb-4 text-center space-y-1.5">
        <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">
          {brandName}
        </h4>
        <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 font-medium">
          <button
            onClick={() => onNavigate('support')}
            className="hover:text-amber-400 transition-colors cursor-pointer underline underline-offset-2"
          >
            Privacy Policy
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => onNavigate('support')}
            className="hover:text-amber-400 transition-colors cursor-pointer underline underline-offset-2"
          >
            Terms & Condition
          </button>
        </div>
      </footer>
    </div>
  );
};
