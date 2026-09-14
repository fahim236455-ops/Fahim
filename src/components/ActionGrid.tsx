import React, { useState } from 'react';
import {
  Mail,
  ThumbsUp,
  Instagram,
  Briefcase,
  Users,
  CalendarCheck,
  Clock,
  Trophy,
  UserPlus,
  History,
  Target,
  HelpCircle,
  Monitor,
  ShieldCheck,
  ShoppingCart,
  Heart,
  HeartHandshake,
  Send,
  Youtube,
  Banknote,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

interface ActionGridProps {
  onNavigate: (route: string) => void;
}

export const ActionGrid: React.FC<ActionGridProps> = ({ onNavigate }) => {
  const { user, settings, showToast, refreshUser } = useApp();

  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState(false);

  // Telegram and YouTube Links dynamically configured from Admin Panel
  const rawTelegram = settings?.telegramChannelUrl || settings?.supportTelegram || 'fahimpaybd';
  const telegramLink = rawTelegram.startsWith('http://') || rawTelegram.startsWith('https://')
    ? rawTelegram
    : `https://t.me/${rawTelegram.replace('@', '').trim()}`;

  const rawYoutube = settings?.heroVideoUrl || 'https://youtube.com';
  const youtubeLink = rawYoutube.startsWith('http://') || rawYoutube.startsWith('https://')
    ? rawYoutube
    : `https://${rawYoutube.trim()}`;

  const handleDailyBonus = () => {
    if (dailyBonusClaimed) {
      showToast('আজকের ডেইলি বোনাস ইতিমধ্যে ক্লেইম করা হয়েছে!', 'info');
      return;
    }
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    setDailyBonusClaimed(true);
    showToast('অভিনন্দন! আপনি আজকের ডেইলি বোনাস ৳৫.০০ পেয়েছেন!', 'success');
    refreshUser();
  };

  return (
    <div className="space-y-4 text-slate-100 font-['Hind_Siliguri',sans-serif]">
      {/* 1. SOCIAL BUTTONS (Telegram & YouTube) */}
      <div className="grid grid-cols-2 gap-2.5">
        <a
          href={telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#0b1329] hover:bg-[#101b38] text-slate-200 border border-slate-800/80 rounded-2xl py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold shadow-md active:scale-98 transition-all"
        >
          <Send className="w-4 h-4 text-sky-400" />
          <span>Telegram</span>
        </a>

        <a
          href={youtubeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#0b1329] hover:bg-[#101b38] text-slate-200 border border-slate-800/80 rounded-2xl py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold shadow-md active:scale-98 transition-all"
        >
          <Youtube className="w-4 h-4 text-red-500" />
          <span>YouTube</span>
        </a>
      </div>

      {/* 2. SECTION 1: সোশ্যাল সার্ভিস ও কাজ */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-emerald-400" />
            <h2 className="text-xs sm:text-sm font-bold text-white">সোশ্যাল সার্ভিস ও কাজ</h2>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              ৩টি সার্ভিস
            </span>
          </div>
          <span className="text-[11px] text-amber-400 font-medium">ইনস্ট্যান্ট কাজ ও পেমেন্ট</span>
        </div>

        {/* 3 Column Cards for Gmail, Facebook, Instagram */}
        <div className="grid grid-cols-3 gap-2">
          {/* Gmail Service */}
          <button
            onClick={() => onNavigate('gmail-sell')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center relative group transition-all cursor-pointer shadow-md hover:border-pink-500/40 active:scale-98"
          >
            <span className="absolute top-1.5 right-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
              ৳14.00
            </span>
            <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center mt-2 mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white leading-tight">Gmail Service</h3>
            <p className="text-[9px] text-slate-400 mt-0.5">জিমেইল সেল ও কাজ</p>
          </button>

          {/* Facebook Service */}
          <button
            onClick={() => onNavigate('facebook-sell')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center relative group transition-all cursor-pointer shadow-md hover:border-blue-500/40 active:scale-98"
          >
            <span className="absolute top-1.5 right-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
              ৳4.50
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mt-2 mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <ThumbsUp className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white leading-tight">Facebook Service</h3>
            <p className="text-[9px] text-slate-400 mt-0.5">ফেসবুক সেল ও কাজ</p>
          </button>

          {/* Instagram Service */}
          <button
            onClick={() => onNavigate('instagram-sell')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center relative group transition-all cursor-pointer shadow-md hover:border-pink-500/40 active:scale-98"
          >
            <span className="absolute top-1.5 right-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
              ৳2.50
            </span>
            <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center mt-2 mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <Instagram className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white leading-tight">Instagram Service</h3>
            <p className="text-[9px] text-slate-400 mt-0.5">ইনস্টাগ্রাম সেল ও কাজ</p>
          </button>
        </div>
      </div>

      {/* 3. SECTION 2: Easy Earning & Tasks (4 Column Grid) */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 px-1">
          <span className="w-1.5 h-4 rounded-full bg-amber-400" />
          <h2 className="text-xs sm:text-sm font-bold text-white">Easy Earning & Tasks</h2>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* Micro Job */}
          <button
            onClick={() => onNavigate('tasks')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center group transition-all cursor-pointer shadow-sm hover:border-sky-500/40 active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">Micro Job</span>
          </button>

          {/* Job Post */}
          <button
            onClick={() => onNavigate('job-post')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center group transition-all cursor-pointer shadow-sm hover:border-amber-500/40 active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">Job Post</span>
          </button>

          {/* Daily Bonus */}
          <button
            onClick={handleDailyBonus}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center group transition-all cursor-pointer shadow-sm hover:border-yellow-500/40 active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">Daily Bonus</span>
          </button>

          {/* Task Status */}
          <button
            onClick={() => onNavigate('pending-status')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center group transition-all cursor-pointer shadow-sm hover:border-cyan-500/40 active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">Task Status</span>
          </button>

          {/* Leaderboard */}
          <button
            onClick={() => onNavigate('leadership')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center group transition-all cursor-pointer shadow-sm hover:border-amber-500/40 active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">Leaderboard</span>
          </button>

          {/* My Team */}
          <button
            onClick={() => onNavigate('team')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center group transition-all cursor-pointer shadow-sm hover:border-purple-500/40 active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">My Team</span>
          </button>

          {/* Income History */}
          <button
            onClick={() => onNavigate('income-history')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center group transition-all cursor-pointer shadow-sm hover:border-emerald-500/40 active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <Banknote className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">Income History</span>
          </button>

          {/* Withdraw History */}
          <button
            onClick={() => onNavigate('withdraw-history')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center group transition-all cursor-pointer shadow-sm hover:border-cyan-500/40 active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <History className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white truncate w-full">Withdraw His...</span>
          </button>
        </div>
      </div>

      {/* 4. SECTION 3: Services & Rewards (4 Column Grid) */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 px-1">
          <span className="w-1.5 h-4 rounded-full bg-amber-400" />
          <h2 className="text-xs sm:text-sm font-bold text-white">Services & Rewards</h2>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* Target */}
          <button
            onClick={() => setActiveModal('target')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center group transition-all cursor-pointer shadow-sm hover:border-rose-500/40 active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">Target</span>
          </button>

          {/* Live Support */}
          <button
            onClick={() => onNavigate('support')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center group transition-all cursor-pointer shadow-sm hover:border-sky-500/40 active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">Live Support</span>
          </button>

          {/* Digital Service */}
          <button
            onClick={() => onNavigate('system-closed')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center group transition-all cursor-pointer shadow-sm hover:border-cyan-500/40 active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <Monitor className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">Digital Service</span>
          </button>

          {/* Paid VPN */}
          <button
            onClick={() => onNavigate('system-closed')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center group transition-all cursor-pointer shadow-sm hover:border-teal-500/40 active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">Paid VPN</span>
          </button>

          {/* Reselling */}
          <button
            onClick={() => onNavigate('system-closed')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center group transition-all cursor-pointer shadow-sm hover:border-blue-500/40 active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">Reselling</span>
          </button>

          {/* Love Mall */}
          <button
            onClick={() => onNavigate('system-closed')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center group transition-all cursor-pointer shadow-sm hover:border-pink-500/40 active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <Heart className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">Love Mall</span>
          </button>

          {/* Humanitarian */}
          <button
            onClick={() => onNavigate('system-closed')}
            className="bg-[#0b1329] hover:bg-[#101b38] border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center text-center group transition-all cursor-pointer shadow-sm hover:border-amber-500/40 active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white truncate w-full">Humanitarian</span>
          </button>
        </div>
      </div>

      {/* Target Modal */}
      {activeModal === 'target' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0a1224] border border-rose-500/30 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-inner">
              <Target className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">মাসিক টার্গেট ও রিওয়ার্ড</h3>
              <p className="text-xs text-slate-400">প্রতি মাসে নির্দিষ্ট টাস্ক ও রেফার সম্পূর্ণ করে জিতে নিন আকর্ষণীয় বোনাস!</p>
            </div>
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>৫০টি টাস্ক সম্পন্ন:</span>
                <span className="font-bold text-emerald-400">৳১০০ বোনাস</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>২০ জন রেফার:</span>
                <span className="font-bold text-amber-400">৳৫০০ এক্সট্রা বোনাস</span>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveModal(null);
                onNavigate('tasks');
              }}
              className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg cursor-pointer"
            >
              এখনই টাস্ক শুরু করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
