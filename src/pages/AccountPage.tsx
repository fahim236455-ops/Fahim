import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../lib/api';
import { User, Mail, Key, Eye, EyeOff, ShieldCheck, Camera, Trash2, CheckCircle2, Lock, Phone } from 'lucide-react';

interface AccountPageProps {
  onNavigate: (route: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { user, logout, showToast, isAdmin, refreshUser } = useApp();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    if (window.confirm('Are you sure you want to permanently delete your account?')) {
      showToast('অ্যাকাউন্ট ডিলিট রিকোয়েস্ট অ্যাডমিন প্যানেলে পাঠানো হয়েছে।', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 font-sans transition-colors duration-300">
      {/* Header */}
      <div className="pt-6 pb-4 text-center">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Edit Profile</h1>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-6">
        {/* Main Edit Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-inner overflow-hidden">
                {/* SVG Avatar Placeholder */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-white/90 translate-y-2">
                  <path fill="currentColor" d="M50 55c12.1 0 22-9.9 22-22S62.1 11 50 11 28 20.9 28 33s9.9 22 22 22zm0 6c-14.7 0-44 7.4-44 22v4h88v-4c0-14.6-29.3-22-44-22z" />
                </svg>
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-full border-2 border-white dark:border-slate-900 shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">Tap camera to change photo</p>
          </div>

          <form onSubmit={handleUpdateInformation} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                  placeholder="Your Full Name"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                  placeholder="017XXXXXX..."
                />
              </div>
            </div>

            {/* Email (Immutable) */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email (Immutable)</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="email"
                  readOnly
                  value={user?.email || ''}
                  className="w-full pl-10 pr-24 py-3 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
                />
                <div className="absolute right-3.5 flex items-center gap-1.5 text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">Locked</span>
                </div>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Password (Keep blank if no change)</label>
              <div className="relative flex items-center">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-blue-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow placeholder:text-slate-700 dark:placeholder:text-slate-600 font-medium tracking-widest"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1e50e5] dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-medium text-sm py-3.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Update Information</span>
              </button>
            </div>
          </form>

        </div>

        {/* Delete Account Card */}
        <div className="bg-red-50/80 dark:bg-rose-950/20 rounded-[20px] p-5 border border-red-100/60 dark:border-rose-900/50 flex items-center justify-between transition-colors duration-300">
          <div>
            <h3 className="text-sm font-bold text-red-700 dark:text-rose-400">Delete Account</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Permanently delete your account</p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="bg-[#ef4444] hover:bg-red-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm shadow-red-500/20 transition-colors flex items-center gap-1.5 focus:outline-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
        
        {/* Admin Quick Entry Card (For Admins Only) */}
        {isAdmin && (
          <div className="mt-4 bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/10 rounded-[20px] p-5 border border-amber-500/40 shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-300">এডমিন কন্ট্রোল প্যানেল</h3>
                <p className="text-[11px] text-slate-400">সকল ইউজার, উইথড্র ও সিস্টেম ম্যানেজমেন্ট</p>
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

      </div>
    </div>
  );
};
