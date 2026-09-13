import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ThumbsUp,
  Lock,
  Copy,
  Check,
  Play,
  Clock,
  History,
  Megaphone,
  Sparkles,
  X,
  Send,
  Smartphone,
  Key,
  ShieldCheck,
  FileCode2,
  ExternalLink,
  SkipForward,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getToken } from '../lib/api';

interface FacebookSellPageProps {
  onNavigate: (route: string) => void;
}

interface SocialSubmission {
  id: string;
  accountIdentifier: string;
  password: string;
  extraField?: string;
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
  rate: number;
  todaySubmissions: number;
  dailyLimit: number;
  remainingToday: number;
  active: boolean;
  reportTime: string;
  tutorialUrl?: string;
}

export const FacebookSellPage: React.FC<FacebookSellPageProps> = ({ onNavigate }) => {
  const { showToast } = useApp();

  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('earnora@12');
  const [cookies, setCookies] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fetchingTask, setFetchingTask] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  
  // Active Task state
  const [activeTask, setActiveTask] = useState<ActiveTaskInfo | null>(null);
  const [skipCount, setSkipCount] = useState(0);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [historyList, setHistoryList] = useState<SocialSubmission[]>([]);
  const [submissions24h, setSubmissions24h] = useState(0);

  const [RATE, setRATE] = useState(4.5);
  const [DAILY_LIMIT, setDAILY_LIMIT] = useState(1000);
  const [REPORT_TIME, setREPORT_TIME] = useState('15/40 hours');
  const [TODAY_PASSWORD, setTODAY_PASSWORD] = useState('earnora@12');
  const [isServiceActive, setIsServiceActive] = useState(true);

  useEffect(() => {
    fetchHistory();
    fetchActiveTask();
  }, []);

  const fetchActiveTask = async () => {
    setFetchingTask(true);
    try {
      const token = getToken() || localStorage.getItem('fahimpay_token') || localStorage.getItem('fpb_token') || sessionStorage.getItem('fpb_token');
      const res = await fetch(`/api/social-sell/active-task?service=facebook&skipCount=${skipCount}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data: ActiveTaskInfo = await res.json();
        setActiveTask(data);
        if (data.rate !== undefined) setRATE(Number(data.rate));
        if (data.dailyLimit !== undefined) setDAILY_LIMIT(Number(data.dailyLimit));
        if (data.todayPassword) {
          setTODAY_PASSWORD(data.todayPassword);
          setPassword(data.todayPassword);
        }
        if (data.reportTime) setREPORT_TIME(data.reportTime);
        if (data.active !== undefined) setIsServiceActive(Boolean(data.active));
        if (data.todaySubmissions !== undefined) setSubmissions24h(Number(data.todaySubmissions));
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
      const token = getToken() || localStorage.getItem('fahimpay_token') || localStorage.getItem('fpb_token') || sessionStorage.getItem('fpb_token');
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
          service: 'facebook',
          skipTaskId: currentTaskId,
          skipTaskIds: updatedSkipped,
          skipCount: nextSkipCount,
        }),
      });

      if (res.ok) {
        const data: ActiveTaskInfo = await res.json();
        setActiveTask(data);
        if (data.todayPassword) {
          setTODAY_PASSWORD(data.todayPassword);
          setPassword(data.todayPassword);
        }
        setUid('');
        setCookies('');
        showToast(`ফেসবুক কাজ #${data.taskNumber} স্কিপ করে নতুন কাজ লোড হয়েছে!`, 'info');
      } else {
        const fallbackRes = await fetch(`/api/social-sell/next-task?service=facebook&skipTaskId=${currentTaskId}&skipCount=${nextSkipCount}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setActiveTask(fallbackData);
          if (fallbackData.todayPassword) {
            setTODAY_PASSWORD(fallbackData.todayPassword);
            setPassword(fallbackData.todayPassword);
          }
          setUid('');
          setCookies('');
          showToast(`ফেসবুক কাজ #${fallbackData.taskNumber} লোড হয়েছে!`, 'info');
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
      const token = getToken() || localStorage.getItem('fahimpay_token') || localStorage.getItem('fpb_token') || sessionStorage.getItem('fpb_token');
      if (!token) {
        const local = localStorage.getItem('fpb_social_sales_facebook');
        if (local) {
          const parsed = JSON.parse(local);
          setHistoryList(parsed);
          setSubmissions24h(parsed.length);
        }
        return;
      }

      const res = await fetch('/api/social-sell/history?service=facebook', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
        setSubmissions24h(data.length);
      }
    } catch {
      const local = localStorage.getItem('fpb_social_sales_facebook');
      if (local) {
        const parsed = JSON.parse(local);
        setHistoryList(parsed);
        setSubmissions24h(parsed.length);
      }
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast(`"${text}" কপি করা হয়েছে!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uid.trim()) {
      showToast('অনুগ্রহ করে Facebook UID বা নাম্বার প্রদান করুন', 'error');
      return;
    }

    if (!password.trim()) {
      showToast('অনুগ্রহ করে পাসওয়ার্ড প্রদান করুন', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken() || localStorage.getItem('fahimpay_token') || localStorage.getItem('fpb_token') || sessionStorage.getItem('fpb_token');
      const payload = {
        service: 'facebook',
        accountIdentifier: uid.trim(),
        password: password.trim(),
        extraField: cookies.trim() || undefined,
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
        showToast(data.message || 'Facebook অ্যাকাউন্ট সফলভাবে জমা হয়েছে! নতুন কাজ লোড হয়েছে।', 'success');

        if (data.nextTask) {
          setActiveTask(data.nextTask);
          if (data.nextTask.todayPassword) {
            setTODAY_PASSWORD(data.nextTask.todayPassword);
            setPassword(data.nextTask.todayPassword);
          }
        } else {
          fetchActiveTask();
        }
      } else {
        const newSub: SocialSubmission = {
          id: 'fb_' + Date.now(),
          accountIdentifier: uid.trim(),
          password: password.trim(),
          extraField: cookies.trim() || undefined,
          rate: RATE,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        const updated = [newSub, ...historyList];
        setHistoryList(updated);
        localStorage.setItem('fpb_social_sales_facebook', JSON.stringify(updated));
        showToast('Facebook অ্যাকাউন্ট সফলভাবে জমা হয়েছে! পরবর্তী কাজ লোড করা হচ্ছে।', 'success');
        fetchActiveTask();
      }

      setUid('');
      setCookies('');
      fetchHistory();
    } catch (err: any) {
      showToast(err.message || 'সাবমিশন ব্যর্থ হয়েছে', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pb-24 pt-2 px-3 space-y-3 font-['Hind_Siliguri',sans-serif]">
      {/* Top Header with Back button */}
      <div className="flex items-center justify-between py-1 px-1">
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
          <ThumbsUp className="w-4 h-4 text-[#1877f2]" />
          Facebook Sell & Tasks
        </h1>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
          title="ইতিহাস"
        >
          <History className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* 1. Blue Announcement Bar */}
      <div className="bg-[#0070f3] text-white rounded-xl px-3 py-2 flex items-center gap-2 shadow-xs text-xs">
        <Megaphone className="w-4 h-4 shrink-0 text-white animate-bounce" />
        <p className="font-medium text-[11px] leading-tight">
          প্রতিটি ফেসবুক আইডি সাবমিট করার পর নতুন কাজ স্বয়ংক্রিয়ভাবে লোড হবে।
        </p>
      </div>

      {/* 2. Tutorial Button Pill */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            if (activeTask?.tutorialUrl) {
              window.open(activeTask.tutorialUrl, '_blank');
            } else {
              showToast('অ্যাডমিন এখনও কোনো টিউটোরিয়াল যুক্ত করেননি।', 'info');
            }
          }}
          className="bg-white border border-slate-200 hover:border-blue-300 shadow-xs px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold text-slate-800 hover:bg-blue-50/50 transition-all group"
        >
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[#1877f2]">
            <ThumbsUp className="w-3 h-3" />
          </div>
          <span>ফেসবুক সেল টিউটোরিয়াল!</span>
          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
          </div>
        </button>
      </div>

      {/* 3. Quick Action Links (Bot Link & Via APK) */}
      <div className="grid grid-cols-2 gap-2.5">
        <a
          href="https://t.me"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-slate-200 hover:border-cyan-300 rounded-full py-2 px-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-cyan-50/30 transition-all group"
        >
          <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </div>
          <span>Bot Link</span>
        </a>

        <a
          href="#download-apk"
          onClick={(e) => {
            e.preventDefault();
            showToast('APK ডাউনলোড লিঙ্ক প্রস্তুত হচ্ছে...', 'info');
          }}
          className="bg-white border border-slate-200 hover:border-cyan-300 rounded-full py-2 px-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-cyan-50/30 transition-all group"
        >
          <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <span>Via APK</span>
        </a>
      </div>

      {/* 4. Facebook Sell Header Blue Card */}
      <div className="bg-[#1877f2] rounded-2xl p-4 text-white shadow-md text-center space-y-3">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-0.5 rounded-full text-[11px] font-bold text-white mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>অ্যাসাইন করা কাজ #{activeTask?.taskNumber || 1} / {DAILY_LIMIT}</span>
          </div>
          <h2 className="text-xl font-black flex items-center justify-center gap-1.5 tracking-tight">
            <ThumbsUp className="w-6 h-6 text-white" />
            Facebook Work & Sell
          </h2>
          <p className="text-[11px] text-blue-100 max-w-xs mx-auto leading-snug">
            আপনার ফেসবুক অ্যাকাউন্ট জমা দিয়ে দ্রুত পেমেন্ট নিন (NUMBER / COOKIES ACCOUNT)
          </p>
        </div>

        {/* 3 Columns Metrics */}
        <div className="grid grid-cols-3 divide-x divide-blue-400/40 bg-black/10 rounded-xl py-2.5 px-1 border border-white/10">
          <div className="text-center px-1">
            <div className="text-[11px] text-blue-100 font-medium">প্রতি একাউন্ট</div>
            <div className="text-base font-extrabold text-white mt-0.5">৳{RATE.toFixed(2)}</div>
          </div>
          <div className="text-center px-1">
            <div className="text-[11px] text-blue-100 font-medium">দৈনিক লিমিট</div>
            <div className="text-base font-extrabold text-white mt-0.5">{DAILY_LIMIT} টি</div>
          </div>
          <div className="text-center px-1">
            <div className="text-[11px] text-blue-100 font-medium">আজকের জমা</div>
            <div className="text-base font-extrabold text-white mt-0.5">{submissions24h} টি</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 text-left bg-black/15 p-2 rounded-xl border border-white/10">
          <div className="flex items-center justify-between text-[10px] text-blue-100 font-bold">
            <span>আজকের অগ্রগতি:</span>
            <span>{submissions24h} / {DAILY_LIMIT} ({Math.round((submissions24h / DAILY_LIMIT) * 100)}%)</span>
          </div>
          <div className="w-full bg-blue-950/50 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(2, (submissions24h / DAILY_LIMIT) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4.1 Dynamic Active Task Card */}
      {activeTask && (
        <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-300/80 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                #{activeTask.taskNumber}
              </div>
              <span className="text-xs font-bold text-slate-800">{activeTask.title || `ফেসবুক কাজ #${activeTask.taskNumber}`}</span>
            </div>
            <button
              type="button"
              disabled={fetchingTask}
              onClick={handleSkipTask}
              className="text-xs font-bold text-blue-950 bg-blue-200/80 hover:bg-blue-300 px-3 py-1.5 rounded-xl border border-blue-400 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs active:scale-95"
              title="কাজটি স্কিপ করে নতুন কাজ লোড করুন"
            >
              <SkipForward className={`w-3.5 h-3.5 ${fetchingTask ? 'animate-spin' : ''}`} />
              <span>{fetchingTask ? 'লোড হচ্ছে...' : 'কাজটি স্কিপ করুন'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-xl border border-blue-200/60 leading-relaxed">
            {activeTask.instruction || 'সক্রিয় ফেসবুক আইডি সাবমিট করুন। কুকিজ ও নির্দেশিত পাসওয়ার্ড সেট করে প্রদান করুন।'}
          </p>
        </div>
      )}

      {/* 6. Today's Password Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Key className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-left">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Today's Password:</div>
            <div className="text-xs font-bold text-slate-800 font-mono">{TODAY_PASSWORD}</div>
          </div>
        </div>
        <button
          onClick={() => handleCopy(TODAY_PASSWORD, 'fb-pass')}
          className="bg-blue-50 hover:bg-blue-100 text-[#1877f2] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          {copiedField === 'fb-pass' ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-700">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* 7. Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        {/* Facebook UID */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Facebook UID / মোবাইল নম্বর</label>
          <div className="relative">
            <input
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="Enter UID or Number"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-medium text-slate-800 placeholder-slate-400 bg-slate-50/50 font-mono"
            />
          </div>
        </div>

        {/* Account Password */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Account Password (নির্ধারিত পাসওয়ার্ড)</label>
          <div className="relative">
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-medium text-slate-800 placeholder-slate-400 bg-slate-50/50 font-mono"
            />
          </div>
        </div>

        {/* COOKIES */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">COOKIES (ঐচ্ছিক / দ্রুত অনুমোদন)</label>
            <span className="text-[10px] text-slate-400">Optional</span>
          </div>
          <div className="relative">
            <textarea
              rows={2}
              value={cookies}
              onChange={(e) => setCookies(e.target.value)}
              placeholder="c_user=...; xs=...;"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-medium text-slate-800 placeholder-slate-400 bg-slate-50/50 font-mono resize-none text-[11px]"
            />
          </div>
        </div>

        {/* Report Time */}
        <div className="bg-blue-50 text-blue-700 border border-blue-100 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-semibold text-[11px]">রিপোর্ট টাইম: {REPORT_TIME}</span>
          </div>
          <span className="text-[10px] bg-blue-100/80 px-2 py-0.5 rounded-md font-bold">অটো-নেক্সট কাজ</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#1877f2] hover:bg-blue-600 active:scale-98 text-white font-bold py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ThumbsUp className="w-4 h-4" />
              কাজ #{activeTask?.taskNumber || submissions24h + 1} জমা দিন ও নতুন কাজ পান
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
          Facebook Sell History ({historyList.length} টি)
        </button>
      </form>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 space-y-3 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Facebook Sell History</h3>
                  <p className="text-[10px] text-slate-500">আপনার সাবমিট করা ফেসবুক অ্যাকাউন্ট</p>
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
                  <ThumbsUp className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">এখনও কোনো ফেসবুক অ্যাকাউন্ট সাবমিট করেননি</p>
                </div>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 truncate max-w-[180px]">
                        UID: {item.accountIdentifier}
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
                <Play className="w-4 h-4 text-emerald-600 fill-current" />
                ফেসবুক সেল টিউটোরিয়াল
              </h3>
              <button
                onClick={() => setShowTutorialModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <div className="aspect-video bg-blue-950 rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center">
                <ThumbsUp className="w-10 h-10 text-blue-400 mb-1" />
                <p className="font-bold text-xs">ভিডিও টিউটোরিয়াল নির্দেশিকা</p>
                <span className="text-[10px] text-slate-300">Facebook ক্লোন ও কুকিজ অ্যাকাউন্ট সাবমিট করার নিয়ম</span>
              </div>
              <div className="space-y-1 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-150">
                <p><strong>ধাপ ১:</strong> দেওয়া পাসওয়ার্ড (<code className="text-blue-600 font-bold">{TODAY_PASSWORD}</code>) ব্যবহার করে নতুন নাম্বার অ্যাকাউন্ট তৈরি করুন।</p>
                <p><strong>ধাপ ২:</strong> অ্যাকাউন্টের UID কপি করুন।</p>
                <p><strong>ধাপ ৩:</strong> ব্রাউজার থেকে কুকিজ এক্সপোর্ট করে কুকিজ বক্সে পেস্ট করুন।</p>
                <p><strong>ধাপ ৪:</strong> সাবমিট করে ১৫-৪০ ঘণ্টার ভেতর ব্যালেন্সে ৳{RATE.toFixed(2)} বুঝে নিন।</p>
              </div>
            </div>

            <button
              onClick={() => setShowTutorialModal(false)}
              className="w-full bg-[#1877f2] hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
