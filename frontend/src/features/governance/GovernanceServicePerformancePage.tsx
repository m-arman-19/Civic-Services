import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { toBanglaNumber } from '../../utils/formatters';
import { BarChart3, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

export const GovernanceServicePerformancePage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const res = await apiClient.governance.getServicePerformance();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-editorial">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[var(--line)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider bg-[var(--paper-elevated)] text-[var(--ink)] border border-[var(--line)] shadow-xs">
              <BarChart3 className="w-3.5 h-3.5" />
              কার্যকারিতা ও মেট্রিক্স
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)] font-bangla flex items-center gap-3">
            সার্বিক সেবা কর্মক্ষমতা ও বিভাগীয় মূল্যায়ন (Aggregated Performance)
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
            নাগরিক গোপনীয়তা সুরক্ষাসহ বিভাগভিত্তিক টাস্ক নিষ্পত্তি অনুপাত ও সমাধান হার বিশ্লেষণ
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={fetchPerformance}
            disabled={loading}
            className="p-2 text-xs font-bold rounded-lg border border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--paper-elevated)] text-[var(--ink)] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-2.5 text-xs text-foreground">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
        <span>{data?.privacy_guarantee || 'ব্যক্তিগত নাগরিক পরিচয় ও ফোন নম্বর সম্পূর্ণ গোপনকৃত। ৫-এর কম নমুনা সংখ্যায় পরিসংখ্যান সংক্ষেপণ প্রয়োগ করা হয়েছে।'}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="text-xs text-muted-foreground">মোট প্রাপ্ত অভিযোগ</div>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">
            {loading ? '...' : toBanglaNumber(data?.city_wide_summary?.total_incidents || 0)}
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="text-xs text-muted-foreground">চূড়ান্ত সমাধানকৃত</div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {loading ? '...' : toBanglaNumber(data?.city_wide_summary?.resolved_incidents || 0)}
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="text-xs text-muted-foreground">সময়োত্তীর্ণ কেস</div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {loading ? '...' : toBanglaNumber(data?.city_wide_summary?.overdue_incidents || 0)}
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="text-xs text-muted-foreground">সামগ্রিক সমাধান হার</div>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">
            {loading ? '...' : `${toBanglaNumber(data?.city_wide_summary?.resolution_rate_pct || 0)}%`}
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/40 font-semibold text-xs text-foreground">
          বিভাগভিত্তিক কার্যক্রম ও সমাধান কর্মক্ষমতা
        </div>
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">বিভাগ কোড</th>
              <th className="py-3 px-4">বিভাগের নাম</th>
              <th className="py-3 px-4">মোট অর্পিত টাস্ক</th>
              <th className="py-3 px-4">সম্পন্নকৃত টাস্ক</th>
              <th className="py-3 px-4">নিষ্পত্তি সাফল্যের হার</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  বিভাগীয় তথ্য লোড হচ্ছে...
                </td>
              </tr>
            ) : (
              (data?.department_performance || []).map((d: any) => (
                <tr key={d.department_id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-foreground">{d.department_code}</td>
                  <td className="py-3 px-4 font-medium text-foreground">{d.department_name_bn}</td>
                  <td className="py-3 px-4 font-mono">{toBanglaNumber(d.total_tasks)}</td>
                  <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{toBanglaNumber(d.completed_tasks)}</td>
                  <td className="py-3 px-4 font-medium">
                    {typeof d.completion_rate_pct === 'number'
                      ? `${toBanglaNumber(d.completion_rate_pct)}%`
                      : <span className="text-muted-foreground italic">{d.completion_rate_pct}</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
