import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api';
import { Transaction } from '../types';
import {  History, TrendingUp, TrendingDown, Calendar, ArrowLeft , Inbox } from 'lucide-react';

interface IncomeHistoryPageProps {
  onNavigate: (route: string) => void;
}

export const IncomeHistoryPage: React.FC<IncomeHistoryPageProps> = ({ onNavigate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchApi<Transaction[]>('/user/transactions')
      .then((data) => setTransactions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getTypeName = (type: string) => {
    switch (type) {
      case 'task_reward':
        return 'টাস্ক আয়';
      case 'referral_bonus':
        return 'রেফারেল বোনাস';
      case 'daily_checkin':
        return 'দৈনিক উপস্থিতি';
      case 'withdrawal_hold':
        return 'উইথড্রয়াল হোল্ড';
      case 'withdrawal_refund':
        return 'উইথড্র রিফান্ড';
      case 'withdrawal_paid':
        return 'উইথড্র সফল';
      default:
        return 'লেনদেন';
    }
  };

  const filtered = transactions.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'earnings') return t.amount > 0;
    if (filter === 'withdraw') return t.amount < 0;
    return true;
  });

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-24 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">আয় হিস্ট্রি (Income History)</h1>
            <p className="text-xs text-slate-400">সকল লেনদেন ও আয়ের হিসাব</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('withdraw-history')}
          className="text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg border border-amber-500/30 transition-colors cursor-pointer"
        >
          উইথড্র রেকর্ড
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          সব লেনদেন
        </button>
        <button
          onClick={() => setFilter('earnings')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filter === 'earnings'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          সকল আয় (+)
        </button>
        <button
          onClick={() => setFilter('withdraw')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filter === 'withdraw'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          উইথড্রয়াল (-)
        </button>
      </div>

      {/* Ledger List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        
        <div className="bg-slate-900/50 rounded-2xl p-10 text-center border border-slate-800 border-dashed flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-3">
            <Inbox className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-bold text-sm mb-1">কোনো লেনদেন পাওয়া যায়নি</h3>
          <p className="text-slate-400 text-xs max-w-[200px] leading-relaxed">
            টাস্ক পূরণ করে প্রথম আয় শুরু করুন এবং আপনার ব্যালেন্স বৃদ্ধি করুন।
          </p>
        </div>

      ) : (
        <div className="space-y-2">
          {filtered.map((t) => {
            const isCredit = t.amount >= 0;
            return (
              <div
                key={t.id}
                className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 shadow-md flex items-center justify-between hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                      isCredit
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                        : 'bg-rose-950/60 text-rose-400 border-rose-800/50'
                    }`}
                  >
                    {isCredit ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{getTypeName(t.type)}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(t.createdAt).toLocaleDateString('bn-BD', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-black ${
                      isCredit ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isCredit ? '+' : ''}৳{t.amount.toFixed(2)}
                  </span>
                  <div className="text-[10px] text-slate-400 font-medium">
                    ব্যালেন্স: ৳{t.balanceAfter.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
