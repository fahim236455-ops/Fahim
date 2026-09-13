import React, { useState } from 'react';
import {
  X,
  Sparkles,
  RotateCw,
  Calculator,
  Keyboard,
  HelpCircle,
  Gift,
  CheckCircle2,
  AlertCircle,
  Send,
  GraduationCap,
  ShoppingBag,
  ShieldCheck,
  Heart,
  Briefcase,
  Ticket,
  Target,
  Award,
  MessageCircle,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

interface ModalProps {
  type: string | null;
  onClose: () => void;
  onNavigate?: (route: string) => void;
}

export const DashboardModals: React.FC<ModalProps> = ({ type, onClose, onNavigate }) => {
  const { user, refreshUser, showToast, settings } = useApp();

  // Spin Wheel State
  const [spinning, setSpinning] = useState(false);
  const [spinDeg, setSpinDeg] = useState(0);
  const [spinWon, setSpinWon] = useState<number | null>(null);

  // Math Task State
  const [num1] = useState(Math.floor(Math.random() * 25) + 12);
  const [num2] = useState(Math.floor(Math.random() * 20) + 7);
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathSolved, setMathSolved] = useState(false);

  // Typing Task State
  const typingTarget = 'ঘরে বসে অনলাইনে ছোট ছোট কাজ করে সহজেই বাড়াতে পারেন আপনার দৈনিক আয়।';
  const [typedText, setTypedText] = useState('');
  const [typingSuccess, setTypingSuccess] = useState(false);

  // Quiz State
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Gift Code State
  const [giftCode, setGiftCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  // Job Post State
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');

  if (!type) return null;

  if (type === 'gmail') {
    if (onNavigate) onNavigate('gmail-sell');
    onClose();
    return null;
  }
  if (type === 'facebook') {
    if (onNavigate) onNavigate('facebook-sell');
    onClose();
    return null;
  }
  if (type === 'instagram') {
    if (onNavigate) onNavigate('instagram-sell');
    onClose();
    return null;
  }

  // 1. SPIN & EARN HANDLER
  const handleSpinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    setSpinWon(null);

    const prizes = [1, 2, 5, 10, 20, 2, 5, 1];
    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const wonAmount = prizes[prizeIndex];
    const segmentDegree = 360 / prizes.length;
    const finalRot = 1800 + prizeIndex * segmentDegree + Math.floor(Math.random() * 10);

    setSpinDeg(finalRot);

    setTimeout(() => {
      setSpinning(false);
      setSpinWon(wonAmount);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      showToast(`অভিনন্দন! আপনি লাকি স্পিনে ৳${wonAmount} জিতেছেন!`, 'success');
    }, 3200);
  };

  // 2. MATH TASK HANDLER
  const handleSolveMath = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(mathAnswer) === num1 + num2) {
      setMathSolved(true);
      confetti({ particleCount: 50, spread: 50 });
      showToast('সঠিক উত্তর! আপনি ৳২.০০ বোনাস পেয়েছেন।', 'success');
    } else {
      showToast('ভুল উত্তর, অনুগ্রহ করে পুনরায় চেষ্টা করুন!', 'error');
    }
  };

  // 3. TYPING TASK HANDLER
  const handleCheckTyping = () => {
    if (typedText.trim() === typingTarget.trim()) {
      setTypingSuccess(true);
      confetti({ particleCount: 60, spread: 60 });
      showToast('অসাধারণ! সঠিক টাইপিংয়ের জন্য ৳৩.০০ বোনাস যোগ হয়েছে।', 'success');
    } else {
      showToast('টাইপিং সঠিক হয়নি, পুনরায় মিলিয়ে লিখুন।', 'error');
    }
  };

  // 4. QUIZ SUBMIT HANDLER
  const handleQuizSubmit = (selectedIdx: number) => {
    setQuizAnswer(selectedIdx);
    setQuizSubmitted(true);
    if (selectedIdx === 1) {
      // Correct answer: টাকা (Taka)
      confetti({ particleCount: 60, spread: 60 });
      showToast('সঠিক উত্তর! ৳২.০০ কুইজ বোনাস যোগ হয়েছে।', 'success');
    } else {
      showToast('দুঃখিত, উত্তরটি সঠিক হয়নি। পরবর্তী কুইজে চেষ্টা করুন।', 'info');
    }
  };

  // 5. GIFT CODE REDEEM HANDLER
  const handleRedeemGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCode.trim()) return;

    setRedeeming(true);
    setTimeout(() => {
      setRedeeming(false);
      const code = giftCode.trim().toUpperCase();
      if (['EARNORA', 'SMALLGIG', 'FAHIMPAY', 'WELCOME50', 'BONUS2026'].includes(code)) {
        confetti({ particleCount: 80, spread: 70 });
        showToast(`অভিনন্দন! গিফট কোড সফলভাবে রিডিম হয়েছে। ৳৫০ ব্যালেন্সে যোগ হয়েছে!`, 'success');
        onClose();
      } else {
        showToast('অবৈধ বা মেয়াদোত্তীর্ণ গিফট কোড। সঠিক কোড লিখুন।', 'error');
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl relative border border-slate-800 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/60"
        >
          <X className="w-4 h-4" />
        </button>

        {/* SYSTEM CLOSED NOTICE (Matches SmallGigWork Snapshot) */}
        {type === 'system-closed' && (
          <div className="text-center pt-2 pb-2 flex flex-col items-center">
            {/* Top red dot */}
            <div className="w-2 h-2 rounded-full bg-rose-500 mb-5 animate-pulse" />

            {/* Circular red pause badge */}
            <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-rose-950">
              <div className="flex items-center gap-1.5 justify-center">
                <div className="w-1.5 h-5 bg-white rounded-full" />
                <div className="w-1.5 h-5 bg-white rounded-full" />
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
              সিস্টেমটি বন্ধ আছে
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed mb-6 max-w-[250px]">
              সিস্টেমটি বর্তমানে সাময়িকভাবে স্থগিত করা হয়েছে। আমরা দ্রুতই ফিরে আসবো।
            </p>

            {/* Go to Dashboard Button */}
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs sm:text-sm py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-md active:scale-95 transition-all mb-6 cursor-pointer"
            >
              <span>&larr; ড্যাশবোর্ডে যান</span>
            </button>

            {/* Dashed divider */}
            <div className="w-full border-t border-dashed border-slate-800 mb-4" />

            {/* Help text */}
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium mb-3">
              সহায়তার জন্য যুক্ত হন
            </p>

            {/* Social channels: Telegram, WhatsApp, YouTube */}
            <div className="flex items-center justify-center gap-3">
              <a
                href={
                  settings?.supportTelegram
                    ? `https://t.me/${settings.supportTelegram.replace('@', '')}`
                    : 'https://t.me'
                }
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-transform shadow-xs"
                title="Telegram Support"
              >
                <Send className="w-4 h-4 ml-[-1px] mt-[1px]" />
              </a>

              <a
                href={`https://wa.me/${(settings?.supportWhatsapp || '+8801700000000').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#25d366] flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-transform shadow-xs"
                title="WhatsApp Support"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

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
        )}

        {/* 1. SPIN & EARN */}
        {type === 'spin' && (
          <div className="text-center space-y-4 pt-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-xs">
              <RotateCw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">স্পিন ও আর্ন (Spin & Earn)</h3>
              <p className="text-xs text-slate-400 mt-0.5">চাকা ঘুরিয়ে জিতে নিন ১ থেকে ৫০ টাকা পর্যন্ত ক্যাশ প্রাইজ!</p>
            </div>

            {/* Graphical Wheel Representation */}
            <div className="relative w-44 h-44 mx-auto my-3 flex items-center justify-center">
              <div
                className="w-full h-full rounded-full border-8 border-amber-500 shadow-xl flex items-center justify-center relative overflow-hidden transition-all duration-[3000ms] ease-out bg-gradient-to-tr from-sky-600 via-amber-500 to-rose-600"
                style={{ transform: `rotate(${spinDeg}deg)` }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-3 text-white font-black text-xs">
                    <span>৳১০</span>
                    <span>৳৫</span>
                    <span>৳২০</span>
                    <span>৳৫০</span>
                  </div>
                </div>
              </div>
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-amber-400 z-10" />
            </div>

            {spinWon !== null && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-emerald-300 text-xs font-bold animate-in bounce-in">
                🎉 আপনি জিতেছেন ৳{spinWon}!
              </div>
            )}

            <button
              onClick={handleSpinWheel}
              disabled={spinning}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs py-3 rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {spinning ? 'চাকা ঘুরছে...' : 'স্পিন করুন (Spin Now)'}
            </button>
          </div>
        )}

        {/* 2. MATH TASK */}
        {type === 'math' && (
          <div className="space-y-4 pt-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-xs">
              <Calculator className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-white">ম্যাথ চ্যালেঞ্জ (Math Task)</h3>
              <p className="text-xs text-slate-400 mt-0.5">সহজ অঙ্কটি সমাধান করে জিতে নিন নিশ্চিত রিওয়ার্ড!</p>
            </div>

            {!mathSolved ? (
              <form onSubmit={handleSolveMath} className="space-y-3">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                  <span className="text-2xl font-black text-amber-400 tracking-wider font-mono">
                    {num1} + {num2} = ?
                  </span>
                </div>
                <input
                  type="number"
                  required
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value)}
                  placeholder="আপনার উত্তর লিখুন..."
                  className="w-full text-center text-sm font-bold p-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-md cursor-pointer"
                >
                  উত্তর জমা দিন
                </button>
              </form>
            ) : (
              <div className="p-4 bg-emerald-950/60 rounded-2xl border border-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-emerald-300">অংকটি সফলভাবে সমাধান হয়েছে!</p>
                <button
                  onClick={onClose}
                  className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  ঠিক আছে
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. TYPING JOB */}
        {type === 'typing' && (
          <div className="space-y-3 pt-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Keyboard className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-white">টাইপিং জব (Typing Job)</h3>
              <p className="text-xs text-slate-400">নিচের বাক্যটি হুবহু টাইপ করে ইনকাম করুন!</p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 leading-relaxed">
              "{typingTarget}"
            </div>

            {!typingSuccess ? (
              <div className="space-y-2">
                <textarea
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder="এখানে বাক্যটি টাইপ করুন..."
                  rows={3}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  onClick={handleCheckTyping}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
                  টাইপিং যাচাই করুন
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-center text-xs font-bold text-emerald-300">
                ✓ আপনার টাইপিং নির্ভুল হয়েছে! রিওয়ার্ড যোগ করা হয়েছে।
              </div>
            )}
          </div>
        )}

        {/* 4. QUIZ JOB */}
        {type === 'quiz' && (
          <div className="space-y-3 pt-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-white">কুইজ জব (Quiz Job)</h3>
              <p className="text-xs text-slate-400">সাধারণ জ্ঞানের সঠিক উত্তর দিয়ে জিতে নিন রিওয়ার্ড!</p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-amber-400">
              প্রশ্ন: বাংলাদেশের জাতীয় মুদ্রার অফিসিয়াল নাম কী?
            </div>

            <div className="space-y-1.5">
              {['রুপি (Rupee)', 'টাকা (Taka)', 'ডলার (Dollar)', 'দিনার (Dinar)'].map((opt, idx) => (
                <button
                  key={idx}
                  disabled={quizSubmitted}
                  onClick={() => handleQuizSubmit(idx)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    quizSubmitted && idx === 1
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                      : quizSubmitted && quizAnswer === idx && idx !== 1
                      ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                      : 'bg-slate-950 border-slate-800 hover:border-amber-500 text-slate-300'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}. {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. GIFT CODE REDEEM */}
        {type === 'gift-code' && (
          <form onSubmit={handleRedeemGift} className="space-y-3 pt-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-white">গিফট কোড রিডিম (Gift Code)</h3>
              <p className="text-xs text-slate-400">প্রোমো কোড বা গিফট ভাউচার লিখে বোনাস সংগ্রহ করুন।</p>
            </div>

            <input
              type="text"
              required
              value={giftCode}
              onChange={(e) => setGiftCode(e.target.value)}
              placeholder="যেমন: EARNORA50"
              className="w-full text-center uppercase tracking-widest text-xs font-bold p-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={redeeming}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
            >
              {redeeming ? 'যাচাই করা হচ্ছে...' : 'কোড রিডিম করুন'}
            </button>
            <p className="text-[10px] text-center text-slate-500">
              টিপস: টেলিগ্রাম চ্যানেলে ফ্রি গিফট কোড শেয়ার করা হয়।
            </p>
          </form>
        )}

        {/* 6. JOB POST MODAL */}
        {type === 'job-post' && (
          <div className="space-y-3 pt-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-white">কাজের বিজ্ঞাপন দিন (Job Post)</h3>
              <p className="text-xs text-slate-400">আপনার ফেসবুক পেজ, ইউটিউব চ্যানেল বা অ্যাপের প্রমোশন করুন।</p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="কাজের শিরোনাম (যেমন: ইউটিউব সাবস্ক্রাইব)..."
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
              <textarea
                placeholder="কাজের বিবরণ ও নিয়মাবলি..."
                rows={3}
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  showToast('বিজ্ঞাপনের অনুরোধ সফলভাবে গ্রহণ করা হয়েছে। অ্যাডমিন টিম যোগাযোগ করবে।', 'success');
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                বিজ্ঞাপন পোস্ট সাবমিট করুন
              </button>
            </div>
          </div>
        )}

        {/* 7. GENERIC INFORMATIONAL MODAL (Course, Salary, Target, Services, etc.) */}
        {![
          'spin',
          'math',
          'typing',
          'quiz',
          'gift-code',
          'job-post',
        ].includes(type) && (
          <div className="text-center space-y-3 pt-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white capitalize">
              {type === 'course' && 'ট্রেনিং ও কোর্স (Course)'}
              {type === 'salary' && 'মাসিক স্যালারি সিস্টেম (Salary)'}
              {type === 'target' && 'টার্গেট ও ইনসেন্টিভ (Target)'}
              {type === 'lottery' && 'সাপ্তাহিক লাকি লটারি (Lottery)'}
              {type === 'vpn' && 'পেইড ভিপিএন ক্রয় (Paid VPN)'}
              {type === 'reselling' && 'রিসেলিং ইনকাম পোর্টাল (Reselling)'}
              {type === 'drive' && 'ড্রাইভ অফার ও এমবি প্যাক (Drive Offer)'}
              {type === 'love-mall' && 'লাভ মল শপিং (Love Mall)'}
              {type === 'humanitarian' && 'মানবিক ফান্ড ও অনুদান (Humanitarian)'}
              {type === 'privacy' && 'গোপনীয়তা নীতি (Privacy Policy)'}
              {type === 'terms' && 'নিয়ম ও শর্তাবলি (Terms & Condition)'}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {type === 'course' &&
                'ফ্রিল্যান্সিং, মাইক্রো জব ও সোশ্যাল মিডিয়া মার্কেটিংয়ের সকল ফ্রী গাইডলাইন আমাদের টেলিগ্রাম ও ইউটিউব চ্যানেলে আপলোড করা হয়।'}
              {type === 'salary' &&
                'প্রতি মাসে ৫০টির বেশি টাস্ক ও ৫ জন সক্রিয় রেফারেল থাকলে ভিআইপি সদস্যদের জন্য আকর্ষণীয় ফিক্সড স্যালারি বোনাস প্রদান করা হয়।'}
              {type === 'target' &&
                'চলতি সপ্তাহে ২০টি মাইক্রো জব সম্পন্ন করলে বিশেষ ৫০ টাকা ক্যাশব্যাক বোনাস স্বয়ংক্রিয়ভাবে ব্যালেন্সে যুক্ত হবে।'}
              {type === 'lottery' &&
                'প্রতি শুক্রবার রাত ৯টায় ড্র অনুষ্ঠিত হয়। নিয়মিত কাজ জমা দেওয়া সদস্যদের থেকে ৩ জনকে মেগা ক্যাশ প্রাইজ দেওয়া হয়।'}
              {type === 'vpn' &&
                'হাই স্পিড প্রিমিয়াম ভিপিএন দিয়ে ইউএসএ/ইউকে ভিত্তিক হাই পেয়িং টাস্ক সম্পন্ন করতে আমাদের সাপোর্টে যোগাযোগ করুন।'}
              {type === 'reselling' &&
                'ডিজিটাল প্রোডাক্ট ও সোশ্যাল মিডিয়া প্রোমোশনাল সার্ভিস রিসেল করে আনলিমিটেড কমিশন আয় করুন।'}
              {type === 'drive' &&
                'রবি, গ্রামীণফোন, বাংলালিংক ও এয়ারটেলের সেরা মূল্যে ড্রাইভ ও ইন্টারনেট প্যাক নিয়ে অতিরিক্ত কমিশন আয় করুন।'}
              {type === 'love-mall' &&
                'আপনার অর্জিত ব্যালেন্স দিয়ে বিভিন্ন আকর্ষণীয় লাইফস্টাইল ও ডিজিটাল গ্যাজেট রিডিম করার প্ল্যাটফর্ম।'}
              {type === 'humanitarian' &&
                'আমাদের প্ল্যাটফর্মের লাভের একটি অংশ প্রতি মাসে দুস্থ ও অসহায় মানুষের সেবায় ব্যয় করা হয়।'}
              {type === 'privacy' &&
                'Earnora আপনার নাম, মোবাইল নম্বর ও লেনদেন তথ্য শতভাগ নিরাপদে সংরক্ষণ করে।'}
              {type === 'terms' &&
                'একটি ডিভাইস থেকে একাধিক ভুয়া অ্যাকাউন্ট খোলা নিষিদ্ধ। সঠিক কাজের প্রুফ জমা দিলে নিশ্চিত পেমেন্ট দেওয়া হয়।'}
            </p>

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow-xs cursor-pointer"
            >
              বুঝেছি (Close)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
