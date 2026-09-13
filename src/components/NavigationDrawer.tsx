import React from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import {
  X,
  Home,
  Briefcase,
  CheckSquare,
  ArrowDownCircle,
  Users2,
  History,
  Clock,
  Headphones,
  User,
  LogOut,
  Send,
  Youtube,
  Trophy,
  ChevronRight,
  Wallet,
  ShieldCheck,
  Mail,
  ThumbsUp,
  Instagram,
} from 'lucide-react';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentRoute,
}) => {
  const { user, logout, settings, isAdmin } = useApp();

  if (!isOpen) return null;

  const handleNav = (route: string) => {
    onNavigate(route);
    onClose();
  };

  const navItems = [
    { id: 'dashboard', label: 'হোম (Home)', icon: Home },
    ...(isAdmin ? [{ id: 'admin', label: 'এডমিন পোর্টাল (Admin Portal)', icon: ShieldCheck }] : []),
    { id: 'gmail-sell', label: 'জিমেইল সার্ভিস (Gmail Service)', icon: Mail },
    { id: 'facebook-sell', label: 'ফেসবুক সার্ভিস (Facebook Service)', icon: ThumbsUp },
    { id: 'instagram-sell', label: 'ইনস্টাগ্রাম সার্ভিস (Instagram Service)', icon: Instagram },
    { id: 'job-post', label: 'জব পোস্ট করুন (Job Post)', icon: Briefcase },
    { id: 'tasks', label: 'কাজ ও মাইক্রো জব (Tasks)', icon: CheckSquare },
    { id: 'withdraw', label: 'টাকা উত্তোলন (Withdraw)', icon: ArrowDownCircle },
    { id: 'team', label: 'রেফার ও টিম (Team)', icon: Users2 },
    { id: 'leadership', label: 'লিডারবোর্ড (Leadership)', icon: Trophy },
    { id: 'income-history', label: 'আয়ের হিস্ট্রি (History)', icon: History },
    { id: 'pending-status', label: 'পেন্ডিং কাজের স্ট্যাটাস', icon: Clock },
    { id: 'support', label: '২৪/৭ হেল্প ও সাপোর্ট', icon: Headphones },
    { id: 'account', label: 'প্রোফাইল সেটিংস', icon: User },
  ];

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-72 max-w-[85vw] bg-slate-950 text-slate-100 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250 border-r border-slate-800">
        {/* Top Profile Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white relative border-b border-slate-800">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 pr-8">
            <Logo variant="full" size={26} />
          </div>

          <button
            onClick={onClose}
            className="absolute top-3.5 right-3 p-1.5 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400/80 bg-slate-900 flex items-center justify-center text-amber-400 font-bold text-lg overflow-hidden shadow-inner">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm truncate text-white">
                {user?.fullName || 'সম্মানিত ইউজার'}
              </h3>
              <p className="text-[11px] text-slate-400 truncate font-mono">
                {user?.phoneNumber || user?.email}
              </p>
              <div className="mt-1 inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-amber-500/30">
                <Wallet className="w-3 h-3 text-amber-400" />
                <span>৳ {(user?.balance ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-600'}`} />
              </button>
            );
          })}

          {/* Social Channels in Drawer */}
          <div className="pt-2 border-t border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5">
              কমিউনিটি চ্যানেল
            </span>
            <a
              href={settings?.telegramChannel || 'https://t.me/fahimpaybd'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-sky-400 transition-colors"
            >
              <Send className="w-4 h-4 text-[#0088cc]" />
              <span>টেলিগ্রাম চ্যানেল</span>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-red-400 transition-colors"
            >
              <Youtube className="w-4 h-4 text-red-500" />
              <span>ইউটিউব চ্যানেল</span>
            </a>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 text-xs font-bold transition-colors border border-rose-800/40"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
