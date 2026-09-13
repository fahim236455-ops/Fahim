import React from 'react';
import {
  CheckSquare,
  ArrowDownCircle,
  Users2,
  RotateCw,
  Video,
  Award,
  History,
  FileCheck2,
  Clock,
  Headphones,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ActionGridProps {
  onNavigate: (route: string) => void;
}

export const ActionGrid: React.FC<ActionGridProps> = ({ onNavigate }) => {
  const { showToast } = useApp();

  const handleDisabledFeature = (title: string) => {
    showToast(`“${title}” ফিচারটি শীঘ্রই আসছে! বর্তমান কাজ ও রেফারেল চালু রয়েছে।`, 'info');
  };

  const actionItems = [
    {
      id: 'tasks',
      title: 'কাজ (Tasks)',
      subtitle: 'দৈনিক কাজ ও বোনাস',
      icon: CheckSquare,
      color: 'bg-emerald-500 text-white',
      badge: 'জনপ্রিয়',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      action: () => onNavigate('tasks'),
      disabled: false,
    },
    {
      id: 'withdraw',
      title: 'উইথড্র (Withdraw)',
      subtitle: 'বিকাশ, নগদ ও রকেট',
      icon: ArrowDownCircle,
      color: 'bg-amber-500 text-white',
      badge: 'মিনিমাম ৳৫০০',
      badgeColor: 'bg-amber-100 text-amber-800',
      action: () => onNavigate('withdraw'),
      disabled: false,
    },
    {
      id: 'team',
      title: 'মাই টিম (Team)',
      subtitle: 'প্রতি রেফারে ৳৫০ বোনাস',
      icon: Users2,
      color: 'bg-blue-500 text-white',
      badge: '৳৫০ বোনাস',
      badgeColor: 'bg-blue-100 text-blue-800',
      action: () => onNavigate('team'),
      disabled: false,
    },
    {
      id: 'spin',
      title: 'স্পিন (Spin)',
      subtitle: 'ভাগ্য পরীক্ষা করুন',
      icon: RotateCw,
      color: 'bg-purple-400/80 text-white',
      badge: 'শীঘ্রই আসছে',
      badgeColor: 'bg-purple-100 text-purple-700',
      action: () => handleDisabledFeature('স্পিন হুইল'),
      disabled: true,
    },
    {
      id: 'video',
      title: 'ভিডিও অ্যাড',
      subtitle: 'ভিডিও দেখে আয়',
      icon: Video,
      color: 'bg-rose-400/80 text-white',
      badge: 'শীঘ্রই আসছে',
      badgeColor: 'bg-rose-100 text-rose-700',
      action: () => handleDisabledFeature('ভিডিও অ্যাড'),
      disabled: true,
    },
    {
      id: 'rank',
      title: 'র্যাংক (Leaderboard)',
      subtitle: 'শীর্ষ উপার্জনকারী',
      icon: Award,
      color: 'bg-amber-400/80 text-white',
      badge: 'শীঘ্রই আসছে',
      badgeColor: 'bg-amber-100 text-amber-700',
      action: () => handleDisabledFeature('র্যাংক লিডারবোর্ড'),
      disabled: true,
    },
    {
      id: 'income-history',
      title: 'আয় হিস্ট্রি',
      subtitle: 'সকল আয়ের হিসাব',
      icon: History,
      color: 'bg-teal-600 text-white',
      badge: 'লেজার',
      badgeColor: 'bg-teal-100 text-teal-800',
      action: () => onNavigate('income-history'),
      disabled: false,
    },
    {
      id: 'withdraw-history',
      title: 'উইথড্র হিস্ট্রি',
      subtitle: 'পেমেন্টের সকল রেকর্ড',
      icon: FileCheck2,
      color: 'bg-indigo-600 text-white',
      badge: 'হিস্ট্রি',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      action: () => onNavigate('withdraw-history'),
      disabled: false,
    },
    {
      id: 'pending-status',
      title: 'পেন্ডিং স্ট্যাটাস',
      subtitle: 'পর্যালোচনায় থাকা কাজ',
      icon: Clock,
      color: 'bg-orange-500 text-white',
      badge: 'লাইভ',
      badgeColor: 'bg-orange-100 text-orange-800',
      action: () => onNavigate('pending-status'),
      disabled: false,
    },
    {
      id: 'support',
      title: 'সাপোর্ট (Support)',
      subtitle: 'যে কোনো সমস্যায় সাহায্য',
      icon: Headphones,
      color: 'bg-sky-600 text-white',
      badge: '২৪/৭',
      badgeColor: 'bg-sky-100 text-sky-800',
      action: () => onNavigate('support'),
      disabled: false,
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">প্রধান সেবাসমূহ (Services)</h2>
        <span className="text-[11px] text-slate-500 font-medium">১০টি অ্যাকশন</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {actionItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`relative text-left p-3.5 rounded-xl border transition-all duration-200 shadow-xs flex flex-col justify-between group ${
                item.disabled
                  ? 'bg-slate-50/80 border-slate-200/60 opacity-85 cursor-not-allowed'
                  : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-md active:scale-[0.98]'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs transition-transform ${
                    item.color
                  } ${!item.disabled && 'group-hover:scale-105'}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
