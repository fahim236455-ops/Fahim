import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, X, Shield, Send, ArrowRight, Facebook, Youtube, Instagram } from 'lucide-react';

interface SiteNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Optional preview mode for Admin Panel
  isPreview?: boolean;
}

export const SiteNoticeModal: React.FC<SiteNoticeModalProps> = ({
  isOpen,
  onClose,
  isPreview = false,
}) => {
  const { settings } = useApp();

  if (!isOpen) return null;

  const notice = settings?.popupNotice;

  const title = notice?.title || 'জরুরী নোটিশ!';
  const message =
    notice?.message ||
    'একটিও গুরুত্বপূর্ণ আপডেট মিস করবেন না! নতুন জব, বোনাস অফার, পেমেন্ট আপডেট ও জরুরী ঘোষণা সবার আগে পেতে এখনই আমাদের Official Group ও Channel-এ যুক্ত হন।';

  // Telegram Channel Link
  const channelText = notice?.channelButtonText || 'Join Officials Channel';
  const rawChannel =
    notice?.channelUrl || settings?.telegramChannelUrl || settings?.supportTelegram || 'fahimpaybd';
  const channelLink =
    rawChannel.startsWith('http://') || rawChannel.startsWith('https://')
      ? rawChannel
      : `https://t.me/${rawChannel.replace('@', '').trim()}`;

  // Telegram Group Link
  const groupText = notice?.groupButtonText || 'Join Officials Group';
  const rawGroup =
    notice?.groupUrl || settings?.telegramGroupUrl || settings?.supportTelegram || 'fahimpaybd_group';
  const groupLink =
    rawGroup.startsWith('http://') || rawGroup.startsWith('https://')
      ? rawGroup
      : `https://t.me/${rawGroup.replace('@', '').trim()}`;

  // Social Links
  const rawFacebook = notice?.facebookUrl || 'https://facebook.com';
  const facebookLink =
    rawFacebook.startsWith('http://') || rawFacebook.startsWith('https://')
      ? rawFacebook
      : `https://${rawFacebook.trim()}`;

  const rawYoutube = notice?.youtubeUrl || settings?.heroVideoUrl || 'https://youtube.com';
  const youtubeLink =
    rawYoutube.startsWith('http://') || rawYoutube.startsWith('https://')
      ? rawYoutube
      : `https://${rawYoutube.trim()}`;

  const rawInstagram = notice?.instagramUrl || 'https://instagram.com';
  const instagramLink =
    rawInstagram.startsWith('http://') || rawInstagram.startsWith('https://')
      ? rawInstagram
      : `https://${rawInstagram.trim()}`;

  // Format title if it contains "জরুরী নোটিশ" or standard string
  const renderTitle = () => {
    if (title.includes('নোটিশ')) {
      const parts = title.split('নোটিশ');
      return (
        <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-tight">
          {parts[0]}
          <span className="text-sky-500">নোটিশ{parts[1] || '!'}</span>
        </h2>
      );
    }
    return (
      <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-tight">
        {title}
      </h2>
    );
  };

  const modalContent = (
    <div
      className={`bg-white text-slate-900 rounded-[32px] p-6 sm:p-7 max-w-sm w-full shadow-2xl relative overflow-hidden text-center transition-all ${
        isPreview ? 'border border-slate-200' : 'animate-in zoom-in-95 fade-in duration-200'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Right Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-sky-500 hover:text-sky-600 flex items-center justify-center transition-colors cursor-pointer shadow-xs active:scale-95"
        aria-label="Close Notice"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Top Center Icon with Bell & Exclamation Badge */}
      <div className="relative w-16 h-16 rounded-full bg-sky-50 border border-sky-100/80 flex items-center justify-center mx-auto mb-3.5 shadow-xs">
        <Bell className="w-7 h-7 text-slate-800" />
        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-sky-500 border-2 border-white text-white flex items-center justify-center text-[10px] font-black shadow-xs">
          !
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2 mb-3">
        {renderTitle()}

        {/* Decorative Divider with Shield Icon */}
        <div className="flex items-center justify-center gap-2 max-w-[140px] mx-auto opacity-80">
          <div className="h-[1.5px] bg-gradient-to-r from-transparent via-sky-400 to-sky-500 flex-1 rounded-full" />
          <Shield className="w-3.5 h-3.5 text-sky-500 shrink-0 stroke-[2.5]" />
          <div className="h-[1.5px] bg-gradient-to-l from-transparent via-sky-400 to-sky-500 flex-1 rounded-full" />
        </div>
      </div>

      {/* Notice Message */}
      <p className="text-xs sm:text-[13px] text-slate-700 font-medium leading-relaxed mb-5 whitespace-pre-line px-1 font-['Hind_Siliguri',sans-serif]">
        {message}
      </p>

      {/* Telegram Primary Action Buttons */}
      <div className="space-y-2.5 mb-4">
        {/* Join Channel Button */}
        <a
          href={channelLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={!isPreview ? onClose : undefined}
          className="w-full bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-between shadow-md shadow-sky-500/20 active:scale-98 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Send className="w-4 h-4 text-white -rotate-12 translate-x-0.5" />
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-wide">{channelText}</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </a>

        {/* Join Group Button */}
        <a
          href={groupLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={!isPreview ? onClose : undefined}
          className="w-full bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-between shadow-md shadow-sky-500/20 active:scale-98 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Send className="w-4 h-4 text-white -rotate-12 translate-x-0.5" />
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-wide">{groupText}</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </a>
      </div>

      {/* Divider with "অথবা যুক্ত হন" */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-slate-500 font-semibold">অথবা যুক্ত হন</span>
        </div>
      </div>

      {/* 3-Column Social Icons Row (Facebook, YouTube, Instagram) */}
      <div className="grid grid-cols-3 gap-2.5 pt-0.5">
        {/* Facebook */}
        <a
          href={facebookLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={!isPreview ? onClose : undefined}
          className="border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 shadow-xs transition-all group active:scale-95"
        >
          <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Facebook className="w-4 h-4 fill-white" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">Facebook</span>
        </a>

        {/* YouTube */}
        <a
          href={youtubeLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={!isPreview ? onClose : undefined}
          className="border border-slate-200 hover:border-red-400 bg-white hover:bg-slate-50 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 shadow-xs transition-all group active:scale-95"
        >
          <div className="w-9 h-9 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Youtube className="w-4 h-4 fill-white" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">YouTube</span>
        </a>

        {/* Instagram */}
        <a
          href={instagramLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={!isPreview ? onClose : undefined}
          className="border border-slate-200 hover:border-pink-400 bg-white hover:bg-slate-50 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 shadow-xs transition-all group active:scale-95"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Instagram className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">Instagram</span>
        </a>
      </div>
    </div>
  );

  if (isPreview) {
    return modalContent;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      {modalContent}
    </div>
  );
};
