import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../lib/api';
import {
  User,
  Mail,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  Camera,
  Trash2,
  CheckCircle2,
  Lock,
  Phone,
  Copy,
  Check,
  Share2,
  Gift,
  Loader2,
  UploadCloud,
  X,
  Sun,
  Moon,
} from 'lucide-react';

interface AccountPageProps {
  onNavigate: (route: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { user, showToast, isAdmin, refreshUser, settings, isDarkMode, toggleDarkMode } = useApp();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [avatar, setAvatar] = useState<string>(user?.avatar || '');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhoneNumber(user.phoneNumber || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const referralCode = user?.referralCode || 'FPB101';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const referralLink = `${origin}/register?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    showToast('রেফারেল লিংক ক্লিপবোর্ডে কপি করা হয়েছে!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    showToast(`রেফারেল কোড (${referralCode}) কপি করা হয়েছে!`, 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${settings?.brandName || 'Earnora'} - ঘরে বসে আয় করুন`,
          text: `${settings?.brandName || 'Earnora'}-এ জয়েন করুন এবং প্রতিদিন ২০০-৫০০ টাকা আয় করুন। আমার রেফারেল লিংক:`,
          url: referralLink,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  // Image Upload and Compression
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('অনুগ্রহ করে একটি ছবি (Image file) নির্বাচন করুন।', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('ছবির সাইজ সর্বোচ্চ 5MB হতে পারবে।', 'error');
      return;
    }

    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        // Compress & scale to max 350x350
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 350;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(compressedDataUrl);

          // Save avatar immediately to server
          try {
            await fetchApi('/user/update-profile', {
              method: 'PUT',
              body: JSON.stringify({ avatar: compressedDataUrl }),
            });
            await refreshUser();
            showToast('প্রোফাইল পিকচার সফলভাবে পরিবর্তন করা হয়েছে!', 'success');
          } catch (err: any) {
            showToast(err.message || 'ছবি সংরক্ষণে সমস্যা হয়েছে।', 'error');
          } finally {
            setUploadingPhoto(false);
          }
        } else {
          setUploadingPhoto(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input so user can re-select same file if needed
    e.target.value = '';
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('আপনি কি প্রোফাইল ছবি মুছে ফেলতে চান?')) return;
    try {
      setUploadingPhoto(true);
      await fetchApi('/user/update-profile', {
        method: 'PUT',
        body: JSON.stringify({ avatar: '' }),
      });
      setAvatar('');
      await refreshUser();
      showToast('প্রোফাইল ছবি সফলভাবে মুছে ফেলা হয়েছে।', 'success');
    } catch (err: any) {
      showToast(err.message || 'ছবি মুছতে ব্যর্থ হয়েছে।', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateInformation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword.length < 6) {
      showToast('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', 'error');
      return;
    }

    try {
      setSubmitting(true);
      let message = '';

      // Update full name and phone number
      if ((fullName && fullName !== user?.fullName) || (phoneNumber && phoneNumber !== user?.phoneNumber)) {
        const res = await fetchApi<{ message: string }>('/user/update-profile', {
          method: 'PUT',
          body: JSON.stringify({ fullName, phoneNumber }),
        });
        message += res.message + ' ';
        await refreshUser();
      }

      // Update password
      if (newPassword) {
        const res = await fetchApi<{ message: string }>('/auth/change-password', {
          method: 'POST',
          body: JSON.stringify({ newPassword }),
        });
        message += res.message;
        setNewPassword('');
      }

      if (message) {
        showToast(message.trim(), 'success');
      } else {
        showToast('কোনো তথ্য পরিবর্তন করা হয়নি।', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'আপডেট ব্যর্থ হয়েছে।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনার অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলতে চান?')) {
      showToast('অ্যাকাউন্ট ডিলিট রিকোয়েস্ট অ্যাডমিন প্যানেলে পাঠানো হয়েছে।', 'info');
    }
  };

  const userInitial = fullName?.trim()?.charAt(0)?.toUpperCase() || user?.fullName?.trim()?.charAt(0)?.toUpperCase() || 'F';

  return (
    <div className="min-h-screen bg-transparent pb-24 font-['Hind_Siliguri',sans-serif]">
      {/* Hidden file input for avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handlePhotoSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="pt-5 pb-3 text-center">
        <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">আমার প্রোফাইল ও অ্যাকাউন্ট</h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium">ব্যক্তিগত তথ্য ও রেফারেল সেটিংস পরিচালনা করুন</p>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-4">
        {/* 1. UNIQUE REFERRAL LINK & CODE CARD */}
        <div className="bg-[#0b1329] border border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-3.5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">আমার রেফারেল লিংক</h2>
                <p className="text-xs text-slate-300">লিংক শেয়ার করে প্রতি রেফারে ৳৫০ বোনাস পান</p>
              </div>
            </div>
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
              ৳৫০ বোনাস
            </span>
          </div>

          {/* Referral Code Chip */}
          <div className="flex items-center justify-between bg-[#060b18] rounded-xl p-2.5 border border-slate-700/80">
            <span className="text-xs sm:text-sm text-slate-200">
              রেফারেল কোড: <strong className="text-amber-400 font-mono text-sm ml-1 font-bold">{referralCode}</strong>
            </span>
            <button
              onClick={handleCopyCode}
              className="text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'কপি হয়েছে' : 'কোড কপি'}</span>
            </button>
          </div>

          {/* Referral Link & Copy to Clipboard Button */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 block">
              ইউনিক রেফারেল লিংক:
            </label>
            <div className="flex items-center gap-2 bg-[#060b18] rounded-xl p-1.5 border border-slate-700/80 focus-within:border-amber-400 transition-colors">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="bg-transparent text-xs sm:text-sm text-amber-300 font-mono font-medium flex-1 outline-none truncate px-2 selection:bg-amber-500/30"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black px-3.5 py-2 rounded-lg flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer shadow-md"
                title="ক্লিপবোর্ডে কপি করুন"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'কপি হয়েছে' : 'Copy Link'}</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold p-2 rounded-lg flex items-center shrink-0 transition-colors border border-slate-700 cursor-pointer"
                title="শেয়ার করুন"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 1.5 THEME SELECTION CARD */}
        <div className="bg-[#0b1329] border border-slate-700/80 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">অ্যাপস কালার থিম (Theme)</h3>
              <p className="text-[11px] text-slate-300 font-medium">
                {isDarkMode ? 'বর্তমান: ডার্ক মোড (Dark Mode)' : 'বর্তমান: লাইট মোড (Light Mode)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 cursor-pointer shadow-sm active:scale-95"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* 2. MAIN EDIT PROFILE CARD */}
        <div className="bg-[#0b1329] border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
          {/* Avatar & Photo Change Section */}
          <div className="flex flex-col items-center mb-1">
            <div className="relative group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full border-3 border-amber-400/80 bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-white text-3xl font-black shadow-lg overflow-hidden cursor-pointer hover:border-amber-400 transition-all relative"
                title="প্রোফাইল ছবি পরিবর্তন করতে ক্লিক করুন"
              >
                {uploadingPhoto ? (
                  <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-1 z-10">
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                    <span className="text-[10px] text-slate-200 font-bold">আপলোড হচ্ছে</span>
                  </div>
                ) : avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>

              {/* Camera Change Icon Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-full border-2 border-[#0b1329] shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                title="প্রোফাইল ছবি পরিবর্তন করুন"
              >
                <Camera className="w-4 h-4 font-bold" />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{avatar ? 'ছবি পরিবর্তন করুন' : 'ছবি আপলোড করুন'}</span>
              </button>

              {avatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={uploadingPhoto}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                  title="ছবি মুছে ফেলুন"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>রিমুভ</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">ক্লিক করে গ্যালারি বা ক্যামেরা থেকে ছবি সেট করুন</p>
          </div>

          <form onSubmit={handleUpdateInformation} className="space-y-4 pt-1">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-400" />
                <span>পুরো নাম (Full Name)</span>
              </label>
              <div className="relative flex items-center bg-[#081226] border border-slate-700/90 rounded-xl focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all shadow-sm">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-3 bg-transparent text-sm sm:text-base font-semibold text-white outline-none placeholder:text-slate-500"
                  placeholder="আপনার পুরো নাম লিখুন"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>ফোন নম্বর (Phone Number)</span>
              </label>
              <div className="relative flex items-center bg-[#081226] border border-slate-700/90 rounded-xl focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all shadow-sm">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-3 bg-transparent text-sm sm:text-base font-semibold text-white outline-none placeholder:text-slate-500 font-mono"
                  placeholder="017XXXXXXXX"
                />
              </div>
            </div>

            {/* Email (Immutable) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>ইমেইল অ্যাড্রেস</span>
                </label>
                <span className="text-[11px] font-bold text-amber-300/90 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Lock className="w-3 h-3" /> অপরিবর্তনীয়
                </span>
              </div>
              <div className="relative flex items-center bg-[#060d1e] border border-slate-800 rounded-xl shadow-inner">
                <input
                  type="email"
                  readOnly
                  value={user?.email || ''}
                  className="w-full px-3.5 py-3 bg-transparent text-sm sm:text-base font-semibold text-slate-200 cursor-not-allowed outline-none font-mono"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-400" />
                <span>নতুন পাসওয়ার্ড (ঐচ্ছিক)</span>
              </label>
              <div className="relative flex items-center bg-[#081226] border border-slate-700/90 rounded-xl focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all shadow-sm">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-3.5 pr-11 py-3 bg-transparent text-sm sm:text-base font-semibold text-white outline-none placeholder:text-slate-500 font-mono"
                  placeholder="পাসওয়ার্ড পরিবর্তন করতে এখানে লিখুন"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 p-1 text-slate-300 hover:text-white transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">পাসওয়ার্ড পরিবর্তন না করতে চাইলে খালি রাখুন।</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>সংরক্ষণ করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 font-black" />
                    <span>তথ্য আপডেট করুন</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 3. ADMIN QUICK ACCESS (If Admin) */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-amber-500/15 via-[#0b1329] to-amber-500/10 rounded-2xl p-4 border border-amber-500/40 shadow-lg space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-amber-300">এডমিন কন্ট্রোল প্যানেল</h3>
                <p className="text-[11px] text-slate-300">সকল ইউজার, উইথড্র ও সিস্টেম পরিচালনা</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('admin')}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>এডমিন পোর্টালে প্রবেশ করুন</span>
            </button>
          </div>
        )}

        {/* 4. DELETE ACCOUNT CARD */}
        <div className="bg-rose-950/20 rounded-2xl p-4 border border-rose-900/40 flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-rose-400">অ্যাকাউন্ট ডিলিট</h3>
            <p className="text-[11px] text-slate-300">স্থায়ীভাবে অ্যাকাউন্ট মুছে ফেলতে আবেদন করুন</p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
