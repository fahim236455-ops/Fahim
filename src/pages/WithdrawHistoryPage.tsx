import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api';
import { WithdrawalRequest } from '../types';
import { ArrowDownCircle, ArrowLeft, Clock, CheckCircle2, XCircle, FileCheck2 } from 'lucide-react';

interface WithdrawHistoryPageProps {
  onNavigate: (route: string) => void;
}

export const WithdrawHistoryPage: React.FC<WithdrawHistoryPageProps> = ({ onNavigate }) => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchApi<WithdrawalRequest[]>('/withdrawals/history')
      .then((data) => setWithdrawals(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>পরিশোধিত</span>
          </span>
        );
      case 'approved':
        return (
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>অনুমোদিত</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>বাতিল (রিফান্ড)</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
            <span>পেন্ডিং</span>
          </span>
        );
    }
  };

  const getMethodBadge = (method: string) => {
    if (method === 'bKash') return <span className="text-xs font-bold text-[#E2136E]">বিকাশ</span>;
    if (method === 'Nagad') return <span className="text-xs font-bold text-[#F7941D]">নগদ</span>;
    return <span className="text-xs font-bold text-[#8C3494]">রকেট</span>;
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-24 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('withdraw')}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">উইথড্র হিস্ট্রি (Withdraw History)</h1>
            <p className="text-xs text-slate-400">আপনার উত্তোলনের সকল রেকর্ড</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('withdraw')}
          className="text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 cursor-pointer transition-colors"
        >
          নতুন উইথড্র
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : withdrawals.length === 0 ? (
        
        <div className="bg-slate-900/50 rounded-2xl p-10 text-center border border-slate-800 border-dashed flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-3">
            <FileCheck2 className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-bold text-sm mb-1">কোনো উইথড্র রেকর্ড নেই</h3>
          <p className="text-slate-400 text-xs max-w-[200px] leading-relaxed mb-3">
            আপনি এখনও কোনো টাকা উইথড্র করেননি। কাজ করে আয় করুন এবং প্রথম উইথড্র দিন।
          </p>
          <button
            onClick={() => onNavigate('withdraw')}
            className="text-xs text-slate-950 bg-amber-500 font-bold px-4 py-2 rounded-lg shadow hover:bg-amber-400 transition-colors cursor-pointer"
          >
            উইথড্র রিকোয়েস্ট দিন
          </button>
        </div>

      ) : (
        <div className="space-y-3">
          {withdrawals.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-md space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold">
                    <ArrowDownCircle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      {getMethodBadge(item.method)}
                      <span className="text-xs font-mono font-bold text-white">
                        {item.accountNumber}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {getStatusBadge(item.status)}
              </div>

              <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800 grid grid-cols-3 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">অনুরোধকৃত অর্থ</span>
                  <span className="font-bold text-white">৳{item.amount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">ফি (২%)</span>
                  <span className="font-bold text-rose-400">৳{item.fee.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">প্রাপ্য নেট অর্থ</span>
                  <span className="font-bold text-amber-400">৳{item.netAmount.toFixed(2)}</span>
                </div>
              </div>

              {item.adminNote && (
                <div className="text-[11px] bg-amber-500/10 border border-amber-500/20 rounded-md p-2 text-amber-300">
                  <strong className="text-amber-400">অ্যাডমিন নোট:</strong> {item.adminNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
