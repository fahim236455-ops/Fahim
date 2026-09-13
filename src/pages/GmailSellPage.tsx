import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  Lock,
  Copy,
  Check,
  Play,
  Clock,
  AlertCircle,
  History,
  CheckCircle2,
  XCircle,
  Megaphone,
  Sparkles,
  Info,
  X,
  ExternalLink,
  SkipForward,
  RotateCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface GmailSellPageProps {
  onNavigate: (route: string) => void;
}

interface SocialSubmission {
  id: string;
  accountIdentifier: string;
  password: string;
  rate: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

interface ActiveTaskInfo {
  taskId: string;
  taskNumber: number;
  service: 'gmail' | 'facebook' | 'instagram';
  title: string;
  instruction: string;
  suggestedUsername: string;
  todayPassword: string;
  recoveryEmail?: string;
  rate: number;
  todaySubmissions: number;
  dailyLimit: number;
  remainingToday: number;
  active: boolean;
  reportTime: string;
  tutorialUrl?: string;
}

export const GmailSellPage: React.FC<GmailSellPageProps> = ({ onNavigate }) => {
  const { user, showToast } = useApp();

  const [gmailAddress, setGmailAddress] = useState('');
  const [password, setPassword] = useState('sgwteam1@21A');
  const [submitting, setSubmitting] = useState(false);
  const [fetchingTask, setFetchingTask] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  // Active Task Queue State
  const [activeTask, setActiveTask] = useState<ActiveTaskInfo | null>(null);
  const [skipCount, setSkipCount] = useState(0);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);

  // History list & live stats
  const [historyList, setHistoryList] = useState<SocialSubmission[]>([]);
  const [todaySubmissions, setTodaySubmissions] = useState(0);

  const [RATE, setRATE] = useState(14.0);
  const [LIMIT, setLIMIT] = useState(1000);
  const [USERNAME_PREFIX, setUSERNAME_PREFIX] = useState('earnora');
  const [TODAY_PASSWORD, setTODAY_PASSWORD] = useState('sgwteam1@21A');
  const [REPORT_TIME, setREPORT_TIME] = useState('15-30 hours');
  const [isServiceActive, setIsServiceActive] = useState(true);

  useEffect(() => {
    fetchHistory();
    fetchActiveTask();
  }, []);

  const fetchActiveTask = async () => {
    setFetchingTask(true);
    try {
      const token = localStorage.getItem('fpb_token') || sessionStorage.getItem('fpb_token');
      const res = await fetch(`/api/social-sell/active-task?service=gmail&skipCount=${skipCount}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data: ActiveTaskInfo = await res.json();
        setActiveTask(data);
        if (data.rate !== undefined) setRATE(Number(data.rate));
        if (data.dailyLimit !== undefined) setLIMIT(Number(data.dailyLimit));
        if (data.suggestedUsername) setUSERNAME_PREFIX(data.suggestedUsername);
        if (data.todayPassword) {
          setTODAY_PASSWORD(data.todayPassword);
          setPassword(data.todayPassword);
        }
        if (data.reportTime) setREPORT_TIME(data.reportTime);
        if (data.active !== undefined) setIsServiceActive(Boolean(data.active));
        if (data.todaySubmissions !== undefined) setTodaySubmissions(Number(data.todaySubmissions));
      }
    } catch {
      // Ignored
    } finally {
      setFetchingTask(false);
    }
  };

  const handleSkipTask = async () => {
    setFetchingTask(true);
    try {
      const token = localStorage.getItem('fpb_token') || sessionStorage.getItem('fpb_token');
      const currentTaskId = activeTask?.taskId || '';
      const nextSkipCount = skipCount + 1;
      const updatedSkipped = currentTaskId ? [...skippedIds, currentTaskId] : skippedIds;
      setSkipCount(nextSkipCount);
      setSkippedIds(updatedSkipped);

      const res = await fetch('/api/social-sell/skip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          service: 'gmail',
          skipTaskId: currentTaskId,
          skipTaskIds: updatedSkipped,
          skipCount: nextSkipCount,
        }),
      });

      if (res.ok) {
        const data: ActiveTaskInfo = await res.json();
        setActiveTask(data);
        if (data.suggestedUsername) {
          setUSERNAME_PREFIX(data.suggestedUsername);
        }
        if (data.todayPassword) {
          setTODAY_PASSWORD(data.todayPassword);
          setPassword(data.todayPassword);
        }
        setGmailAddress('');
        showToast(`কাজ #${activeTask?.taskNumber || ''} স্কিপ করা হয়েছে। নতুন কাজ লোড হয়েছে!`, 'info');
      } else {
        // Fallback next-task
        const fallbackRes = await fetch(`/api/social-sell/next-task?service=gmail&skipTaskId=${currentTaskId}&skipCount=${nextSkipCount}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setActiveTask(fallbackData);
          if (fallbackData.suggestedUsername) setUSERNAME_PREFIX(fallbackData.suggestedUsername);
          setGmailAddress('');
          showToast('নতুন কাজ লোড হয়েছে!', 'info');
        }
      }
    } catch {
      showToast('টাস্ক স্কিপ করতে সমস্যা হয়েছে', 'error');
    } finally {
      setFetchingTask(false);
    }
  };

  const fetchNextTask = handleSkipTask;

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('fpb_token') || sessionStorage.getItem('fpb_token');
      if (!token) {
        const local = localStorage.getItem('fpb_social_sales_gmail');
        if (local) {
          const parsed = JSON.parse(local);
          setHistoryList(parsed);
          setTodaySubmissions(parsed.length);
        }
        return;
      }

      const res = await fetch('/api/social-sell/history?service=gmail', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
        setTodaySubmissions(data.length);
      }
    } catch {
      const local = localStorage.getItem('fpb_social_sales_gmail');
      if (local) {
        const parsed = JSON.parse(local);
        setHistoryList(parsed);
        setTodaySubmissions(parsed.length);
      }
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast(`"${text}" কপি করা হয়েছে!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApplySuggestedUsername = () => {
    if (activeTask?.suggestedUsername) {
      setGmailAddress(activeTask.suggestedUsername);
      showToast('পরামর্শিত ইউজারনেম ইনপুটে বসানো হয়েছে', 'info');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gmailAddress.trim()) {
      showToast('অনুগ্রহ করে সঠিক Gmail এড্রেস প্রদান করুন', 'error');
      return;
    }

    if (!gmailAddress.toLowerCase().endsWith('@gmail.com')) {
      showToast('ইমেইল অবশ্যই @gmail.com হতে হবে', 'error');
      return;
    }

    if (!password.trim()) {
      showToast('অনুগ্রহ করে পাসওয়ার্ড প্রদান করুন', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('fpb_token') || sessionStorage.getItem('fpb_token');
      const payload = {
        service: 'gmail',
        accountIdentifier: gmailAddress.trim(),
        password: password.trim(),
        taskId: activeTask?.taskId,
        taskNumber: activeTask?.taskNumber,
      };

      if (token) {
        const res = await fetch('/api/social-sell/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'সাবমিট ব্যর্থ হয়েছে');
        }
        showToast(data.message || 'Gmail সফলভাবে জমা হয়েছে! নতুন কাজ লোড হয়েছে।', 'success');

        // Auto Advance to Next Task seamlessly
        if (data.nextTask) {
          setActiveTask(data.nextTask);
          if (data.nextTask.suggestedUsername) {
            setUSERNAME_PREFIX(data.nextTask.suggestedUsername);
          }
          if (data.nextTask.todayPassword) {
            setTODAY_PASSWORD(data.nextTask.todayPassword);
            setPassword(data.nextTask.todayPassword);
          }
        } else {
          fetchActiveTask();
        }
      } else {
        // Local state fallback
        const newSub: SocialSubmission = {
          id: 'sub_' + Date.now(),
          accountIdentifier: gmailAddress.trim(),
          password: password.trim(),
          rate: RATE,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        const updated = [newSub, ...historyList];
        setHistoryList(updated);
        localStorage.setItem('fpb_social_sales_gmail', JSON.stringify(updated));
        showToast('Gmail সফলভাবে জমা হয়েছে! পরবর্তী কাজ লোড করা হচ্ছে।', 'success');
        fetchActiveTask();
      }

      setGmailAddress('');
      fetchHistory();
    } catch (err: any) {
      showToast(err.message || 'সাবমিশন ব্যর্থ হয়েছে', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pb-24 pt-2 px-3 space-y-3 font-['Hind_Siliguri',sans-serif]">
      {/* Top App Header with back button */}
      <div className="flex items-center justify-between py-1 px-1">
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
          <Mail className="w-4 h-4 text-red-600" />
          Gmail Sell
        </h1>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
          title="ইতিহাস"
        >
          <History className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* 1. Red Announcement Ticker */}
      <div className="bg-[#dc2626] text-white rounded-xl px-3 py-2 flex items-center gap-2 shadow-xs text-xs">
        <Megaphone className="w-4 h-4 shrink-0 text-white animate-bounce" />
        <p className="font-medium text-[11px] leading-tight">
          আপনার জিমেইলটি কালেক্ট হওয়ার ১৫-৩০ ঘণ্টার মধ্যে টাকা যোগ হবে আপনার একাউন্টে
        </p>
      </div>

      {/* 2. Tutorial Button Pill */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowTutorialModal(true)}
          className="bg-white border border-slate-200 hover:border-red-300 shadow-xs px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold text-slate-800 hover:bg-red-50/50 transition-all group"
        >
          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <Mail className="w-3 h-3" />
          </div>
          <span>জিমেইল সেল টিউটোরিয়াল</span>
          <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
          </div>
        </button>
      </div>

      {/* 3. Gmail Sell Main Red Header Card */}
      <div className="bg-[#dc2626] rounded-2xl p-4 text-white shadow-md text-center space-y-3">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-0.5 rounded-full text-[11px] font-bold text-white mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>অ্যাসাইন করা কাজ #{activeTask?.taskNumber || 1} / {LIMIT}</span>
          </div>
          <h2 className="text-xl font-black flex items-center justify-center gap-1.5 tracking-tight">
            <Mail className="w-6 h-6 text-white" />
            Gmail Work & Sell
          </h2>
          <p className="text-xs text-red-100">প্রতিটি অ্যাকাউন্ট সাবমিট করার পর স্বয়ংক্রিয়ভাবে নতুন কাজ আসবে</p>
        </div>

        {/* 3 Columns Metrics */}
        <div className="grid grid-cols-3 divide-x divide-red-400/40 bg-black/10 rounded-xl py-2.5 px-1 border border-white/10">
          <div className="text-center px-1">
            <div className="text-[11px] text-red-100 uppercase font-medium">প্রতি একাউন্ট</div>
            <div className="text-base font-extrabold text-white mt-0.5">৳{RATE.toFixed(2)}</div>
          </div>
          <div className="text-center px-1">
            <div className="text-[11px] text-red-100 uppercase font-medium">আজকের লিমিট</div>
            <div className="text-base font-extrabold text-white mt-0.5">{LIMIT} টি</div>
          </div>
          <div className="text-center px-1">
            <div className="text-[11px] text-red-100 uppercase font-medium">সম্পন্ন কাজ</div>
            <div className="text-base font-extrabold text-white mt-0.5">{todaySubmissions} টি</div>
          </div>
        </div>

        {/* Daily Progress Bar */}
        <div className="space-y-1 text-left bg-black/15 p-2 rounded-xl border border-white/10">
          <div className="flex items-center justify-between text-[10px] text-red-100 font-bold">
            <span>দৈনিক টার্গেট অগ্রগতি:</span>
            <span>{todaySubmissions} / {LIMIT} ({Math.round((todaySubmissions / LIMIT) * 100)}%)</span>
          </div>
          <div className="w-full bg-red-950/50 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(2, (todaySubmissions / LIMIT) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3.1 Dynamic Assigned Task Card */}
      {activeTask && (
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                #{activeTask.taskNumber}
              </div>
              <span className="text-xs font-bold text-slate-800">{activeTask.title || `জিমেইল কাজ #${activeTask.taskNumber}`}</span>
            </div>
            <button
              type="button"
              disabled={fetchingTask}
              onClick={handleSkipTask}
              className="text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded-xl border border-amber-400 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs active:scale-95"
              title="কাজটি স্কিপ করে নতুন কাজ লোড করুন"
            >
              <SkipForward className={`w-3.5 h-3.5 ${fetchingTask ? 'animate-spin' : ''}`} />
              <span>{fetchingTask ? 'লোড হচ্ছে...' : 'কাজটি স্কিপ করুন'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-xl border border-amber-200/60 leading-relaxed">
            {activeTask.instruction || 'নির্দেশিত ইউজারনেম ফরম্যাট ব্যবহার করে গুগল অ্যাকাউন্ট খুলুন। পাসওয়ার্ড দিয়ে কোনো রিকভারি যোগ না করে সাবমিট করুন।'}
          </p>

          <div className="flex items-center justify-between bg-white/90 p-2 rounded-xl border border-amber-200 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-semibold block">পরামর্শিত ইউজারনেম:</span>
              <span className="font-mono font-bold text-red-600 text-xs truncate max-w-[200px] block">
                {activeTask.suggestedUsername || USERNAME_PREFIX}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleCopy(activeTask.suggestedUsername || USERNAME_PREFIX, 'suggested')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-0.5 transition-colors"
              >
                <Copy className="w-2.5 h-2.5" /> কপি
              </button>
              <button
                type="button"
                onClick={handleApplySuggestedUsername}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold transition-colors"
              >
                ফর্মে বসান
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Credentials Copy Box (Username & Password) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs grid grid-cols-2 gap-3 divide-x divide-slate-100">
        {/* Username */}
        <div className="pr-1.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Username Prefix</span>
            <button
              onClick={() => handleCopy(USERNAME_PREFIX, 'username')}
              className="bg-red-50 text-red-600 hover:bg-red-100 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors"
            >
              {copiedField === 'username' ? (
                <>
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-2.5 h-2.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="text-sm font-bold text-red-600 bg-red-50/50 rounded-lg px-2.5 py-1 font-mono truncate">
            {USERNAME_PREFIX}
          </div>
        </div>

        {/* Password */}
        <div className="pl-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Password</span>
            <button
              onClick={() => handleCopy(TODAY_PASSWORD, 'password')}
              className="bg-red-50 text-red-600 hover:bg-red-100 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors"
            >
              {copiedField === 'password' ? (
                <>
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-2.5 h-2.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="text-sm font-bold text-red-600 bg-red-50/50 rounded-lg px-2 py-1 font-mono truncate">
            {TODAY_PASSWORD}
          </div>
        </div>
      </div>

      {/* 5. Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3.5">
        {/* Gmail Address */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              তৈরিকৃত Gmail Address
            </label>
            <span className="text-[10px] text-slate-400">অবশ্যই @gmail.com সহ</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={gmailAddress}
              onChange={(e) => setGmailAddress(e.target.value)}
              placeholder="example@gmail.com"
              required
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs font-medium text-slate-800 placeholder-slate-400 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Account Password */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            Account Password (নির্দিষ্ট পাসওয়ার্ড)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter given password"
              required
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs font-medium text-slate-800 placeholder-slate-400 bg-slate-50/50 font-mono"
            />
          </div>
        </div>

        {/* Report Time Pill */}
        <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="font-semibold text-[11px]">রিপোর্ট টাইম: {REPORT_TIME}</span>
          </div>
          <span className="text-[10px] bg-red-100/80 px-2 py-0.5 rounded-md font-bold">অটো-নেক্সট সক্রিয়</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#dc2626] hover:bg-red-700 active:scale-98 text-white font-bold py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Mail className="w-4 h-4" />
              কাজ #{activeTask?.taskNumber || todaySubmissions + 1} জমা দিন ও নতুন কাজ পান
            </>
          )}
        </button>

        {/* Sell History Button */}
        <button
          type="button"
          onClick={() => setShowHistoryModal(true)}
          className="w-full bg-slate-50 hover:bg-slate-100 active:scale-98 text-slate-700 border border-slate-200 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-slate-500" />
          Gmail Sell History ({historyList.length} টি)
        </button>
      </form>

      {/* 6. Guidelines & Rules Card */}
      <div className="bg-[#fefce8] border border-dashed border-amber-300 rounded-2xl p-3.5 text-xs text-amber-900 space-y-2">
        <div className="font-bold flex items-center gap-1.5 text-amber-950 text-[13px]">
          <Sparkles className="w-4 h-4 text-amber-600" />
          জিমেইল খোলার সঠিক নিয়ম:
        </div>
        <ul className="space-y-1.5 text-[11px] text-amber-900/90 leading-relaxed list-disc list-inside">
          <li>
            জিমেইল খোলার সময় নামের ভেতর অবশ্যই <strong className="text-red-700 font-bold font-mono">sgw</strong> ইউজারনেমটি থাকতে হবে (যেমন: testsgw12@gmail.com)।
          </li>
          <li>
            উপরে দেওয়া আজকের নির্দিষ্ট পাসওয়ার্ডটি (<strong className="text-red-700 font-bold font-mono">sgwteam1@21A</strong>) ব্যবহার করে জিমেইল তৈরি করতে হবে।
          </li>
          <li>ভুল পাসওয়ার্ড বা ইউজারনেম ছাড়া সাবমিট করলে জিমেইল গ্রহণ করা হবে না।</li>
          <li>ভেরিফিকেশন সম্পন্ন হলে আপনার অ্যাকাউন্টে সরাসরি ৳{RATE.toFixed(2)} যুক্ত হবে।</li>
        </ul>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 space-y-3 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Gmail Sell History</h3>
                  <p className="text-[10px] text-slate-500">আপনার সাবমিট করা জিমেইল তালিকা</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {historyList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 space-y-1">
                  <Mail className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">এখনও কোনো জিমেইল সাবমিট করেননি</p>
                </div>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 truncate max-w-[180px]">
                        {item.accountIdentifier}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : item.status === 'rejected'
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}
                      >
                        {item.status === 'approved'
                          ? '✓ অনুমোদিত'
                          : item.status === 'rejected'
                          ? '✕ বাতিল'
                          : '⏳ পেন্ডিং'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>রিওয়ার্ড: ৳{item.rate.toFixed(2)}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString('bn-BD')}</span>
                    </div>
                    {item.rejectionReason && (
                      <p className="text-[10px] text-rose-600 bg-rose-50 p-1.5 rounded-md mt-1">
                        কারণ: {item.rejectionReason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      {showTutorialModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Play className="w-4 h-4 text-red-600 fill-current" />
                জিমেইল সেল টিউটোরিয়াল
              </h3>
              <button
                onClick={() => setShowTutorialModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <div className="aspect-video bg-red-950 rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center">
                <Mail className="w-10 h-10 text-red-500 mb-1" />
                <p className="font-bold text-xs">ভিডিও টিউটোরিয়াল নির্দেশিকা</p>
                <span className="text-[10px] text-slate-300">কিভাবে জিমেইল খুলে সেল করবেন</span>
              </div>
              <div className="space-y-1 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-150">
                <p><strong>ধাপ ১:</strong> ফোনের ব্রাউজার বা জিমেইল অ্যাপ খুলুন।</p>
                <p><strong>ধাপ ২:</strong> ইউজারনেমের সাথে <strong>sgw</strong> যোগ করে নতুন জিমেইল খুলুন।</p>
                <p><strong>ধাপ ৩:</strong> পাসওয়ার্ডে <strong>sgwteam1@21A</strong> সেট করুন।</p>
                <p><strong>ধাপ ৪:</strong> জিমেইলটি এই পেইজের ফর্মে সাবমিট করে দিন।</p>
              </div>
            </div>

            <button
              onClick={() => setShowTutorialModal(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
