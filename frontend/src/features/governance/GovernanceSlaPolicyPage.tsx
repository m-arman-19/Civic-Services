import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { toBanglaNumber } from '../../utils/formatters';
import { Clock, ShieldCheck, Edit3, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export const GovernanceSlaPolicyPage: React.FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editPolicy, setEditPolicy] = useState<any | null>(null);
  const [formResponse, setFormResponse] = useState<number>(2);
  const [formResolution, setFormResolution] = useState<number>(6);
  const [formNotes, setFormNotes] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data = await apiClient.governance.getSlaPolicies();
      setPolicies(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const openEdit = (p: any) => {
    setEditPolicy(p);
    setFormResponse(p.first_response_hours || p.response_target_hours || 2);
    setFormResolution(p.resolution_hours || p.resolution_target_hours || 6);
    setFormNotes('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPolicy) return;
    setActionLoading(true);
    try {
      const res = await apiClient.governance.updateSlaPolicy(editPolicy.priority, {
        first_response_hours: Number(formResponse),
        resolution_hours: Number(formResolution),
        notes_bn: formNotes
      });
      if (res) {
        alert(res.message_bn || 'এসএলএ পলিসি সফলভাবে হালনাগাদ করা হয়েছে।');
        setEditPolicy(null);
        fetchPolicies();
      }
    } catch (e: any) {
      alert(e.message || 'আপডেটে ব্যর্থ হয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-editorial">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[var(--line)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider bg-[var(--paper-elevated)] text-[var(--ink)] border border-[var(--line)] shadow-xs">
              <Clock className="w-3.5 h-3.5" />
              পৌর সেবা মান ও এসএলএ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)] font-bangla flex items-center gap-3">
            পৌর সেবা স্তর মানদণ্ড (Municipal SLA Policies)
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
            সিটি কর্পোরেশনের অগ্রাধিকার স্তরভিত্তিক প্রাথমিক সাড়া ও চূড়ান্ত সমাধান সময়সীমা নির্ধারণ
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={fetchPolicies}
            disabled={loading}
            className="p-2 text-xs font-bold rounded-lg border border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--paper-elevated)] text-[var(--ink)] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">অগ্রাধিকার স্তর</th>
              <th className="py-3 px-4">প্রাথমিক সাড়া টার্গেট</th>
              <th className="py-3 px-4">চূড়ান্ত সমাধান টার্গেট</th>
              <th className="py-3 px-4">এস্কেলেশন লিড টাইম</th>
              <th className="py-3 px-4">কর্তৃত্ব</th>
              <th className="py-3 px-4 text-right">পদক্ষেপ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  এসএলএ নীতিমালা লোড হচ্ছে...
                </td>
              </tr>
            ) : (
              policies.map((p) => (
                <tr key={p.priority} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold uppercase text-foreground">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      p.priority === 'emergency' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                      p.priority === 'high' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                      'bg-muted text-foreground'
                    }`}>
                      {p.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium">
                    {toBanglaNumber(p.first_response_hours || p.response_target_hours || 0)} ঘণ্টা
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    {toBanglaNumber(p.resolution_hours || p.resolution_target_hours || 0)} ঘণ্টা
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {toBanglaNumber(p.reminder_lead_hours || 2)} ঘণ্টা পূর্বে সতর্কতা
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-medium">
                    {p.authority || 'সিটি গভর্নেন্স প্রধান কর্তৃক নির্ধারিত'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openEdit(p)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border hover:bg-muted text-foreground transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      টার্গেট সম্পাদনা
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editPolicy && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleUpdate} className="bg-card border border-border rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm uppercase">
                {editPolicy.priority} এসএলএ টার্গেট সংশোধন
              </h3>
              <button
                type="button"
                onClick={() => setEditPolicy(null)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">প্রাথমিক সাড়া সময়সীমা (ঘণ্টা):</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={formResponse}
                  onChange={(e) => setFormResponse(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded border border-border bg-background text-foreground"
                  required
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">চূড়ান্ত সমাধান সময়সীমা (ঘণ্টা):</label>
                <input
                  type="number"
                  min="1"
                  max="720"
                  value={formResolution}
                  onChange={(e) => setFormResolution(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded border border-border bg-background text-foreground"
                  required
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">সংশোধনের কারণ / সরকারি সিদ্ধান্ত সূত্র:</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="যেমন: নাগরিক সেবা সনদের নতুন নির্দেশিকা অনুযায়ী..."
                  className="w-full px-3 py-2 rounded border border-border bg-background text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setEditPolicy(null)}
                className="px-3.5 py-1.5 rounded text-xs border border-border text-muted-foreground hover:bg-muted"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                হালনাগাদ নিশ্চিত করুন
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
