import React from 'react';
import { Home, CheckSquare, ArrowDownCircle, Users2, Headphones } from 'lucide-react';

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 shadow-2xl shadow-black">
      <div className="max-w-md mx-auto px-2 py-1 flex items-center justify-between">
        {/* 1. Home */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            currentRoute === 'dashboard'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* 2. Tasks */}
        <button
          onClick={() => onNavigate('tasks')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            currentRoute === 'tasks' || currentRoute === 'job-post'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Tasks</span>
        </button>

        {/* 3. Withdraw (Center Raised Glowing Pill) */}
        <button
          onClick={() => onNavigate('withdraw')}
          className="flex-1 flex flex-col items-center justify-center -mt-4 relative group cursor-pointer"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 active:scale-95 ${
              currentRoute === 'withdraw' || currentRoute === 'withdraw-history'
                ? 'bg-gradient-to-tr from-emerald-500 via-amber-400 to-amber-500 text-slate-950 shadow-amber-500/40 ring-2 ring-amber-400'
                : 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-amber-500/30'
            }`}
          >
            <ArrowDownCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span
            className={`text-[10px] mt-0.5 font-bold ${
              currentRoute === 'withdraw' || currentRoute === 'withdraw-history' ? 'text-amber-400' : 'text-amber-300'
            }`}
          >
            উইথড্র
          </span>
        </button>

        {/* 4. Team */}
        <button
          onClick={() => onNavigate('team')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            currentRoute === 'team' || currentRoute === 'leadership'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Users2 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Team</span>
        </button>

        {/* 5. Support */}
        <button
          onClick={() => onNavigate('support')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            currentRoute === 'support'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Headphones className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Support</span>
        </button>
      </div>
    </div>
  );
};
