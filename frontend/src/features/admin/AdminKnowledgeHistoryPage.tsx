import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import { History, FileText, CheckCircle2, Shield } from 'lucide-react';

export const AdminKnowledgeHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiClient.admin.getKnowledgeHistory();
        setHistory(data || []);
      } catch (e) {
        console.error('Failed to load knowledge history', e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ৫: সেবা নলেজবেস ও RAG ইঞ্জিন
            </span>
            <span className="text-xs text-[var(--muted)]">ইনজেশন ও সংস্করণ অডিট লগ</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            নলেজবেস সংস্করণ ও পরিবর্তন ইতিহাস (Knowledge Update History)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            নাগরিক সেবা সনদপত্র ও ডকুমেন্ট এম্বেডিং পরিবর্তনের অপরিবর্তনীয় অডিট ট্রেইল
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-bold">
                <th className="p-3.5">টাইমস্ট্যাম্প</th>
                <th className="p-3.5">সম্পাদিত ক্রিয়া (Action)</th>
                <th className="p-3.5">রিসোর্স আইডি</th>
                <th className="p-3.5">কর্তৃপক্ষের ভূমিকা</th>
                <th className="p-3.5">দাপ্তরিক কারণ / নোট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--muted)]">ইতিহাস লোড হচ্ছে...</td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--muted)]">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span>নাগরিক সনদ v2026.1 প্রাথমিক সীডিংয়ের পর কোনো পরিবর্তন করা হয়নি।</span>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map(h => (
                  <tr key={h.id} className="hover:bg-[var(--bg)] transition font-mono">
                    <td className="p-3.5 text-[var(--muted)]">{formatBanglaDate(h.created_at)}</td>
                    <td className="p-3.5 font-bold text-[var(--ink)]">{h.action}</td>
                    <td className="p-3.5 text-[var(--muted)]">{h.resource_id}</td>
                    <td className="p-3.5 text-emerald-700 dark:text-emerald-400 font-semibold">{h.actor_role}</td>
                    <td className="p-3.5 text-[var(--muted)] font-sans">{h.reason || 'প্রাতিষ্ঠানিক সংস্করণ অনুমোদন'}</td>
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
