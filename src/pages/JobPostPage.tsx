import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../lib/api';
import confetti from 'canvas-confetti';
import {
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Send,
  Plus,
  Trash2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Pause,
  Play,
  RotateCw,
  Wallet,
  ChevronDown,
  Upload,
  Sparkles,
} from 'lucide-react';

interface JobPostPageProps {
  onNavigate: (route: string) => void;
}

interface ProofRequirement {
  id: string;
  title: string;
  type: 'text' | 'screenshot';
}

interface UserPostedJob {
  id: string;
  mainCategory: string;
  subCategory: string;
  title: string;
  instructions: string;
  thumbnailUrl?: string;
  proofRequirements: ProofRequirement[];
  workersNeeded: number;
  workersCompleted: number;
  costPerWorker: number;
  netAmount: number;
  systemFee: number;
  totalPayable: number;
  status: 'active' | 'pending' | 'completed' | 'paused' | 'rejected';
  createdAt: string;
}

const CATEGORIES_DATA: Record<string, { label: string; subCategories: string[] }> = {
  YouTube: {
    label: 'YouTube (ইউটিউব)',
    subCategories: [
      'Subscribe & Like',
      'Watch Full Video (3-5 Min)',
      'Like & Comment',
      'Share Video to Social Media',
      'Channel Follow & Bell Icon',
      'YouTube Shorts Watch & Like',
    ],
  },
  Facebook: {
    label: 'Facebook (ফেসবুক)',
    subCategories: [
      'Page Like & Follow',
      'Post Share in 3-5 Groups',
      'Post Comment & React (Love/Care)',
      'Group Join & Invite Friends',
      'Facebook Video Watch',
      'Profile Follow',
    ],
  },
  Instagram: {
    label: 'Instagram (ইনস্টাগ্রাম)',
    subCategories: [
      'Follow Profile / Account',
      'Like & Comment on Recent Post',
      'Story View & React',
      'Reel Video Watch & Share',
    ],
  },
  Telegram: {
    label: 'Telegram (টেলিগ্রাম)',
    subCategories: [
      'Join Telegram Channel',
      'Join Telegram Discussion Group',
      'Start Telegram Bot & Forward',
      'Telegram Reaction & Comment',
    ],
  },
  TikTok: {
    label: 'TikTok (টিকটক)',
    subCategories: [
      'Follow TikTok Account',
      'Like & Comment on 3 Videos',
      'Share Video & Copy Link',
    ],
  },
  'Website Visit': {
    label: 'Website Visit & Search (ওয়েবসাইট ভিজিট)',
    subCategories: [
      'Search on Google & Click Website',
      'Visit 3 Pages & Stay 1 Minute',
      'Browse Blog Post & Click Ad',
      'Sign Up & Email Verification',
    ],
  },
  'App Download': {
    label: 'Mobile App Download & Review (অ্যাপ ইন্সটল)',
    subCategories: [
      'Install App & Open (1 Min)',
      'Install & 5-Star Rating with Positive Review',
      'Register Account on App',
    ],
  },
  'Twitter / X': {
    label: 'Twitter / X (টুইটার)',
    subCategories: [
      'Follow Account',
      'Retweet & Like Post',
      'Quote Tweet with Comment',
    ],
  },
  'Sign Up & KYC': {
    label: 'Sign Up / Account Creation (একাউন্ট তৈরি)',
    subCategories: [
      'Sign Up with Referral Code',
      'Account Registration & Email Verify',
      'Basic KYC / Form Fillup',
    ],
  },
  'Other / Custom': {
    label: 'Other Custom Task (অন্যান্য কাজ)',
    subCategories: [
      'Custom Task Instructions',
      'Survey / Google Form Fillup',
      'Review & Feedback',
    ],
  },
};

export const JobPostPage: React.FC<JobPostPageProps> = ({ onNavigate }) => {
  const { user, refreshUser, showToast } = useApp();

  // View state: 'create' | 'manage'
  const [activeView, setActiveView] = useState<'create' | 'manage'>('create');

  // Step state in wizard: 1 | 2 | 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Category State
  const [mainCategory, setMainCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');

  // Step 2: Details State
  const [jobTitle, setJobTitle] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [proofRequirements, setProofRequirements] = useState<ProofRequirement[]>([
    { id: '1', title: '', type: 'text' },
  ]);

  // Step 3: Budget State
  const [workersNeeded, setWorkersNeeded] = useState<number | string>(10);
  const [costPerWorker, setCostPerWorker] = useState<number | string>('');

  // Previous jobs state
  const [myJobs, setMyJobs] = useState<UserPostedJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successJob, setSuccessJob] = useState<UserPostedJob | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Financial calculations
  const numWorkers = typeof workersNeeded === 'number' ? workersNeeded : parseInt(workersNeeded, 10) || 0;
  const unitCost = typeof costPerWorker === 'number' ? costPerWorker : parseFloat(costPerWorker) || 0;
  const netAmount = Number((numWorkers * unitCost).toFixed(2));
  const systemFee = Number((netAmount * 0.10).toFixed(2)); // 10.00% system fee
  const totalPayable = Number((netAmount + systemFee).toFixed(2));

  // Load previous jobs when switching to manage view
  useEffect(() => {
    if (activeView === 'manage') {
      loadMyJobs();
    }
  }, [activeView]);

  const loadMyJobs = async () => {
    try {
      setLoadingJobs(true);
      const data = await fetchApi<UserPostedJob[]>('/user-jobs');
      setMyJobs(data || []);
    } catch (err: any) {
      showToast(err.message || 'পূর্ববর্তী জব লোড করতে ব্যর্থ হয়েছে', 'error');
    } finally {
      setLoadingJobs(false);
    }
  };

  // Proof requirement handlers
  const handleAddProof = () => {
    setProofRequirements((prev) => [
      ...prev,
      { id: Date.now().toString(), title: '', type: 'screenshot' },
    ]);
  };

  const handleRemoveProof = (id: string) => {
    if (proofRequirements.length <= 1) {
      showToast('কমপক্ষে একটি প্রুফ রিকোয়ারমেন্ট থাকা আবশ্যক', 'info');
      return;
    }
    setProofRequirements((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateProof = (id: string, field: 'title' | 'type', value: string) => {
    setProofRequirements((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Rich Text Editor Toolbar Formatting Helpers
  const insertFormatting = (tag: string, endTag: string = tag) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || 'текст';
    const replacement = `${tag}${selected}${endTag}`;

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setInstructions(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length + selected.length);
    }, 0);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step Validation & Navigation
  const handleNextStep1 = () => {
    if (!mainCategory) {
      showToast('দয়া করে একটি মেইন ক্যাটাগরি সিলেক্ট করুন', 'error');
      return;
    }
    if (!subCategory) {
      showToast('দয়া করে একটি সাব ক্যাটাগরি সিলেক্ট করুন', 'error');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextStep2 = () => {
    if (!jobTitle.trim()) {
      showToast('কাজের শিরোনাম (Job Title) পূরণ করুন', 'error');
      return;
    }
    if (!instructions.trim()) {
      showToast('কাজের স্পষ্ট বিবরণ ও নির্দেশিকা (Task Instructions) লিখুন', 'error');
      return;
    }
    const hasEmptyProof = proofRequirements.some((p) => !p.title.trim());
    if (hasEmptyProof) {
      showToast('প্রুফ রিকোয়ারমেন্টের টাইটেল পূরণ করুন', 'error');
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit & Publish Job
  const handlePublishJob = async () => {
    if (numWorkers < 1) {
      showToast('কমপক্ষে ১ জন ওয়ার্কার লাগবে', 'error');
      return;
    }
    if (unitCost < 0.5) {
      showToast('প্রতি ওয়ার্কারের বাজেট কমপক্ষে ৳০.৫০ হতে হবে', 'error');
      return;
    }

    const isAdmin =
      (user as any)?.roles?.includes('admin') ||
      (user as any)?.roles?.includes('moderator') ||
      user?.email === 'fahim236455@gmail.com';

    const currentBalance = user?.balance ?? 0;
    if (!isAdmin && currentBalance < totalPayable) {
      showToast(
        `পর্যাপ্ত ব্যালেন্স নেই! মোট প্রয়োজন ৳${totalPayable.toFixed(2)}, আপনার ব্যালেন্স ৳${currentBalance.toFixed(2)}`,
        'error'
      );
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        mainCategory,
        subCategory,
        title: jobTitle.trim(),
        instructions: instructions.trim(),
        targetUrl: targetUrl.trim(),
        thumbnailUrl: thumbnailPreview || '',
        proofRequirements: proofRequirements.map((p) => ({
          id: p.id,
          title: p.title.trim(),
          type: p.type,
        })),
        workersNeeded: numWorkers,
        costPerWorker: unitCost,
      };

      const res = await fetchApi<{ message: string; job: UserPostedJob }>('/user-jobs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
      });

      showToast(res.message || 'আপনার জব সফলভাবে পাবলিশ হয়েছে!', 'success');
      await refreshUser();

      // Reset form
      setJobTitle('');
      setInstructions('');
      setTargetUrl('');
      setThumbnailFile(null);
      setThumbnailPreview('');
      setWorkersNeeded(10);
      setCostPerWorker('');
      setProofRequirements([{ id: '1', title: '', type: 'text' }]);
      setCurrentStep(1);

      // Open success modal
      setSuccessJob(res.job);
      await loadMyJobs();
    } catch (err: any) {
      showToast(err.message || 'জব পোস্ট করতে সমস্যা হয়েছে', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel / Delete Job
  const handleCancelJob = async (jobId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই জবটি বাতিল করতে চান? অবশিষ্ট স্লটের টাকা আপনার ওয়ালেটে ফেরত দেওয়া হবে।')) {
      return;
    }
    try {
      const res = await fetchApi<{ message: string; refundAmount: number }>(`/user-jobs/${jobId}`, {
        method: 'DELETE',
      });
      showToast(res.message || 'জবটি বাতিল করা হয়েছে', 'success');
      await refreshUser();
      await loadMyJobs();
    } catch (err: any) {
      showToast(err.message || 'জব বাতিল করতে ব্যর্থ হয়েছে', 'error');
    }
  };

  // Toggle Job Status (Pause / Resume)
  const handleToggleStatus = async (jobId: string) => {
    try {
      const res = await fetchApi<{ message: string }>(`/user-jobs/${jobId}/toggle-status`, {
        method: 'POST',
      });
      showToast(res.message || 'স্ট্যাটাস আপডেট সফল হয়েছে', 'success');
      await loadMyJobs();
    } catch (err: any) {
      showToast(err.message || 'আপডেট ব্যর্থ হয়েছে', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-['Hind_Siliguri',sans-serif] pb-28 pt-3 px-3.5 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* ========================================================= */}
        {/* TOP BUTTON: MANAGE PREVIOUS JOBS (Dark navy header bar) */}
        {/* ========================================================= */}
        <button
          onClick={() => setActiveView((prev) => (prev === 'create' ? 'manage' : 'create'))}
          className="w-full bg-[#182338] hover:bg-[#202d46] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 active:scale-98 transition-all cursor-pointer border border-slate-700/50"
        >
          <Briefcase className="w-4 h-4 text-sky-400" />
          <span>{activeView === 'create' ? 'Manage Previous Jobs' : '← Post a New Job'}</span>
        </button>

        {/* ========================================================= */}
        {/* VIEW 1: 3-STEP JOB POSTING WIZARD */}
        {/* ========================================================= */}
        {activeView === 'create' && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80 space-y-6 animate-in fade-in duration-200">
            {/* STEPPER HEADER (1 Category, 2 Details, 3 Budget) */}
            <div className="flex items-center justify-between max-w-md mx-auto px-4">
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => setCurrentStep(1)}>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep === 1
                      ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-500/30 ring-2 ring-[#4f46e5]/30'
                      : currentStep > 1
                      ? 'bg-[#4f46e5] text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-bold ${
                    currentStep === 1 ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  Category
                </span>
              </div>

              {/* Connecting Line 1-2 */}
              <div
                className={`flex-1 h-0.5 mx-2 -mt-5 transition-colors ${
                  currentStep >= 2 ? 'bg-[#4f46e5]' : 'bg-slate-200'
                }`}
              />

              {/* Step 2 */}
              <div
                className="flex flex-col items-center gap-1.5 cursor-pointer"
                onClick={() => {
                  if (mainCategory && subCategory) setCurrentStep(2);
                }}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep === 2
                      ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-500/30 ring-2 ring-[#4f46e5]/30'
                      : currentStep > 2
                      ? 'bg-[#4f46e5] text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-bold ${
                    currentStep === 2 ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  Details
                </span>
              </div>

              {/* Connecting Line 2-3 */}
              <div
                className={`flex-1 h-0.5 mx-2 -mt-5 transition-colors ${
                  currentStep >= 3 ? 'bg-[#4f46e5]' : 'bg-slate-200'
                }`}
              />

              {/* Step 3 */}
              <div
                className="flex flex-col items-center gap-1.5 cursor-pointer"
                onClick={() => {
                  if (mainCategory && subCategory && jobTitle && instructions) setCurrentStep(3);
                }}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep === 3
                      ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-500/30 ring-2 ring-[#4f46e5]/30'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  3
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-bold ${
                    currentStep === 3 ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  Budget
                </span>
              </div>
            </div>

            {/* --------------------------------------------------------- */}
            {/* STEP 1 CONTENT: CATEGORY (Matches Image 3) */}
            {/* --------------------------------------------------------- */}
            {currentStep === 1 && (
              <div className="space-y-5 pt-2 animate-in fade-in duration-150">
                {/* Main Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Main Category</label>
                  <div className="relative">
                    <select
                      value={mainCategory}
                      onChange={(e) => {
                        setMainCategory(e.target.value);
                        setSubCategory('');
                      }}
                      className="w-full bg-white border border-slate-300/90 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 appearance-none focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] shadow-xs cursor-pointer"
                    >
                      <option value="" disabled>
                        Select Category
                      </option>
                      {Object.keys(CATEGORIES_DATA).map((catKey) => (
                        <option key={catKey} value={catKey}>
                          {CATEGORIES_DATA[catKey].label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Sub Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Sub Category</label>
                  <div className="relative">
                    <select
                      value={subCategory}
                      disabled={!mainCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className={`w-full bg-white border border-slate-300/90 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 appearance-none focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] shadow-xs cursor-pointer ${
                        !mainCategory ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="" disabled>
                        {!mainCategory ? 'Choose main category first' : 'Select Sub Category'}
                      </option>
                      {mainCategory &&
                        CATEGORIES_DATA[mainCategory]?.subCategories.map((sub, idx) => (
                          <option key={idx} value={sub}>
                            {sub}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  type="button"
                  onClick={handleNextStep1}
                  className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3.5 px-6 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer mt-4"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* STEP 2 CONTENT: DETAILS (Matches Image 2) */}
            {/* --------------------------------------------------------- */}
            {currentStep === 2 && (
              <div className="space-y-5 pt-2 animate-in fade-in duration-150">
                {/* Job Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Subscribe to channel"
                    className="w-full bg-white border border-slate-300/90 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] shadow-xs"
                  />
                </div>

                {/* Target URL / Link */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-[#4f46e5]" />
                      <span>কাজের মূল লিংক (Target URL / Link)</span>
                    </label>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                      সুপারিশকৃত
                    </span>
                  </div>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="যেমন: https://youtube.com/watch?v=... অথবা https://facebook.com/..."
                    className="w-full bg-white border border-slate-300/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] shadow-xs"
                  />
                  <p className="text-[11px] text-slate-500">
                    ওয়ার্কাররা মাইক্রো জব লিস্ট থেকে সরাসরি এই লিংকে গিয়ে আপনার কাজটি করতে পারবে।
                  </p>
                </div>

                {/* Task Instructions with Rich Formatting Toolbar */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Task Instructions</label>
                  <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs focus-within:border-[#4f46e5] focus-within:ring-1 focus-within:ring-[#4f46e5] transition-all bg-white">
                    {/* Toolbar */}
                    <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center gap-1 flex-wrap text-slate-600">
                      <button
                        type="button"
                        onClick={() => insertFormatting('**', '**')}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-700 hover:text-black font-bold text-xs"
                        title="Bold"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('*', '*')}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-700 hover:text-black italic text-xs"
                        title="Italic"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('<u>', '</u>')}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-700 hover:text-black text-xs"
                        title="Underline"
                      >
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                      <span className="h-4 w-[1px] bg-slate-300 mx-1" />
                      <button
                        type="button"
                        onClick={() => insertFormatting('\n• ', '')}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-700 hover:text-black text-xs"
                        title="Bullet List"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('\n1. ', '')}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-700 hover:text-black text-xs"
                        title="Numbered List"
                      >
                        <ListOrdered className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(' [Link Text](https://', ') ')}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-700 hover:text-black text-xs"
                        title="Add Link"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(' ![Image](https://', ') ')}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-700 hover:text-black text-xs"
                        title="Image"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Textarea */}
                    <textarea
                      ref={textareaRef}
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Write instructions clearly... (Step by step instructions for workers)"
                      rows={6}
                      className="w-full p-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 border-none outline-none resize-y focus:ring-0 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Thumbnail (Optional) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Thumbnail (Optional)</label>
                  <div className="flex items-center gap-3 border border-slate-300/90 rounded-xl p-2.5 bg-white shadow-xs">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Choose File
                    </button>
                    <span className="text-xs text-slate-500 truncate flex-1">
                      {thumbnailFile ? thumbnailFile.name : 'No file chosen'}
                    </span>
                    {thumbnailPreview && (
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail Preview"
                        className="w-8 h-8 rounded-md object-cover border border-slate-200"
                      />
                    )}
                  </div>
                </div>

                {/* Proof Requirements */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">Proof Requirements</label>
                    <button
                      type="button"
                      onClick={handleAddProof}
                      className="border border-[#4f46e5] text-[#4f46e5] bg-indigo-50/50 hover:bg-indigo-100 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Add Proof</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {proofRequirements.map((proof, idx) => (
                      <div
                        key={proof.id}
                        className="border border-slate-200 rounded-2xl p-3 bg-slate-50/40 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={proof.title}
                            onChange={(e) => handleUpdateProof(proof.id, 'title', e.target.value)}
                            placeholder={
                              idx === 0 ? 'e.g. Channel subscribe screenshot' : 'Proof requirement title'
                            }
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4f46e5]"
                          />
                          {proofRequirements.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveProof(proof.id)}
                              className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
                              title="Delete requirement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="relative">
                          <select
                            value={proof.type}
                            onChange={(e) =>
                              handleUpdateProof(proof.id, 'type', e.target.value as 'text' | 'screenshot')
                            }
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 appearance-none focus:outline-none focus:border-[#4f46e5] cursor-pointer"
                          >
                            <option value="text">Text Report (যেমন: ইউজারনেম, ইমেইল, অথবা লিংক)</option>
                            <option value="screenshot">Screenshot Proof (কাজের স্ক্রিনশট আপলোড)</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Back and Next Step Buttons */}
                <div className="flex items-center justify-between gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep2}
                    className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3 px-8 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* STEP 3 CONTENT: BUDGET (Matches Image 1) */}
            {/* --------------------------------------------------------- */}
            {currentStep === 3 && (
              <div className="space-y-5 pt-2 animate-in fade-in duration-150">
                {/* 2 Column Budget Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Workers Needed */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Workers Needed</label>
                    <input
                      type="number"
                      min={1}
                      value={workersNeeded}
                      onChange={(e) => setWorkersNeeded(e.target.value)}
                      placeholder="10"
                      className="w-full bg-white border border-slate-300/90 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] shadow-xs"
                    />
                  </div>

                  {/* Cost per Worker */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Cost per Worker (৳)</label>
                    <input
                      type="number"
                      step="0.10"
                      min={0.5}
                      value={costPerWorker}
                      onChange={(e) => setCostPerWorker(e.target.value)}
                      placeholder="e.g. 2.50"
                      className="w-full bg-white border border-slate-300/90 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] shadow-xs"
                    />
                  </div>
                </div>

                {/* Calculation Summary Card (Dashed Border Card) */}
                <div className="border border-dashed border-slate-300 rounded-2xl p-4 sm:p-5 space-y-2.5 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-700">
                    <span className="font-semibold text-slate-600">Net Amount:</span>
                    <span className="font-mono font-bold">৳{netAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-rose-500">
                    <span className="font-medium">System Fee (10.00%):</span>
                    <span className="font-mono font-bold">৳{systemFee.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-dashed border-slate-200 pt-2.5 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-slate-800">Total Payable:</span>
                    <span className="text-lg sm:text-xl font-black text-[#4f46e5] font-mono">
                      ৳{totalPayable.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Wallet Balance Status Box */}
                <div className="bg-slate-100 rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="text-slate-500 block text-[10px]">আপনার বর্তমান ওয়ালেট ব্যালেন্স:</span>
                      <span className="font-black text-slate-900 text-xs">
                        ৳{(user?.balance ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {(user?.balance ?? 0) >= totalPayable && totalPayable > 0 ? (
                    <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> পর্যাপ্ত ব্যালেন্স
                    </span>
                  ) : ((user as any)?.roles?.includes('admin') || user?.email === 'fahim236455@gmail.com') ? (
                    <span className="text-indigo-700 font-bold bg-indigo-100 px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" /> অ্যাডমিন ফ্রি পোস্টিং সক্রিয়
                    </span>
                  ) : (
                    <span className="text-rose-700 font-bold bg-rose-100/80 px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-600" /> ব্যালেন্স অপর্যাপ্ত
                    </span>
                  )}
                </div>

                {/* Navigation Buttons: Back & Publish Job */}
                <div className="flex items-center justify-between gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    disabled={submitting || totalPayable <= 0}
                    onClick={handlePublishJob}
                    className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3 px-8 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Publish Job</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: MANAGE PREVIOUS JOBS */}
        {/* ========================================================= */}
        {activeView === 'manage' && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Manage Posted Jobs</h3>
                <p className="text-[11px] text-slate-500">আপনার তৈরি করা সকল জব ও ওয়ার্কারদের অগ্রগতি</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveView('create');
                  setCurrentStep(1);
                }}
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Post Job</span>
              </button>
            </div>

            {loadingJobs ? (
              <div className="text-center py-10 space-y-2">
                <div className="w-7 h-7 border-2 border-[#4f46e5] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">জব তালিকা লোড হচ্ছে...</p>
              </div>
            ) : myJobs.length === 0 ? (
              <div className="text-center py-10 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center mx-auto">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">কোনো পূর্ববর্তী জব পাওয়া যায়নি</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    আপনি এখনও কোনো মাইক্রো জব পোস্ট করেননি।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('create');
                    setCurrentStep(1);
                  }}
                  className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>এখনই প্রথম জব পোস্ট করুন</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myJobs.map((job) => (
                  <div
                    key={job.id}
                    className="border border-slate-200 rounded-2xl p-4 bg-white hover:border-indigo-300 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="bg-indigo-50 text-[#4f46e5] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
                            {job.mainCategory}
                          </span>
                          <span className="text-slate-400 text-[10px] font-medium">
                            {job.subCategory}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{job.title}</h4>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                          job.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : job.status === 'paused'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    {/* Progress Bar & Stats */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="font-semibold">
                          অগ্রগতি: {job.workersCompleted} / {job.workersNeeded} Workers
                        </span>
                        <span className="font-bold text-[#4f46e5]">৳{job.costPerWorker} / জন</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#4f46e5] rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(((job.workersCompleted || 0) / (job.workersNeeded || 1)) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 flex-wrap gap-2">
                      <div className="flex items-center gap-2 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(job.createdAt).toLocaleDateString('bn-BD')}</span>
                        {job.targetUrl && (
                          <a
                            href={job.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline flex items-center gap-1 font-sans ml-2"
                          >
                            <Link2 className="w-3 h-3" />
                            <span>লিংক</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onNavigate('tasks')}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition-colors flex items-center gap-1"
                        >
                          <Briefcase className="w-3 h-3 text-indigo-600" />
                          <span>মাইক্রো জবে দেখুন</span>
                        </button>

                        {job.status !== 'cancelled' && job.status !== 'completed' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(job.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1"
                            >
                              {job.status === 'active' ? (
                                <>
                                  <Pause className="w-3 h-3 text-amber-600" />
                                  <span>Pause</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 text-emerald-600" />
                                  <span>Resume</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCancelJob(job.id)}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold transition-colors flex items-center gap-1"
                              title="জব বাতিল ও রিফান্ড"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>বাতিল</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Success Modal upon publishing */}
        {successJob && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-indigo-100 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">জব সফলভাবে লাইভ হয়েছে!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  আপনার মাইক্রো জবটি তৈরি হয়েছে এবং সকল সাধারণ ইউজার ও ওয়ার্কারদের মাইক্রো জব লিস্টে যোগ করা হয়েছে।
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 text-left text-xs space-y-1.5 border border-slate-200">
                <div className="font-bold text-slate-800 line-clamp-1">{successJob.title}</div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>মোট ওয়ার্কার: {successJob.workersNeeded} জন</span>
                  <span className="font-bold text-indigo-600">৳{successJob.costPerWorker}/জন</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessJob(null);
                    onNavigate('tasks');
                  }}
                  className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>মাইক্রো জবে এখনই লাইভ দেখুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSuccessJob(null);
                    setActiveView('manage');
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  জব তালিকা ম্যানেজ করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
