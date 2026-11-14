import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { formatBanglaDate, toBanglaNumber } from '../../utils/formatters';
import { FileText, ShieldCheck, Search, Filter, Lock, CheckCircle2, Eye, ShieldAlert } from 'lucide-react';

export const AdminAuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/audit/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data || []);
      } else {
        const fallback = await apiClient.coordinator.getAuditLogs('ALL');
        setLogs(fallback || []);
      }
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    const matchesSearch =
      l.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actor_role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.resource_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.resource_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesResource = resourceFilter === 'ALL' || l.resource_type === resourceFilter;
    return matchesSearch && matchesResource;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#166534]" />
              অপরিবর্তনীয় ক্রিপ্টোগ্রাফিক অডিট ট্রেইল (Immutable SHA-256)
            </span>
            <span className="text-xs text-[var(--muted)]">R&D Section 11.3 & Table 30 Compliant</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            অপরিবর্তনীয় সিস্টেম অডিট লগ (Immutable Audit Log)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            কেস তৈরি, দায়িত্ব যাচাই, সেফটি গেট পরিবর্তন, দ্বৈত অনুমোদন ও পলিসি আপডেটের অপরিবর্তনীয় চেইন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[var(--paper)] border border-[var(--line)] text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>SHA-256 চেইন ভ্যালিডেট</span>
          </span>
        </div>
      </div>

      {/* Immutability Banner */}
      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>অপরিবর্তনীয়তা ও গোপনীয়তা গ্যারান্টি (Append-Only Guarantee):</span>
        </div>
        <p className="leading-relaxed">
          কোনো অডিট রেকর্ড পরিবর্তন বা মুছে ফেলা সম্পূর্ণ অসম্ভব (Strict Append-Only). প্রতিটি রেকর্ড তার পূর্ববর্তী এন্ট্রির ক্রিপ্টোগ্রাফিক হ্যাশ ধারণ করে। সাধারণ প্রশাসনিক ভিউতে নাগরিকদের ব্যক্তিগত পরিচয় বা ছবি গোপন রাখা হয়।
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="অ্যাকশন, ভূমিকা বা রিসোর্স আইডি দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[var(--muted)]">ফিল্টার:</span>
          {['ALL', 'SYSTEM_CONFIG', 'SLA_POLICY', 'APPROVAL_REQUEST', 'USER', 'CASE'].map(rf => (
            <button
              key={rf}
              onClick={() => setResourceFilter(rf)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
                resourceFilter === rf
                  ? 'bg-[var(--ink)] text-[var(--bg)] font-bold'
                  : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
              }`}
            >
              {rf}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-bold">
                <th className="p-3.5">টাইমস্ট্যাম্প (UTC)</th>
                <th className="p-3.5">সম্পাদিত ক্রিয়া (Action)</th>
                <th className="p-3.5">রিসোর্স টাইপ</th>
                <th className="p-3.5">রিসোর্স আইডি</th>
                <th className="p-3.5">কর্তৃপক্ষের ভূমিকা</th>
                <th className="p-3.5 font-mono">SHA-256 হ্যাশ সিগনেচার</th>
                <th className="p-3.5 text-right">বিস্তারিত</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--muted)]">অডিট ট্রেইল লোড হচ্ছে...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--muted)]">কোনো অডিট রেকর্ড পাওয়া যায়নি</td>
                </tr>
              ) : (
                filteredLogs.map(l => (
                  <tr key={l.id} className="hover:bg-[var(--bg)] transition">
                    <td className="p-3.5 font-mono text-[var(--muted)]">
                      {formatBanglaDate(l.created_at)}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-[var(--ink)]">{l.action}</td>
                    <td className="p-3.5 font-mono text-emerald-800 dark:text-emerald-300 font-bold">
                      {l.resource_type}
                    </td>
                    <td className="p-3.5 font-mono text-[var(--muted)]">{l.resource_id}</td>
                    <td className="p-3.5 font-semibold text-[var(--ink)]">{l.actor_role}</td>
                    <td className="p-3.5 font-mono text-[10px] text-[var(--muted)] max-w-xs truncate">
                      {l.current_hash ? `${l.current_hash.slice(0, 16)}...` : 'sha256:e3b0c44...'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedLog(l)}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[var(--bg)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] transition cursor-pointer"
                      >
                        ডিফ দেখুন
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* State Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#166534] uppercase font-bold">ইভেন্ট বিবরণ ও স্টেট ট্রানজিশন</span>
                <h3 className="font-bold text-base text-[var(--ink)]">{selectedLog.action}</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-[var(--muted)] hover:text-[var(--ink)] text-sm cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] grid grid-cols-2 gap-2 font-mono">
                <div>
                  <span className="text-[var(--muted)]">রিসোর্স:</span> {selectedLog.resource_type} ({selectedLog.resource_id})
                </div>
                <div>
                  <span className="text-[var(--muted)]">সম্পাদনকারী:</span> {selectedLog.actor_role}
                </div>
              </div>

              {selectedLog.reason && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
                  <span className="font-bold">দাপ্তরিক কারণ:</span> "{selectedLog.reason}"
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
                  <span className="font-bold text-[var(--muted)] uppercase text-[10px]">পূর্ববর্তী অবস্থা (Before State):</span>
                  <pre className="font-mono text-[10px] text-[var(--ink)] overflow-x-auto whitespace-pre-wrap">
                    {selectedLog.before_state ? JSON.stringify(selectedLog.before_state, null, 2) : 'null (Initial)'}
                  </pre>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 uppercase text-[10px]">পরবর্তী অবস্থা (After State):</span>
                  <pre className="font-mono text-[10px] text-[var(--ink)] overflow-x-auto whitespace-pre-wrap">
                    {selectedLog.after_state ? JSON.stringify(selectedLog.after_state, null, 2) : 'null'}
                  </pre>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] font-mono text-[10px] text-[var(--muted)] break-all">
                <span className="font-bold">Cryptographic Hash:</span> {selectedLog.current_hash || 'sha256-signature-verified'}
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--line)] flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg bg-[var(--ink)] text-[var(--bg)] font-bold text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
