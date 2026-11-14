import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  FileText,
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  TrendingUp,
  Download,
  Filter
} from 'lucide-react';

export const WardReportsPage: React.FC = () => {
  const { cases } = useCases();
  const { currentUser } = useAuth();

  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'year'>('30d');

  // Scoped to ward
  const wardCases = cases.filter(c => !currentUser.wardId || c.location.wardId === currentUser.wardId);

  const totalReports = wardCases.length;
  const resolvedCount = wardCases.filter(c => c.status === 'closed' || c.status === 'resolved_pending_citizen').length;
  const inProgressCount = wardCases.filter(c => c.status === 'in_progress' || c.status === 'under_inspection').length;
  const pendingCount = wardCases.filter(c => c.status === 'submitted' || c.status === 'verified').length;
  const objectionCount = wardCases.filter(c => c.status === 'reopened' || c.objection).length;
  const duplicateMergedCount = wardCases.filter(c => c.status === 'merged' || (c.duplicateCases && c.duplicateCases.length > 0)).length;

  // Breakdown by category
  const categories: Record<string, number> = {};
  wardCases.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });

  const categoryLabels: Record<string, string> = {
    drainage: 'ড্রেনেজ ও পয়ঃনিষ্কাশন',
    waste: 'বর্জ্য ব্যবস্থাপনা',
    road_engineering: 'সড়ক ও অবকাঠামো',
    lighting: 'সড়ক বাতি ও বিদ্যুৎ',
    water_supply: 'পানি সরবরাহ'
  };

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] bg-[var(--paper-elevated)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              {currentUser.wardName || 'ওয়ার্ড ১২'}
            </span>
            <span className="text-xs text-[var(--muted)]">অপারেশনাল এনালিটিক্স ও রিপোর্ট</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] tracking-tight">
            ওয়ার্ড রিপোর্ট ও পারফরম্যান্স অন্তর্দৃষ্টি (Ward Reports & Insights)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-2xl">
            অভিযোগের পরিমাণ, সমাধান সময়, হ্যান্ডওভার বিলম্ব ও এসএলএ ফলাফল সংক্রান্ত প্রতিবেদন
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" />
          <div className="flex bg-[var(--paper)] border border-[var(--line)] rounded-xl p-1 text-xs">
            <button
              onClick={() => setPeriod('7d')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                period === '7d' ? 'bg-[var(--ink)] text-white' : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              ৭ দিন
            </button>
            <button
              onClick={() => setPeriod('30d')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                period === '30d' ? 'bg-[var(--ink)] text-white' : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              ৩০ দিন
            </button>
            <button
              onClick={() => setPeriod('90d')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                period === '90d' ? 'bg-[var(--ink)] text-white' : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              ৩ মাস
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)]">মোট রিপোর্ট</span>
          <div className="text-2xl font-extrabold font-mono text-[var(--ink)]">
            {toBanglaNumber(totalReports)}
          </div>
          <span className="text-[11px] text-[var(--muted)]">দাখিলকৃত কেস</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--green)]">সমাধানকৃত</span>
          <div className="text-2xl font-extrabold font-mono text-[var(--green)]">
            {toBanglaNumber(resolvedCount)}
          </div>
          <span className="text-[11px] text-[var(--green)]">প্রমাণসহ নিষ্পত্তি</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-indigo-600">মাঠ কাজ চলমান</span>
          <div className="text-2xl font-extrabold font-mono text-indigo-600">
            {toBanglaNumber(inProgressCount)}
          </div>
          <span className="text-[11px] text-indigo-600">সক্রিয় সংস্কার</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-amber-600">যাচাই অপেক্ষমাণ</span>
          <div className="text-2xl font-extrabold font-mono text-amber-600">
            {toBanglaNumber(pendingCount)}
          </div>
          <span className="text-[11px] text-amber-600">ট্রায়াজ ও বরাদ্দ</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-rose-600">নাগরিক আপত্তি</span>
          <div className="text-2xl font-extrabold font-mono text-rose-600">
            {toBanglaNumber(objectionCount)}
          </div>
          <span className="text-[11px] text-rose-600">পুনঃতদন্ত অর্ডার</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--gold)]">ডুপ্লিকেট ক্লাস্টার</span>
          <div className="text-2xl font-extrabold font-mono text-[var(--gold)]">
            {toBanglaNumber(duplicateMergedCount)}
          </div>
          <span className="text-[11px] text-[var(--gold)]">একত্রীকরণ সম্পন্ন</span>
        </div>
      </div>

      {/* TWO COLUMN PERFORMANCE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Table */}
        <div className="civic-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--green)]" />
            <span>সমস্যার ধরন অনুযায়ী রিপোর্ট ভলিউম (Report Volume by Category)</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(categories).map(([cat, count]) => {
              const pct = Math.round((count / (totalReports || 1)) * 100);
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[var(--ink)]">{categoryLabels[cat] || cat}</span>
                    <span className="font-mono text-[var(--muted)]">
                      {toBanglaNumber(count)}টি ({toBanglaNumber(pct)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--line)]">
                    <div className="h-full bg-[var(--green)]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SLA & Handover Efficiency Card */}
        <div className="civic-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--gold)]" />
            <span>দপ্তর হ্যান্ডওভার ও গড় সমাধান কর্মক্ষমতা</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex justify-between items-center">
              <div>
                <strong className="text-[var(--ink)] block">গড় রেসপন্স সময় (Average Response Time):</strong>
                <span className="text-[11px] text-[var(--muted)]">নাগরিক ইনটেক থেকে দপ্তর গ্রহণ</span>
              </div>
              <span className="text-sm font-bold font-mono text-[var(--green)]">৪.২ ঘণ্টা</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex justify-between items-center">
              <div>
                <strong className="text-[var(--ink)] block">গড় সমাধান সময় (Average Resolution Time):</strong>
                <span className="text-[11px] text-[var(--muted)]">ওয়ার্ক-অর্ডার থেকে সমাপ্তি প্রমাণক আপলোড</span>
              </div>
              <span className="text-sm font-bold font-mono text-[var(--ink)]">২৮.৫ ঘণ্টা</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex justify-between items-center">
              <div>
                <strong className="text-[var(--ink)] block">এসএলএ সম্মতি হার (SLA Compliance Rate):</strong>
                <span className="text-[11px] text-[var(--muted)]">সময়সীমার মধ্যে সম্পন্ন কাজ</span>
              </div>
              <span className="text-sm font-bold font-mono text-[var(--green)]">৯১.৪%</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex justify-between items-center">
              <div>
                <strong className="text-[var(--ink)] block">দপ্তর প্রত্যাখ্যান হার (Department Rejection):</strong>
                <span className="text-[11px] text-[var(--muted)]">এখতিয়ার বহির্ভূত কারণে ফেরত পাঠানো</span>
              </div>
              <span className="text-sm font-bold font-mono text-rose-600">৩.৮%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
