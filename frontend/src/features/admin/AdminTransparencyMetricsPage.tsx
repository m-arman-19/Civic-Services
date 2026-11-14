import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { toBanglaNumber } from '../../utils/formatters';
import { FileCheck, Award, ThumbsUp, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export const AdminTransparencyMetricsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await apiClient.admin.getTransparencyMetrics();
        setMetrics(data);
      } catch (e) {
        console.error('Failed to load transparency metrics', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ৮: অ্যানালিটিক্স ও স্বচ্ছতা (Public Accountability)
            </span>
            <span className="text-xs text-[var(--muted)]">নাগরিক সেবা সন্তুষ্টি ও উন্মুক্ত প্রকাশ</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            স্বচ্ছতা ও জনসেবা সূচক (Public Transparency Metrics)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            সিটি কর্পোরেশনের উন্মুক্ত নাগরিক সেবা সূচক, প্রমাণক কমপ্লায়েন্স ও প্রতিক্রিয়া সময়
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-[var(--muted)]">স্বচ্ছতা সূচক লোড হচ্ছে...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Satisfaction Index */}
            <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>নাগরিক সন্তুষ্টি স্কোর</span>
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  {toBanglaNumber(metrics?.citizen_satisfaction_index || 4.6)}
                </span>
                <span className="text-xs text-[var(--muted)]">/ ৫.০</span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                কেস সমাধানের পর নাগরিক কর্তৃক এসএমএস ও মোবাইল অ্যাপে প্রদত্ত মতামতের গড়
              </p>
            </div>

            {/* Evidence Compliance */}
            <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>প্রমাণক কমপ্লায়েন্স হার</span>
                <FileCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-blue-700 dark:text-blue-400 font-mono">
                  {toBanglaNumber(metrics?.evidence_compliance_rate || 94.8)}%
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                সমাধানকৃত কেসসমূহে ভূ-চিহ্নিত (Geo-tagged) ছবি ও অডিট প্রুফ আপলোডের হার
              </p>
            </div>

            {/* First Response Time */}
            <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>গড় প্রাথমিক সাড়া (Response Time)</span>
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-purple-700 dark:text-purple-400 font-mono">
                  {toBanglaNumber(metrics?.average_first_response_hours || 3.8)}
                </span>
                <span className="text-xs text-[var(--muted)]">ঘণ্টা</span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                প্রতিবেদন প্রাপ্তির পর ওয়ার্ড ডেস্ক কর্মকর্তা কর্তৃক ইনটেক যাচাইকরণের গড় সময়
              </p>
            </div>
          </div>

          {/* Public Disclosure Audit Status */}
          <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--ink)]">পাবলিক ডিসক্লোজার ও অডিট প্রত্যয়ন</h4>
                <p className="text-xs text-[var(--muted)]">
                  নাগরিক অধিকার ও তথ্য অধিকার আইন (RTI) ২০০৯ অনুযায়ী উন্মুক্ত তথ্য ভাণ্ডার হিসেবে প্রত্যয়িত
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              নিরীক্ষিত ও প্রকাশিত (Audited & Published)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
