import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { toBanglaNumber } from '../../utils/formatters';
import { AlertOctagon, MapPin, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';

export const GovernanceRecurringIssuesPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await apiClient.governance.getRecurringIssues();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-editorial">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[var(--line)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider bg-[var(--paper-elevated)] text-[var(--ink)] border border-[var(--line)] shadow-xs">
              <AlertOctagon className="w-3.5 h-3.5" />
              ক্রনিক হটস্পট বিশ্লেষণ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)] font-bangla flex items-center gap-3">
            বারংবার সমস্যা ও হটস্পট পর্যালোচনা (Recurring Hotspots)
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
            দীর্ঘস্থায়ী অবকাঠামোগত ব্যর্থতা, পুনরাবৃত্তিমূলক ড্রেন ব্লকেজ ও অগ্রাধিকার নীতি সংস্কার
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={fetchIssues}
            disabled={loading}
            className="p-2 text-xs font-bold rounded-lg border border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--paper-elevated)] text-[var(--ink)] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-3 bg-muted/40 border border-border/70 rounded-lg text-xs text-foreground flex items-center justify-between">
        <div>
          <span className="font-semibold">বিশ্লেষণের ব্যাপ্তি:</span> {data?.analysis_period || 'গত ৩০ দিন'}
        </div>
        <div className="text-muted-foreground italic">
          {data?.policy_implication || 'বারংবার সমস্যাযুক্ত ওয়ার্ডসমূহে অতিরিক্ত বাজেট ও জনবল বরাদ্দের প্রস্তাব বিবেচনাধীন।'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(data?.identified_hotspots || []).map((h: any, idx: number) => (
          <div key={idx} className="p-4 rounded-lg border border-border bg-card space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {toBanglaNumber(h.ward_number)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">ওয়ার্ড {toBanglaNumber(h.ward_number)}</h4>
                  <span className="text-[11px] text-muted-foreground">{h.zone}</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                h.risk_rating.includes('High')
                  ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                  : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
              }`}>
                ঝুঁকি: {h.risk_rating}
              </span>
            </div>

            <div className="text-xs space-y-1.5 pt-2 border-t border-border/60">
              <div className="flex justify-between">
                <span className="text-muted-foreground">সমস্যার ঘনত্ব:</span>
                <span className="font-bold text-foreground">{toBanglaNumber(h.incident_density)} টি সংশ্লিষ্ট অভিযোগ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">প্রধান পুনরাবৃত্ত সমস্যা:</span>
                <span className="font-medium text-foreground">{h.primary_issue}</span>
              </div>
              <div className="pt-2 text-muted-foreground">
                <span className="font-semibold text-foreground block mb-0.5">প্রস্তাবিত নীতিগত সংস্কার:</span>
                <p className="text-[11px] bg-muted/30 p-2 rounded border border-border/40 text-foreground leading-relaxed">
                  {h.recommended_action}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
