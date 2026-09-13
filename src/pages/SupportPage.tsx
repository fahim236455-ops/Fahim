import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../lib/api';
import { SupportTicket } from '../types';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Clock,
  CheckCircle2,
  X,
  Phone,
  MessageSquare,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';

interface SupportPageProps {
  onNavigate: (route: string) => void;
}

export const formatWhatsAppLink = (number?: string) => {
  if (!number) return 'https://wa.me/8801700000000';
  let clean = number.replace(/[^0-9]/g, '');
  if (clean.startsWith('01') && clean.length === 11) {
    clean = '88' + clean;
  }
  return `https://wa.me/${clean}`;
};

export const formatTelegramLink = (handle?: string) => {
  if (!handle) return 'https://t.me/fahimpaybd_official';
  if (handle.startsWith('http://') || handle.startsWith('https://')) {
    return handle;
  }
  const clean = handle.replace(/^@+/, '').trim();
  return `https://t.me/${clean}`;
};

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
  const { user, settings, showToast } = useApp();

  // Tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'task' | 'withdrawal' | 'deposit' | 'referral' | 'account' | 'other'>('withdrawal');
  const [message, setMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  // UI tabs / filters
  const [activeTab, setActiveTab] = useState<'contact' | 'ticket' | 'my-tickets'>('contact');
  const [selectedScreenshotUrl, setSelectedScreenshotUrl] = useState<string | null>(null);

  // FAQ open/close state
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing tickets
  const loadTickets = async () => {
    try {
      setLoadingTickets(true);
      const data = await fetchApi<SupportTicket[]>('/support/tickets');
      if (Array.isArray(data)) {
        setTickets(data);
      }
    } catch {
      // quiet fail
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Handle Image upload for ticket
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('শুধুমাত্র ছবি ফাইল নির্বাচন করুন।', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('ফাইলের সাইজ ৫MB এর কম হতে হবে।', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setAttachedImage(uploadEvent.target?.result as string);
      showToast('ছবি সফলভাবে সংযুক্ত হয়েছে', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Submit new support ticket
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      showToast('দয়া করে বিষয় এবং বার্তার বিবরণ লিখুন।', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetchApi<{ message: string; ticket: SupportTicket }>('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({
          subject: subject.trim(),
          category,
          message: message.trim(),
          userName: user?.fullName || 'গ্রাহক',
          userPhone: user?.phoneNumber || '',
          userEmail: user?.email || '',
          attachmentUrl: attachedImage || undefined,
        }),
      });

      showToast(res.message || 'সাপোর্ট টিকিট সফলভাবে পাঠানো হয়েছে!', 'success');
      setSubject('');
      setMessage('');
      setAttachedImage(null);
      await loadTickets();
      setActiveTab('my-tickets');
    } catch (err: any) {
      showToast(err.message || 'টিকিট পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'উইথড্র রিকোয়েস্ট করার কতক্ষণের মধ্যে টাকা পাওয়া যায়?',
      a: 'সাধারণত ১২ থেকে ২৪ ঘণ্টার মধ্যে উইথড্র অনুমোদিত ও পরিশোধ করা হয়। অ্যাডমিন প্যানেল থেকে পেমেন্ট সফল হলে আপনার বিকাশ, নগদ বা রকেটে এসএমএস যাবে।',
    },
    {
      q: 'টাস্ক জমা দেওয়ার পর ব্যালেন্সে টাকা কখন যোগ হয়?',
      a: 'টাস্ক জমা দেওয়ার পর অ্যাডমিন টিম প্রুফ বা স্ক্রিনশট যাচাই করে। সাধারণত ১-৩ ঘণ্টার মধ্যে টাস্ক অ্যাপ্রুভ হয়ে স্বয়ংক্রিয়ভাবে মূল ব্যালেন্সে টাকা যোগ হয়।',
    },
    {
      q: 'রেফারেল বোনাস পাওয়ার নিয়ম কী?',
      a: 'আপনার রেফারেল লিংক ব্যবহার করে যেকোনো বন্ধু একাউন্ট খুললেই আপনার রেফারেল তালিকায় যুক্ত হবে। রেফারেল বোনাস সরাসরি আপনার মূল ব্যালেন্সে যোগ হয়।',
    },
    {
      q: 'অ্যাকাউন্ট সংক্রান্ত যেকোনো জরুরি প্রয়োজনে কীভাবে কথা বলব?',
      a: 'সবচেয়ে দ্রুত সমাধানের জন্য উপরের অফিসিয়াল হোয়াটসঅ্যাপ বা টেলিগ্রাম লিংকে ক্লিক করে সরাসরি আমাদের সাপোর্ট এজেন্টের সাথে কথা বলতে পারেন।',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 text-slate-100">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between bg-slate-900 rounded-2xl p-4 shadow-md border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-support-back"
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="ড্যাশবোর্ডে ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>২৪/৭ হেল্পডেস্ক ও কাস্টমার সাপোর্ট</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                সক্রিয়
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              যেকোনো সমস্যা বা সহযোগিতার জন্য সরাসরি আমাদের অফিশিয়াল চ্যানেলে যোগাযোগ করুন
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
        <button
          type="button"
          id="tab-direct-contact"
          onClick={() => setActiveTab('contact')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>সরাসরি যোগাযোগ</span>
        </button>

        <button
          type="button"
          id="tab-create-ticket"
          onClick={() => setActiveTab('ticket')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'ticket'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>টিকিট পাঠান</span>
        </button>

        <button
          type="button"
          id="tab-my-tickets"
          onClick={() => setActiveTab('my-tickets')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 relative cursor-pointer ${
            activeTab === 'my-tickets'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>আমার টিকিটসমূহ</span>
          {tickets.length > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-1 ${activeTab === 'my-tickets' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'}`}>
              {tickets.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: DIRECT OFFICIAL CONTACT CHANNELS */}
      {activeTab === 'contact' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Main 3 Direct Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. WhatsApp Support Card */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col justify-between hover:border-emerald-500/40 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-md mb-3">
                  {/* WhatsApp SVG Icon */}
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current text-emerald-400">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.83a8.17 8.17 0 0 1-5.82 2.41c-1.47 0-2.92-.39-4.19-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.196 8.196 0 0 1-1.26-4.39c0-4.54 3.7-8.24 8.23-8.24zm4.5 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43l-.48-.01c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.41 1.02 2.58.13.17 1.75 2.68 4.24 3.76.59.26 1.05.41 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.07-.1-.23-.17-.48-.29z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-sm sm:text-base">হোয়াটসঅ্যাপ সাপোর্ট</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  সরাসরি হোয়াটসঅ্যাপে মেসেজ পাঠান। সাপোর্ট টিম দ্রুত আপনার সমস্যার সমাধান দেবে।
                </p>
                <div className="mt-3 p-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold text-xs">
                  {settings?.supportWhatsapp || '+880 1700-000000'}
                </div>
              </div>

              <a
                href={formatWhatsAppLink(settings?.supportWhatsapp)}
                target="_blank"
                rel="noreferrer"
                id="btn-open-whatsapp-support"
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-98 cursor-pointer"
              >
                <span>হোয়াটসঅ্যাপে চ্যাট করুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* 2. Telegram Channel & Community Card */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col justify-between hover:border-sky-500/40 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center shadow-md mb-3">
                  {/* Telegram SVG Icon */}
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-sky-400">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-sm sm:text-base">টেলিগ্রাম চ্যানেল ও সাপোর্ট</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  অফিসিয়াল চ্যানেলে যুক্ত হয়ে প্রতিদিনের পেমেন্ট প্রুফ, গুরুত্বপূর্ণ নোটিশ ও আপডেট সবার আগে পান।
                </p>
                <div className="mt-3 p-2 bg-slate-950 border border-slate-800 rounded-xl text-sky-400 font-mono font-bold text-xs">
                  {settings?.supportTelegram || '@fahimpaybd_official'}
                </div>
              </div>

              <a
                href={formatTelegramLink(settings?.supportTelegram)}
                target="_blank"
                rel="noreferrer"
                id="btn-open-telegram-support"
                className="mt-4 w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-98 cursor-pointer"
              >
                <span>টেলিগ্রামে জয়েন করুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* 3. Phone Hotline Card */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col justify-between hover:border-amber-500/40 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-md mb-3">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-sm sm:text-base">মোবাইল হেল্পলাইন</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  জরুরি প্রয়োজনে সরাসরি আমাদের হেল্পলাইন নম্বরে কল করুন (সকাল ১০টা - রাত ১০টা)।
                </p>
                <div className="mt-3 p-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-mono font-bold text-xs">
                  {settings?.supportPhone || '+880 1700-000000'}
                </div>
              </div>

              <a
                href={`tel:${settings?.supportPhone || '+8801700000000'}`}
                id="btn-call-helpline"
                className="mt-4 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-98 cursor-pointer"
              >
                <span>সরাসরি কল করুন</span>
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Notice Banner */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 shadow-md">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-bold text-amber-400">জরুরি পরামর্শ:</p>
              <p className="leading-relaxed text-slate-300">
                উইথড্র সমস্যা বা টাস্ক অনুমোদন নিয়ে জটিলতা থাকলে হোয়াটসঅ্যাপে আপনার <strong className="text-white">একাউন্ট নম্বর ও ট্রানজেকশন স্ক্রিনশট</strong> সহ মেসেজ দিন। এতে আমাদের প্রতিনিধিরা মুহূর্তেই আপনার বিষয়টি সমাধান করে দিতে পারবেন।
              </p>
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-md space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>সাধারণ প্রশ্নোত্তর (FAQ)</span>
            </h3>

            <div className="divide-y divide-slate-800">
              {faqs.map((item, idx) => {
                const isOpen = faqOpenIndex === idx;
                return (
                  <div key={idx} className="py-2.5">
                    <button
                      type="button"
                      onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-200 hover:text-amber-400 py-1 transition-colors cursor-pointer"
                    >
                      <span>{item.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="text-xs text-slate-400 leading-relaxed mt-1.5 pl-1 animate-in fade-in">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREATE SUPPORT TICKET FORM */}
      {activeTab === 'ticket' && (
        <form
          onSubmit={handleSubmitTicket}
          className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md space-y-4 animate-in fade-in duration-150"
        >
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>নতুন সাপোর্ট টিকিট তৈরি করুন</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              আপনার সমস্যার বিবরণ লিখে পাঠান, আমাদের সাপোর্ট টিম যাচাই করে উত্তর প্রদান করবে
            </p>
          </div>

          {/* Category selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              সমস্যার ধরন বা ক্যাটাগরি:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-800 text-xs sm:text-sm bg-slate-950 text-slate-200 outline-none focus:border-amber-500 font-medium"
            >
              <option value="withdrawal">উইথড্রয়াল বা টাকা উত্তোলনে সমস্যা</option>
              <option value="task">টাস্ক সাবমিশন ও রিওয়ার্ড সংক্রান্ত</option>
              <option value="deposit">ডিপোজিট বা ব্যালেন্স সংক্রান্ত</option>
              <option value="referral">রেফারেল বোনাস সমস্যা</option>
              <option value="account">একাউন্ট বা প্রোফাইল সমস্যা</option>
              <option value="other">অন্যান্য সাধারণ জিজ্ঞাসা</option>
            </select>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              বিষয়ের শিরোনাম (Subject):
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="যেমন: উইথড্র রিকোয়েস্ট ২৪ ঘণ্টা ধরে পেন্ডিং আছে..."
              className="w-full p-2.5 rounded-xl border border-slate-800 text-xs sm:text-sm bg-slate-950 text-white placeholder-slate-500 outline-none focus:border-amber-500"
            />
          </div>

          {/* Detailed Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              বিস্তারিত বিবরণ (Message):
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="সমস্যার পুরো বিবরণ লিখুন (যেমন: পেমেন্ট নম্বর, সময়, কোনো ভুল হলে বিস্তারিত)..."
              className="w-full p-3 rounded-xl border border-slate-800 text-xs sm:text-sm bg-slate-950 text-white placeholder-slate-500 outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          {/* Attachment Preview & Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              স্ক্রিনশট বা প্রুফ ছবি (ঐচ্ছিক):
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            {attachedImage ? (
              <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <img
                  src={attachedImage}
                  alt="Attachment Preview"
                  className="w-14 h-14 object-cover rounded-lg border border-slate-700 bg-black"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-bold text-emerald-400">✓ ছবি সংযুক্ত হয়েছে</p>
                  <p className="text-slate-400 text-[11px]">টিকিটের সাথে অ্যাডমিন এই ছবি দেখতে পাবে</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="p-1.5 text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                  title="ছবি বাদ দিন"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
              >
                <Paperclip className="w-4 h-4 text-slate-400" />
                <span>সমস্যার স্ক্রিনশট সংযুক্ত করুন (যদি থাকে)</span>
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="btn-submit-support-ticket"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'টিকিট জমা দেওয়া হচ্ছে...' : 'টিকিট সাবমিট করুন'}</span>
          </button>
        </form>
      )}

      {/* TAB 3: MY SUBMITTED TICKETS */}
      {activeTab === 'my-tickets' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200">
              আপনার প্রেরিত সাপোর্ট টিকিটসমূহ ({tickets.length})
            </h2>
            <button
              type="button"
              onClick={loadTickets}
              className="text-xs text-amber-400 hover:underline font-bold cursor-pointer"
            >
              রিফ্রেশ করুন
            </button>
          </div>

          {loadingTickets ? (
            <div className="bg-slate-900 rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-800">
              টিকিটসমূহ লোড হচ্ছে...
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-slate-900 rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-800 space-y-2 shadow-md">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-500" />
              <p className="font-bold text-white text-sm">কোনো টিকিট পাওয়া যায়নি</p>
              <p className="text-slate-400">
                আপনার কোনো সমস্যা থাকলে "টিকিট পাঠান" ট্যাবে গিয়ে সহজেই সাপোর্ট টিকিট তৈরি করতে পারেন।
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('ticket')}
                className="mt-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs cursor-pointer shadow-md"
              >
                নতুন টিকিট তৈরি করুন
              </button>
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base">{t.subject}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-mono text-slate-400">ID: {t.id.slice(0, 8)}</span>
                      <span>•</span>
                      <span>{new Date(t.createdAt).toLocaleString('bn-BD')}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 border ${
                      t.status === 'answered'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : t.status === 'closed'
                        ? 'bg-slate-950 text-slate-400 border-slate-800'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {t.status === 'answered'
                      ? '✓ উত্তর দেওয়া হয়েছে'
                      : t.status === 'closed'
                      ? '🔒 সম্পন্ন'
                      : '⏳ উত্তরের অপেক্ষায়'}
                  </span>
                </div>

                {/* User message */}
                <div className="bg-slate-950 p-3 rounded-xl text-xs text-slate-300 leading-relaxed border border-slate-800">
                  <p className="font-bold text-amber-400 mb-1 text-[11px]">আপনার প্রশ্ন / মেসেজ:</p>
                  <p className="whitespace-pre-wrap">{t.message}</p>
                </div>

                {/* Admin Reply Box (If answered) */}
                {t.adminReply ? (
                  <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>অ্যাডমিন সাপোর্ট উত্তর:</span>
                      </span>
                      {t.repliedAt && (
                        <span className="text-[10px] text-emerald-400/80">
                          {new Date(t.repliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-200 font-medium leading-relaxed whitespace-pre-wrap pl-1">
                      {t.adminReply}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>আমাদের সাপোর্ট টিম টিকিটটি পর্যালোচনা করছে। শীঘ্রই এখানে উত্তর প্রদান করা হবে।</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Screenshot Modal preview if clicked */}
      {selectedScreenshotUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedScreenshotUrl(null)}
        >
          <div className="relative max-w-xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2">
            <button
              type="button"
              onClick={() => setSelectedScreenshotUrl(null)}
              className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedScreenshotUrl}
              alt="Screenshot Preview"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
