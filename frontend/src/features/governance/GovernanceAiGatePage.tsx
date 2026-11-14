import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { toBanglaNumber } from '../../utils/formatters';
import { Sliders, ShieldCheck, AlertTriangle, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export const GovernanceAiGatePage: React.FC = () => {
  const [gate, setGate] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchGate = async () => {
    setLoading(true);
    try {
      const data = await apiClient.governance.getAiGate();
      setGate(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGate();
  }, []);

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-editorial">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[var(--line)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider bg-[var(--paper-elevated)] text-[var(--ink)] border border-[var(--line)] shadow-xs">
              <Sliders className="w-3.5 h-3.5" />
              পৌর অ্যালগরিদম সীমানা
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)] font-bangla flex items-center gap-3">
            এআই কনফিডেন্স গেট ও নীতিগত সীমানা (AI Confidence Gate Governance)
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
            স্বয়ংক্রিয় সুপারিশ নির্ভুলতা সীমা ও সেফটি গেট শিথিলকরণের দ্বৈত অনুমোদন নিয়ন্ত্রণ
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/governance/approvals"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            গেট পরিবর্তনের প্রস্তাব উত্থাপন
          </Link>
          <button
            type="button"
            onClick={fetchGate}
            disabled={loading}
            className="p-2 text-xs font-bold rounded-lg border border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--paper-elevated)] text-[var(--ink)] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg border border-border bg-card flex flex-col justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">বর্তমান কার্যকর গেট</span>
            <div className="mt-3 text-4xl font-extrabold font-mono text-foreground">
              {loading ? '...' : `${toBanglaNumber(Math.round((gate?.current_threshold || 0.8) * 100))}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ৮০% বা তদূর্ধ্ব কনফিডেন্স পেলে সরাসরি স্বয়ংক্রিয় রুট নির্ধারণ হয়। এর নিচে থাকলে ওয়ার্ড ডেস্কে হস্তচালিত যাচাই বাধ্যতামূলক।
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" /> সুরক্ষিত ও সক্রিয়
          </div>
        </div>

        <div className="col-span-2 p-6 rounded-lg border border-border bg-card space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            R&D v1.2 ও এস৭ দ্বৈত অনুমোদন নীতি
          </h3>
          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <div className="p-3 bg-muted/40 rounded border border-border/60">
              <span className="font-semibold text-foreground block mb-0.5">গেট বাড়ানো (Raising Gate):</span>
              সিস্টেমের নিরাপত্তা বাড়াতে ৮০% থেকে বাড়িয়ে ৮৫% বা ৯০% করার অধিকার সিস্টেম অ্যাডমিনিস্ট্রেটরের রয়েছে (অডিট রেকর্ডসহ)।
            </div>
            <div className="p-3 bg-amber-500/10 rounded border border-amber-500/20 text-foreground">
              <span className="font-semibold text-amber-700 dark:text-amber-400 block mb-0.5">
                গেট কমানো (Lowering Gate - কঠোর নিয়ন্ত্রণ):
              </span>
              কনফিডেন্স গেট ৮০% থেকে কমাতে হলে **সিটি গভর্নেন্স প্রধান ও সিস্টেম অ্যাডমিন—উভয়ের দ্বৈত অনুমোদন** এবং 
              কমপক্ষে ২৫০টি সংরক্ষিত পরীক্ষামূলক ডেটাসেটে রি-ভ্যালিডেশন সম্পাদন বাধ্যতামূলক। রি-ভ্যালিডেশন ব্যর্থ হলে পরিবর্তন কোনোভাবেই কার্যকর হবে না।
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
