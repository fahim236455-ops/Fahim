import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { showToast } = useApp();
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-md space-y-4">
        <button
          onClick={() => onNavigate('login')}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>লগইনে ফিরে যান</span>
        </button>

        <div className="space-y-1">
          <h1 className="text-lg font-bold text-slate-900">পাসওয়ার্ড রিসেট করুন</h1>
          <p className="text-xs text-slate-500">
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
              <label className="text-xs font-bold text-slate-700 block">ইমেইল বা মোবাইল নম্বর:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="01712345678 অথবা name@example.com"
                  className="w-full text-xs font-medium pl-9 p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
