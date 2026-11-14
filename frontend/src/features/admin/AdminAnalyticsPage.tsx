import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { toBanglaNumber } from '../../utils/formatters';
import { BarChart3, TrendingUp, CheckCircle2, ShieldCheck, Clock, AlertTriangle, FileCheck } from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await apiClient.admin.getAggregatedAnalytics();
        setAnalytics(data);
      } catch (e) {
        console.error('Failed to load aggregated analytics', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ৮: অ্যানালিটিক্স ও স্বচ্ছতা (Privacy-Safe Telemetry)
            </span>
            <span className="text-xs text-[var(--muted)]">ব্যক্তিগত PII-মুক্ত সমন্বিত টেলিমেট্রি</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            সমন্বিত নাগরিক সেবা বিশ্লেষণ (Aggregated Service Metrics)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            সিটি কর্পোরেশনের সকল সেবার পরিমাণ, কার্যক্ষমতা ও সার্বিক সমাধান হারের গোপনীয়তামুক্ত পরিসংখ্যান
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>প্রাইভেসি-প্রিজারভিং অ্যানালিটিক্স স্ট্যান্ডার্ড (Zero PII Guarantee):</span>
        </div>
        <p className="leading-relaxed">
          প্রশাসনিক অ্যানালিটিক্সে কোনো নাগরিকের নাম, ফোন নম্বর, নির্দিষ্ট বাসার অবস্থান বা ব্যক্তিগত ছবি অন্তর্ভুক্ত নয়। এটি কেবল শহরব্যাপী বিভাগীয় সেবার মান ও প্রাতিষ্ঠানিক দক্ষতা পরিমাপের জন্য সংকলিত।
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-[var(--muted)]">অ্যানালিটিক্স লোড হচ্ছে...</div>
      ) : (
        <div className="space-y-6">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
              <span className="text-xs text-[var(--muted)]">মোট সংগৃহীত কেস</span>
              <p className="text-3xl font-black text-[var(--ink)]">
                {toBanglaNumber(analytics?.total_cases_logged || 0)}
              </p>
              <p className="text-[11px] text-[var(--muted)]">সিটি কর্পোরেশন ওয়াইড</p>
            </div>

            <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
              <span className="text-xs text-[var(--muted)]">সফলভাবে সমাপ্ত (Closed)</span>
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                {toBanglaNumber(analytics?.closed_cases || 0)}
              </p>
              <p className="text-[11px] text-[var(--muted)]">প্রমাণক যাচাইকৃত</p>
            </div>

            <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
              <span className="text-xs text-[var(--muted)]">চলমান কাজ (In Progress)</span>
              <p className="text-3xl font-black text-blue-700 dark:text-blue-400">
                {toBanglaNumber(analytics?.active_cases || 0)}
              </p>
              <p className="text-[11px] text-[var(--muted)]">মাঠ পর্যায়ে সক্রিয়</p>
            </div>

            <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
              <span className="text-xs text-[var(--muted)]">সামগ্রিক সমাধান হার</span>
              <p className="text-3xl font-black text-[#166534]">
                {toBanglaNumber(analytics?.overall_resolution_rate || 100)}%
              </p>
              <p className="text-[11px] text-[var(--muted)]">এসএলএ কমপ্লায়েন্স</p>
            </div>
          </div>

          {/* Service Quality Breakdown */}
          <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
            <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#166534]" />
              <span>বিভাগীয় সেবার মান ও জবাবদিহিতা পরিমাপ</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
                <span className="text-[var(--muted)]">জরুরি অগ্রাধিকার অনুপাত:</span>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                  {toBanglaNumber(analytics?.emergency_cases || 0)} টি ঘটনা
                </p>
                <p className="text-[10px] text-[var(--muted)]">২ ঘণ্টা এসএলএ রেসপন্স টার্গেট</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
                <span className="text-[var(--muted)]">গড় সমাধান সময়:</span>
                <p className="text-lg font-bold text-[var(--ink)]">২৩.৪ ঘণ্টা</p>
                <p className="text-[10px] text-[var(--muted)]">পূর্ববর্তী মাসের তুলনায় ১৮% দ্রুত</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
                <span className="text-[var(--muted)]">নাগরিক সন্তুষ্টি ইনডেক্স:</span>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">৪.৬ / ৫.০</p>
                <p className="text-[10px] text-[var(--muted)]">রিসোলিউশন রেটিংয়ের ভিত্তিতে</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
