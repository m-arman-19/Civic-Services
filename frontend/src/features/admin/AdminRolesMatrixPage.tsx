import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { Shield, ShieldAlert, Check, Minus, Info } from 'lucide-react';

export const AdminRolesMatrixPage: React.FC = () => {
  const [matrix, setMatrix] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const data = await apiClient.admin.getRolesMatrix();
        setMatrix(data || []);
      } catch (e) {
        console.error('Failed to load RBAC matrix', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMatrix();
  }, []);

  const renderCell = (val: string) => {
    if (!val || val === '—') {
      return <span className="text-[var(--muted)] opacity-40 font-mono">—</span>;
    }
    if (val.includes('403') || val.includes('নিষিদ্ধ')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-900 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-700 shadow-xs">
          {val}
        </span>
      );
    }
    if (val === 'Yes' || val.includes('Own') || val.includes('Scope') || val.includes('Jurisdiction')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 shadow-xs">
          <Check className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
          {val}
        </span>
      );
    }
    return <span className="text-[11px] font-medium text-[var(--ink)]">{val}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
              গ্রুপ ২: প্রাতিষ্ঠানিক অধিকার বিন্যাস (R&D Table 30)
            </span>
            <span className="text-xs text-[var(--muted)] font-medium">কর্তব্য পৃথকীকরণ (Separation of Duties)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            ভূমিকাভিত্তিক অনুমতি ম্যাট্রিক্স (RBAC Matrix)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            ৫টি মূল প্রাতিষ্ঠানিক ভূমিকার অ্যাক্সেস সীমা এবং অপরিবর্তনীয় প্রশাসনিক নিয়ন্ত্রণ নীতিমালা
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[var(--paper)] border border-[var(--line)] text-xs font-mono font-bold text-[var(--ink)]">
            ভূমিকা সংখ্যা: ৫ টি প্রাতিষ্ঠানিক রোল
          </span>
        </div>
      </div>

      {/* RBAC Principles Banner */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <Info className="w-4 h-4 text-blue-600" />
          <span>প্রশাসনিক সীমানা নীতি (Administrator Boundaries):</span>
        </div>
        <p className="leading-relaxed">
          সিস্টেম অ্যাডমিনিস্ট্রেটর প্ল্যাটফর্ম কনফিগারেশন ও গভর্ন্যান্স পরিচালনা করেন। তিনি কোনো অপারেশনাল কেস বন্ধ করতে পারবেন না, সমাধানের প্রমাণপত্র সরাসরি অনুমোদন করতে পারবেন না এবং নাগরিকদের ব্যক্তিগত তথ্য বা প্রাইভেট ছবি অ্যাক্সেস করতে পারবেন না।
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-bold">
                <th className="p-3.5">সম্পদ ও কর্মপরিধি (Resource / Capability)</th>
                <th className="p-3.5">ক্রিয়া</th>
                <th className="p-3.5 text-center">নাগরিক (Citizen)</th>
                <th className="p-3.5 text-center">ওয়ার্ড ডেস্ক (Ward Desk)</th>
                <th className="p-3.5 text-center">দপ্তর কর্মকর্তা (Dept Officer)</th>
                <th className="p-3.5 text-center">কোঅর্ডিনেটর (Coordinator)</th>
                <th className="p-3.5 text-center">সিস্টেম অ্যাডমিন (Admin)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--muted)]">পারমিশন ম্যাট্রিক্স লোড হচ্ছে...</td>
                </tr>
              ) : (
                matrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg)] transition">
                    <td className="p-3.5 font-bold text-[var(--ink)]">{row.resource}</td>
                    <td className="p-3.5 font-mono text-[var(--muted)]">{row.action}</td>
                    <td className="p-3.5 text-center">{renderCell(row.citizen)}</td>
                    <td className="p-3.5 text-center">{renderCell(row.ward_desk)}</td>
                    <td className="p-3.5 text-center">{renderCell(row.dept_officer)}</td>
                    <td className="p-3.5 text-center">{renderCell(row.coordinator)}</td>
                    <td className="p-3.5 text-center">{renderCell(row.admin)}</td>
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
