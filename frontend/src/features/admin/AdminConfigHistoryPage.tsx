import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { formatBanglaDate, toBanglaNumber } from '../../utils/formatters';
import { Sliders, Clock, History, CheckCircle2, FileText } from 'lucide-react';

export const AdminConfigHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiClient.admin.getConfigHistory();
        setHistory(data || []);
      } catch (e) {
        console.error('Failed to load config history', e);
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
              গ্রুপ ৭: অডিট ও নিরাপত্তা (Configuration History)
            </span>
            <span className="text-xs text-[var(--muted)]">প্যারামিটার ভার্সনিং ও পরিবর্তনের কারণ</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            কনফিগারেশন পরিবর্তন ইতিহাস (Configuration Change History)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            সিস্টেম কনফিগ, এসএলএ ও গভর্ন্যান্স প্যারামিটারের প্রতিটি পরিবর্তনের টাইমস্ট্যাম্পড স্টেট ডিফারেন্স
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-bold">
                <th className="p-3.5">টাইমস্ট্যাম্প</th>
                <th className="p-3.5">কনফিগ প্যারামিটার (Resource)</th>
                <th className="p-3.5">সম্পাদিত ক্রিয়া (Action)</th>
                <th className="p-3.5">দাপ্তরিক কারণ ও প্রেক্ষাপট</th>
                <th className="p-3.5 text-right">স্টেট ডিফারেন্স</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--muted)]">ইতিহাস লোড হচ্ছে...</td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--muted)]">কোনো কনফিগারেশন পরিবর্তন পাওয়া যায়নি</td>
                </tr>
              ) : (
                history.map(h => (
                  <tr key={h.id} className="hover:bg-[var(--bg)] transition font-mono">
                    <td className="p-3.5 text-[var(--muted)]">{formatBanglaDate(h.created_at)}</td>
                    <td className="p-3.5 font-bold text-emerald-800 dark:text-emerald-400">
                      {h.resource_type}: {h.resource_id}
                    </td>
                    <td className="p-3.5 text-[var(--ink)] font-semibold">{h.action}</td>
                    <td className="p-3.5 text-[var(--muted)] font-sans max-w-sm truncate">{h.reason || 'প্রাতিষ্ঠানিক সেটিং হালনাগাদ'}</td>
                    <td className="p-3.5 text-right font-sans">
                      <button
                        onClick={() => setSelectedItem(h)}
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
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#166534] uppercase font-bold">{selectedItem.resource_type}</span>
                <h3 className="font-bold text-base text-[var(--ink)]">{selectedItem.action}</h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-[var(--muted)] hover:text-[var(--ink)] text-sm cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              {selectedItem.reason && (
                <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)]">
                  <span className="font-bold text-[var(--ink)]">দাপ্তরিক কারণ:</span> "{selectedItem.reason}"
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
                  <span className="font-bold text-[var(--muted)] uppercase text-[10px]">পূর্বের মান (Before):</span>
                  <pre className="font-mono text-[10px] text-[var(--ink)] overflow-x-auto whitespace-pre-wrap">
                    {selectedItem.before_state ? JSON.stringify(selectedItem.before_state, null, 2) : 'null (Initial)'}
                  </pre>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase text-[10px]">নতুন মান (After):</span>
                  <pre className="font-mono text-[10px] text-[var(--ink)] overflow-x-auto whitespace-pre-wrap">
                    {selectedItem.after_state ? JSON.stringify(selectedItem.after_state, null, 2) : 'null'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--line)] flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
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
