import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api';
import { TaskSubmission, WithdrawalRequest, SocialAccountSale } from '../types';
import {
  Clock,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowDownCircle,
  Mail,
  ThumbsUp,
  Instagram,
  Sparkles,
} from 'lucide-react';

interface PendingStatusPageProps {
  onNavigate: (route: string) => void;
}

export const PendingStatusPage: React.FC<PendingStatusPageProps> = ({ onNavigate }) => {
  const [pendingTasks, setPendingTasks] = useState<TaskSubmission[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [socialSales, setSocialSales] = useState<SocialAccountSale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<'all' | 'social' | 'tasks' | 'withdrawals'>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchApi<{
        pendingSubmissions: TaskSubmission[];
        pendingWithdrawals: WithdrawalRequest[];
        socialSales?: SocialAccountSale[];
      }>('/user/pending');
      setPendingTasks(res.pendingSubmissions || []);
      setPendingWithdrawals(res.pendingWithdrawals || []);
      setSocialSales(res.socialSales || []);
    } catch {
      // Fallback to local storage if offline
      try {
        const gmailList = JSON.parse(localStorage.getItem('fpb_social_sales_gmail') || '[]');
        const fbList = JSON.parse(localStorage.getItem('fpb_social_sales_facebook') || '[]');
        const igList = JSON.parse(localStorage.getItem('fpb_social_sales_instagram') || '[]');
        const localCombined: SocialAccountSale[] = [
          ...gmailList.map((g: any) => ({ ...g, service: 'gmail' })),
          ...fbList.map((f: any) => ({ ...f, service: 'facebook' })),
          ...igList.map((i: any) => ({ ...i, service: 'instagram' })),
        ];
        if (localCombined.length > 0) {
          setSocialSales(localCombined);
        }
      } catch {
        // Ignored
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRecords = pendingTasks.length + pendingWithdrawals.length + socialSales.length;

  const getServiceBadge = (service: string) => {
    if (service === 'gmail') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
          <Mail className="w-3 h-3" /> Gmail Sell
        </span>
      );
    }
    if (service === 'facebook') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold text-[#1877f2] bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
          <ThumbsUp className="w-3 h-3" /> Facebook Sell
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px] font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-md">
        <Instagram className="w-3 h-3" /> Instagram Sell
      </span>
    );
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-24 text-slate-100 font-['Hind_Siliguri',sans-serif]">
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
            <h1 className="text-base font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>টাস্ক ও কাজের স্ট্যাটাস (Status)</span>
            </h1>
            <p className="text-[11px] text-slate-400">আপনার সাবমিট করা কাজ, সোস্যাল সেল ও উইথড্রয়াল স্ট্যাটাস</p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer transition-colors"
          title="রিফ্রেশ"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setTab('all')}
          className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer truncate text-center ${
            tab === 'all'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          সকল ({totalRecords})
        </button>
        <button
          onClick={() => setTab('social')}
          className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer truncate text-center ${
            tab === 'social'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          সোস্যাল ({socialSales.length})
        </button>
        <button
          onClick={() => setTab('tasks')}
          className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer truncate text-center ${
            tab === 'tasks'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          টাস্ক ({pendingTasks.length})
        </button>
        <button
          onClick={() => setTab('withdrawals')}
          className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer truncate text-center ${
            tab === 'withdrawals'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          উইথড্র ({pendingWithdrawals.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : totalRecords === 0 ? (
        <div className="bg-slate-900 rounded-2xl p-8 text-center border border-slate-800 text-slate-400 text-sm space-y-2 shadow-md">
          <CheckCircle2 className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="font-bold text-white text-base">কোনো কাজের রেকর্ড নেই!</p>
          <p className="text-xs text-slate-400">আপনি এখনও কোনো কাজ বা অ্যাকাউন্ট সাবমিট করেননি।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Social Account Sales Submissions */}
          {(tab === 'all' || tab === 'social') &&
            socialSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-[#0b1329] rounded-xl p-3.5 border border-slate-800/80 shadow-md space-y-2.5 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0">
                      {sale.service === 'gmail' && <Mail className="w-4 h-4 text-red-500" />}
                      {sale.service === 'facebook' && <ThumbsUp className="w-4 h-4 text-[#1877f2]" />}
                      {sale.service === 'instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        {getServiceBadge(sale.service)}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        দাখিল: {new Date(sale.createdAt).toLocaleDateString('bn-BD', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                      +৳{Number(sale.rate || 0).toFixed(2)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        sale.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : sale.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {sale.status === 'approved'
                        ? '✓ অনুমোদিত'
                        : sale.status === 'rejected'
                        ? '✕ বাতিল'
                        : '⏳ পেন্ডিং'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/80 rounded-lg p-2 text-xs text-slate-300 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px]">অ্যাকাউন্ট / ইউজারনেম:</span>
                    <span className="font-mono text-[11px] text-white font-semibold">
                      {sale.accountIdentifier}
                    </span>
                  </div>
                  {sale.password && (
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                      <span className="text-slate-400 text-[10px]">পাসওয়ার্ড:</span>
                      <span className="font-mono text-slate-300">••••••••</span>
                    </div>
                  )}
                  {sale.status === 'rejected' && sale.rejectionReason && (
                    <div className="pt-1 border-t border-rose-500/20 text-rose-400 text-[11px]">
                      <span className="font-bold">বাতিলের কারণ: </span>
                      {sale.rejectionReason}
                    </div>
                  )}
                </div>

                {sale.status === 'pending' && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-300/90 font-medium">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>অ্যাডমিন রিভিউ করছেন। অনুমোদিত হলে মূল ব্যালেন্সে যুক্ত হবে।</span>
                  </div>
                )}
                {sale.status === 'approved' && (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>অ্যাকাউন্টটি সফলভাবে অনুমোদিত হয়েছে এবং একাউন্টে টাকা যোগ হয়েছে।</span>
                  </div>
                )}
              </div>
            ))}

          {/* General Tasks Submissions */}
          {(tab === 'all' || tab === 'tasks') &&
            pendingTasks.map((sub) => (
              <div
                key={sub.id}
                className="bg-[#0b1329] rounded-xl p-3.5 border border-slate-800/80 shadow-md space-y-2.5 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{sub.taskTitle}</h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        দাখিল: {new Date(sub.createdAt).toLocaleDateString('bn-BD', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                      +৳{sub.rewardAmount.toFixed(2)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        sub.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : sub.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {sub.status === 'approved'
                        ? '✓ অনুমোদিত'
                        : sub.status === 'rejected'
                        ? '✕ বাতিল'
                        : '⏳ পেন্ডিং'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/80 rounded-lg p-2 text-xs text-slate-300 border border-slate-800/80 space-y-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">আপনার প্রদত্ত প্রুফ:</span>
                    <span className="font-mono text-[11px] text-white break-all">{sub.proofData}</span>
                  </div>

                  {sub.status === 'rejected' && sub.rejectionReason && (
                    <div className="pt-1.5 border-t border-rose-500/20 text-rose-400 text-[11px]">
                      <span className="font-bold">বাতিলের কারণ: </span>
                      {sub.rejectionReason}
                    </div>
                  )}

                  {sub.screenshot && (
                    <div className="pt-1.5 border-t border-slate-800 flex items-center gap-2.5">
                      <img
                        src={sub.screenshot}
                        alt="আপলোডকৃত স্ক্রিনশট প্রুফ"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-700 bg-black"
                      />
                      <div>
                        <span className="text-[11px] text-amber-400 font-bold block">
                          ✓ স্ক্রিনশট প্রমাণ সংযুক্ত রয়েছে
                        </span>
                        <span className="text-[10px] text-slate-400">অ্যাডমিন স্ক্রিনশটটি দেখে যাচাই করছেন</span>
                      </div>
                    </div>
                  )}
                </div>

                {sub.status === 'pending' && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-300/90 font-medium">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>অ্যাডমিন রিভিউ চলছে। অনুমোদিত হলে ব্যালেন্সে টাকা যোগ হবে।</span>
                  </div>
                )}
                {sub.status === 'approved' && (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>টাস্কটি অনুমোদিত হয়েছে এবং ব্যালেন্সে টাকা যোগ হয়েছে।</span>
                  </div>
                )}
              </div>
            ))}

          {/* Pending Withdrawals */}
          {(tab === 'all' || tab === 'withdrawals') &&
            pendingWithdrawals.map((w) => (
              <div
                key={w.id}
                className="bg-[#0b1329] rounded-xl p-3.5 border border-slate-800/80 shadow-md space-y-2.5 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 border border-slate-800 flex items-center justify-center shrink-0">
                      <ArrowDownCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{w.method} উইথড্র</span>
                        <span className="text-xs font-mono font-semibold text-slate-300">
                          {w.accountNumber}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        দাখিল: {new Date(w.createdAt).toLocaleDateString('bn-BD', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      w.status === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : w.status === 'approved'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                        : w.status === 'rejected'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {w.status === 'paid'
                      ? '✓ পেইড (সম্পন্ন)'
                      : w.status === 'approved'
                      ? '✓ অনুমোদিত (প্রসেসিং)'
                      : w.status === 'rejected'
                      ? '✕ বাতিল'
                      : '⏳ পেন্ডিং'}
                  </span>
                </div>

                <div className="bg-slate-950/80 rounded-lg p-2 flex items-center justify-between text-xs border border-slate-800/80">
                  <span className="text-slate-400">
                    অনুরোধকৃত অর্থ: <strong className="text-white">৳{w.amount.toFixed(2)}</strong>
                  </span>
                  <span className="text-amber-400 font-bold">প্রাপ্য নেট: ৳{w.netAmount.toFixed(2)}</span>
                </div>

                {w.status === 'pending' && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-medium">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>অর্থ সাময়িকভাবে সংরক্ষিত আছে। ১২-২৪ ঘণ্টার মধ্যে পরিশোধ হবে।</span>
                  </div>
                )}

                {w.status === 'rejected' && w.rejectionReason && (
                  <div className="pt-1.5 text-rose-400 text-[11px]">
                    <span className="font-bold">বাতিলের কারণ: </span>
                    {w.rejectionReason}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
