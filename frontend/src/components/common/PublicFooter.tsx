import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  PhoneCall,
  ExternalLink,
  ArrowRight,
  HeartPulse,
  Landmark,
  ShieldAlert
} from 'lucide-react';
import { APP_NAME_BN } from '../../constants';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-[var(--paper)] text-[var(--ink)] border-t border-[var(--line)] transition-colors duration-150">
      {/* Sleek Emergency Hotline Bar */}
      <div className="border-b border-[var(--line)] bg-[var(--paper-elevated)] py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1540px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[var(--status-emergency)] font-bold">
            <span className="flex h-2 w-2 relative" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--status-emergency)]"></span>
            </span>
            <span className="uppercase tracking-wider text-[11px]">জরুরি জাতীয় হটলাইন ও তাৎক্ষণিক সহায়তা:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            <a
              href="tel:999"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--status-emergency-bg)] text-[var(--status-emergency)] border border-[var(--status-emergency-border)] font-bold text-xs hover:opacity-90 transition"
              title="জাতীয় জরুরি সেবা (পুলিশ, অ্যাম্বুলেন্স, ফায়ার সার্ভিস)"
            >
              <PhoneCall className="w-3 h-3" aria-hidden="true" />
              <span>৯৯৯</span>
              <span className="text-[10px] opacity-75 font-normal hidden sm:inline">(জরুরি সেবা)</span>
            </a>

            <a
              href="tel:333"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--ink)] font-bold text-xs transition"
              title="সরকারি তথ্য ও নাগরিক সেবা কল সেন্টার"
            >
              <Landmark className="w-3 h-3 text-[var(--muted)]" aria-hidden="true" />
              <span>৩৩৩</span>
              <span className="text-[10px] opacity-75 font-normal hidden sm:inline">(নাগরিক সেবা)</span>
            </a>

            <a
              href="tel:16106"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--ink)] font-bold text-xs transition"
              title="পৌর ও সিটি কর্পোরেশন নাগরিক সহায়তা"
            >
              <PhoneCall className="w-3 h-3 text-[var(--muted)]" aria-hidden="true" />
              <span>১৬১০৬</span>
              <span className="text-[10px] opacity-75 font-normal hidden sm:inline">(পৌর সহায়তা)</span>
            </a>

            <a
              href="tel:16263"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--ink)] font-bold text-xs transition"
              title="স্বাস্থ্য বাতায়ন ২৪/৭"
            >
              <HeartPulse className="w-3 h-3 text-[var(--muted)]" aria-hidden="true" />
              <span>১৬২৬৩</span>
              <span className="text-[10px] opacity-75 font-normal hidden sm:inline">(স্বাস্থ্য বাতায়ন)</span>
            </a>

            <a
              href="tel:109"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--ink)] font-bold text-xs transition"
              title="নারী ও শিশু নির্যাতন প্রতিরোধ হেল্পলাইন"
            >
              <ShieldAlert className="w-3 h-3 text-[var(--muted)]" aria-hidden="true" />
              <span>১০৯</span>
              <span className="text-[10px] opacity-75 font-normal hidden sm:inline">(নারী ও শিশু)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-9">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand & Principles */}
          <div className="md:col-span-4 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2 group" aria-label="Nagorik Sathi AI Home">
              <div className="w-7 h-7 rounded-md bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center shadow-xs">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs tracking-wider uppercase text-[var(--ink)] leading-none">
                  NAGORIK SATHI <span className="font-extrabold">AI</span>
                </span>
                <span className="text-[10px] font-medium text-[var(--muted)] mt-0.5">
                  {APP_NAME_BN}
                </span>
              </div>
            </Link>

            <p className="text-xs text-[var(--muted)] leading-relaxed max-w-sm">
              সিটি কর্পোরেশন এলাকার নাগরিক সমস্যা দ্রুত নিরসন ও বহু-বিভাগীয় টাস্ক সমন্বয়ে কৃত্রিম বুদ্ধিমত্তা-সহায়তাপ্রাপ্ত সরকারি প্ল্যাটফর্ম।
            </p>

            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-[var(--ink)] bg-[var(--paper-elevated)] border border-[var(--line)] rounded-md px-2.5 py-1 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--status-low)] shrink-0" aria-hidden="true" />
              <span>নীতিমালা: “AI proposes, People decide.”</span>
            </div>
          </div>

          {/* Quick Citizen Services */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
              নাগরিক সেবা
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/report" className="text-[var(--muted)] hover:text-[var(--ink)] transition flex items-center gap-1.5 font-medium">
                  <ArrowRight className="w-3 h-3 text-[var(--muted)]" aria-hidden="true" />
                  <span>সমস্যা রিপোর্ট করুন</span>
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-[var(--muted)] hover:text-[var(--ink)] transition flex items-center gap-1.5 font-medium">
                  <ArrowRight className="w-3 h-3 text-[var(--muted)]" aria-hidden="true" />
                  <span>লাইভ সিটি মানচিত্র</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-[var(--muted)] hover:text-[var(--ink)] transition flex items-center gap-1.5 font-medium">
                  <ArrowRight className="w-3 h-3 text-[var(--muted)]" aria-hidden="true" />
                  <span>সেবা নির্দেশিকা ও নলেজবেস</span>
                </Link>
              </li>
              <li>
                <Link to="/transparency" className="text-[var(--muted)] hover:text-[var(--ink)] transition flex items-center gap-1.5 font-medium">
                  <ArrowRight className="w-3 h-3 text-[var(--muted)]" aria-hidden="true" />
                  <span>পাবলিক স্বচ্ছতা ড্যাশবোর্ড</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency & Gov Portals */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider flex items-center gap-1.5">
              <span>জরুরি সরকারি পোর্টাল</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://bangladesh.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-[var(--ink)] transition flex items-center gap-1.5 font-medium"
                >
                  <ExternalLink className="w-3 h-3 text-[var(--muted)]" aria-hidden="true" />
                  <span>বাংলাদেশ জাতীয় তথ্য বাতায়ন</span>
                </a>
              </li>
              <li>
                <a
                  href="https://modmr.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-[var(--ink)] transition flex items-center gap-1.5 font-medium"
                >
                  <ExternalLink className="w-3 h-3 text-[var(--muted)]" aria-hidden="true" />
                  <span>দুর্যোগ ব্যবস্থাপনা ও ত্রাণ মন্ত্রণালয়</span>
                </a>
              </li>
              <li>
                <a
                  href="https://fireservice.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-[var(--ink)] transition flex items-center gap-1.5 font-medium"
                >
                  <ExternalLink className="w-3 h-3 text-[var(--muted)]" aria-hidden="true" />
                  <span>ফায়ার সার্ভিস ও সিভিল ডিফেন্স</span>
                </a>
              </li>
              <li>
                <a
                  href="https://lgd.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-[var(--ink)] transition flex items-center gap-1.5 font-medium"
                >
                  <ExternalLink className="w-3 h-3 text-[var(--muted)]" aria-hidden="true" />
                  <span>স্থানীয় সরকার বিভাগ (LGD)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Operational Roles */}
          <div className="md:col-span-2 space-y-2.5">
            <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
              দাপ্তরিক ওয়ার্কস্পেস
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/login/ward" className="text-[var(--muted)] hover:text-[var(--ink)] transition">
                  ওয়ার্ড ডেস্ক কমান্ড
                </Link>
              </li>
              <li>
                <Link to="/login/officer" className="text-[var(--muted)] hover:text-[var(--ink)] transition">
                  দপ্তর কর্মকর্তা
                </Link>
              </li>
              <li>
                <Link to="/login/coordinator" className="text-[var(--muted)] hover:text-[var(--ink)] transition">
                  কেস কোঅর্ডিনেটর
                </Link>
              </li>
              <li>
                <Link to="/login/admin" className="text-[var(--muted)] hover:text-[var(--ink)] transition">
                  সিস্টেম অডিট ও গভর্ন্যান্স
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Compact Metadata & Copyright */}
        <div className="border-t border-[var(--line)] mt-7 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[var(--muted)]">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span>গণপ্রজাতন্ত্রী বাংলাদেশ · সিভিক সার্ভিস আরএন্ডডি v1.2</span>
            <span>•</span>
            <span className="font-mono">SHA-256 ইমিউটেবল অডিট সিকিউরড</span>
          </div>
          <div>
            <span>© ২০২৬ নাগরিক সাথী এআই · সর্বস্বত্ব সংরক্ষিত</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
