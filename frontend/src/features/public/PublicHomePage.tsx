import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  PlusCircle,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Camera,
  Workflow,
  BookOpen,
  Repeat
} from 'lucide-react';
import { PriorityBadge } from '../../components/common/Badge';
import { PriorityLevel } from '../../types';

interface HeroSlide {
  id: string;
  bnNumber: string;
  img: string;
  tagBn: string;
  stepBn: string;
  headlineBn: string;
  subtitleBn: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: '01',
    bnNumber: '০১',
    img: '/images/hero_civic_lake.jpg',
    tagBn: '— বাংলাদেশ / সবার শহর, সবার পাশে',
    stepBn: '০১ / আমাদের শহর',
    headlineBn: 'সুন্দর শহরের শুরু আপনার হাতে।',
    subtitleBn: 'আপনার কথা, দায়িত্বপ্রাপ্ত বিভাগ এবং যাচাইকৃত সমাধান—একই জায়গায়।'
  },
  {
    id: '02',
    bnNumber: '০২',
    img: '/images/hero_promenade_night.jpg',
    tagBn: '— বাংলাদেশ / সবার শহর, সবার পাশে',
    stepBn: '০২ / সেবার সংযোগ',
    headlineBn: 'এক অভিযোগ। সমন্বিত সেবা।',
    subtitleBn: 'ময়লা অপসারণ, ড্রেন পরিষ্কার ও সড়ক মেরামত—একাধিক বিভাগের কাজ, এক সমন্বিত কেস।'
  },
  {
    id: '03',
    bnNumber: '০৩',
    img: '/images/hero_civic_desk.jpg',
    tagBn: '— বাংলাদেশ / সবার শহর, সবার পাশে',
    stepBn: '০৩ / সমাধানের নিশ্চয়তা',
    headlineBn: 'সমাধান হোক প্রমাণসহ।',
    subtitleBn: 'সমাধানের প্রমাণ দেখুন। কাজ ঠিক না হলে একই কেসে আবার যাচাইয়ের অনুরোধ করুন।'
  }
];

const RECENT_LIVE_CASES = [
  {
    id: 'NS-2026-W03-1001',
    category: 'drainage',
    categoryBn: 'ড্রেনেজ ও জলাবদ্ধতা',
    titleBn: 'প্রধান সড়কে বর্জ্য জমে ড্রেন ভরাট ও জলাবদ্ধতা সৃষ্টি',
    wardBn: 'ওয়ার্ড ৩ (মিরপুর)',
    priority: 'emergency' as PriorityLevel,
    priorityBn: 'জরুরি',
    status: 'in_progress',
    statusBn: 'সমন্বিত সমাধান চলমান',
    tasksCount: 3,
    activeDept: 'ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ',
    slaRemaining: '২ ঘণ্টা ১৮ মি.',
    prerequisiteNote: 'বর্জ্য অপসারণ সম্পন্ন -> ড্রেন স্লাজ ক্লিনিং চলমান'
  },
  {
    id: 'NS-2026-W12-0842',
    category: 'waste',
    categoryBn: 'কঠিন বর্জ্য ব্যবস্থাপনা',
    titleBn: 'বাজার সংলগ্ন সেকেন্ডারি ট্রান্সফার পয়েন্ট উপচে ময়লা ফেলা',
    wardBn: 'ওয়ার্ড ১২ (ধানমন্ডি)',
    priority: 'high' as PriorityLevel,
    priorityBn: 'উচ্চ অগ্রাধিকার',
    status: 'verified',
    statusBn: 'দপ্তর কর্তৃক গৃহীত',
    tasksCount: 1,
    activeDept: 'বর্জ্য ব্যবস্থাপনা বিভাগ',
    slaRemaining: '৫ ঘণ্টা ৪৫ মি.',
    prerequisiteNote: 'কমপ্যাক্টর ট্রাক নির্ধারিত'
  },
  {
    id: 'NS-2026-W08-0719',
    category: 'roads',
    categoryBn: 'সড়ক ও অবকাঠামো',
    titleBn: 'কালভার্ট সংযোগে গভীর গর্ত ও খোয়া সরে যাওয়া',
    wardBn: 'ওয়ার্ড ৮ (গুলশান)',
    priority: 'medium' as PriorityLevel,
    priorityBn: 'মাঝারি',
    status: 'resolved',
    statusBn: 'সমাধান সম্পন্ন (যাচাইকৃত)',
    tasksCount: 2,
    activeDept: 'সিভিল ও সড়ক সংস্কার বিভাগ',
    slaRemaining: 'সম্পন্ন',
    prerequisiteNote: 'নাগরিক সন্তুষ্টি নিশ্চিতকৃত'
  }
];

const SCOPE_METRICS = [
  { value: '১২+', labelBn: 'সিটি ওয়ার্ড কভারেজ', subBn: 'Active Ward Desks' },
  { value: '৪টি', labelBn: 'সমন্বিত পৌর দপ্তর', subBn: 'Waste, Drain, Roads, Lights' },
  { value: '৯৪.২%', labelBn: 'অন-টাইম সমাধান হার', subBn: 'Strict SLA Compliance' },
  { value: '৮০%', labelBn: 'এআই কনফিডেন্স গেট', subBn: 'Human Verification Fallback' }
];

export const PublicHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [quickWard, setQuickWard] = useState('3');
  const [quickCategory, setQuickCategory] = useState('drainage');
  const [, setSelectedCase] = useState(RECENT_LIVE_CASES[0]);

  // Auto-play carousel
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activeSlide = HERO_SLIDES[currentSlide];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    if (isAuthenticated) {
      navigate('/report', { state: { description: quickInput, wardId: quickWard, category: quickCategory } });
    } else {
      navigate('/login/citizen', {
        state: {
          from: {
            pathname: '/report',
            state: { description: quickInput, wardId: quickWard, category: quickCategory }
          }
        }
      });
    }
  };

  return (
    <div className="space-y-12 lg:space-y-16 animate-in fade-in duration-200 pb-16">
      {/* 1. CINEMATIC EDITORIAL HERO CAROUSEL */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="hero-preserve relative min-h-[580px] sm:min-h-[660px] lg:min-h-[740px] flex flex-col justify-between overflow-hidden border-b border-[var(--line)]"
        aria-label="Hero Carousel"
      >
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            } transition-transform duration-[7000ms]`}
          >
            <img
              src={slide.img}
              alt={slide.headlineBn}
              className="w-full h-full object-cover object-center filter brightness-[0.70] contrast-[1.08]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          </div>
        ))}

        {/* Carousel Content */}
        <div className="relative z-10 max-w-[1540px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="inline-block text-xs font-mono font-bold tracking-widest text-amber-300 bg-black/75 px-3 py-1 rounded-md border border-white/20">
              {activeSlide.tagBn}
            </span>
            <div className="text-xs text-zinc-300 font-mono font-medium">
              {activeSlide.stepBn}
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight max-w-4xl drop-shadow-sm">
              {activeSlide.headlineBn}
            </h1>
            <p className="text-sm sm:text-base text-zinc-200 max-w-2xl leading-relaxed font-medium">
              {activeSlide.subtitleBn}
            </p>
          </div>

          {/* Quick Problem Intake Bar Inside Hero */}
          <div className="mt-8 max-w-3xl">
            <form
              onSubmit={handleQuickSubmit}
              className="bg-black/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                  <span>তাৎক্ষণিক অভিযোগ দাখিল (AI Quick Intake)</span>
                </span>
                <span className="text-[11px] text-zinc-300 font-mono font-bold">ধাপ ১/৩</span>
              </div>

              <input
                type="text"
                value={quickInput}
                onChange={e => setQuickInput(e.target.value)}
                placeholder="সমস্যাটি লিখুন (যেমন: মিরপুর ১০ মেইন রোডে ড্রেন উপচে নোংরা পানি)..."
                className="w-full bg-[#121215] text-white p-3 rounded-lg border border-zinc-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white placeholder-zinc-400 font-medium"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label htmlFor="quick-ward-select" className="block text-[11px] text-zinc-200 mb-1 font-bold">ওয়ার্ড নির্বাচন:</label>
                  <select
                    id="quick-ward-select"
                    value={quickWard}
                    onChange={e => setQuickWard(e.target.value)}
                    className="w-full bg-[#121215] text-white p-2.5 rounded-lg border border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-white font-medium"
                  >
                    <option value="3">ওয়ার্ড ৩ (মিরপুর ১০)</option>
                    <option value="12">ওয়ার্ড ১২ (ধানমন্ডি)</option>
                    <option value="8">ওয়ার্ড ৮ (গুলশান)</option>
                    <option value="19">ওয়ার্ড ১৯ (বনানী)</option>
                    <option value="1">ওয়ার্ড ১ (উত্তরা)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quick-category-select" className="block text-[11px] text-zinc-200 mb-1 font-bold">সমস্যার ধরন:</label>
                  <select
                    id="quick-category-select"
                    value={quickCategory}
                    onChange={e => setQuickCategory(e.target.value)}
                    className="w-full bg-[#121215] text-white p-2.5 rounded-lg border border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-white font-medium"
                  >
                    <option value="drainage">ড্রেনেজ ও জলাবদ্ধতা</option>
                    <option value="waste">কঠিন বর্জ্য অপসারণ</option>
                    <option value="roads">সড়ক ও ফুটপাত সংস্কার</option>
                    <option value="streetlights">সড়ক বাতি মেরামত</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-lg bg-white text-black hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md active:scale-95"
                  >
                    <span>রিপোর্ট শুরু করুন</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. SCOPE & METRICS */}
      <section className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SCOPE_METRICS.map((metric, idx) => (
            <div
              key={idx}
              className="civic-card p-5 text-left hover:border-[var(--ink)] transition-colors shadow-xs"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] font-mono tracking-tight mb-1">
                {metric.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-[var(--ink)]">
                {metric.labelBn}
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-0.5">
                {metric.subBn}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CORE ARCHITECTURAL PILLARS */}
      <section className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-left space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted)]">
            CORE ARCHITECTURE · মূল ভিত্তি
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
            এক নাগরিক অভিযোগ · বহু বিভাগের সমন্বিত কাজ
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
            একই স্থানে ড্রেন আটকে রাস্তা ভাঙলে নাগরিককে একাধিক দপ্তরে ঘুরতে হবে না। একটি কেসের অধীনে বর্জ্য, ড্রেনেজ ও সড়ক বিভাগ সমন্বিতভাবে কাজ সম্পন্ন করে।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="civic-card p-5 space-y-3">
            <div className="w-8 h-8 rounded-md bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center font-mono font-bold text-xs">
              01
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)]">
              স্বয়ংক্রিয় দায়িত্ব বণ্টন ও কনফিডেন্স গেট
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              নাগরিকের বিবরণ ও জিপিএস অবস্থান বিশ্লেষণ করে পৌর নীতিমালা অনুযায়ী দায়িত্বপ্রাপ্ত দপ্তর নির্ধারণ। ৮০% কনফিডেন্সের নিচে নামলে সরাসরি মানবীয় পর্যালোচনায় প্রেরণ।
            </p>
          </div>

          <div className="civic-card p-5 space-y-3">
            <div className="w-8 h-8 rounded-md bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center font-mono font-bold text-xs">
              02
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)]">
              ধাপভিত্তিক টাস্ক সিকোয়েন্সিং (Waste &rarr; Drain &rarr; Road)
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              বর্জ্য অপসারণ না করে ড্রেন পরিষ্কার করা যাবে না, এবং ড্রেন মেরামত না করে সড়ক সংস্কার অসম্ভব। সিস্টেম স্বয়ংক্রিয়ভাবে যৌক্তিক পূর্বশর্ত বজায় রাখে।
            </p>
          </div>

          <div className="civic-card p-5 space-y-3">
            <div className="w-8 h-8 rounded-md bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center font-mono font-bold text-xs">
              03
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)]">
              প্রমাণ যাচাই ও নাগরিকের আপিল অধিকার
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              কর্মকর্তা কাজের পূর্বের ও পরের ছবি আপলোড করতে বাধ্য। সমাধান সন্তোষজনক না হলে নাগরিক “কাজটি সমাধান হয়নি” বাটনে ক্লিক করে একই কেস পুনরায় চালু করতে পারেন।
            </p>
          </div>
        </div>
      </section>

      {/* 4. LIVE INCIDENT RADAR & MAP ACCESS */}
      <section className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--line)]">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[var(--muted)] uppercase">
              LIVE MONITORING · সরাসরি ট্র্যাকিং
            </span>
            <h2 className="text-xl font-bold text-[var(--ink)]">
              লাইভ কেস রাডার ও সিভিক ম্যাপ ভিউ
            </h2>
          </div>
          <Link
            to="/map"
            className="civic-btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto"
          >
            <MapPin className="w-3.5 h-3.5 text-[var(--muted)]" aria-hidden="true" />
            <span>সম্পূর্ণ ম্যাপ ওপেন করুন</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RECENT_LIVE_CASES.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedCase(item)}
              className="civic-card p-4 hover:border-[var(--ink)] transition cursor-pointer space-y-2.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--muted)]">#{item.id}</span>
                <PriorityBadge priority={item.priority} />
              </div>
              <h4 className="text-xs font-bold text-[var(--ink)] line-clamp-2">
                {item.titleBn}
              </h4>
              <div className="text-[11px] text-[var(--muted)] flex items-center justify-between pt-2 border-t border-[var(--line-subtle)]">
                <span>{item.wardBn}</span>
                <span className="font-semibold text-[var(--ink)]">{item.slaRemaining}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PLATFORM FACILITIES */}
      <section className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-left space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted)]">
            CITIZEN BENEFITS & FACILITIES · নাগরিক সুবিধা
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">
            নাগরিক সাথী এআই প্ল্যাটফর্মের প্রধান সুবিধাসমূহ
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
            সরকারি অফিসে দৌড়াদৌড়ি দূর করে কৃত্রিম বুদ্ধিমত্তা ও জবাবদিহিতামূলক প্রক্রিয়ায় নাগরিক সমস্যার দ্রুততম সমাধান।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="civic-card p-5 hover:border-[var(--ink)] transition space-y-2.5">
            <div className="w-8 h-8 rounded-md bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center">
              <Camera className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)]">ছবি ও ভয়েস নোট দিয়ে সহজ রিপোর্ট</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              মোবাইল ক্যামেরা দিয়ে ছবি তুলে অথবা সাধারণ বাংলায় ভয়েস রেকর্ড করে সমস্যা জানান। কোনো জটিল ফর্মের ঝামেলা নেই।
            </p>
          </div>

          <div className="civic-card p-5 hover:border-[var(--ink)] transition space-y-2.5">
            <div className="w-8 h-8 rounded-md bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)]">এআই স্বয়ংক্রিয় বিভাগ ও ওয়ার্ড নির্ধারণ</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              কোন দপ্তরে অভিযোগ দেবেন তা জানা না থাকলেও এআই বিবরণ ও জিপিএস বিশ্লেষণ করে সরাসরি দায়িত্ব অর্পণ করে।
            </p>
          </div>

          <div className="civic-card p-5 hover:border-[var(--ink)] transition space-y-2.5">
            <div className="w-8 h-8 rounded-md bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center">
              <Workflow className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)]">বহু-বিভাগীয় সমন্বিত সমাধান</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              একই স্থানে ড্রেন আটকে রাস্তা ভাঙলে পৃথক অভিযোগ নয়। এক কেসের অধীনেই বর্জ্য, ড্রেন ও রাস্তা সংস্কার শেষ হয়।
            </p>
          </div>

          <div className="civic-card p-5 hover:border-[var(--ink)] transition space-y-2.5">
            <div className="w-8 h-8 rounded-md bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center">
              <Clock className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)]">জরুরি এসএলএ গ্যারান্টি ও ট্র্যাকিং</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              জরুরি জননিরাপত্তা ঝুঁকিতে ২ ঘণ্টার মধ্যে ফিল্ড রেসপন্স টিম উপস্থিত হয়। সাধারণ কাজে ২৪ থেকে ৪৮ ঘণ্টার সমাধান লক্ষ্যমাত্রা।
            </p>
          </div>

          <div className="civic-card p-5 hover:border-[var(--ink)] transition space-y-2.5">
            <div className="w-8 h-8 rounded-md bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)]">কাজের সত্যতা ও জিপিএস সমাধান প্রমাণ</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              মাঠ কর্মকর্তা কাজের আগের ও পরের ছবি জিপিএস অবস্থানসহ আপলোড করতে বাধ্য। কোনো ভুয়া সমাধান দেখানো সম্ভব নয়।
            </p>
          </div>

          <div className="civic-card p-5 hover:border-[var(--ink)] transition space-y-2.5">
            <div className="w-8 h-8 rounded-md bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center">
              <Repeat className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)]">নাগরিকের আপত্তির পূর্ণ ক্ষমতা</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              কাজ ঠিকমতো না হলে নাগরিক “কাজটি সমাধান হয়নি” বাটনে ক্লিক করে আপত্তি দাখিল করতে পারেন। কেসটি পুনরায় তদন্তে যায়।
            </p>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED SERVICES LIST */}
      <section className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2 border-b border-[var(--line)]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted)]">
              OFFICIAL SERVICE CHARTER · সেবা সহায়িকা
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)]">
              সিটি কর্পোরেশনের সকল নাগরিক সেবাসমূহ
            </h2>
          </div>
          <Link
            to="/services"
            className="civic-btn-secondary text-xs py-1.5 px-3 self-start md:self-auto"
          >
            <BookOpen className="w-3.5 h-3.5 text-[var(--muted)]" aria-hidden="true" />
            <span>সকল সেবা ও ফি তালিকা</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="civic-card p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[var(--muted)] bg-[var(--paper-elevated)] px-2 py-0.5 rounded border border-[var(--line)]">
                TRD-01 · বাণিজ্য
              </span>
              <h3 className="text-sm font-bold text-[var(--ink)]">ই-ট্রেড লাইসেন্স ইস্যু ও নবায়ন</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                দোকান বা ব্যবসা প্রতিষ্ঠানের নতুন ডিজিটাল ট্রেড লাইসেন্স গ্রহণ ও বাৎসরিক নবায়ন আবেদন।
              </p>
            </div>
            <Link
              to="/services/srv_01"
              className="inline-flex items-center justify-between text-xs font-semibold text-[var(--ink)] hover:underline pt-2.5 border-t border-[var(--line-subtle)]"
            >
              <span>প্রয়োজনীয় কাগজপত্র ও ফি</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="civic-card p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[var(--muted)] bg-[var(--paper-elevated)] px-2 py-0.5 rounded border border-[var(--line)]">
                BRG-02 · নাগরিক সনদ
              </span>
              <h3 className="text-sm font-bold text-[var(--ink)]">অনলাইন জন্ম নিবন্ধন ও সংশোধন</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                নবজাতকের জন্ম নিবন্ধন, বয়স বা নামের ভুল সংশোধন এবং ১৭ ডিজিটের অনলাইন ডিজিটাল সনদ গ্রহণ।
              </p>
            </div>
            <Link
              to="/services/srv_02"
              className="inline-flex items-center justify-between text-xs font-semibold text-[var(--ink)] hover:underline pt-2.5 border-t border-[var(--line-subtle)]"
            >
              <span>প্রয়োজনীয় কাগজপত্র ও ফি</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="civic-card p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[var(--muted)] bg-[var(--paper-elevated)] px-2 py-0.5 rounded border border-[var(--line)]">
                HLD-03 · রাজস্ব
              </span>
              <h3 className="text-sm font-bold text-[var(--ink)]">হোল্ডিং ট্যাক্স ও অনলাইন ই-পেমেন্ট</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                সিটি কর্পোরেশনের বাড়ি বা ফ্ল্যাটের বাৎসরিক পৌর কর অ্যাসেসমেন্ট এবং বিকাশ/কার্ডে সরাসরি পরিশোধ।
              </p>
            </div>
            <Link
              to="/services/srv_03"
              className="inline-flex items-center justify-between text-xs font-semibold text-[var(--ink)] hover:underline pt-2.5 border-t border-[var(--line-subtle)]"
            >
              <span>প্রয়োজনীয় কাগজপত্র ও ফি</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM ACTION CALLOUT */}
      <section className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl p-6 sm:p-8 bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5 max-w-2xl text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted)] font-bold">
              GET INVOLVED · অংশ নিন
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
              আপনার এলাকার নাগরিক সমস্যা সমাধানে অংশ নিন
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              রাস্তা ভাঙা, ড্রেনে জলাবদ্ধতা কিংবা সড়ক বাতি নষ্ট? এখনই নাগরিক সাথী এআই-তে রিপোর্ট করুন এবং লাইভ অগ্রগতি পর্যবেক্ষণ করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to={isAuthenticated ? '/report' : '/login/citizen'}
              state={!isAuthenticated ? { from: { pathname: '/report' } } : undefined}
              className="civic-btn-primary text-xs py-2 px-4 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" aria-hidden="true" />
              <span>সমস্যা রিপোর্ট করুন</span>
            </Link>
            <Link
              to="/services"
              className="civic-btn-secondary text-xs py-2 px-4 shadow-xs"
            >
              <span>সেবা নির্দেশিকা দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
