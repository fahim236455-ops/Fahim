import React, { useState } from 'react';
import { Trophy, Medal, Crown, Star, ArrowLeft, Users, Award, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LeadershipPageProps {
  onNavigate: (route: string) => void;
}

export const LeadershipPage: React.FC<LeadershipPageProps> = ({ onNavigate }) => {
  const { user } = useApp();
  const [tab, setTab] = useState<'all' | 'weekly' | 'monthly'>('all');

  const topLeaders = [
    { rank: 1, name: 'তানভীর আহমেদ', earnings: 18540, tasks: 320, badge: 'গোল্ড মেম্বার' },
    { rank: 2, name: 'রফিকুল ইসলাম', earnings: 14200, tasks: 260, badge: 'সিলভার মেম্বার' },
    { rank: 3, name: 'সাদিয়া আক্তার', earnings: 12850, tasks: 235, badge: 'ব্রোঞ্জ মেম্বার' },
    { rank: 4, name: 'হাসিবুর রহমান', earnings: 9640, tasks: 190, badge: 'টপ আর্নার' },
    { rank: 5, name: 'মারুফ হোসেন', earnings: 8150, tasks: 165, badge: 'সক্রিয় মেম্বার' },
    { rank: 6, name: 'নুসরাত জাহান', earnings: 7420, tasks: 148, badge: 'সক্রিয় মেম্বার' },
    { rank: 7, name: 'মোঃ ফাহিম আহমেদ', earnings: 6900, tasks: 130, badge: 'রেগুলার মেম্বার' },
    { rank: 8, name: 'শাকিল চৌধুরী', earnings: 5850, tasks: 112, badge: 'রেগুলার মেম্বার' },
    { rank: 9, name: 'আরিফুল হক', earnings: 4920, tasks: 98, badge: 'স্টার আর্নার' },
    { rank: 10, name: 'তাহমিনা পারভীন', earnings: 4350, tasks: 85, badge: 'স্টার আর্নার' },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-20 text-slate-100">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 flex items-center gap-1 text-xs font-bold cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>হোমে যান</span>
        </button>
        <h1 className="text-base font-black text-white flex items-center gap-1.5">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>লিডারবোর্ড ও র্যাংক</span>
        </h1>
        <div className="w-16" />
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-3 gap-2 items-end pt-4 pb-2">
        {/* 2nd Place */}
        <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 shadow-md flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs mb-1 border border-slate-700">
            2
          </div>
          <Medal className="w-5 h-5 text-slate-400 mb-1" />
          <h4 className="text-[11px] font-bold text-slate-200 truncate w-full">
            {topLeaders[1].name}
          </h4>
          <span className="text-[10px] font-bold text-amber-400">
            ৳ {topLeaders[1].earnings.toLocaleString()}
          </span>
        </div>

        {/* 1st Place (Champion) */}
        <div className="bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 rounded-2xl p-3.5 border-2 border-amber-500/50 shadow-xl flex flex-col items-center text-center -mt-2">
          <Crown className="w-6 h-6 text-amber-400 mb-1 animate-bounce" />
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black text-sm mb-1 shadow-md">
            1
          </div>
          <h4 className="text-xs font-extrabold text-white truncate w-full">
            {topLeaders[0].name}
          </h4>
          <span className="text-xs font-black text-amber-400">
            ৳ {topLeaders[0].earnings.toLocaleString()}
          </span>
          <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full mt-1 border border-amber-500/30">
            চ্যাম্পিয়ন
          </span>
        </div>

        {/* 3rd Place */}
        <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 shadow-md flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-amber-950/60 text-amber-400 flex items-center justify-center font-bold text-xs mb-1 border border-amber-800/40">
            3
          </div>
          <Medal className="w-5 h-5 text-amber-600 mb-1" />
          <h4 className="text-[11px] font-bold text-slate-200 truncate w-full">
            {topLeaders[2].name}
          </h4>
          <span className="text-[10px] font-bold text-amber-400">
            ৳ {topLeaders[2].earnings.toLocaleString()}
          </span>
        </div>
      </div>

      {/* User's Own Standing Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/30 text-white rounded-2xl p-3.5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 text-amber-400 flex items-center justify-center font-bold text-sm">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-white">{user?.fullName || 'আপনি'}</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium">আপনার অবস্থান</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              মোট আয়: <strong className="text-amber-400">৳ {(user?.totalEarned ?? user?.balance ?? 0).toFixed(2)}</strong>
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">র্যাংক</span>
          <span className="text-sm font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-2.5 py-1 rounded-lg inline-block mt-0.5">#১২</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs font-bold">
        <button
          onClick={() => setTab('all')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            tab === 'all' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          সর্বমোট (All Time)
        </button>
        <button
          onClick={() => setTab('monthly')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            tab === 'monthly' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          এই মাসের (Monthly)
        </button>
        <button
          onClick={() => setTab('weekly')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            tab === 'weekly' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          সাপ্তাহিক (Weekly)
        </button>
      </div>

      {/* List Table of Top 10 */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden divide-y divide-slate-800">
        {topLeaders.map((lead) => (
          <div key={lead.rank} className="p-3 flex items-center justify-between hover:bg-slate-850/60 transition-colors">
            <div className="flex items-center gap-3">
              <span className={`w-6 text-center font-black text-xs ${
                lead.rank <= 3 ? 'text-amber-400 font-extrabold' : 'text-slate-500'
              }`}>
                #{lead.rank}
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-200">{lead.name}</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span>{lead.tasks}টি কাজ সম্পন্ন</span>
                  <span>•</span>
                  <span className="text-amber-400 font-medium">{lead.badge}</span>
                </div>
              </div>
            </div>
            <span className="text-xs font-black text-amber-400 font-mono">
              ৳ {lead.earnings.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
