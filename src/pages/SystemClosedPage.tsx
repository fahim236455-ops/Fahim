import React from 'react';
import { Send, MessageCircle, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SystemClosedPageProps {
  onNavigate: (route: string) => void;
}

export const SystemClosedPage: React.FC<SystemClosedPageProps> = ({ onNavigate }) => {
  const { settings } = useApp();

  const telegramUrl = settings?.supportTelegram
    ? `https://t.me/${settings.supportTelegram.replace('@', '')}`
    : 'https://t.me';

  const whatsappUrl = `https://wa.me/${(settings?.supportWhatsapp || '+8801700000000').replace(/[^0-9]/g, '')}`;

  return (
    <div className="min-h-screen bg-[#edf2f7] flex items-center justify-center p-4 font-['Hind_Siliguri',sans-serif]">
      {/* Centered White Card */}
      <div className="bg-white rounded-[28px] px-7 py-8 sm:px-9 sm:py-10 max-w-[340px] w-full text-center shadow-lg shadow-slate-200/60 border border-slate-100 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        {/* Top small red dot indicator */}
        <div className="w-2 h-2 rounded-full bg-[#f87171] mb-5" />

        {/* Circular red pause badge */}
        <div className="w-14 h-14 rounded-full bg-[#ef4444] text-white flex items-center justify-center mb-5 shadow-sm shadow-red-200">
          <div className="flex items-center gap-1.5 justify-center">
            <div className="w-1.5 h-5 bg-white rounded-full" />
            <div className="w-1.5 h-5 bg-white rounded-full" />
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-xl font-bold text-[#1e293b] mb-2 tracking-tight">
          সিস্টেমটি বন্ধ আছে
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-[13px] text-[#64748b] leading-relaxed mb-6 max-w-[250px]">
          সিস্টেমটি বর্তমানে সাময়িকভাবে স্থগিত করা হয়েছে। আমরা দ্রুতই ফিরে আসবো।
        </p>

        {/* Go to Dashboard Button */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs sm:text-sm font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-all mb-6 cursor-pointer"
        >
          <span>&larr; ড্যাশবোর্ডে যান</span>
        </button>

        {/* Dashed divider */}
        <div className="w-full border-t border-dashed border-slate-200 mb-4" />

        {/* Help text */}
        <p className="text-[11px] sm:text-xs text-slate-400 font-medium mb-3">
          সহায়তার জন্য যুক্ত হন
        </p>

        {/* Social channels: Telegram, WhatsApp, YouTube */}
        <div className="flex items-center justify-center gap-3">
          {/* Telegram */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-transform shadow-xs"
            title="Telegram Support"
          >
            <Send className="w-4 h-4 ml-[-1px] mt-[1px]" />
          </a>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 rounded-full bg-[#25d366] flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-transform shadow-xs"
            title="WhatsApp Support"
          >
            <MessageCircle className="w-4 h-4" />
          </a>

          {/* YouTube */}
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 rounded-full bg-[#ff0000] flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-transform shadow-xs"
            title="YouTube Channel"
          >
            <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
