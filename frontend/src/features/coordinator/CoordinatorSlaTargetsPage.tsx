import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { toBanglaNumber } from '../../utils/formatters';
import { PriorityBadge } from '../../components/common/Badge';
import {
  Clock,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Layers,
  HelpCircle,
  PauseCircle,
  BellRing,
  Award
} from 'lucide-react';

interface SlaPolicy {
  id: string;
  category: string;
  priority: string;
  target_resolution_hours: number;
  escalation_threshold_hours: number;
  reminder_lead_hours: number;
  escalation_role: string;
}

export const CoordinatorSlaTargetsPage: React.FC = () => {
  const [policies, setPolicies] = useState<SlaPolicy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      setLoading(true);
      try {
        const res: any = await apiClient.coordinator.getSlaPolicies();
        if (Array.isArray(res)) {
          setPolicies(res);
        } else if (res && Array.isArray(res.items)) {
          setPolicies(res.items);
        }
      } catch (err) {
        console.warn('Failed to fetch SLA policies, using standard default schedule:', err);
        setPolicies([
          {
            id: 'sla-001',
            category: 'drainage_block',
            priority: 'emergency',
            target_resolution_hours: 4,
            escalation_threshold_hours: 3,
            reminder_lead_hours: 1,
            escalation_role: 'zonal_executive_officer'
          },
          {
            id: 'sla-002',
            category: 'road_damage',
            priority: 'high',
            target_resolution_hours: 24,
            escalation_threshold_hours: 20,
            reminder_lead_hours: 4,
            escalation_role: 'executive_engineer'
          },
          {
            id: 'sla-003',
            category: 'street_light_outage',
            priority: 'medium',
            target_resolution_hours: 72,
            escalation_threshold_hours: 60,
            reminder_lead_hours: 12,
            escalation_role: 'assistant_engineer'
          },
          {
            id: 'sla-004',
            category: 'garbage_accumulation',
            priority: 'low',
            target_resolution_hours: 168,
            escalation_threshold_hours: 140,
            reminder_lead_hours: 24,
            escalation_role: 'ward_inspector'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in text-[var(--ink)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
              M7 সেবা স্তর লক্ষ্যমাত্রা ও প্রটোকল
            </span>
            <span className="text-xs text-[var(--muted)]">অনুমোদিত এসএলএ লেডার ও এস্কেলেশন নিয়মাবলী</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            সিটি কর্পোরেশন সেবা স্তর লক্ষ্যমাত্রা (Service-Level Targets)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            জরুরি, উচ্চ ও সাধারণ নাগরিক সেবাসমূহের নিষ্পত্তি সময়সীমা এবং বিভাগীয় রিমাইন্ডার থ্রেশহোল্ড
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/coordinator"
            className="px-3.5 py-1.5 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] text-xs text-[var(--ink)] hover:bg-[var(--line)]/20 transition"
          >
            ← ড্যাশবোর্ডে ফিরুন
          </Link>
        </div>
      </div>

      {/* RBAC Notice (Read-Only for Coordinator) */}
      <div className="civic-card rounded-xl p-4 bg-[var(--paper-elevated)] border border-[var(--line)] text-xs flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-[var(--ink)]">
            আরঅ্যান্ডডি অনুমোদিত এক্সেস কন্ট্রোল (R&D Section 11 RBAC):
          </div>
          <p className="text-[var(--muted)] leading-relaxed">
            কেন্দ্রীয় সমন্বয়ক হিসেবে আপনি কার্যকর এসএলএ পলিসি এবং এস্কেলেশন শর্তাবলী পর্যবেক্ষণ করতে পারেন। সিস্টেম-ব্যাপী এসএলএ ঘন্টা বা রাউটিং পলিসির পরিবর্তন শুধুমাত্র <strong>সিস্টেম অ্যাডমিনিস্ট্রেটর</strong> প্যানেল থেকে সংরক্ষিত।
          </p>
        </div>
      </div>

      {/* SLA Tiers Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="civic-card rounded-xl p-4 border border-rose-500/30 bg-rose-500/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Tier S: জরুরি</span>
            <Award className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-800">২-৪ ঘণ্টা</div>
          <p className="text-[11px] text-[var(--muted)]">
            বিদ্যুৎস্পৃষ্টের ঝুঁকি, মূল সড়কের ড্রেন স্ল্যাব ভাঙা বা উদ্ধার তৎপরতা।
          </p>
        </div>

        <div className="civic-card rounded-xl p-4 border border-amber-500/30 bg-amber-500/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Tier A: উচ্চ</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-800">২৪ ঘণ্টা</div>
          <p className="text-[11px] text-[var(--muted)]">
            মহাসড়ক বা জনবহুল এলাকায় জলাবদ্ধতা, বড় গর্ত ও বর্জ্য স্তূপ।
          </p>
        </div>

        <div className="civic-card rounded-xl p-4 border border-blue-500/30 bg-blue-500/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Tier B: মাঝারি</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-800">৭২ ঘণ্টা</div>
          <p className="text-[11px] text-[var(--muted)]">
            রাস্তার আলো বন্ধ, মশক নিধন ওষুধ ছিটানো ও শাখা সড়কের ছোট সংস্কার।
          </p>
        </div>

        <div className="civic-card rounded-xl p-4 border border-emerald-500/30 bg-emerald-500/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Tier C: সাধারণ</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800">৭ দিন</div>
          <p className="text-[11px] text-[var(--muted)]">
            দীর্ঘমেয়াদী জরিপ, ফুটপাত উন্নয়ন পরিকল্পনা ও সাধারণ নোটিশ।
          </p>
        </div>
      </div>

      {/* SLA Policies Table */}
      <div className="civic-card rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--paper)]">
        <div className="p-4 border-b border-[var(--line)] bg-[var(--bg)] flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-[var(--ink)]">
            সক্রিয় সেবা স্তর নীতিমালা তালিকা (Active Service Targets)
          </span>
          <span className="text-xs text-[var(--muted)]">
            মোট লক্ষ্যমাত্রা: {toBanglaNumber(policies.length)}টি
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--paper-elevated)] border-b border-[var(--line)] text-[var(--muted)] font-semibold">
                <th className="p-3.5">ক্যাটাগরি</th>
                <th className="p-3.5">অগ্রাধিকার</th>
                <th className="p-3.5 text-center">টার্গেট রেজোলিউশন</th>
                <th className="p-3.5 text-center">পূর্ব সতর্কীকরণ (Reminder)</th>
                <th className="p-3.5 text-center">এস্কেলেশন থ্রেশহোল্ড</th>
                <th className="p-3.5">উর্ধ্বতন এস্কেলেশন রোল</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {policies.map(p => (
                <tr key={p.id} className="hover:bg-[var(--bg)] transition">
                  <td className="p-3.5 font-bold text-[var(--ink)] font-mono">
                    {p.category}
                  </td>
                  <td className="p-3.5">
                    <PriorityBadge priority={p.priority as any} />
                  </td>
                  <td className="p-3.5 text-center font-mono font-bold text-[#166534]">
                    {toBanglaNumber(p.target_resolution_hours)} ঘণ্টা
                  </td>
                  <td className="p-3.5 text-center font-mono text-[var(--muted)]">
                    {toBanglaNumber(p.reminder_lead_hours)} ঘণ্টা পূর্বে
                  </td>
                  <td className="p-3.5 text-center font-mono text-rose-700 font-bold">
                    {toBanglaNumber(p.escalation_threshold_hours)} ঘণ্টা
                  </td>
                  <td className="p-3.5 text-xs text-[var(--ink)]">
                    <span className="px-2 py-0.5 rounded bg-[var(--paper-elevated)] border border-[var(--line)]">
                      {p.escalation_role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLA Timer Pausing Conditions */}
      <div className="civic-card rounded-xl p-5 border border-[var(--line)] bg-[var(--paper)] space-y-3">
        <div className="font-bold text-xs uppercase tracking-wider text-[var(--ink)] flex items-center gap-2">
          <PauseCircle className="w-4 h-4 text-amber-600" />
          যৌক্তিক সময় স্থগিতাদেশ নীতিমালা (SLA Pause Rules)
        </div>
        <p className="text-xs text-[var(--muted)]">
          আরঅ্যান্ডডি নির্দেশনা অনুযায়ী কোনো টাস্কের এসএলএ কাউন্টডাউন শুধুমাত্র নিম্নলিখিত সুনির্দিষ্ট শর্তে সাময়িকভাবে স্থগিত (Pause) রাখা যাবে:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
            <div className="font-bold text-[var(--ink)]">১. ইউটিলিটি এনওসি অপেক্ষমাণ</div>
            <p className="text-[11px] text-[var(--muted)]">
              ওয়াসা, ডেসকো বা তিতাস গ্যাসের অনুমোদন অথবা যৌথ কাজের জন্য অপেক্ষা।
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
            <div className="font-bold text-[var(--ink)]">২. প্রাকৃতিক দুর্যোগ ও বিরূপ আবহাওয়া</div>
            <p className="text-[11px] text-[var(--muted)]">
              টানা ভারী বর্ষণ বা প্রতিকূল আবহাওয়ায় সড়ক ঢালাই সম্ভব না হলে।
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
            <div className="font-bold text-[var(--ink)]">৩. মালামাল সংগ্রহ প্রক্রিয়া</div>
            <p className="text-[11px] text-[var(--muted)]">
              বিশেষায়িত স্পেয়ার পার্টস বা কাঁচামাল ক্রয় প্রক্রিয়া চলমান থাকলে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
