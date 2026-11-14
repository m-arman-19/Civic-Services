import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { toBanglaNumber } from '../../utils/formatters';
import { BellRing, ShieldAlert, ArrowUpRight, CheckCircle2, UserCheck, MessageSquare } from 'lucide-react';

export const AdminEscalationConfigPage: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEscalation = async () => {
      try {
        const data = await apiClient.admin.getEscalationConfig();
        setConfig(data);
      } catch (e) {
        console.error('Failed to load escalation config', e);
      } finally {
        setLoading(false);
      }
    };
    fetchEscalation();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ৬: এসএলএ ও অপারেশনস (Escalation Ladder)
            </span>
            <span className="text-xs text-[var(--muted)]">স্বয়ংক্রিয় ঊর্ধ্বতন বার্তা ও দায়িত্ব এস্কেলেশন</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            এস্কেলেশন ও অ্যালার্ট কনফিগারেশন (Escalation Configuration)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            এসএলএ অতিরিক্ত বিলম্বিত হলে স্বয়ংক্রিয়ভাবে জোনাল নির্বাহী কর্মকর্তা (ZEO) ও প্রধান নির্বাহী কর্মকর্তা (CEO)-কে অবহিতকরণ
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-[var(--muted)]">এস্কেলেশন ডাটা লোড হচ্ছে...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tier 1 Escalation */}
            <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">টায়ার-১ এস্কেলেশন (Tier-1)</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  সক্রিয়
                </span>
              </div>
              <h3 className="font-bold text-base text-[var(--ink)]">জোনাল নির্বাহী কর্মকর্তা (ZEO) নোটিফিকেশন</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                এসএলএ চূড়ান্ত সময়সীমা পার হওয়ার {toBanglaNumber(config?.tier_1_lead_hours || 3)} ঘণ্টা পূর্বে দায়িত্বপ্রাপ্ত জোনাল নির্বাহী কর্মকর্তাকে পুশ নোটিফিকেশন ও এসএমএস অ্যালার্ট পাঠানো হয়।
              </p>
              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">ভূমিকা কোড:</span>
                  <span className="text-[var(--ink)] font-bold">{config?.tier_1_role || 'zonal_executive_officer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">লিড সময়:</span>
                  <span className="text-[var(--ink)]">+{toBanglaNumber(config?.tier_1_lead_hours || 3)} ঘণ্টা</span>
                </div>
              </div>
            </div>

            {/* Tier 2 Escalation */}
            <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-red-700 dark:text-red-400">টায়ার-২ এস্কেলেশন (Tier-2)</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  সক্রিয়
                </span>
              </div>
              <h3 className="font-bold text-base text-[var(--ink)]">প্রধান নির্বাহী কর্মকর্তা (CEO) নোটিফিকেশন</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                গুরুতর বা দীর্ঘসূত্রিতার ক্ষেত্রে চূড়ান্ত ডেডলাইনের {toBanglaNumber(config?.tier_2_lead_hours || 6)} ঘণ্টা পর প্রধান নির্বাহী কর্মকর্তার কেন্দ্রীয় ড্যাশবোর্ডে রেড-ফ্ল্যাগ অ্যালার্ট জারি হয়।
              </p>
              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">ভূমিকা কোড:</span>
                  <span className="text-[var(--ink)] font-bold">{config?.tier_2_role || 'chief_executive_officer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">লিড সময়:</span>
                  <span className="text-[var(--ink)]">+{toBanglaNumber(config?.tier_2_lead_hours || 6)} ঘণ্টা</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Channels */}
          <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-3">
            <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#166534]" />
              <span>সহায়ক নোটিফিকেশন ও নির্বাচিত প্রতিনিধি সমন্বয়</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
                <span className="font-bold text-[var(--ink)]">ওয়ার্ড কাউন্সিলর স্বয়ংক্রিয় ব্রিফিং:</span>
                <p className="text-[var(--muted)] leading-relaxed">
                  ওয়ার্ড সীমানার অন্তর্গত সমস্যাসমূহ কাউন্সিলর ড্যাশবোর্ডে স্বয়ংক্রিয়ভাবে দৃশ্যমান এবং প্রতি সোমবার সকাল ৯টায় সাপ্তাহিক রিপোর্ট প্রেরিত হয়।
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
                <span className="font-bold text-[var(--ink)]">এসএমএস অটো-ডিসপ্যাচ চ্যানেল:</span>
                <p className="text-[var(--muted)] leading-relaxed">
                  মাঠ কর্মকর্তার ফোনে ইউনিকোড বাংলায় তাৎক্ষণিক টাস্ক অ্যালার্ট প্রেরিত হয়।
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
