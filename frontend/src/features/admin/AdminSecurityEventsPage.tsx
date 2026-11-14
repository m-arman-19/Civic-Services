import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { formatBanglaDate, toBanglaNumber } from '../../utils/formatters';
import { ShieldAlert, AlertTriangle, Key, Lock, CheckCircle2, XCircle } from 'lucide-react';

export const AdminSecurityEventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await apiClient.admin.getSecurityEvents();
        setEvents(data || []);
      } catch (e) {
        console.error('Failed to load security events', e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getEventBadge = (action: string) => {
    if (action.includes('FAILED') || action.includes('DENIED')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200">
          <XCircle className="w-3 h-3" />
          নিরাপত্তা লঙ্ঘন / ব্যর্থতা
        </span>
      );
    }
    if (action.includes('GATE') || action.includes('APPROVAL')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200">
          <AlertTriangle className="w-3 h-3" />
          গভর্ন্যান্স পরিবর্তন
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        সফল প্রমাণীকরণ
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ৭: অডিট ও নিরাপত্তা (Threat Monitoring)
            </span>
            <span className="text-xs text-[var(--muted)]">অননুমোদিত অ্যাক্সেস ট্র্যাকিং</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            নিরাপত্তা ইভেন্ট লগ (Security Events)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            লগইন প্রচেষ্টা, পারমিশন অস্বীকৃতি (403), সেফটি গেট পরিবর্তন ও দ্বৈত নিয়ন্ত্রণ অডিট ট্রেইল
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-bold">
                <th className="p-3.5">টাইমস্ট্যাম্প</th>
                <th className="p-3.5">ইভেন্ট অ্যাকশন (Action)</th>
                <th className="p-3.5">ইভেন্ট ক্যাটাগরি</th>
                <th className="p-3.5">রোল / ব্যবহারকারী</th>
                <th className="p-3.5">রিসোর্স</th>
                <th className="p-3.5 font-mono">হ্যাশ আইডি</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">নিরাপত্তা ইভেন্ট লোড হচ্ছে...</td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">কোনো নিরাপত্তা ব্যত্যয় রেকর্ড নেই</td>
                </tr>
              ) : (
                events.map(e => (
                  <tr key={e.id} className="hover:bg-[var(--bg)] transition font-mono">
                    <td className="p-3.5 text-[var(--muted)]">{formatBanglaDate(e.created_at)}</td>
                    <td className="p-3.5 font-bold text-[var(--ink)]">{e.action}</td>
                    <td className="p-3.5 font-sans">{getEventBadge(e.action)}</td>
                    <td className="p-3.5 text-[var(--ink)] font-semibold font-sans">{e.actor_role}</td>
                    <td className="p-3.5 text-[var(--muted)]">{e.resource_type} ({e.resource_id})</td>
                    <td className="p-3.5 text-[10px] text-[var(--muted)] truncate max-w-xs">{e.current_hash?.slice(0, 16)}...</td>
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
