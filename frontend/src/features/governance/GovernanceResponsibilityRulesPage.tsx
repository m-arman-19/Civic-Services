import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { Landmark, ShieldCheck, ArrowRight, RefreshCw, BookOpen, AlertCircle } from 'lucide-react';

export const GovernanceResponsibilityRulesPage: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await apiClient.governance.getResponsibilityRules();
      setRules(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-editorial">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[var(--line)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider bg-[var(--paper-elevated)] text-[var(--ink)] border border-[var(--line)] shadow-xs">
              <Landmark className="w-3.5 h-3.5" />
              পৌর প্রবিধান ও এখতিয়ার
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)] font-bangla flex items-center gap-3">
            পৌর দায়িত্ব নির্ধারণ বিধিমালা (Responsibility Rules)
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
            কোন নাগরিক সমস্যা কোন বিভাগের এখতিয়ারভুক্ত এবং সহায়ক বিভাগসমূহের দায়িত্ব বিভাজন
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/governance/approvals"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            বিধি সংশোধনের প্রস্তাব দাখিল
          </Link>
          <button
            type="button"
            onClick={fetchRules}
            disabled={loading}
            className="p-2 text-xs font-bold rounded-lg border border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--paper-elevated)] text-[var(--ink)] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">বিধি কোড</th>
                <th className="py-3 px-4">সমস্যার ধরণ</th>
                <th className="py-3 px-4">নাম ও প্রবিধান</th>
                <th className="py-3 px-4">প্রধান দায়িত্বপ্রাপ্ত বিভাগ</th>
                <th className="py-3 px-4">সহায়ক বিভাগসমূহ</th>
                <th className="py-3 px-4">অনুমোদন স্থিতি</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    বিধিমালা লোড হচ্ছে...
                  </td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    কোনো সক্রিয় দায়িত্ব বিধি পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                rules.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      {r.rule_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-foreground">
                        {r.category_code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{r.name_bn}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{r.rule_description_bn}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {r.primary_department_name_bn}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {r.secondary_department_ids && r.secondary_department_ids.length > 0
                        ? r.secondary_department_ids.join(', ')
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        অনুমোদিত পৌরনীতি ({r.policy_version})
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
