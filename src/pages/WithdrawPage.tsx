import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../lib/api';
import { ArrowDownCircle, AlertCircle, CheckCircle2, History, ShieldAlert, Sparkles, Smartphone } from 'lucide-react';
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
        origin: { y: 0.7 },
      });

      showToast(res.message, 'success');
      await refreshUser();
      onNavigate('pending-status');
    } catch (err: any) {
      showToast(err.message || 'উইথড্র রিকোয়েস্ট ব্যর্থ হয়েছে।', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-24 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <ArrowDownCircle className="w-5 h-5 text-amber-400" />
            <span>টাকা উত্তোলন (Withdraw)</span>
          </h1>
          <p className="text-xs text-slate-400">বিকাশ, নগদ ও রকেটে দ্রুত পেমেন্ট নিন</p>
        </div>
        <button
          onClick={() => onNavigate('withdraw-history')}
          className="text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 font-bold px-3 py-1.5 rounded-lg border border-amber-500/30 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <History className="w-3.5 h-3.5" />
          <span>হিস্ট্রি</span>
        </button>
      </div>

      {/* Available Balance Box */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-4 text-white shadow-xl flex items-center justify-between border border-amber-500/30">
        <div>
          <span className="text-xs text-amber-200 uppercase font-semibold">আপনার বর্তমান ব্যালেন্স</span>
          <div className="text-2xl font-black text-amber-400">৳{balance.toFixed(2)}</div>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400">মিনিমাম উইথড্র</span>
          <div className="text-sm font-bold text-white">৳{minWithdrawal} টাকা</div>
        </div>
      </div>

      {/* Withdrawal Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md space-y-4">
        {/* Method selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 block">পেমেন্ট মেথড বেছে নিন:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* bKash */}
            <button
              type="button"
              onClick={() => setMethod('bKash')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                method === 'bKash'
                  ? 'border-[#E2136E] bg-[#E2136E]/15 text-[#E2136E] font-bold shadow-md scale-102 ring-1 ring-[#E2136E]'
                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-[#E2136E] text-white text-[10px] font-black flex items-center justify-center">
                bK
              </div>
              <span className="text-[11px] font-bold">বিকাশ (bKash)</span>
            </button>

            {/* Nagad */}
            <button
              type="button"
              onClick={() => setMethod('Nagad')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                method === 'Nagad'
                  ? 'border-[#F7941D] bg-[#F7941D]/15 text-[#F7941D] font-bold shadow-md scale-102 ring-1 ring-[#F7941D]'
                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-[#F7941D] text-white text-[10px] font-black flex items-center justify-center">
                না
              </div>
              <span className="text-[11px] font-bold">নগদ (Nagad)</span>
            </button>

            {/* Rocket */}
            <button
              type="button"
              onClick={() => setMethod('Rocket')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                method === 'Rocket'
                  ? 'border-[#8C3494] bg-[#8C3494]/15 text-purple-300 font-bold shadow-md scale-102 ring-1 ring-[#8C3494]'
                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-[#8C3494] text-white text-[10px] font-black flex items-center justify-center">
                র
              </div>
              <span className="text-[11px] font-bold">রকেট (Rocket)</span>
            </button>

            {/* Mobile Recharge */}
            <button
              type="button"
              onClick={() => setMethod('Recharge')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                method === 'Recharge'
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold shadow-md scale-102 ring-1 ring-emerald-500'
                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold">রিচার্জ (Recharge)</span>
            </button>
          </div>
        </div>

        {/* Account number */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-200 block">
            {method === 'Recharge' ? 'রিচার্জ মোবাইল নম্বর' : `${method} পার্সোনাল নম্বর`} (১১ ডিজিট):
          </label>
          <input
            type="tel"
            required
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="01712345678"
            className="w-full text-sm font-semibold p-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark-input"
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200">উত্তোলনের পরিমাণ (টাকা):</label>
            <span className="text-[11px] text-amber-400 font-semibold">মিনিমাম ৳{minWithdrawal}</span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-3 text-slate-400 font-bold text-sm">৳</span>
            <input
              type="number"
              min={minWithdrawal}
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
              className="w-full text-base font-bold pl-8 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark-input"
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickAmount(500)}
              className="flex-1 py-1 text-xs font-semibold rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            >
              ৳৫০০
            </button>
            <button
              type="button"
              onClick={() => handleQuickAmount(1000)}
              className="flex-1 py-1 text-xs font-semibold rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            >
              ৳১০০০
            </button>
            <button
              type="button"
              onClick={() => handleQuickAmount(2000)}
              className="flex-1 py-1 text-xs font-semibold rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            >
              ৳২০০০
            </button>
            <button
              type="button"
              onClick={handleMaxAmount}
              className="flex-1 py-1 text-xs font-bold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
            >
              সব ব্যালেন্স
            </button>
          </div>
        </div>

        {/* Calculation Summary Table */}
        <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>উত্তোলনের পরিমাণ:</span>
            <span className="font-bold text-white">৳{numericAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>প্ল্যাটফর্ম ফি ({feePercent}%):</span>
            <span className="font-bold text-rose-400">-৳{calculatedFee.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
            <span className="font-bold text-amber-200">আপনি পাবেন (Net Payout):</span>
            <span className="font-extrabold text-amber-400 text-base">৳{netPayout.toFixed(2)}</span>
          </div>
        </div>

        {/* Balance Warning */}
        {numericAmount > balance && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>আপনার পর্যাপ্ত ব্যালেন্স নেই। আরও টাস্ক পূরণ করে ব্যালেন্স বৃদ্ধি করুন।</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || numericAmount > balance || numericAmount < minWithdrawal}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm py-3 rounded-xl shadow-md transition-transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowDownCircle className="w-4 h-4" />
          <span>{loading ? 'প্রক্রিয়াধীন...' : 'উইথড্র রিকোয়েস্ট নিশ্চিত করুন'}</span>
        </button>
      </form>

      {/* Rules Notice */}
      <div className="bg-slate-900 rounded-xl p-3.5 border border-amber-500/20 text-xs text-slate-300 space-y-1.5 shadow-md">
        <p className="font-bold flex items-center gap-1.5 text-amber-400">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>উইথড্র সংক্রান্ত আবশ্যকীয় নিয়মাবলী:</span>
        </p>
        <ul className="list-disc pl-4 space-y-1 text-slate-400">
          <li>উইথড্র রিকোয়েস্ট সাবমিট করার পর রিকোয়েস্টটি পেন্ডিং অবস্থায় চলে যাবে।</li>
          <li>অ্যাডমিন ভেরিফিকেশনের পর ১২ থেকে ২৪ ঘণ্টার মধ্যে টাকা আপনার একাউন্টে পৌঁছে যাবে।</li>
          <li>রিকোয়েস্ট বাতিল হলে টাকা স্বয়ংক্রিয়ভাবে আপনার মূল ব্যালেন্সে রিফান্ড হবে।</li>
        </ul>
      </div>
    </div>
  );
};
