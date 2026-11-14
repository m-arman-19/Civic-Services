import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { toBanglaNumber } from '../../utils/formatters';
import { ShieldCheck, Eye, EyeOff, Sliders, RefreshCw, CheckCircle2, Lock } from 'lucide-react';

export const AdminPublicDashboardSettingsPage: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await apiClient.admin.getPublicDashboardConfig();
        setConfig(data);
      } catch (e) {
        console.error('Failed to load public dashboard config', e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ৬: এসএলএ ও অপারেশনস (Privacy Protection)
            </span>
            <span className="text-xs text-[var(--muted)]">নাগরিক গোপনীয়তা ও স্বচ্ছতা নিয়ন্ত্রণ</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            পাবলিক ড্যাশবোর্ড সেটিংস (Public Dashboard Settings)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            সাধারণ নাগরিক ও গণমাধ্যমের জন্য উন্মুক্ত ডেটাতে কে-অ্যানোনিমিটি ও তথ্য মাস্কিং পলিসি
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>k-অ্যানোনিমিটি গোপনীয়তা গ্যারান্টি (Privacy Guarantee):</span>
        </div>
        <p className="leading-relaxed">
          কোনো নির্দিষ্ট এলাকায় সমস্যা সংখ্যা k=৫ এর কম হলে তা মানচিত্রে পৃথক পয়েন্ট হিসেবে প্রদর্শিত হবে না; এটি কেবল ক্লাস্টার পরিসংখ্যান হিসেবে দেখানো হবে যাতে অভিযোগকারী নাগরিকের বাড়ি বা ব্যক্তি পরিচয় চিহ্নিত না করা যায়।
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-[var(--muted)]">সেটিংস লোড হচ্ছে...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Anonymity Threshold */}
            <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[var(--ink)]">k-Anonymity থ্রেশহোল্ড</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200">
                  k = {toBanglaNumber(config?.k_anonymity_threshold || 5)}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                ক্ষুদ্রতম স্যাম্পল সাপ্রেশন ফিল্টার। ৫ জনের কম অভিযোগকারীর ক্ষেত্রে ভৌগোলিক পিন সরাসরি পয়েন্ট হিসেবে উন্মুক্ত করা নিষিদ্ধ।
              </p>
            </div>

            {/* Refresh Interval */}
            <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[var(--ink)]">রিফ্রেশ ও ক্যাশ ইন্টারভাল</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200">
                  {toBanglaNumber(config?.refresh_interval_seconds || 60)} সেকেন্ড
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                পাবলিক পোর্টালে ডেটা সিঙ্ক্রোনাইজেশনের স্বয়ংক্রিয় বিরতি। লাইভ ডাটাবেজ সুরক্ষায় ইন-মেমোরি ক্যাশ ব্যবহৃত হয়।
              </p>
            </div>
          </div>

          {/* Privacy Controls Panel */}
          <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
            <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#166534]" />
              <span>তথ্য মাস্কিং ও গোপনীয়তা নিয়ন্ত্রণ (PII Masking Status)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--ink)]">নাগরিক নাম মাস্কিং</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-[var(--muted)] text-[11px]">পাবলিক ভিউতে 'মুশফিক ***' আকারে দৃশ্যমান</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--ink)]">ফোন নম্বর এনক্রিপশন</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-[var(--muted)] text-[11px]">পাবলিক ভিউতে '০১৭****০০১' আকারে দৃশ্যমান</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--ink)]">হটস্পট ক্লাস্টার ভিউ</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-[var(--muted)] text-[11px]">ব্যক্তিগত ঠিকানা গোপন রেখে সামগ্রিক ঘনত্ব প্রদর্শন</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
