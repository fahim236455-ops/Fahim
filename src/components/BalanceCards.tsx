import React from 'react';
import { useApp } from '../context/AppContext';
import { Wallet, Landmark, Users, TrendingUp, ArrowUpRight } from 'lucide-react';

interface BalanceCardsProps {
  onNavigate: (route: string) => void;
}

export const BalanceCards: React.FC<BalanceCardsProps> = ({ onNavigate }) => {
  const { user } = useApp();

  const balance = user?.balance ?? 0;
  const totalEarned = user?.totalEarned ?? 0;
  const totalReferrals = user?.totalReferrals ?? 0;

  return (
    <div className="space-y-3">
      {/* Primary Hero Wallet Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-5 shadow-lg border border-emerald-500/20">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-400/10 rounded-full blur-xl pointer-events-none -ml-8 -mb-8" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs text-amber-300">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold tracking-wide text-emerald-100 uppercase">
                মোট ব্যালেন্স (Total Balance)
              </span>
            </div>
            <span className="bg-emerald-500/30 text-emerald-200 text-[11px] font-medium px-2 py-0.5 rounded-full border border-emerald-400/20">
              উত্তোলনযোগ্য
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-3">
            <span className="text-2xl font-bold text-amber-300">৳</span>
            <span className="text-4xl font-extrabold tracking-tight">
              {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-100">
            <div>
              <span className="opacity-80">ব্যবহারকারী: </span>
              <span className="font-semibold text-white">{user?.fullName || 'সদস্য'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onNavigate('tasks')}
                className="bg-white/15 hover:bg-white/25 text-white font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                <span>কাজ</span>
              </button>
              <button
                onClick={() => onNavigate('withdraw')}
                className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-transform active:scale-95"
              >
                <span>উইথড্র</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Secondary Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Main Balance */}
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-colors">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Landmark className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-medium leading-tight">মূল ব্যালেন্স</span>
          </div>
          <div className="mt-1">
            <span className="text-base font-bold text-slate-900">
              ৳{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total Referrals */}
        <button
          onClick={() => onNavigate('team')}
          className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-amber-200 transition-colors text-left group"
        >
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-medium leading-tight">মোট রেফার</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-base font-bold text-slate-900">{totalReferrals} জন</span>
          </div>
        </button>

        {/* Total Earnings */}
        <button
          onClick={() => onNavigate('income-history')}
          className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-teal-200 transition-colors text-left group"
        >
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-medium leading-tight">মোট আয়</span>
          </div>
          <div className="mt-1">
            <span className="text-base font-bold text-emerald-600">
              ৳{totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
