import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../lib/api';
import { ArrowDownCircle, History, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WithdrawPageProps {
  onNavigate: (route: string) => void;
}

export const WithdrawPage: React.FC<WithdrawPageProps> = ({ onNavigate }) => {
  const { user, settings, refreshUser, showToast } = useApp();

  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Recharge'>('bKash');
  const [accountNumber, setAccountNumber] = useState<string>(user?.phoneNumber || '');
  const [amount, setAmount] = useState<string>('500');
  const [loading, setLoading] = useState<boolean>(false);

  const balance = user?.balance ?? 0;
  const minWithdrawal = settings?.minWithdrawal ?? 500;
  const feePercent = settings?.withdrawalFeePercent ?? 2;

  const numericAmount = parseFloat(amount) || 0;
  const calculatedFee = Number(((numericAmount * feePercent) / 100).toFixed(2));
  const netPayout = numericAmount > calculatedFee ? Number((numericAmount - calculatedFee).toFixed(2)) : 0;

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  const handleMaxAmount = () => {
    if (balance >= minWithdrawal) {
      setAmount(Math.floor(balance).toString());
    } else {
      setAmount(minWithdrawal.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountNumber || !/^01[3-9]\d{8}$/.test(accountNumber.replace(/\s+/g, ''))) {
      showToast('সঠিক ১১ ডিজিটের পার্সোনাল নম্বর প্রদান করুন (যেমন: 01712345678)', 'error');
      return;
    }

    if (numericAmount < minWithdrawal) {
      showToast(`সর্বনিম্ন উত্তোলনের পরিমাণ ৳${minWithdrawal} টাকা।`, 'error');
      return;
    }

    if (numericAmount > balance) {
      showToast(`অপর্যাপ্ত ব্যালেন্স। আপনার বর্তমান ব্যালেন্স ৳${balance.toFixed(2)} টাকা।`, 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await fetchApi<{ message: string; balance: number }>('/withdrawals/request', {
        method: 'POST',
        body: JSON.stringify({
          method,
          accountNumber: accountNumber.trim(),
          amount: numericAmount,
        }),
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      showToast(res.message || 'উত্তোলন রিকোয়েস্ট সফলভাবে গৃহীত হয়েছে!', 'success');
      await refreshUser();
      onNavigate('withdraw-history');
    } catch (err: any) {
      showToast(err.message || 'উত্তোলন প্রক্রিয়াকরণে সমস্যা হয়েছে।', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-24 font-['Hind_Siliguri',sans-serif] text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <ArrowDownCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight">টাকা উত্তোলন (Withdraw)</h1>
            <p className="text-xs text-slate-400 font-medium">বিকাশ, নগদ ও রকেটে দ্রুত পেমেন্ট নিন</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('withdraw-history')}
          className="text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 font-bold px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <History className="w-4 h-4" />
          <span>হিস্ট্রি</span>
        </button>
      </div>

      {/* Available Balance Box */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-5 border border-amber-500/30 shadow-xl flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">আপনার বর্তমান ব্যালেন্স</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-0.5">৳{balance.toFixed(2)}</div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 font-medium">মিনিমাম উইথড্র</span>
          <div className="text-sm sm:text-base font-bold text-white">৳{minWithdrawal} টাকা</div>
        </div>
      </div>

      {/* Withdrawal Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        {/* Method selection */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-bold text-slate-200 block">পেমেন্ট মেথড বেছে নিন:</label>
          <div className="grid grid-cols-2 gap-2.5">
            {/* bKash */}
            <button
              type="button"
              onClick={() => setMethod('bKash')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                method === 'bKash'
                  ? 'border-[#E2136E] bg-[#E2136E]/20 text-pink-300 font-bold shadow-md scale-102 ring-1 ring-[#E2136E]/50'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#E2136E] text-white text-[11px] font-black flex items-center justify-center shadow-sm">
                bK
              </div>
              <span className="text-xs font-bold">বিকাশ (bKash)</span>
            </button>

            {/* Nagad */}
            <button
              type="button"
              onClick={() => setMethod('Nagad')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                method === 'Nagad'
                  ? 'border-[#F7941D] bg-[#F7941D]/20 text-orange-300 font-bold shadow-md scale-102 ring-1 ring-[#F7941D]/50'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#F7941D] text-white text-[11px] font-black flex items-center justify-center shadow-sm">
                নাগদ
              </div>
              <span className="text-xs font-bold">নগদ (Nagad)</span>
            </button>

            {/* Rocket */}
            <button
              type="button"
              onClick={() => setMethod('Rocket')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                method === 'Rocket'
                  ? 'border-[#8C3494] bg-[#8C3494]/20 text-purple-300 font-bold shadow-md scale-102 ring-1 ring-[#8C3494]/50'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#8C3494] text-white text-[11px] font-black flex items-center justify-center shadow-sm">
                রকেট
              </div>
              <span className="text-xs font-bold">রকেট (Rocket)</span>
            </button>

            {/* Recharge */}
            <button
              type="button"
              onClick={() => setMethod('Recharge')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                method === 'Recharge'
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold shadow-md scale-102 ring-1 ring-emerald-500/50'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-black flex items-center justify-center shadow-sm">
                রিচার্জ
              </div>
              <span className="text-xs font-bold">মোবাইল রিচার্জ</span>
            </button>
          </div>
        </div>

        {/* Account Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">
            {method} একাউন্ট নম্বর (Personal):
          </label>
          <input
            type="tel"
            required
            placeholder="017XXXXXXXX"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-amber-400 focus:outline-none transition-colors"
          />
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">উত্তোলনের পরিমাণ (টাকা):</label>
            <button
              type="button"
              onClick={handleMaxAmount}
              className="text-[11px] text-amber-400 hover:underline font-bold cursor-pointer"
            >
              সর্বোচ্চ তুলুন
            </button>
          </div>
          <input
            type="number"
            required
            min={minWithdrawal}
            step="10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-bold text-amber-400 focus:border-amber-400 focus:outline-none transition-colors"
          />

          {/* Quick amount chips */}
          <div className="flex items-center gap-2 pt-1">
            {[500, 1000, 2000, 5000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAmount(val)}
                className="flex-1 py-1 text-xs font-bold rounded-lg border border-slate-800 bg-slate-950/80 hover:border-amber-500/40 text-slate-300 transition-colors cursor-pointer"
              >
                ৳{val}
              </button>
            ))}
          </div>
        </div>

        {/* Fee & Calculation Summary */}
        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>রিকোয়েস্ট পরিমাণ:</span>
            <span className="font-bold text-slate-200">৳{numericAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>সার্ভিস চার্জ ({feePercent}%):</span>
            <span className="font-bold text-rose-400">- ৳{calculatedFee.toFixed(2)}</span>
          </div>
          <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold text-sm">
            <span className="text-slate-300">আপনি পাবেন:</span>
            <span className="text-emerald-400">৳{netPayout.toFixed(2)}</span>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || balance < minWithdrawal}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-slate-950 font-black text-sm py-3 rounded-xl shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'রিকোয়েস্ট পাঠানো হচ্ছে...' : 'উইথড্র সাবমিট করুন'}</span>
        </button>
      </form>
    </div>
  );
};
