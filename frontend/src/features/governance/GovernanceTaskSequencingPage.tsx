import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { GitFork, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export const GovernanceTaskSequencingPage: React.FC = () => {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPipelines = async () => {
    setLoading(true);
    try {
      const data = await apiClient.governance.getSequencingRules();
      setPipelines(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-editorial">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[var(--line)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider bg-[var(--paper-elevated)] text-[var(--ink)] border border-[var(--line)] shadow-xs">
              <GitFork className="w-3.5 h-3.5" />
              ক্রস-ডিপার্টমেন্টাল পাইপলাইন
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)] font-bangla flex items-center gap-3">
            টাস্ক সিকোয়েন্সিং ও পূর্বশর্ত নীতিমালা (Task Sequencing Pipelines)
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
            যৌগিক কেসসমূহে বিভাগীয় কাজের ধারাবাহিকতা ও অযৌক্তিক সড়ক খোঁড়াখুঁড়ি প্রতিরোধ নীতিমালা
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/governance/approvals"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            সিকোয়েন্স পরিবর্তনের প্রস্তাব
          </Link>
          <button
            type="button"
            onClick={fetchPipelines}
            disabled={loading}
            className="p-2 text-xs font-bold rounded-lg border border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--paper-elevated)] text-[var(--ink)] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {pipelines.map((p) => (
          <div key={p.id} className="p-5 border border-border rounded-lg bg-card space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-muted-foreground">{p.id}</span>
                <h3 className="text-base font-semibold text-foreground mt-0.5">{p.pipeline_name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {p.policy_status}
                </span>
                <span className="text-xs text-muted-foreground">কার্যকর: {p.last_reviewed}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2.5 rounded border border-border/40">
              <span className="font-semibold text-foreground">পৌরনীতির যৌক্তিকতা:</span> {p.rationale}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {p.stages.map((st: any, idx: number) => (
                <div key={idx} className="p-3 rounded border border-border/70 bg-background relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-1">
                      <span>ধাপ {st.stage}</span>
                      <span className="text-[11px] font-mono font-normal">{st.prerequisite}</span>
                    </div>
                    <div className="text-xs font-semibold text-foreground">{st.department}</div>
                    <div className="text-xs text-muted-foreground mt-1">{st.task}</div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border/40 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> সিকোয়েন্স লক সক্রিয়
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
