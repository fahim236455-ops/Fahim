import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/Logo';
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
  const { settings } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
    <div className="min-h-screen bg-white text-slate-800 font-['Hind_Siliguri',sans-serif] selection:bg-sky-500 selection:text-white overflow-x-hidden">
      {/* 1. Header / Navbar */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all"
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
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              onClick={() => scrollToSection('home')}
              className="hover:text-sky-600 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="hover:text-sky-600 transition-colors cursor-pointer"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-sky-600 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('reviews')}
              className="hover:text-sky-600 transition-colors cursor-pointer"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-sky-600 transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-4">
            <button
              onClick={() => onNavigate('login')}
              className="text-sm font-bold text-slate-700 hover:text-sky-600 px-3 py-2 transition-colors cursor-pointer"
            >
              Log in
            </button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate('register')}
              className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-md shadow-sky-500/25 transition-all cursor-pointer"
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => onNavigate('login')}
              className="text-xs font-bold text-slate-700 px-2 py-1.5"
            >
              Log in
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
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
            className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg"
          >
            <button
              onClick={() => scrollToSection('home')}
              className="block w-full text-left py-2 text-slate-700 font-semibold text-sm hover:text-sky-600"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="block w-full text-left py-2 text-slate-700 font-semibold text-sm hover:text-sky-600"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-2 text-slate-700 font-semibold text-sm hover:text-sky-600"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('reviews')}
              className="block w-full text-left py-2 text-slate-700 font-semibold text-sm hover:text-sky-600"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left py-2 text-slate-700 font-semibold text-sm hover:text-sky-600"
            >
              FAQ
            </button>
            <div className="pt-3 flex flex-col gap-2">
              <button
                onClick={() => onNavigate('register')}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 rounded-full text-center text-sm shadow-md"
              >
                Get Started (রেজিস্টার)
              </button>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* 2. Hero Section */}
      <section id="home" className="pt-10 sm:pt-16 pb-14 sm:pb-20 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 border border-sky-200/70 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Trusted Digital Earning Platform</span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-[56px] font-black text-slate-900 tracking-tight leading-[1.15]"
              >
                {heroHeadline}
              </motion.h1>

              {/* Description in Bengali */}
              <motion.p
                variants={fadeInUp}
                className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl font-normal"
              >
                {heroDescription}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onNavigate('register')}
                  className="inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-full shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
                >
                  <span>Start Earning Now</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onNavigate('login')}
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base px-6 py-3.5 rounded-full border border-slate-200 shadow-sm transition-all cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-500" />
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
              className="lg:col-span-6 flex justify-center lg:justify-end"
            >
              <HeroIllustration />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Stats Counter Banner */}
      <section className="pb-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          <motion.div
            variants={scaleIn}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm text-center"
          >
            <h3 className="text-2xl sm:text-3xl font-black text-sky-500">20K+</h3>
            <p className="text-xs font-bold text-slate-500 tracking-wider mt-1 uppercase">
              Active Earners
            </p>
          </motion.div>

          <motion.div
            variants={scaleIn}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm text-center"
          >
            <h3 className="text-2xl sm:text-3xl font-black text-sky-500">1M+</h3>
            <p className="text-xs font-bold text-slate-500 tracking-wider mt-1 uppercase">
              Total Payout (BDT)
            </p>
          </motion.div>

          <motion.div
            variants={scaleIn}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm text-center"
          >
            <h3 className="text-2xl sm:text-3xl font-black text-sky-500">24/7</h3>
            <p className="text-xs font-bold text-slate-500 tracking-wider mt-1 uppercase">
              Live Support
            </p>
          </motion.div>

          <motion.div
            variants={scaleIn}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm text-center"
          >
            <h3 className="text-2xl sm:text-3xl font-black text-sky-500">100%</h3>
            <p className="text-xs font-bold text-slate-500 tracking-wider mt-1 uppercase">
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
          className="mt-10 text-center space-y-3"
        >
          <p className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-widest uppercase">
            Supported Payment Methods
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {/* bKash */}
            <div className="flex items-center gap-2 font-bold text-slate-700 text-sm hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                <path d="M4 4L12 12L20 4M4 20L12 12L20 20" stroke="#E2136E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>bKash</span>
            </div>
            {/* Nagad */}
            <div className="flex items-center gap-2 font-bold text-slate-700 text-sm hover:scale-105 transition-transform">
              <div className="w-3.5 h-3.5 rounded bg-[#F7941D]" />
              <span>Nagad</span>
            </div>
            {/* Rocket */}
            <div className="flex items-center gap-2 font-bold text-slate-700 text-sm hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#00A19D]" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5l5.5 3.5-5.5 3.5-5.5-3.5L12 4.5z" />
              </svg>
              <span>Rocket</span>
            </div>
            {/* Upay */}
            <div className="flex items-center gap-2 font-bold text-slate-700 text-sm hover:scale-105 transition-transform">
              <div className="w-3.5 h-3.5 rounded-full bg-[#00A19D]" />
              <span>Upay</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. Our Premium Services */}
      <section id="services" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeInUp}
            className="text-center space-y-2 mb-12"
          >
            <span className="text-xs font-extrabold text-sky-600 tracking-widest uppercase">
              What We Offer
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our Premium <span className="text-sky-500">Services</span>
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
              className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shadow-sm">
                  {/* Google G Logo */}
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
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
                <h3 className="text-xl font-bold text-slate-900">Gmail Account Sales</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  নতুন জিমেইল অ্যাকাউন্ট তৈরি করে আমাদের কাছে পাইকারি রেটে সেল করুন। কাজ করার কোনো
                  লিমিট নেই।
                </p>
              </div>
            </motion.div>

            {/* 2. Social Media Tasks - Clean Card with Instagram Gradient Logo */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center shadow-sm">
                  {/* Instagram Logo */}
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="6" stroke="#E1306C" strokeWidth="2" />
                    <circle cx="12" cy="12" r="4.5" stroke="#E1306C" strokeWidth="2" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="#E1306C" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Social Media Tasks</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  ফেসবুক, ইনস্টাগ্রাম, টুইটার লাইক, ফলো এবং সাবস্ক্রাইবের মতো সহজ মাইক্রো টাস্ক সম্পন্ন
                  করে প্রতিদিন আয় করুন।
                </p>
              </div>
            </motion.div>

            {/* 3. Referral Program - Clean Card with Users Icon */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Referral Program</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  বন্ধুদের ইনভাইট করুন এবং তাদের কাজের উপর ভিত্তি করে লাইফটাইম এফিলিয়েট কমিশন উপভোগ
                  করুন।
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5. Why Choose Us (The Most Reliable Earning Platform) */}
      <section id="features" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text & Features */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="lg:col-span-6 space-y-6"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200/80 px-3 py-1 rounded-full text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />
              <span>WHY CHOOSE US</span>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight"
            >
              The Most <span className="text-sky-500">Reliable</span> Earning Platform
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-slate-600 text-sm sm:text-base leading-relaxed"
            >
              আমরা দিচ্ছি এমন কিছু অত্যাধুনিক ফিচার যা আপনার আয়ের পথকে করবে আরও সহজ, দ্রুত এবং
              সম্পূর্ণ নিরাপদ।
            </motion.p>

            <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <motion.div
                variants={scaleIn}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex items-start gap-3.5 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 fill-amber-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Fast Payouts</h4>
                  <p className="text-xs text-slate-500 mt-0.5">দ্রুত পেমেন্ট সরাসরি অ্যাকাউন্টে।</p>
                </div>
              </motion.div>

              <motion.div
                variants={scaleIn}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex items-start gap-3.5 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">100% Secure</h4>
                  <p className="text-xs text-slate-500 mt-0.5">উন্নত সিকিউরিটিতে ডাটা নিরাপদ।</p>
                </div>
              </motion.div>

              <motion.div
                variants={scaleIn}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex items-start gap-3.5 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">24/7 Support</h4>
                  <p className="text-xs text-slate-500 mt-0.5">যেকোনো দরকারে লাইভ সাপোর্ট।</p>
                </div>
              </motion.div>

              <motion.div
                variants={scaleIn}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex items-start gap-3.5 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Video Guides</h4>
                  <p className="text-xs text-slate-500 mt-0.5">কাজের নিয়ম বুঝতে সহজ ভিডিও।</p>
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
            className="lg:col-span-6 flex justify-center lg:justify-end"
          >
            <FeaturesIllustration />
          </motion.div>
        </div>
      </section>

      {/* 6. How It Works (Process Section) */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeInUp}
            className="text-center space-y-2 mb-14"
          >
            <span className="text-xs font-extrabold text-sky-600 tracking-widest uppercase">
              Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How It <span className="text-sky-500">Works?</span>
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
              className="text-center space-y-3 p-4"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-sky-500 text-white font-black text-lg flex items-center justify-center shadow-md shadow-sky-500/20">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base">Register</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                সঠিক তথ্য দিয়ে খুব সহজেই ফ্রি অ্যাকাউন্ট খুলুন।
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              variants={scaleIn}
              className="text-center space-y-3 p-4"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-sky-500 text-white font-black text-lg flex items-center justify-center shadow-md shadow-sky-500/20">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base">Select Task</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                ড্যাশবোর্ড থেকে জিমেইল বা সোশ্যাল টাস্ক বেছে নিন।
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              variants={scaleIn}
              className="text-center space-y-3 p-4"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-sky-500 text-white font-black text-lg flex items-center justify-center shadow-md shadow-sky-500/20">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base">Submit Proof</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                সঠিকভাবে কাজ শেষ করে নির্দেশিকা অনুযায়ী প্রুফ দিন।
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              variants={scaleIn}
              className="text-center space-y-3 p-4"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-sky-500 text-white font-black text-lg flex items-center justify-center shadow-md shadow-sky-500/20">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-base">Get Paid</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                কাজ অ্যাপ্রুভ হলেই বিকাশ বা নগদে টাকা নিয়ে নিন।
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 7. What Our Users Say (Testimonials) */}
      <section id="reviews" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={fadeInUp}
          className="text-center space-y-2 mb-14"
        >
          <span className="text-xs font-extrabold text-sky-600 tracking-widest uppercase">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            What Our <span className="text-sky-500">Users Say</span>
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
            className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed italic">
                "খুবই ট্রাস্টেড একটি সাইট। আমি গত ২ মাস ধরে জিমেইল সেল দিচ্ছি। পেমেন্ট নিয়ে কোনো ঝামেলা
                নেই, খুব দ্রুত পেমেন্ট করে দেয়।"
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Rahim Uddin</h4>
                <p className="text-xs text-slate-400">Student</p>
              </div>
            </div>
          </motion.div>

          {/* Testimonial 2 */}
          <motion.div
            variants={scaleIn}
            className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed italic">
                "সোশ্যাল মিডিয়া টাস্কগুলো করা অনেক সহজ। আমি প্রতিদিন ২-৩ ঘণ্টা সময় দিয়ে ভালো একটা
                অ্যামাউন্ট পকেট মানি বের করতে পারছি।"
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Sumaiya Akter</h4>
                <p className="text-xs text-slate-400">Freelancer</p>
              </div>
            </div>
          </motion.div>

          {/* Testimonial 3 */}
          <motion.div
            variants={scaleIn}
            className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed italic">
                "সাপোর্ট সিস্টেমটা আমার খুব ভালো লেগেছে। কোনো কাজ বুঝতে সমস্যা হলে এডমিনরা টেলিগ্রামে
                খুব দ্রুত রেসপন্স করে বুঝিয়ে দেয়।"
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Abrar Sakib</h4>
                <p className="text-xs text-slate-400">Part-time Worker</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 8. Frequently Asked Questions (FAQ) */}
      <section id="faq" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left FAQ Info */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeInUp}
            className="lg:col-span-5 space-y-4 text-left"
          >
            <span className="text-xs font-extrabold text-sky-600 tracking-widest uppercase">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Frequently Asked <br />
              <span className="text-sky-500">Questions</span>
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              আপনার মনে থাকা সাধারণ কিছু প্রশ্নের উত্তর এখানে দেওয়া হলো। আরও কিছু জানার থাকলে
              আমাদের সাপোর্টে মেসেজ দিন।
            </p>
            <div className="pt-2">
              <a
                href={settings?.supportTelegram || 'https://t.me/fahimpaybd'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-full border border-slate-200 shadow-sm transition-all"
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
                    isOpen ? 'bg-sky-50/70 border-sky-200' : 'bg-white border-slate-200/80'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-bold text-slate-900 text-sm cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-sky-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
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
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-sky-900 via-sky-800 to-sky-900 rounded-3xl p-8 sm:p-14 text-center text-white shadow-xl space-y-6 relative overflow-hidden"
        >
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Start Earning?
            </h2>
            <p className="text-sky-100 text-xs sm:text-sm leading-relaxed">
              আর দেরি কেন? আজই আমাদের প্ল্যাটফর্মে যুক্ত হোন এবং আপনার স্মার্টফোনেই বানান আয়ের হাতিয়ার।
            </p>
          </div>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('register')}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-sky-800 font-bold text-sm px-8 py-3.5 rounded-full shadow-lg transition-all cursor-pointer"
            >
              <span>Join Now For Free</span>
              <Send className="w-4 h-4 text-sky-600" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-white border-t border-slate-100 pt-14 pb-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-100">
            {/* Brand column */}
            <div className="md:col-span-4 space-y-3">
              <div className="flex items-center gap-2">
                <Logo variant="full" size={32} />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                বাংলাদেশের সবচেয়ে আধুনিক এবং বিশ্বস্ত মাইক্রো টাস্ক প্ল্যাটফর্ম। ঘরে বসে নিরাপদ আয়ের সেরা মাধ্যম।
              </p>
            </div>

            {/* Quick links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollToSection('home')} className="hover:text-sky-600">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('services')} className="hover:text-sky-600">
                    Services
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('login')} className="hover:text-sky-600">
                    Login
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('register')} className="hover:text-sky-600">
                    Register
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => onNavigate('dashboard')} className="hover:text-sky-600">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('dashboard')} className="hover:text-sky-600">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('dashboard')} className="hover:text-sky-600">
                    Refund Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('faq')} className="hover:text-sky-600">
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Connect With Us */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Connect With Us</h4>
              <p className="text-xs text-slate-500">যেকোনো সাপোর্টের জন্য যুক্ত হোন</p>
              <div className="flex items-center gap-3 pt-1">
                <a
                  href={settings?.supportTelegram || 'https://t.me/fahimpaybd'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-sky-500 hover:text-white text-slate-600 flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4" />
                </a>
                <a
                  href={settings?.supportWhatsapp || 'https://wa.me/8801700000000'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-600 flex items-center justify-center transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom copyright line */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
            <p>© {new Date().getFullYear()} {brandName.toUpperCase()}. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Developed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> by <span className="font-bold text-slate-600">AKASH</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
