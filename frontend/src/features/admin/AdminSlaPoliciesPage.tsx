import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { toBanglaNumber } from '../../utils/formatters';
import { Clock, Edit2, ShieldAlert, CheckCircle2, Save, AlertCircle } from 'lucide-react';

export const AdminSlaPoliciesPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingPolicy, setEditingPolicy] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [form, setForm] = useState({
    response_target_hours: 2,
    resolution_target_hours: 6,
    reminder_lead_hours: 1,
    escalation_1_hours: 4,
    escalation_2_hours: 8
  });

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const data = await apiClient.admin.getSlaPolicies();
      setPolicies(data || []);
    } catch (e) {
      console.error('Failed to load SLA policies', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const openEdit = (p: any) => {
    setEditingPolicy(p);
    setForm({
      response_target_hours: p.response_target_hours,
      resolution_target_hours: p.resolution_target_hours,
      reminder_lead_hours: p.reminder_lead_hours,
      escalation_1_hours: p.escalation_1_hours,
      escalation_2_hours: p.escalation_2_hours
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;

    try {
      setIsSaving(true);
      await apiClient.admin.updateSlaPolicy(editingPolicy.priority, form);
      showSuccess(`${editingPolicy.priority} অগ্রাধিকারের এসএলএ পলিসি সফলভাবে হালনাগাদ ও অডিটে সংরক্ষিত হয়েছে।`);
      setEditingPolicy(null);
      loadPolicies();
    } catch (err: any) {
      showError(err.message || 'এসএলএ পলিসি আপডেট ব্যর্থ');
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200">জরুরি (Emergency)</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200">উচ্চ (High)</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200">মাঝারি (Medium)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[var(--bg)] text-[var(--muted)] border border-[var(--line)]">সাধারণ (Low)</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ৬: এসএলএ ও অপারেশনস (Table 12 & 13)
            </span>
            <span className="text-xs text-[var(--muted)]">নাগরিক সেবা সনদ প্রতিশ্রুতি</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            এসএলএ নীতিমালা কনফিগারেশন (SLA Policies)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            সিটি কর্পোরেশনের অগ্রাধিকার অনুযায়ী প্রাথমিক সাড়া ও চূড়ান্ত সমাধানের সময়সীমা নির্ধারণ
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>কাস্টমাইজড এসএলএ স্ট্যান্ডার্ড:</span>
        </div>
        <p className="leading-relaxed">
          কোনো সার্বজনীন হার্ডকোডেড এসএলএ নেই; সিটি কর্পোরেশন নিজস্ব অবকাঠামো ও সক্ষমতা অনুযায়ী এই লক্ষ্যমাত্রা নির্ধারণ করে। পলিসি পরিবর্তনের প্রতিটি রেকর্ড অডিটে সংরক্ষিত হয়।
        </p>
      </div>

      {/* Policies Table */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-bold">
                <th className="p-3.5">অগ্রাধিকার স্তর (Priority)</th>
                <th className="p-3.5">সাড়া দেওয়ার টার্গেট</th>
                <th className="p-3.5">সমাধানের চূড়ান্ত টার্গেট</th>
                <th className="p-3.5">রিমাইন্ডার লিড</th>
                <th className="p-3.5">টায়ার-১ এস্কেলেশন</th>
                <th className="p-3.5">টায়ার-২ এস্কেলেশন</th>
                <th className="p-3.5 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--muted)]">এসএলএ পলিসি লোড হচ্ছে...</td>
                </tr>
              ) : (
                policies.map(p => (
                  <tr key={p.id} className="hover:bg-[var(--bg)] transition">
                    <td className="p-3.5 font-bold">{getPriorityLabel(p.priority)}</td>
                    <td className="p-3.5 font-mono font-bold text-[var(--ink)]">
                      {toBanglaNumber(p.response_target_hours)} ঘণ্টা
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {toBanglaNumber(p.resolution_target_hours)} ঘণ্টা
                    </td>
                    <td className="p-3.5 font-mono text-[var(--muted)]">
                      {toBanglaNumber(p.reminder_lead_hours)} ঘণ্টা পূর্বে
                    </td>
                    <td className="p-3.5 font-mono text-amber-700 dark:text-amber-400">
                      +{toBanglaNumber(p.escalation_1_hours)} ঘণ্টায় (ZEO)
                    </td>
                    <td className="p-3.5 font-mono text-red-700 dark:text-red-400">
                      +{toBanglaNumber(p.escalation_2_hours)} ঘণ্টায় (CEO)
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[var(--bg)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] transition cursor-pointer"
                      >
                        সম্পাদনা
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-bold text-base text-[var(--ink)]">
                এসএলএ পলিসি সমন্বয় ({editingPolicy.priority.toUpperCase()})
              </h3>
              <button onClick={() => setEditingPolicy(null)} className="text-[var(--muted)] hover:text-[var(--ink)] text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">সাড়ার টার্গেট (ঘণ্টা) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.response_target_hours}
                    onChange={e => setForm({ ...form, response_target_hours: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">সমাধান টার্গেট (ঘণ্টা) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.resolution_target_hours}
                    onChange={e => setForm({ ...form, resolution_target_hours: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">রিমাইন্ডার লিড</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.reminder_lead_hours}
                    onChange={e => setForm({ ...form, reminder_lead_hours: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">টায়ার-১ (ZEO)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.escalation_1_hours}
                    onChange={e => setForm({ ...form, escalation_1_hours: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">টায়ার-২ (CEO)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.escalation_2_hours}
                    onChange={e => setForm({ ...form, escalation_2_hours: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--line)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPolicy(null)}
                  className="px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)] cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-[var(--ink)] text-[var(--bg)] font-bold hover:opacity-90 cursor-pointer"
                >
                  {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'এসএলএ সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
