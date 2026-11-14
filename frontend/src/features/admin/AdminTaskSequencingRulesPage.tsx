import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { toBanglaNumber } from '../../utils/formatters';
import { GitBranch, ArrowRight, CheckCircle2, ShieldCheck, Layers, AlertCircle } from 'lucide-react';

export const AdminTaskSequencingRulesPage: React.FC = () => {
  const [sequencingRules, setSequencingRules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSequencing = async () => {
      try {
        const data = await apiClient.admin.getSequencingRules();
        setSequencingRules(data || []);
      } catch (e) {
        console.error('Failed to load sequencing rules', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSequencing();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ৪: বিধি ও এআই গভর্ন্যান্স (Compound Pipeline)
            </span>
            <span className="text-xs text-[var(--muted)]">মাল্টি-ডিপার্টমেন্ট কার্যধারা ও পূর্বশর্ত চেইন</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            টাস্ক-সিকোয়েন্সিং বিধিমালা (Task-Sequencing Rules)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            যৌথ নাগরিক সমস্যার ক্ষেত্রে আন্তঃবিভাগীয় কাজের পূর্বশর্ত ও পর্যায়ক্রমিক বাস্তবায়ন প্রটোকল
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <GitBranch className="w-4 h-4 text-blue-600" />
          <span>পূর্বশর্ত নির্ভরতা নীতি (Dependency Enforcement):</span>
        </div>
        <p className="leading-relaxed">
          পূর্ববর্তী ডিপার্টমেন্টাল টাস্কের সমাধান প্রমাণপত্র আপলোড ও ভেরিফিকেশন সম্পন্ন না হওয়া পর্যন্ত পরবর্তী ডিপার্টমেন্টের টাস্ক আনলক বা ফিল্ডে পাঠানো যাবে না।
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-[var(--muted)]">সিকোয়েন্সিং ডাটা লোড হচ্ছে...</div>
      ) : (
        <div className="space-y-6">
          {sequencingRules.map(seq => (
            <div key={seq.id} className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
                <div>
                  <span className="text-[11px] font-mono font-bold text-[#166534]">{seq.id}</span>
                  <h3 className="font-bold text-base text-[var(--ink)]">{seq.name_bn}</h3>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-[var(--muted)]">ট্রিগার ক্যাটাগরি:</span>
                  {seq.trigger_categories.map((cat: string) => (
                    <span key={cat} className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pipeline Stages */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">বাস্তবায়ন পর্যায়ক্রম (Sequential Stages):</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {seq.stages.map((stg: any, sIdx: number) => (
                    <div key={sIdx} className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center font-bold text-xs text-[var(--ink)]">
                          {toBanglaNumber(stg.order)}
                        </span>
                        {stg.is_prerequisite_for_next ? (
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200">
                            পূর্বশর্ত (Prerequisite)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200">
                            চূড়ান্ত সমাপ্তি
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-mono text-[11px] uppercase font-bold text-[#166534]">{stg.department}</div>
                        <p className="text-xs font-semibold text-[var(--ink)] mt-1">{stg.action_bn}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
