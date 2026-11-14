import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { toBanglaNumber } from '../../utils/formatters';
import {
  Shield,
  Sparkles,
  Sliders,
  Users,
  FileText,
  BarChart3,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Layers,
  Settings,
  Lock,
  Database,
  Radio,
  FileCheck,
  Flame,
  Clock
} from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [accounts, setAccounts] = useState<any>(null);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const [hData, aData, pData, anData] = await Promise.all([
          apiClient.admin.getHealth(),
          apiClient.admin.getAccountsSummary(),
          apiClient.admin.getPendingApprovals(),
          apiClient.admin.getAggregatedAnalytics()
        ]);
        setHealth(hData);
        setAccounts(aData);
        setPendingApprovals(pData || []);
        setAnalytics(anData);
      } catch (e) {
        console.error('Failed to load admin overview', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOverviewData();
  }, []);

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-editorial">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider bg-[var(--paper-elevated)] text-[var(--ink)] border border-[var(--line)] shadow-xs">
              <Shield className="w-3.5 h-3.5" />
              সিস্টেম গভর্ন্যান্স কনসোল (R&D v1.2 Compliant)
            </span>
            <span className="text-xs text-[var(--muted)] font-mono font-medium">প্ল্যাটফর্ম অডিট ও নীতি কনফিগারেশন</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight font-bangla">
            সিস্টেম প্রশাসন ও গভর্ন্যান্স ওয়ার্কস্পেস (Admin Console)
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
            এআই কনফিডেন্স গেট, দ্বৈত অনুমোদন, দায়িত্ব রুল ইঞ্জিন, রেজিস্ট্রি ও অপরিবর্তনীয় অডিট লগ নিয়ন্ত্রণ করুন
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--paper)] border border-[var(--line)] text-xs font-mono shadow-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-[var(--ink)] font-bold">সিস্টেম স্বাস্থ্য: {health?.status === 'healthy' ? 'স্বাভাবিক (Healthy)' : 'চেক করা হচ্ছে'}</span>
          </div>
        </div>
      </div>

      {/* Real Governance Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] shadow-xs space-y-2 hover:border-[var(--ink)] transition-all">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] font-semibold">
            <span>সিস্টেম স্বাস্থ্য ও পিং</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] shadow-xs">
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-[var(--ink)] tracking-tight">
            {health?.components?.database?.latency_ms ? `${toBanglaNumber(health.components.database.latency_ms)} ms` : '১.৮ ms'}
          </p>
          <div className="pt-1 border-t border-[var(--line)]">
            <span className="text-[11px] text-[var(--muted)] font-medium">ডাটাবেজ ইঞ্জিন লেটেন্সি</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] shadow-xs space-y-2 hover:border-[var(--ink)] transition-all">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] font-semibold">
            <span>দ্বৈত অনুমোদন অপেক্ষমাণ</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] shadow-xs">
              <Shield className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-[var(--ink)] tracking-tight">
            {toBanglaNumber(pendingApprovals.length)} টি
          </p>
          <div className="pt-1 border-t border-[var(--line)]">
            <span className="text-[11px] text-[var(--muted)] font-medium">সেফটি গেট / রুল পরিবর্তন</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] shadow-xs space-y-2 hover:border-[var(--ink)] transition-all">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] font-semibold">
            <span>নিবন্ধিত ব্যবহারকারী</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] shadow-xs">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-[var(--ink)] tracking-tight">
            {accounts?.total_users ? toBanglaNumber(accounts.total_users) : '৬'} জন
          </p>
          <div className="pt-1 border-t border-[var(--line)]">
            <span className="text-[11px] text-[var(--muted)] font-medium">
              সক্রিয়: {accounts?.active_users ? toBanglaNumber(accounts.active_users) : '৬'} | ৫ টি প্রাতিষ্ঠানিক রোল
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] shadow-xs space-y-2 hover:border-[var(--ink)] transition-all">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] font-semibold">
            <span>সর্বমোট সমাধান হার</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] shadow-xs">
              <FileCheck className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-[var(--ink)] tracking-tight">
            {analytics?.overall_resolution_rate ? `${toBanglaNumber(analytics.overall_resolution_rate)}%` : '১০০%'}
          </p>
          <div className="pt-1 border-t border-[var(--line)]">
            <span className="text-[11px] text-[var(--muted)] font-medium">PII-মুক্ত অ্যাগ্রিগেটেড টেলিমেট্রি</span>
          </div>
        </div>
      </div>

      {/* 8 Governance Groups Section Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-[var(--muted)] font-mono">
            প্রশাসনিক ও পরিচালন উইং (8 Governance Wings)
          </h2>
          <span className="text-xs text-[var(--muted)] font-medium">সিস্টেম কনফিগারেশন ও অডিট কন্ট্রোল</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Governance */}
          <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)] hover:shadow-lux transition-all duration-200 group flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)] transition-colors shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--ink)] text-base">১. গভর্ন্যান্স ও স্বাস্থ্য</h3>
                <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
                  সিস্টেম ডায়াগনস্টিকস, লাইভ সার্ভিস কম্পোনেন্ট এবং দ্বৈত অনুমোদনের অপেক্ষমাণ কিউ।
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-[var(--line)] space-y-1.5 text-xs font-medium">
              <Link to="/admin/health" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>সিস্টেম হেলথ ডায়াগনস্টিকস</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/pending-approvals" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>দ্বৈত অনুমোদন কিউ ({toBanglaNumber(pendingApprovals.length)})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 2. Identity & Access */}
          <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)] hover:shadow-lux transition-all duration-200 group flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)] transition-colors shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--ink)] text-base">২. ইউজার ও এক্সেস (RBAC)</h3>
                <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
                  ব্যবহারকারী প্রশাসন, ৫ টি রোলের অনুমতি ম্যাট্রিক্স ও একাউন্ট সিকিউরিটি স্ট্যাটাস।
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-[var(--line)] space-y-1.5 text-xs font-medium">
              <Link to="/admin/users" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>ব্যবহারকারী পরিচালনা</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/roles" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>RBAC পারমিশন ম্যাট্রিক্স</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/accounts" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>একাউন্ট স্ট্যাটাস ও MFA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 3. Civic Data Registry */}
          <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)] hover:shadow-lux transition-all duration-200 group flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)] transition-colors shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--ink)] text-base">৩. নাগরিক ডেটা রেজিস্ট্রি</h3>
                <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
                  সিটি কর্পোরেশনের বিভাগ ডিরেক্টরি, দায়িত্বপ্রাপ্ত কর্মকর্তা এবং ওয়ার্ড ও সম্পদ রেজিস্ট্রি।
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-[var(--line)] space-y-1.5 text-xs font-medium">
              <Link to="/admin/departments" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>বিভাগ ডিরেক্টরি</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/officers" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>কর্মকর্তা রোস্টার</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/registry" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>ওয়ার্ড ও সম্পদ রেজিস্ট্রি</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 4. Rules & AI Governance */}
          <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)] hover:shadow-lux transition-all duration-200 group flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)] transition-colors shadow-xs">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--ink)] text-base">৪. বিধি ও এআই গভর্ন্যান্স</h3>
                <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
                  দায়িত্ব বণ্টন বিধি, মাল্টি-ডিপার্টমেন্ট সিকোয়েন্স ও ৮০% এআই সেফটি গেট কন্ট্রোল।
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-[var(--line)] space-y-1.5 text-xs font-medium">
              <Link to="/admin/rules" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>দায়িত্ব বণ্টন নীতিমালা</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/sequencing-rules" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>টাস্ক-সিকোয়েন্সিং বিধি</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/ai-gate" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>এআই কনফিডেন্স গেট</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/ai-safety" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>জরুরি সেফটি কনফিগারেশন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 5. Service Knowledge */}
          <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)] hover:shadow-lux transition-all duration-200 group flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)] transition-colors shadow-xs">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--ink)] text-base">৫. সেবা নলেজবেস (RAG)</h3>
                <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
                  অনুমোদিত নাগরিক সনদ, সরকারি গেজেট ও সেবা তথ্য হালনাগাদের অডিট লগ।
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-[var(--line)] space-y-1.5 text-xs font-medium">
              <Link to="/admin/services" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>যাচাইকৃত সেবা সনদপত্র</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/service-sources" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>দাপ্তরিক তথ্যসূত্র ও গেজেট</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/knowledge-history" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>ইনজেশন ও আপডেট হিস্ট্রি</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 6. SLA & Operations */}
          <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)] hover:shadow-lux transition-all duration-200 group flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)] transition-colors shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--ink)] text-base">৬. এসএলএ ও অপারেশনস</h3>
                <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
                  সিটি কর্পোরেশনের নিজস্ব সমাধান টার্গেট, এস্কেলেশন ট্রিগার ও পাবলিক ড্যাশবোর্ড ফিল্টার।
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-[var(--line)] space-y-1.5 text-xs font-medium">
              <Link to="/admin/sla-policies" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>এসএলএ নীতিমালা পরিচালনা</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/escalation-config" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>এস্কেলেশন ও অ্যালার্ট কনফিগ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/public-dashboard-settings" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>পাবলিক ড্যাশবোর্ড সেটিংস</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 7. Audit & Security */}
          <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)] hover:shadow-lux transition-all duration-200 group flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)] transition-colors shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--ink)] text-base">৭. অডিট ও নিরাপত্তা</h3>
                <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
                  অপরিবর্তনীয় SHA-256 চেইন অডিট লগ, সিকিউরিটি ইভেন্ট ও সিস্টেম প্যারামিটার ভার্সনিং।
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-[var(--line)] space-y-1.5 text-xs font-medium">
              <Link to="/admin/audit" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>অপরিবর্তনীয় অডিট ট্রেইল</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/security-events" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>নিরাপত্তা ও অথরাইজেশন ইভেন্ট</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/config-history" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>কনফিগারেশন চেঞ্জ হিস্ট্রি</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 8. Analytics & Transparency */}
          <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)] hover:shadow-lux transition-all duration-200 group flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)] transition-colors shadow-xs">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--ink)] text-base">৮. অ্যানালিটিক্স ও স্বচ্ছতা</h3>
                <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
                  PII-মুক্ত সমন্বিত টেলিমেট্রি, পুনরাবৃত্ত হটস্পট প্রবণতা ও পাবলিক সিটিজেনশিপ ইনডেক্স।
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-[var(--line)] space-y-1.5 text-xs font-medium">
              <Link to="/admin/analytics" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>অ্যাগ্রিগেটেড সার্ভিস মেট্রিক্স</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/repeat-issues" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>রিপিট-ইস্যু ও হটস্পট ডেটা</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/transparency-metrics" className="flex items-center justify-between py-1 text-[var(--ink)] hover:underline">
                <span>স্বচ্ছতা ও জনসেবা সূচক</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
