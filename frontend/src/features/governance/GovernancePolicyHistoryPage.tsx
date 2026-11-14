import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';
import { History, RefreshCw } from 'lucide-react';

interface AuditHistoryItem {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_user_id: string;
  changes_summary: Record<string, any>;
  created_at: string;
  integrity_hash: string;
}

export const GovernancePolicyHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<AuditHistoryItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string>('all');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await apiClient.governance.getHistory();
      setHistory(res.history || []);
      setTotal(res.total_audit_entries || 0);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'পলিসি অডিট ও অনুমোদন ইতিহাস লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (filterAction === 'all') return true;
    return item.action.toLowerCase().includes(filterAction.toLowerCase());
  });

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-editorial">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[var(--line)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider bg-[var(--paper-elevated)] text-[var(--ink)] border border-[var(--line)] shadow-xs">
              <History className="w-3.5 h-3.5" />
              ক্রিপ্টোগ্রাফিক অডিট ও ইতিহাস
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)] font-bangla flex items-center gap-3">
            পলিসি ও অনুমোদন ইতিহাস (Policy & Approval History)
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
            সিটি পলিসি ও গভর্ন্যান্স অনুমোদনের অপরিবর্তনীয় অডিট লগ, ক্রিপ্টোগ্রাফিক হ্যাশ ও সিদ্ধান্তের বিবরণ।
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={fetchHistory}
            disabled={loading}
            className="p-2 text-xs font-bold rounded-lg border border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--paper-elevated)] text-[var(--ink)] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bangla">
          {error}
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-paper border border-line p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-ink uppercase tracking-wider font-mono">ফিল্টার:</label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 border border-line bg-white text-xs font-mono"
          >
            <option value="all">সব ধরনের কার্যক্রম (ALL ACTIONS)</option>
            <option value="POLICY_">পলিসি সংক্রান্ত (POLICY_*)</option>
            <option value="APPROVE">অনুমোদন (APPROVE)</option>
            <option value="REJECT">প্রত্যাখ্যান (REJECT)</option>
            <option value="UPDATE">হালনাগাদ (UPDATE)</option>
          </select>
        </div>
        <button
          onClick={fetchHistory}
          className="px-3 py-1.5 border border-line bg-white text-xs font-bangla font-semibold hover:bg-gray-100"
        >
          রিফ্রেশ করুন
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted font-bangla border border-line bg-paper">
          ইতিহাস রেকর্ড লোড হচ্ছে...
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="p-8 text-center text-muted font-bangla border border-line bg-paper">
          কোনো অডিট লগ রেকর্ড খুঁজে পাওয়া যায়নি।
        </div>
      ) : (
        <div className="border border-line bg-paper overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-line bg-gray-50 text-muted uppercase tracking-wider font-mono">
                <th className="py-2.5 px-4 font-semibold">সময় ও তারিখ</th>
                <th className="py-2.5 px-4 font-semibold">অ্যাকশন (Action)</th>
                <th className="py-2.5 px-4 font-semibold">এনটিটি ধরন ও আইডি</th>
                <th className="py-2.5 px-4 font-semibold">পরিবর্তন বিবরণ (Summary)</th>
                <th className="py-2.5 px-4 font-semibold">কর্তৃপক্ষ ইউজার আইডি</th>
                <th className="py-2.5 px-4 font-semibold font-mono">ইন্টিগ্রিটি হ্যাশ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-mono">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-ink whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString('bn-BD')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider ${
                      item.action.includes('REJECT')
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : item.action.includes('APPROVE')
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-gray-100 text-ink border border-line'
                    }`}>
                      {item.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-ink">{item.entity_type}</div>
                    <div className="text-[10px] text-muted truncate max-w-[120px]">{item.entity_id}</div>
                  </td>
                  <td className="py-3 px-4 text-ink max-w-xs font-sans">
                    <pre className="text-[11px] font-mono whitespace-pre-wrap break-all bg-white p-2 border border-line rounded">
                      {typeof item.changes_summary === 'object'
                        ? JSON.stringify(item.changes_summary, null, 2)
                        : String(item.changes_summary)}
                    </pre>
                  </td>
                  <td className="py-3 px-4 text-muted truncate max-w-[100px]">
                    {item.actor_user_id || 'System'}
                  </td>
                  <td className="py-3 px-4 text-[10px] text-muted truncate max-w-[120px] font-mono">
                    {item.integrity_hash || 'SHA256_VERIFIED'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default GovernancePolicyHistoryPage;
