import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/Logo';
import { SiteNoticeModal } from '../components/SiteNoticeModal';
import {
  ArrowRight,
  User,
  ShieldCheck,
  Zap,
  Headphones,
  Video,
  Star,
  ChevronDown,
  ChevronUp,
  Send,
  Menu,
  X,
  MessageCircle,
  Facebook,
  Heart,
  Sparkles,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';
import { motion, type Variants } from 'motion/react';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

// Animation variants for smooth scroll reveal
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

/* --- EXACT HERO ILLUSTRATION (Young man in red shirt on laptop with desk lamp, frames & black cat) --- */
const HeroIllustration: React.FC = () => (
  <div className="relative w-full max-w-[520px] flex items-center justify-center">
    <img
      src="/hero-illustration.jpg"
      alt="Digital freelancing and earning illustration"
      className="w-full h-auto object-contain rounded-2xl select-none"
      loading="eager"
    />
  </div>
);

/* --- EXACT WHY CHOOSE US ILLUSTRATION (Two developers designing mobile app wireframe & workspace) --- */
const FeaturesIllustration: React.FC = () => (
  <div className="relative w-full max-w-[520px] flex items-center justify-center">
    <img
      src="/why-choose-us.jpg"
      alt="App development and reliable earning workflow"
      className="w-full h-auto object-contain rounded-2xl select-none"
      loading="eager"
    />
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { settings, isDarkMode, toggleDarkMode } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [dismissedNotice, setDismissedNotice] = useState(false);

  const brandName = settings?.brandName || 'Earnora';

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const defaultFaqs = [
    {
      q: 'এখানে কাজ করতে কি কোনো অভিজ্ঞতা লাগে?',
      a: 'না, এখানে কাজ করার জন্য কোনো পূর্ব অভিজ্ঞতার প্রয়োজন নেই। প্রতিটি কাজের জন্য আমাদের সাইটে সহজ গাইডলাইন দেওয়া আছে, যা দেখে যেকেউ খুব সহজে ঘরে বসেই কাজ করতে পারবে।',
    },
    {
      q: 'টাকা কীভাবে উইথড্র করবো?',
      a: 'আপনার অ্যাকাউন্টে সর্বনিম্ন উইথড্র পরিমাণ ব্যালেন্স জমা হলে আপনি বিকাশ, নগদ, রকেট বা উপায়ের মাধ্যমে সরাসরি আপনার ব্যক্তিগত অ্যাকাউন্টে টাকা উইথড্র করে নিতে পারবেন।',
    },
    {
      q: 'রেফার করে কি আয় করা সম্ভব?',
      a: 'হ্যাঁ! আপনি আপনার ইউনিক রেফারেল লিংক দিয়ে বন্ধুদের ইনভাইট করলে তাদের কাজের উপর নির্ধারিত বোনাস এবং লাইফটাইম এফিলিয়েট কমিশন সরাসরি আপনার অ্যাকাউন্টে যুক্ত হবে।',
    },
  ];

  const faqs = (settings?.faqs && settings.faqs.length > 0)
    ? settings.faqs.map((f) => ({ q: f.question, a: f.answer }))
    : defaultFaqs;

  const heroHeadline = settings?.heroTitle || 'Earn Smarter With A Trusted Digital Platform';
  const heroDescription = settings?.heroSubtitle || 'একটি আধুনিক ও নির্ভরযোগ্য ডিজিটাল প্ল্যাটফর্ম যেখানে আপনি সহজে টাস্ক সম্পন্ন করে, রেফারেল প্রোগ্রামে অংশগ্রহণ করে এবং বিভিন্ন অনলাইন কার্যক্রমের মাধ্যমে অতিরিক্ত আয়ের সুযোগ পেতে পারেন। নিরাপদ লেনদেন, দ্রুত পেমেন্ট এবং স্বচ্ছ সিস্টেম আমাদের সেবার প্রধান বৈশিষ্ট্য।';

  return (
    <div className={`min-h-screen font-['Hind_Siliguri',sans-serif] selection:bg-sky-500 selection:text-white overflow-x-hidden transition-colors ${isDarkMode ? 'bg-[#060b18] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Dynamic Popup Notice Alert Modal (controlled from Admin Panel) */}
      <SiteNoticeModal
        isOpen={Boolean(settings?.popupNotice?.enabled && !dismissedNotice)}
        onClose={() => setDismissedNotice(true)}
      />

      {/* 1. Header / Navbar */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="sticky top-0 z-50 glass-panel-dark border-b border-sky-500/20 transition-all shadow-lg shadow-sky-900/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo - Earnora */}
          <div
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <Logo variant="full" size={38} />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-300">
            <button
              onClick={() => scrollToSection('home')}
              className="hover:text-sky-400 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="hover:text-sky-400 transition-colors cursor-pointer"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-sky-400 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('reviews')}
              className="hover:text-sky-400 transition-colors cursor-pointer"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-sky-400 transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50 cursor-pointer flex items-center justify-center"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="text-sm font-bold text-slate-300 hover:text-sky-400 px-3 py-2 transition-colors cursor-pointer"
            >
              Log in
            </button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate('register')}
              className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg shadow-sky-500/20 transition-all cursor-pointer border border-sky-400/30"
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-slate-800/60 text-slate-300 cursor-pointer flex items-center justify-center border border-slate-700/50"
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="text-xs font-bold text-slate-300 px-2 py-1.5"
            >
              Log in
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel-dark border-b border-sky-500/20 px-4 pt-2 pb-6 space-y-3 shadow-lg"
          >
            <button
              onClick={() => scrollToSection('home')}
              className="block w-full text-left py-2 text-slate-300 font-bold text-sm hover:text-sky-400"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="block w-full text-left py-2 text-slate-300 font-bold text-sm hover:text-sky-400"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-2 text-slate-300 font-bold text-sm hover:text-sky-400"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('reviews')}
              className="block w-full text-left py-2 text-slate-300 font-bold text-sm hover:text-sky-400"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left py-2 text-slate-300 font-bold text-sm hover:text-sky-400"
            >
              FAQ
            </button>
            <div className="pt-3 flex flex-col gap-2">
              <button
                onClick={() => onNavigate('register')}
                className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold py-2.5 rounded-full text-center text-sm shadow-lg shadow-sky-500/20 border border-sky-400/30"
              >
                Get Started (রেজিস্টার)
              </button>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* 2. Hero Section */}
      <section id="home" className="pt-10 sm:pt-16 pb-14 sm:pb-20 overflow-hidden relative">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={staggerContainer}
              className="lg:col-span-6 space-y-6 text-left"
            >
              {/* Badge */}
              <motion.div variants={fadeInUp} className="inline-flex">
                <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 px-4 py-2 rounded-full text-xs font-bold tracking-wide shadow-[0_0_15px_rgba(14,165,233,0.15)] backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-sky-300">Trusted Digital Earning Platform</span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-[56px] font-black text-white tracking-tight leading-[1.15] drop-shadow-lg"
              >
                {heroHeadline}
              </motion.h1>

              {/* Description in Bengali */}
              <motion.p
                variants={fadeInUp}
                className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-medium"
              >
                {heroDescription}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onNavigate('register')}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold text-sm sm:text-base px-8 py-4 rounded-full shadow-lg shadow-sky-500/25 transition-all cursor-pointer border border-sky-400/30"
                >
                  <span>Start Earning Now</span>
                  <ArrowRight className="w-5 h-5 drop-shadow-md" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onNavigate('login')}
                  className="inline-flex items-center justify-center gap-2 glass-panel-dark hover:bg-white/10 text-white font-bold text-sm sm:text-base px-8 py-4 rounded-full border border-white/10 shadow-lg shadow-black/20 transition-all cursor-pointer"
                >
                  <User className="w-5 h-5 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                  <span>Member Login</span>
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Hero Clean Vector Illustration (Exact Red Shirt Character with Laptop & Cat) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="lg:col-span-6 flex justify-center lg:justify-end relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-transparent rounded-full blur-[80px] -z-10" />
              <HeroIllustration />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Stats Counter Banner */}
      <section className="pb-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          <motion.div
            variants={scaleIn}
            className="glass-panel-dark rounded-2xl p-6 sm:p-8 border border-sky-500/20 shadow-lg shadow-black/20 text-center hover:border-sky-500/40 transition-colors"
          >
            <h3 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-sky-500 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">20K+</h3>
            <p className="text-xs font-bold text-slate-400 tracking-wider mt-2 uppercase">
              Active Earners
            </p>
          </motion.div>

          <motion.div
            variants={scaleIn}
            className="glass-panel-dark rounded-2xl p-6 sm:p-8 border border-emerald-500/20 shadow-lg shadow-black/20 text-center hover:border-emerald-500/40 transition-colors"
          >
            <h3 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">1M+</h3>
            <p className="text-xs font-bold text-slate-400 tracking-wider mt-2 uppercase">
              Total Payout (BDT)
            </p>
          </motion.div>

          <motion.div
            variants={scaleIn}
            className="glass-panel-dark rounded-2xl p-6 sm:p-8 border border-amber-500/20 shadow-lg shadow-black/20 text-center hover:border-amber-500/40 transition-colors"
          >
            <h3 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">24/7</h3>
            <p className="text-xs font-bold text-slate-400 tracking-wider mt-2 uppercase">
              Live Support
            </p>
          </motion.div>

          <motion.div
            variants={scaleIn}
            className="glass-panel-dark rounded-2xl p-6 sm:p-8 border border-purple-500/20 shadow-lg shadow-black/20 text-center hover:border-purple-500/40 transition-colors"
          >
            <h3 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">100%</h3>
            <p className="text-xs font-bold text-slate-400 tracking-wider mt-2 uppercase">
              Secured System
            </p>
          </motion.div>
        </motion.div>

        {/* Supported Payment Methods Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-12 text-center space-y-4"
        >
          <p className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-[0.2em] uppercase">
            Supported Payment Methods
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {/* bKash */}
            <div className="flex items-center gap-2 font-black text-slate-300 text-sm hover:scale-110 transition-transform cursor-default">
              <svg viewBox="0 0 24 24" className="w-5 h-5 drop-shadow-[0_0_8px_rgba(226,19,110,0.5)]" fill="none">
                <path d="M4 4L12 12L20 4M4 20L12 12L20 20" stroke="#E2136E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>bKash</span>
            </div>
            {/* Nagad */}
            <div className="flex items-center gap-2 font-black text-slate-300 text-sm hover:scale-110 transition-transform cursor-default">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#F7941D] to-orange-600 drop-shadow-[0_0_8px_rgba(247,148,29,0.5)]" />
              <span>Nagad</span>
            </div>
            {/* Rocket */}
            <div className="flex items-center gap-2 font-black text-slate-300 text-sm hover:scale-110 transition-transform cursor-default">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#8C1B74] drop-shadow-[0_0_8px_rgba(140,27,116,0.5)]" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5l5.5 3.5-5.5 3.5-5.5-3.5L12 4.5z" />
              </svg>
              <span>Rocket</span>
            </div>
            {/* Upay */}
            <div className="flex items-center gap-2 font-black text-slate-300 text-sm hover:scale-110 transition-transform cursor-default">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#00A19D] to-teal-600 drop-shadow-[0_0_8px_rgba(0,161,157,0.5)]" />
              <span>Upay</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. Our Premium Services */}
      <section id="services" className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-800/20 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeInUp}
            className="text-center space-y-3 mb-16"
          >
            <span className="text-xs font-black text-sky-400 tracking-[0.2em] uppercase">
              What We Offer
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              Our Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-600">Services</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
          >
            {/* 1. Gmail Account Sales - Clean Card with Google G Logo */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-panel-dark rounded-3xl p-8 border border-sky-500/20 shadow-lg hover:shadow-sky-500/20 hover:border-sky-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                  {/* Google G Logo */}
                  <svg viewBox="0 0 24 24" className="w-7 h-7 drop-shadow-md">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">Gmail Account Sales</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  নতুন জিমেইল অ্যাকাউন্ট তৈরি করে আমাদের কাছে পাইকারি রেটে সেল করুন। কাজ করার কোনো
                  লিমিট নেই।
                </p>
              </div>
            </motion.div>

            {/* 2. Social Media Tasks - Clean Card with Instagram Gradient Logo */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-panel-dark rounded-3xl p-8 border border-pink-500/20 shadow-lg hover:shadow-pink-500/20 hover:border-pink-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                  {/* Instagram Logo */}
                  <svg viewBox="0 0 24 24" className="w-7 h-7 drop-shadow-md" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="6" stroke="#E1306C" strokeWidth="2" />
                    <circle cx="12" cy="12" r="4.5" stroke="#E1306C" strokeWidth="2" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="#E1306C" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">Social Media Tasks</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  ফেসবুক, ইনস্টাগ্রাম, টুইটার লাইক, ফলো এবং সাবস্ক্রাইবের মতো সহজ মাইক্রো টাস্ক সম্পন্ন
                  করে প্রতিদিন আয় করুন।
                </p>
              </div>
            </motion.div>

            {/* 3. Referral Program - Clean Card with Users Icon */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-panel-dark rounded-3xl p-8 border border-emerald-500/20 shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">Referral Program</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  বন্ধুদের ইনভাইট করুন এবং তাদের কাজের উপর ভিত্তি করে লাইফটাইম এফিলিয়েট কমিশন উপভোগ
                  করুন।
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5. Why Choose Us (The Most Reliable Earning Platform) */}
      <section id="features" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Text & Features */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="lg:col-span-6 space-y-6"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-400 border border-sky-500/30 px-4 py-2 rounded-full text-xs font-bold tracking-widest backdrop-blur-md">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              <span>WHY CHOOSE US</span>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md"
            >
              The Most <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-600">Reliable</span> Earning Platform
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium"
            >
              আমরা দিচ্ছি এমন কিছু অত্যাধুনিক ফিচার যা আপনার আয়ের পথকে করবে আরও সহজ, দ্রুত এবং
              সম্পূর্ণ নিরাপদ।
            </motion.p>

            <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <motion.div
                variants={scaleIn}
                className="glass-panel-dark rounded-2xl p-5 border border-amber-500/20 flex items-start gap-4 shadow-lg hover:border-amber-500/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-inner">
                  <Zap className="w-6 h-6 fill-amber-400 drop-shadow-md" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Fast Payouts</h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">দ্রুত পেমেন্ট সরাসরি অ্যাকাউন্টে।</p>
                </div>
              </motion.div>

              <motion.div
                variants={scaleIn}
                className="glass-panel-dark rounded-2xl p-5 border border-emerald-500/20 flex items-start gap-4 shadow-lg hover:border-emerald-500/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-inner">
                  <ShieldCheck className="w-6 h-6 drop-shadow-md" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">100% Secure</h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">উন্নত সিকিউরিটিতে ডাটা নিরাপদ।</p>
                </div>
              </motion.div>

              <motion.div
                variants={scaleIn}
                className="glass-panel-dark rounded-2xl p-5 border border-sky-500/20 flex items-start gap-4 shadow-lg hover:border-sky-500/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20 shadow-inner">
                  <Headphones className="w-6 h-6 drop-shadow-md" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">24/7 Support</h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">যেকোনো দরকারে লাইভ সাপোর্ট।</p>
                </div>
              </motion.div>

              <motion.div
                variants={scaleIn}
                className="glass-panel-dark rounded-2xl p-5 border border-rose-500/20 flex items-start gap-4 shadow-lg hover:border-rose-500/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20 shadow-inner">
                  <Video className="w-6 h-6 drop-shadow-md" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Video Guides</h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">কাজের নিয়ম বুঝতে সহজ ভিডিও।</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Exact Vector Illustration (Developer presenting UI wireframe board) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="lg:col-span-6 flex justify-center lg:justify-end relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-transparent rounded-full blur-[80px] -z-10" />
            <FeaturesIllustration />
          </motion.div>
        </div>
      </section>

      {/* 6. How It Works (Process Section) */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeInUp}
            className="text-center space-y-3 mb-16"
          >
            <span className="text-xs font-black text-sky-400 tracking-[0.2em] uppercase">
              Process
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-600">Works?</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative"
          >
            {/* Step 1 */}
            <motion.div
              variants={scaleIn}
              className="glass-panel-dark rounded-3xl p-8 border border-sky-500/20 shadow-lg text-center space-y-4 hover:border-sky-500/40 transition-colors relative"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-sky-500/30 border-4 border-[#060b18]">
                1
              </div>
              <div className="pt-4">
                <h3 className="font-bold text-white text-lg tracking-wide">Register</h3>
                <p className="text-slate-400 text-sm leading-relaxed mt-2 font-medium">
                  সঠিক তথ্য দিয়ে খুব সহজেই ফ্রি অ্যাকাউন্ট খুলুন।
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              variants={scaleIn}
              className="glass-panel-dark rounded-3xl p-8 border border-sky-500/20 shadow-lg text-center space-y-4 hover:border-sky-500/40 transition-colors relative mt-8 sm:mt-0"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-sky-500/30 border-4 border-[#060b18]">
                2
              </div>
              <div className="pt-4">
                <h3 className="font-bold text-white text-lg tracking-wide">Select Task</h3>
                <p className="text-slate-400 text-sm leading-relaxed mt-2 font-medium">
                  ড্যাশবোর্ড থেকে জিমেইল বা সোশ্যাল টাস্ক বেছে নিন।
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              variants={scaleIn}
              className="glass-panel-dark rounded-3xl p-8 border border-sky-500/20 shadow-lg text-center space-y-4 hover:border-sky-500/40 transition-colors relative mt-8 lg:mt-0"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-sky-500/30 border-4 border-[#060b18]">
                3
              </div>
              <div className="pt-4">
                <h3 className="font-bold text-white text-lg tracking-wide">Submit Proof</h3>
                <p className="text-slate-400 text-sm leading-relaxed mt-2 font-medium">
                  সঠিকভাবে কাজ শেষ করে নির্দেশিকা অনুযায়ী প্রুফ দিন।
                </p>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              variants={scaleIn}
              className="glass-panel-dark rounded-3xl p-8 border border-sky-500/20 shadow-lg text-center space-y-4 hover:border-sky-500/40 transition-colors relative mt-8 lg:mt-0"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-[#060b18]">
                4
              </div>
              <div className="pt-4">
                <h3 className="font-bold text-emerald-400 text-lg tracking-wide">Get Paid</h3>
                <p className="text-slate-400 text-sm leading-relaxed mt-2 font-medium">
                  কাজ অ্যাপ্রুভ হলেই বিকাশ বা নগদে টাকা নিয়ে নিন।
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 7. What Our Users Say (Testimonials) */}
      <section id="reviews" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={fadeInUp}
          className="text-center space-y-3 mb-16"
        >
          <span className="text-xs font-black text-sky-400 tracking-[0.2em] uppercase">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-600">Users Say</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        >
          {/* Testimonial 1 */}
          <motion.div
            variants={scaleIn}
            className="glass-panel-dark rounded-3xl p-8 border border-sky-500/20 shadow-lg flex flex-col justify-between space-y-6 hover:border-sky-500/40 transition-colors"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed italic font-medium">
                "খুবই ট্রাস্টেড একটি সাইট। আমি গত ২ মাস ধরে জিমেইল সেল দিচ্ছি। পেমেন্ট নিয়ে কোনো ঝামেলা
                নেই, খুব দ্রুত পেমেন্ট করে দেয়।"
              </p>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
              <div className="w-12 h-12 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-inner">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm tracking-wide">Rahim Uddin</h4>
                <p className="text-xs text-slate-400 mt-0.5">Student</p>
              </div>
            </div>
          </motion.div>

          {/* Testimonial 2 */}
          <motion.div
            variants={scaleIn}
            className="glass-panel-dark rounded-3xl p-8 border border-sky-500/20 shadow-lg flex flex-col justify-between space-y-6 hover:border-sky-500/40 transition-colors"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed italic font-medium">
                "সোশ্যাল মিডিয়া টাস্কগুলো করা অনেক সহজ। আমি প্রতিদিন ২-৩ ঘণ্টা সময় দিয়ে ভালো একটা
                অ্যামাউন্ট পকেট মানি বের করতে পারছি।"
              </p>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
              <div className="w-12 h-12 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center shadow-inner">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm tracking-wide">Sumaiya Akter</h4>
                <p className="text-xs text-slate-400 mt-0.5">Freelancer</p>
              </div>
            </div>
          </motion.div>

          {/* Testimonial 3 */}
          <motion.div
            variants={scaleIn}
            className="glass-panel-dark rounded-3xl p-8 border border-sky-500/20 shadow-lg flex flex-col justify-between space-y-6 hover:border-sky-500/40 transition-colors"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed italic font-medium">
                "সাপোর্ট সিস্টেমটা আমার খুব ভালো লেগেছে। কোনো কাজ বুঝতে সমস্যা হলে এডমিনরা টেলিগ্রামে
                খুব দ্রুত রেসপন্স করে বুঝিয়ে দেয়।"
              </p>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm tracking-wide">Abrar Sakib</h4>
                <p className="text-xs text-slate-400 mt-0.5">Part-time Worker</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 8. Frequently Asked Questions (FAQ) */}
      <section id="faq" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left FAQ Info */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeInUp}
            className="lg:col-span-5 space-y-4 text-left"
          >
            <span className="text-xs font-black text-sky-400 tracking-[0.2em] uppercase">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              Frequently Asked <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-600">Questions</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              আপনার মনে থাকা সাধারণ কিছু প্রশ্নের উত্তর এখানে দেওয়া হলো। আরও কিছু জানার থাকলে
              আমাদের সাপোর্টে মেসেজ দিন।
            </p>
            <div className="pt-2">
              <a
                href={settings?.supportTelegram || 'https://t.me/fahimpaybd'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 glass-panel-dark hover:bg-white/10 text-white font-bold text-xs px-6 py-3 rounded-full border border-sky-500/30 shadow-lg shadow-sky-500/10 transition-all cursor-pointer"
              >
                <span>Contact Support</span>
              </a>
            </div>
          </motion.div>

          {/* Right Accordions */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="lg:col-span-7 space-y-3"
          >
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className={`border rounded-2xl overflow-hidden transition-all ${
                    isOpen ? 'glass-panel-dark border-sky-500/40 shadow-lg shadow-sky-500/10' : 'glass-panel-dark border-white/5 hover:border-sky-500/20 shadow-md'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-bold text-white text-sm cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-sky-400 shrink-0 drop-shadow-md" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 9. Call To Action (CTA) Banner */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-sky-900 via-slate-800 to-sky-900 rounded-3xl p-8 sm:p-14 text-center text-white shadow-[0_0_40px_rgba(14,165,233,0.15)] space-y-6 relative overflow-hidden border border-sky-500/30"
        >
          {/* Internal Glow for CTA */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-sky-500/20 blur-[100px] pointer-events-none rounded-full" />
          
          <div className="space-y-4 max-w-2xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
              Ready to Start Earning?
            </h2>
            <p className="text-sky-100 text-sm leading-relaxed font-medium">
              আর দেরি কেন? আজই আমাদের প্ল্যাটফর্মে যুক্ত হোন এবং আপনার স্মার্টফোনেই বানান আয়ের হাতিয়ার।
            </p>
          </div>

          <div className="pt-2 relative z-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('register')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold text-sm px-8 py-4 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all cursor-pointer border border-sky-400/30"
            >
              <span>Join Now For Free</span>
              <Send className="w-5 h-5 drop-shadow-md" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* 10. Footer */}
      <footer className="glass-panel-dark border-t border-sky-500/20 pt-16 pb-8 text-xs text-slate-400 mt-10 relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/5">
            {/* Brand column */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-2">
                <Logo variant="full" size={32} />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-medium">
                বাংলাদেশের সবচেয়ে আধুনিক এবং বিশ্বস্ত মাইক্রো টাস্ক প্ল্যাটফর্ম। ঘরে বসে নিরাপদ আয়ের সেরা মাধ্যম।
              </p>
            </div>

            {/* Quick links */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="font-bold text-white text-sm tracking-wide">Quick Links</h4>
              <ul className="space-y-3 font-medium">
                <li>
                  <button onClick={() => scrollToSection('home')} className="hover:text-sky-400 transition-colors">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('services')} className="hover:text-sky-400 transition-colors">
                    Services
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('login')} className="hover:text-sky-400 transition-colors">
                    Login
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('register')} className="hover:text-sky-400 transition-colors">
                    Register
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="font-bold text-white text-sm tracking-wide">Legal</h4>
              <ul className="space-y-3 font-medium">
                <li>
                  <button onClick={() => onNavigate('terms-and-conditions')} className="hover:text-sky-400 transition-colors">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('privacy-policy')} className="hover:text-sky-400 transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('refund-policy')} className="hover:text-sky-400 transition-colors">
                    Refund Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('faq')} className="hover:text-sky-400 transition-colors">
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Connect With Us */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="font-bold text-white text-sm tracking-wide">Connect With Us</h4>
              <p className="text-xs text-slate-400 font-medium">যেকোনো সাপোর্টের জন্য যুক্ত হোন</p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={settings?.supportTelegram || 'https://t.me/fahimpaybd'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-sky-500 hover:text-white text-sky-400 flex items-center justify-center transition-all border border-white/10 hover:border-sky-400 hover:shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                >
                  <Send className="w-4 h-4" />
                </a>
                <a
                  href={settings?.supportWhatsapp || 'https://wa.me/8801700000000'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-emerald-500 hover:text-white text-emerald-400 flex items-center justify-center transition-all border border-white/10 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white text-blue-400 flex items-center justify-center transition-all border border-white/10 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom copyright line */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 font-medium">
            <p>© {new Date().getFullYear()} {brandName.toUpperCase()}. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Developed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> by <span className="font-bold text-sky-400">Fahim</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
