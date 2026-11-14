import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { ShieldAlert, AlertTriangle, Flame, Zap, Construction, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toBanglaNumber } from '../../utils/formatters';

export const AdminAiSafetyConfigPage: React.FC = () => {
  const [safetyConfig, setSafetyConfig] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await apiClient.admin.getAiSafetyConfig();
        setSafetyConfig(data);
      } catch (e) {
        console.error('Failed to load AI safety config', e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const getFlagIcon = (flag: string) => {
    switch (flag) {
      case 'ELECTRIC_SHOCK_RISK':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'STRUCTURAL_COLLAPSE':
        return <Construction className="w-5 h-5 text-red-500" />;
      case 'DEEP_OPEN_MANHOLE':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'HAZARDOUS_GAS_LEAK':
        return <Flame className="w-5 h-5 text-rose-500" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-[#166534]" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ৪: বিধি ও এআই গভর্ন্যান্স (Safety Protocol)
            </span>
            <span className="text-xs text-[var(--muted)]">জরুরি ঝুঁকি চিহ্নিতকরণ ও প্রোটোকল</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            এআই সেফটি ও জরুরি ট্রায়াজ কনফিগারেশন (AI Safety Configuration)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            জীবন ও সম্পদের জন্য হুমকিস্বরূপ পরিস্থিতিতে এআই অ্যালগরিদমের স্বয়ংক্রিয় এস্কেলেশন প্রটোকল
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-900 dark:text-red-200 space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>ক্রিটিক্যাল সেফটি ওভাররাইড নীতি:</span>
        </div>
        <p className="leading-relaxed">
          কোনো নাগরিক প্রতিবেদনে যদি জরুরি নিরাপত্তা ঝুঁকি ফ্ল্যাগ (যেমন খোলা ম্যানহোল বা বৈদ্যুতিক তার) শনাক্ত হয়, তবে সাধারণ কিউ উপেক্ষা করে তাৎক্ষণিক জরুরি এসএলএ (২ ঘণ্টা প্রতিক্রিয়া) সক্রিয় হবে এবং আন্তঃসংস্থা সংকেত প্রেরিত হবে।
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-[var(--muted)]">সেফটি কনফিগারেশন লোড হচ্ছে...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safetyConfig?.critical_safety_flags?.map((flag: any) => (
              <div key={flag.flag} className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg)] border border-[var(--line)] flex items-center justify-center">
                      {getFlagIcon(flag.flag)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--ink)]">{flag.label_bn}</h4>
                      <span className="text-[10px] font-mono font-bold text-[var(--muted)]">{flag.flag}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200">
                    সক্রিয়
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs space-y-1">
                  <div className="text-[var(--muted)]">স্বয়ংক্রিয় একশন ট্রিগার:</div>
                  <div className="font-mono font-bold text-red-700 dark:text-red-400">{flag.action}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-3">
            <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#166534]" />
              <span>মানব যাচাই ও ট্রায়াজ গ্যারান্টি (Human Triage Mandate)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
                <span className="text-[var(--muted)]">ম্যানুয়াল ট্রায়াজ থ্রেশহোল্ড:</span>
                <p className="font-mono font-bold text-[var(--ink)]">৮০% কনফিডেন্স কাট-অফ</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
                <span className="text-[var(--muted)]">জরুরি স্বয়ংক্রিয় এস্কেলেশন:</span>
                <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400">সক্রিয় (Enabled)</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
                <span className="text-[var(--muted)]">ফায়ার সার্ভিস ও বিদ্যুৎ বোর্ড সংকেত:</span>
                <p className="font-mono font-bold text-blue-700 dark:text-blue-400">ইন্টার-এজেন্সি ব্রিজ</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
