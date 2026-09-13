import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../lib/api';
import { Task } from '../types';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Youtube,
  Facebook,
  Globe,
  Smartphone,
  Mail,
  Instagram,
  X,
  CalendarCheck,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Camera,
  ArrowRight,
  List,
  Layers,
  RotateCcw,
  Award,
  SkipForward,
} from 'lucide-react';

interface TasksPageProps {
  onNavigate: (route: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onNavigate }) => {
  const { refreshUser, showToast } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dailyCheckinLoading, setDailyCheckinLoading] = useState<boolean>(false);
  
  // View mode: 'queue' (Auto-Next Mode) vs 'list' (All Tasks list)
  const [viewMode, setViewMode] = useState<'queue' | 'list'>('queue');
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(0);

  // Form states for the currently active queue task or modal
  const [proofInput, setProofInput] = useState<string>('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [submittingProof, setSubmittingProof] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queueFileInputRef = useRef<HTMLInputElement>(null);

  // Modal for list view
  const [activeTaskModal, setActiveTaskModal] = useState<Task | null>(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<Task[]>('/tasks');
      setTasks(data);
    } catch (err: any) {
      showToast(err.message || 'টাস্ক লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleDailyCheckin = async () => {
    try {
      setDailyCheckinLoading(true);
      const res = await fetchApi<{ message: string; balance: number }>('/tasks/daily-checkin', {
        method: 'POST',
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      showToast(res.message, 'success');
      await refreshUser();
      await loadTasks();
    } catch (err: any) {
      showToast(err.message || 'দৈনিক বোনাস সংগ্রহ ব্যর্থ হয়েছে', 'error');
    } finally {
      setDailyCheckinLoading(false);
    }
  };

  // Image Processing & Compression via Canvas
  const processImageFile = (file: File, isForQueue: boolean = true) => {
    if (!file.type.startsWith('image/')) {
      showToast('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WEBP) নির্বাচন করুন।', 'error');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      showToast('ছবির সাইজ ১২ মেগাবাইটের কম হতে হবে।', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const srcResult = event.target?.result as string;
      if (!srcResult) return;

      const img = document.createElement('img');
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.naturalWidth || img.width || 600;
          let height = img.naturalHeight || img.height || 600;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            setScreenshotPreview(dataUrl);
            setScreenshotFileName(file.name);
            showToast('স্ক্রিনশট সফলভাবে যুক্ত হয়েছে', 'info');
          } else {
            setScreenshotPreview(srcResult);
            setScreenshotFileName(file.name);
            showToast('স্ক্রিনশট সফলভাবে যুক্ত হয়েছে', 'info');
          }
        } catch {
          setScreenshotPreview(srcResult);
          setScreenshotFileName(file.name);
          showToast('স্ক্রিনশট সফলভাবে যুক্ত হয়েছে', 'info');
        }
      };
      img.onerror = () => {
        setScreenshotPreview(srcResult);
        setScreenshotFileName(file.name);
        showToast('স্ক্রিনশট সফলভাবে যুক্ত হয়েছে', 'info');
      };
      img.src = srcResult;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isForQueue: boolean = true) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0], isForQueue);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent, isForQueue: boolean = true) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0], isForQueue);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotPreview(null);
    setScreenshotFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (queueFileInputRef.current) queueFileInputRef.current.value = '';
  };

  const resetProofForm = () => {
    setProofInput('');
    setScreenshotPreview(null);
    setScreenshotFileName(null);
    setDragActive(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (queueFileInputRef.current) queueFileInputRef.current.value = '';
  };

  // Filter tasks
  const dailyTask = tasks.find((t) => t.category === 'daily_checkin');
  const manualTasks = tasks.filter((t) => t.category !== 'daily_checkin');

  // Active Queue: Tasks that the user hasn't completed or pending today
  const availableQueue = manualTasks.filter(
    (t) => !t.completedToday && t.submissionStatus !== 'pending' && t.submissionStatus !== 'approved'
  );

  const completedTodayTasks = manualTasks.filter(
    (t) => t.completedToday || t.submissionStatus === 'pending' || t.submissionStatus === 'approved'
  );

  // Current task in Auto-Queue
  const currentTask: Task | undefined = availableQueue[currentQueueIndex] || availableQueue[0];

  const handleSkipTaskInQueue = () => {
    if (availableQueue.length <= 1) {
      showToast('আর কোনো বিকল্প কাজ নেই', 'info');
      return;
    }
    const nextIdx = (currentQueueIndex + 1) % availableQueue.length;
    setCurrentQueueIndex(nextIdx);
    resetProofForm();
    showToast('পরবর্তী কাজ লোড করা হয়েছে', 'info');
  };

  // Submit proof handler (Auto advances to next task in queue)
  const handleSubmitTaskProof = async (taskToSubmit: Task) => {
    if (!taskToSubmit) return;
    if (!proofInput.trim() && !screenshotPreview) {
      showToast('অনুগ্রহ করে টাস্ক প্রুফ তথ্য অথবা স্ক্রিনশট আপলোড করুন।', 'error');
      return;
    }

    try {
      setSubmittingProof(true);
      const res = await fetchApi<{
        message: string;
        nextTask?: Task;
        remainingCount?: number;
      }>('/tasks/submit', {
        method: 'POST',
        body: JSON.stringify({
          taskId: taskToSubmit.id,
          proofData: proofInput.trim() || 'স্ক্রিনশট প্রমাণ দাখিল করা হয়েছে',
          screenshot: screenshotPreview || null,
        }),
      });

      // Celebration effect
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });

      if (res.nextTask) {
        showToast(`টাস্ক সাবমিট হয়েছে! পরবর্তী কাজ: "${res.nextTask.title}" লোড হয়েছে।`, 'success');
      } else {
        showToast(res.message || 'টাস্ক সফলভাবে জমা হয়েছে! পরবর্তী কাজ লোড করা হচ্ছে...', 'success');
      }

      // Reset form fields
      resetProofForm();
      setActiveTaskModal(null);

      // Auto Advance to Next Task:
      // Refresh user balance & reload fresh task list
      await refreshUser();
      const updatedData = await fetchApi<Task[]>('/tasks');
      setTasks(updatedData);

      // Cycle queue to 0 so the new upcoming task is presented directly
      setCurrentQueueIndex(0);
    } catch (err: any) {
      showToast(err.message || 'টাস্ক সাবমিশন ব্যর্থ হয়েছে', 'error');
    } finally {
      setSubmittingProof(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'telegram':
        return <Send className="w-4 h-4 text-sky-400" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 text-rose-500" />;
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-500" />;
      case 'gmail':
        return <Mail className="w-4 h-4 text-red-400" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-400" />;
      case 'app':
        return <Smartphone className="w-4 h-4 text-purple-400" />;
      default:
        return <Globe className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-24 font-['Hind_Siliguri',sans-serif] text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <span>টাস্ক সেন্টার (Task Center)</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">কাজ শেষ করুন ও স্বয়ংক্রিয়ভাবে পরবর্তী কাজ পান</p>
        </div>
        <button
          onClick={() => onNavigate('pending-status')}
          className="text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 font-bold px-2.5 py-1.5 rounded-lg border border-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>পেন্ডিং কাজ</span>
        </button>
      </div>

      {/* Daily Check-in Bonus Banner */}
      {dailyTask && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white p-4 shadow-xl border border-amber-500/30">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xs w-fit px-2 py-0.5 rounded-md text-[11px] font-bold border border-amber-400/20">
                <CalendarCheck className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-amber-200">দৈনিক উপহার</span>
              </div>
              <h3 className="text-base font-bold text-white">{dailyTask.title}</h3>
              <p className="text-xs text-amber-100/90">
                প্রতিদিন ১ বার ক্লিক করে সংগ্রহ করুন ৳{dailyTask.rewardAmount.toFixed(2)} টাকা
              </p>
            </div>
            <span className="text-2xl font-black text-amber-300 bg-black/30 border border-amber-400/30 px-2.5 py-1 rounded-xl">
              +৳{dailyTask.rewardAmount}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-amber-400/20 flex items-center justify-between">
            {dailyTask.completedToday ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200 bg-black/30 px-3 py-2 rounded-lg w-full justify-center border border-amber-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>আজকের দৈনিক বোনাস গ্রহণ করা হয়েছে</span>
              </div>
            ) : (
              <button
                onClick={handleDailyCheckin}
                disabled={dailyCheckinLoading}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-75 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{dailyCheckinLoading ? 'যাচাই করা হচ্ছে...' : 'আজকের বোনাস গ্রহণ করুন (৳৫.০০)'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
        <button
          onClick={() => {
            setViewMode('queue');
            resetProofForm();
          }}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'queue'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>অটো কিউ মোড ({availableQueue.length} টি বাকি)</span>
        </button>

        <button
          onClick={() => {
            setViewMode('list');
            resetProofForm();
          }}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'list'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <List className="w-4 h-4" />
          <span>সকল কাজের তালিকা ({manualTasks.length})</span>
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. AUTO TASK QUEUE VIEW (SUBMIT -> AUTO NEXT) */}
      {/* ========================================================= */}
      {!loading && viewMode === 'queue' && (
        <div className="space-y-4">
          {currentTask ? (
            <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-amber-500/30 shadow-xl space-y-4 relative overflow-hidden">
              {/* Queue Position Pill */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                    {getCategoryIcon(currentTask.category)}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      চলতি কাজ ({availableQueue.indexOf(currentTask) + 1} / {availableQueue.length})
                    </span>
                    <h2 className="text-sm font-bold text-white truncate max-w-[160px] sm:max-w-[220px]">
                      {currentTask.title}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSkipTaskInQueue}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-slate-800 hover:bg-slate-750 px-2.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                    title="কাজটি স্কিপ করে পরের কাজে যান"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>স্কিপ</span>
                  </button>
                  <span className="text-base font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl inline-block">
                    +৳{currentTask.rewardAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-500 h-1.5 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (completedTodayTasks.length / Math.max(1, manualTasks.length)) * 100
                      )
                    )}%`,
                  }}
                />
              </div>

              {/* Step 1: Open Target URL */}
              {currentTask.targetUrl && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    ধাপ ১: কাজের লিংকে যান ও কাজটি করুন
                  </span>
                  <a
                    href={currentTask.targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-between border border-slate-700 shadow-xs transition-colors group"
                  >
                    <span className="text-slate-200 group-hover:text-amber-300 truncate">
                      লিংক ওপেন করুন ({currentTask.targetUrl.slice(0, 35)}...)
                    </span>
                    <ExternalLink className="w-4 h-4 text-amber-400 shrink-0 ml-1.5" />
                  </a>
                </div>
              )}

              {/* Step 2: Task Instructions */}
              <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-400 block">
                  ধাপ ২: কাজের নিয়ম ও নির্দেশনা
                </span>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-normal">
                  {currentTask.description}
                </p>
                {currentTask.proofInstruction && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-xs text-amber-200 font-semibold mt-2">
                    📌 প্রুফ নির্দেশনা: {currentTask.proofInstruction}
                  </div>
                )}
              </div>

              {/* Step 3: Proof Submission (Screenshot + Text) */}
              <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-200 block">
                  ধাপ ৩: প্রুফ দাখিল করুন (Screenshot / Username)
                </span>

                {/* Screenshot Uploader */}
                {!screenshotPreview ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, true)}
                    onClick={() => queueFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-slate-800 hover:border-amber-500/50 bg-slate-950'
                    }`}
                  >
                    <input
                      type="file"
                      ref={queueFileInputRef}
                      onChange={(e) => handleFileChange(e, true)}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="w-8 h-8 mx-auto rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-1.5 border border-amber-500/20">
                      <Camera className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-200">
                      কাজের স্ক্রিনশট আপলোড করুন
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      ছবি ড্র্যাগ করুন অথবা ক্লিক করে ফাইল বা ক্যামেরা সিলেক্ট করুন
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                    <img
                      src={screenshotPreview}
                      alt="Proof"
                      className="w-full max-h-36 object-contain bg-slate-950"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/80 p-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate text-[11px] font-mono text-slate-300">
                          {screenshotFileName || 'screenshot.jpg'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveScreenshot}
                        className="p-1 rounded bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                        title="বাতিল করুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Text Proof */}
                <div>
                  <textarea
                    value={proofInput}
                    onChange={(e) => setProofInput(e.target.value)}
                    placeholder="প্রমাণ টেক্সট (ইউজারনেম, রেফারেন্স নম্বর বা লিংক লিখুন)..."
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Action Buttons: Submit & Skip */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={handleSkipTaskInQueue}
                  className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="এই কাজটি স্কিপ করে পরের কাজ দেখুন"
                >
                  <SkipForward className="w-4 h-4 text-amber-400" />
                  <span>কাজটি স্কিপ করুন</span>
                </button>

                <button
                  onClick={() => handleSubmitTaskProof(currentTask)}
                  disabled={submittingProof}
                  className="w-full flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-60 cursor-pointer"
                >
                  {submittingProof ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin text-slate-950" />
                      <span>সাবমিট হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-4 h-4 text-slate-950" />
                      <span>টাস্ক সাবমিট করুন ও পরবর্তী কাজ পান</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Empty Queue Celebration Banner */
            <div className="bg-slate-900 rounded-2xl p-6 text-center border border-emerald-500/30 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-lg">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">অভিনন্দন! আপনার সব কাজ সম্পন্ন হয়েছে</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                আজকের জন্য সব সক্রিয় কাজ আপনি সাবমিট করেছেন। এডমিন নতুন কাজ পোস্ট করলে তা সাথে সাথে এখানে চলে আসবে।
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={loadTasks}
                  className="bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>রিফ্রেশ করুন</span>
                </button>
                <button
                  onClick={() => onNavigate('pending-status')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  পেন্ডিং স্ট্যাটাস দেখুন
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ALL TASKS LIST VIEW */}
      {/* ========================================================= */}
      {!loading && viewMode === 'list' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200">উপলব্ধ সকল কাজ ({manualTasks.length})</h2>
            <span className="text-[11px] text-slate-400">যেকোনো কাজে ক্লিক করে শুরু করুন</span>
          </div>

          {manualTasks.length === 0 ? (
            <div className="bg-slate-900 rounded-xl p-8 text-center border border-slate-800 text-slate-400 text-sm">
              আপাতত কোনো নতুন টাস্ক নেই। শীঘ্রই এডমিন প্যানেল থেকে নতুন টাস্ক যোগ করা হবে।
            </div>
          ) : (
            <div className="space-y-2.5">
              {manualTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-md flex flex-col justify-between hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        {getCategoryIcon(task.category)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-snug">{task.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{task.description}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                        ৳{task.rewardAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>দৈনিক সীমা: {task.dailyLimit} বার</span>
                    </div>

                    {task.submissionStatus === 'pending' ? (
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>রিভিউতে আছে</span>
                      </span>
                    ) : task.completedToday ? (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>সম্পন্ন</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveTaskModal(task);
                          resetProofForm();
                        }}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-md transition-transform active:scale-95 cursor-pointer"
                      >
                        <span>কাজ শুরু করুন</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Proof Submission Modal for List View */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-800 animate-in fade-in zoom-in-95 text-slate-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  {getCategoryIcon(activeTaskModal.category)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{activeTaskModal.title}</h3>
                  <span className="text-xs font-bold text-amber-400">
                    পুরস্কার: ৳{activeTaskModal.rewardAmount.toFixed(2)} টাকা
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTaskModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-3 text-xs text-slate-300 space-y-1.5 border border-slate-800">
              <p className="font-bold text-amber-400">কাজের নিয়মাবলী:</p>
              <p className="text-slate-300">{activeTaskModal.description}</p>
              {activeTaskModal.proofInstruction && (
                <p className="text-amber-300 font-semibold bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 mt-2">
                  📌 প্রমাণ নির্দেশনা: {activeTaskModal.proofInstruction}
                </p>
              )}
            </div>

            {activeTaskModal.targetUrl && (
              <a
                href={activeTaskModal.targetUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-700 shadow-xs"
              >
                <span>লিংক ওপেন করে টাস্ক সম্পন্ন করুন</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </a>
            )}

            {/* Screenshot Upload Section */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>কাজের স্ক্রিনশট (Screenshot Proof):</span>
                </span>
                <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  প্রয়োজনীয়
                </span>
              </label>

              {!screenshotPreview ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-slate-800 hover:border-amber-500/60 bg-slate-950'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileChange(e, false)}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 border border-amber-500/20">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-200">
                    স্ক্রিনশট আপলোড করুন
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ছবি ড্র্যাগ করুন অথবা ফাইল সিলেক্ট করুন
                  </p>
                </div>
              ) : (
                <div className="relative rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                  <img
                    src={screenshotPreview}
                    alt="টাস্ক স্ক্রিনশট প্রুফ"
                    className="w-full max-h-36 object-contain mx-auto bg-slate-950"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/90 p-2 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate text-[11px] font-mono text-slate-300">
                        {screenshotFileName || 'screenshot.jpg'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="p-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                      title="ছবি বাতিল করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 block">
                আপনার কাজের তথ্য (ইউজারনেম / প্রমাণ বিবরণ):
              </label>
              <textarea
                value={proofInput}
                onChange={(e) => setProofInput(e.target.value)}
                placeholder="যেমন: টেলিগ্রাম ইউজারনেম @username অথবা চ্যানেলের নাম..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTaskModal(null)}
                className="flex-1 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl transition-colors border border-slate-700/60 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={() => handleSubmitTaskProof(activeTaskModal)}
                disabled={submittingProof}
                className="flex-1 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 py-2.5 rounded-xl shadow-md transition-transform active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {submittingProof ? 'জমা হচ্ছে...' : 'প্রুফ সাবমিট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
