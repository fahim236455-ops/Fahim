import React from 'react';
import { ArrowLeft, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PolicyPageProps {
  onNavigate: (route: string) => void;
  type: 'privacy' | 'terms' | 'refund';
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ onNavigate, type }) => {
  const { settings } = useApp();
  const brandName = settings?.brandName || 'Earnora';

  const getContent = () => {
    if (type === 'privacy') {
      return {
        title: 'প্রাইভেসি পলিসি (Privacy Policy)',
        subtitle: 'আপনার তথ্যের সুরক্ষা ও গোপনীয়তা নীতিমালা',
        icon: ShieldCheck,
        sections: [
          {
            heading: '১. তথ্য সংগ্রহ ও ব্যবহার',
            text: `${brandName}-এ রেজিস্ট্রেশন করার সময় আপনার নাম, ইমেইল নম্বর এবং পেমেন্ট উইথড্রয়ালের জন্য বিকাশ/নগদ নম্বর সংগ্রহ করা হয়। এই তথ্য শুধুমাত্র আপনার অ্যাকাউন্ট নিরাপত্তা এবং অর্জিত টাকা পাঠানোর কাজে ব্যবহৃত হয়।`,
          },
          {
            heading: '২. তথ্যের নিরাপত্তা',
            text: 'আমরা ব্যবহারকারীদের গোপনীয়তাকে সর্বোচ্চ প্রাধান্য দিই। আপনার ব্যক্তিগত তথ্য বা পাসওয়ার্ড অন্য কোনো তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করা হয় না।',
          },
          {
            heading: '৩. পেআউট ও ট্রানজেকশন রেকর্ড',
            text: 'সকল লেনদেন ও কাজের জমা দেওয়া হিস্ট্রি সিস্টেমে সংরক্ষিত থাকে যাতে পরবর্তীতে কোনো পেমেন্ট সংক্রান্ত বিরোধ দেখা দিলে দ্রুত সমাধান করা যায়।',
          },
          {
            heading: '৪. কুকিজ ও সেশন',
            text: 'আপনার সিস্টেমে লগইন অবস্থা বজায় রাখতে এবং অ্যাপটি দ্রুত লোড হওয়ার জন্য লোকাল স্টোরেজ ব্যবহার করা হয়।',
          },
        ],
      };
    } else if (type === 'terms') {
      return {
        title: 'টার্মস অ্যান্ড কন্ডিশন (Terms & Conditions)',
        subtitle: 'ব্যবহারকারীর নিয়মাবলী ও ব্যবহারের শর্তাবলী',
        icon: FileText,
        sections: [
          {
            heading: '১. অ্যাকাউন্ট ব্যবহারের শর্তাবলী',
            text: `একজন ব্যবহারকারী একটি মাত্র অ্যাকাউন্ট খুলতে পারবেন। একাধিক ফেক অ্যাকাউন্ট খোলা বা অটোমেটিক বট ব্যবহার করা কঠোরভাবে নিষিদ্ধ।`,
          },
          {
            heading: '২. সঠিক কাজের প্রুফ প্রদান',
            text: 'টাস্ক সম্পন্ন করার পর সঠিক তথ্য বা স্ক্রিনশট প্রদান করতে হবে। ভুল বা ভুয়া প্রুফ দিলে অ্যাকাউন্ট সাময়িকভাবে ব্যান করা হতে পারে।',
          },
          {
            heading: '৩. পেমেন্ট ও উইথড্রয়াল নীতি',
            text: `সর্বনিম্ন উইথড্রয়াল অ্যামাউন্ট (৳${settings?.minWithdrawal || 100}) অর্জন করার পর উইথড্র রিকোয়েস্ট দেওয়া যাবে। ২৪ থেকে ৪৮ ঘণ্টার মধ্যে পেমেন্ট প্রক্রিয়া সম্পন্ন হয়।`,
          },
          {
            heading: '৪. রেফারেল নিয়মাবলী',
            text: 'রেফারেল বোনাস পাওয়ার জন্য যাকে রেফার করছেন তাকে অবশ্যই রিয়েল ইউজার হতে হবে। আত্ম-রেফারেল বা ফেক রেফারেল ধরা পড়লে বোনাস বাজেয়াপ্ত করা হবে।',
          },
        ],
      };
    } else {
      return {
        title: 'রিফান্ড পলিসি (Refund Policy)',
        subtitle: 'পেমেন্ট ও রিফান্ড নীতি',
        icon: CheckCircle2,
        sections: [
          {
            heading: '১. ফ্রি মেম্বারশিপ',
            text: `${brandName}-এ যোগদান সম্পূর্ণ ফ্রী। কাজ করার জন্য ব্যবহারকারীকে কোনো টাকা প্রদান করতে হয় না।`,
          },
          {
            heading: '২. ডিপোজিট ও ব্যালেন্স রিফান্ড',
            text: 'যদি কোনো ইউজার জিমেইল বা টাস্ক পোস্ট করার জন্য ডিপোজিট করেন এবং সেই কাজ সম্পন্ন না হয়, তবে অব্যবহৃত টাকা মেম্বার ওয়ালেটে রিফান্ড করা হবে।',
          },
        ],
      };
    }
  };

  const content = getContent();
  const IconComponent = content.icon;

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4 pb-24 font-['Hind_Siliguri',sans-serif] text-slate-100">
      {/* Top Header */}
      <div className="flex items-center gap-3 bg-[#0c1222] border border-[#1e293b] p-3.5 rounded-2xl shadow-md">
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-bold text-white">{content.title}</h1>
          <p className="text-[10px] text-slate-400">{content.subtitle}</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-[#0c1222] border border-[#1e293b] rounded-2xl p-5 space-y-5 shadow-xl">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">{brandName} Legal Overview</h2>
            <p className="text-[11px] text-slate-400">সর্বশেষ আপডেট: সেপ্টেম্বর ২০২৬</p>
          </div>
        </div>

        {content.sections.map((sec, idx) => (
          <div key={idx} className="space-y-1.5 bg-[#060b18] p-3.5 rounded-xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-sky-300">{sec.heading}</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{sec.text}</p>
          </div>
        ))}

        <div className="pt-2 text-center border-t border-slate-800">
          <p className="text-[10px] text-slate-400">
            যেকোনো প্রশ্নের জন্য আমাদের{' '}
            <button
              onClick={() => onNavigate('support')}
              className="text-amber-400 font-bold underline cursor-pointer"
            >
              সাপোর্ট সেন্টারে
            </button>{' '}
            যোগাযোগ করুন।
          </p>
        </div>
      </div>
    </div>
  );
};
