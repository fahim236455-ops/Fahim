import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, ArrowLeft, Send, CheckCircle2, Sun, Moon } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { showToast, isDarkMode, toggleDarkMode } = useApp();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone) {
      showToast('ইমেইল অথবা মোবাইল নম্বর প্রদান করুন।', 'error');
      return;
    }
    setSent(true);
    showToast('পাসওয়ার্ড রিসেট নির্দেশাবলী পাঠানো হয়েছে।', 'success');
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center px-4 py-8 max-w-md mx-auto transition-colors ${
      isDarkMode ? 'bg-[#060b18] text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      <div className="bg-white dark:bg-[#0c1222] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('login')}
            className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>লগইনে ফিরে যান</span>
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
          </button>
        </div>

        <div className="space-y-1">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">পাসওয়ার্ড রিসেট করুন</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            আপনার রেজিস্টার্ড মোবাইল নম্বর বা ইমেইল লিখুন। আমরা রিকভারি সহায়তা প্রদান করব।
          </p>
        </div>

        {sent ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-900">অনুরোধ গৃহীত হয়েছে</h3>
            <p className="text-xs text-slate-600">
              আপনার একাউন্টের নিরাপত্তা নিশ্চিত করতে আমাদের হেল্পলাইন বা টেলিগ্রাম সাপোর্টে যোগাযোগ করতে পারেন।
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl mt-2"
            >
              লগইন পেজে যান
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">ইমেইল বা মোবাইল নম্বর:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="01712345678 অথবা name@example.com"
                  className="w-full text-xs font-semibold pl-9 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0a1128] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>রিসেট লিংক পাঠান</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
