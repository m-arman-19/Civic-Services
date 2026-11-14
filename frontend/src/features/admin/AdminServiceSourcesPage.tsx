import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { toBanglaNumber } from '../../utils/formatters';
import { BookOpen, ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';

export const AdminServiceSourcesPage: React.FC = () => {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const data = await apiClient.admin.getKnowledgeSources();
        setSources(data || []);
      } catch (e) {
        console.error('Failed to load service sources', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSources();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ৫: সেবা নলেজবেস ও RAG ইঞ্জিন
            </span>
            <span className="text-xs text-[var(--muted)]">অনুমোদিত আইনি ও প্রবিধানিক তথ্যসূত্র</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            সরকারি প্রামাণ্য তথ্যসূত্র (Official Service Sources)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            সিটি কর্পোরেশন সচিবালয় ও স্থানীয় সরকার বিভাগের গেজেট ও বিধিমালার অনুমোদিত উৎস তালিকা
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-[var(--muted)]">তথ্যসূত্র লোড হচ্ছে...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map(src => (
            <div key={src.id} className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#166534]">{src.id}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  সরকারিভাবে অনুমোদিত
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">{src.name_bn}</h3>
                <p className="text-xs text-[var(--muted)] mt-1">{src.authority}</p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">নথি সংখ্যা:</span>
                  <span className="font-bold text-[var(--ink)]">{toBanglaNumber(src.document_count)} টি</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">সর্বশেষ গেজেট যাচাই:</span>
                  <span className="text-[var(--ink)]">{src.last_verified_date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
