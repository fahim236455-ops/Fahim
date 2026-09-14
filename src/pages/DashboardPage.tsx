import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../lib/api';
import {
  Volume2,
  Wallet,
  ArrowDownCircle,
  CheckCircle2
, Bell, TrendingUp, ChevronRight, Activity } from 'lucide-react';
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

  // Dynamic Chart State
  const [chartData, setChartData] = useState([]);
  
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const transactions = await fetchApi('/user/transactions');
        // Filter last 7 days earnings
        const earnings = transactions.filter(t => t.amount > 0);
        
        // Generate last 7 days labels
        const today = new Date();
        const days = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
        const last7Days = Array.from({length: 7}).map((_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() - (6 - i));
          return {
            dateStr: d.toDateString(),
            label: days[d.getDay()],
            amount: 0
          };
        });

        // Sum earnings per day
        earnings.forEach(t => {
          const tDate = new Date(t.createdAt).toDateString();
          const dayObj = last7Days.find(d => d.dateStr === tDate);
          if (dayObj) {
            dayObj.amount += t.amount;
          }
        });

        setChartData(last7Days);
      } catch (err) {
        console.error(err);
      }
    };
    fetchChartData();
  }, []);

  const getChartPaths = () => {
    const data = chartData.length > 0 ? chartData : [
      {label: 'শনি', amount: 0}, {label: 'রবি', amount: 0}, {label: 'সোম', amount: 0}, 
      {label: 'মঙ্গল', amount: 0}, {label: 'বুধ', amount: 0}, {label: 'বৃহঃ', amount: 0}, {label: 'শুক্র', amount: 0}
    ];
    
    const max = Math.max(...data.map(d => d.amount), 10); // at least 10 scale
    const width = 300;
    const xStep = width / 6;

    const points = data.map((d, i) => {
      const x = i * xStep;
      const y = 60 - ((d.amount / max) * 50); 
      return { x, y, amount: d.amount, label: d.label };
    });

    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const fillPath = `${path} L 300 80 L 0 80 Z`;

    return { points, path, fillPath };
  };

  const chart = getChartPaths();


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

      
      {/* ================= RECENT PAYOUTS TICKER ================= */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-slate-800 to-slate-800 rounded-xl p-2.5 border border-emerald-500/20 flex items-center gap-2 overflow-hidden shadow-sm relative">
        <div className="bg-emerald-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0 z-10 flex items-center gap-1">
          <Activity className="w-3 h-3 animate-pulse" />
          লাইভ পেআউট
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1 flex">
          <div className="inline-block animate-marquee text-[11px] font-medium text-emerald-400">
            • ইউজার **Sajid** ৳250 উইথড্র করেছেন (বিকাশ) • ইউজার **Mim12** ৳150 উইথড্র করেছেন (নগদ) • ইউজার **Rana** ৳500 উইথড্র করেছেন (বিকাশ) • ইউজার **Tanvir** ৳300 উইথড্র করেছেন (রকেট)
          </div>
        </div>
      </div>

      {/* ================= EARNING CHART (Last 7 Days) ================= */}
      <div className="bg-[#0c1222] rounded-[16px] p-4 border border-[#1e293b] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">আয়ের গ্রাফ (গত ৭ দিন)</h3>
          </div>
          <button className="text-[10px] text-slate-400 flex items-center gap-0.5 hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('income-history')}>
            বিস্তারিত <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        
        
        <div className="pt-4 pb-2">
          <div className="relative w-full h-20 mb-2">
            {chart.points.map((p, i) => (
              <div 
                key={i} 
                className="absolute text-[8px] font-bold text-slate-400 opacity-0 hover:opacity-100 transition-opacity cursor-pointer whitespace-nowrap z-20"
                style={{ top: p.y - 15, left: p.x - 10 }}
              >
                ৳{p.amount.toFixed(0)}
              </div>
            ))}
            
            <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible preserve-3d">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <path
                d={chart.fillPath}
                fill="url(#chartGradient)"
                className="animate-pulse"
              />

              <path
                d={chart.path}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />

              {chart.points.map((p, i) => (
                <circle 
                  key={i}
                  cx={p.x} 
                  cy={p.y} 
                  r={i === chart.points.length - 1 ? 4.5 : 3} 
                  fill={i === chart.points.length - 1 ? "#38bdf8" : "#0f172a"} 
                  stroke={i === chart.points.length - 1 ? "#ffffff" : "#38bdf8"} 
                  strokeWidth={i === chart.points.length - 1 ? 1.5 : 2} 
                  className={i === chart.points.length - 1 ? "animate-pulse cursor-pointer relative z-10" : "hover:r-5 transition-all cursor-pointer relative z-10"} 
                />
              ))}
            </svg>
          </div>

          <div className="flex justify-between w-full text-[9px] text-slate-500 font-medium">
            {chart.points.map((p, i) => (
              <span key={i}>{p.label}</span>
            ))}
          </div>
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
