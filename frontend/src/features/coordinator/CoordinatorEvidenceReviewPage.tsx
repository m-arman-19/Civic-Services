import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import apiClient from '../../services/apiClient';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  Camera,
  Calendar,
  Building,
  AlertTriangle,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export const CoordinatorEvidenceReviewPage: React.FC = () => {
  const { cases } = useCases();
  // Filter cases with completed tasks or proof uploaded
  const reviewCases = cases.filter(c => c.status === 'resolved_pending_citizen' || c.status === 'in_progress' || c.tasks?.some(t => t.resolutionEvidence && t.resolutionEvidence.length > 0));

  const [selectedCase, setSelectedCase] = useState<any>(reviewCases[0] || null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleDecision = async (decision: 'approved' | 'rework_required') => {
    if (!selectedCase) return;
    if (decision === 'rework_required' && !reviewNotes.trim()) {
      alert('পুনরায় কাজের নির্দেশনার জন্য যৌক্তিক কারণ উল্লেখ করা বাধ্যতামূলক');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.coordinator.reviewResolution(
        selectedCase.id,
        decision,
        reviewNotes || (decision === 'approved' ? 'প্রমাণক পর্যালোচনা সফল ও গৃহীত' : 'পুনরায় কাজের নির্দেশ')
      );
      setMessage(
        decision === 'approved'
          ? 'প্রমাণক পর্যালোচনা সফলভাবে অনুমোদিত হয়েছে। কেসটি চূড়ান্ত সমাপ্তির জন্য প্রস্তুত।'
          : 'পুনরায় কাজের নির্দেশ সংশ্লিষ্ট ফিল্ড অফিসারের কাছে প্রেরিত হয়েছে।'
      );
      setReviewNotes('');
    } catch (e: any) {
      alert('পর্যালোচনা সংরক্ষণে ত্রুটি ঘটেছে: ' + (e?.message || 'অনুগ্রহ করে পুনরায় চেষ্টা করুন'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--green-light)] px-3 py-0.5 rounded-full border border-[var(--line)]">
              রেজোলিউশন ও রিভিউ
            </span>
            <span className="text-xs text-[var(--muted)]">R&D Section 14 / Module 8 প্রমাণক নিরীক্ষা</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
            প্রমাণক ও সমাধান পর্যালোচনা (Evidence Review)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            মাঠপর্যায়ের কর্মকর্তা কর্তৃক আপলোডকৃত সমাপ্তি প্রমাণক (Before vs After) যাচাই এবং গুণগত মান অনুমোদন
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs underline cursor-pointer">
            ঠিক আছে
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Case Queue */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block">
            পর্যালোচনার জন্য অপেক্ষমাণ কেস ({toBanglaNumber(reviewCases.length)} টি):
          </label>
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {reviewCases.map(item => (
              <div
                key={item.id}
                onClick={() => { setSelectedCase(item); setMessage(null); }}
                className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                  item.id === selectedCase?.id
                    ? 'bg-[var(--green-light)] border-[var(--green)]'
                    : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line-dark)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--gold)]">
                    {item.trackingNumber || item.id}
                  </span>
                  <PriorityBadge priority={item.priority} />
                </div>
                <h4 className="text-xs font-bold text-[var(--ink)] truncate mt-1">{item.title}</h4>
                <div className="flex items-center justify-between text-[10px] text-[var(--muted)] mt-2 pt-2 border-t border-[var(--line)]">
                  <span>{item.location.wardName}</span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Before-After Evidence Inspection Workspace */}
        {selectedCase ? (
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-5 shadow-xs">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--line)]">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--gold)]">{selectedCase.trackingNumber || selectedCase.id}</span>
                  <h3 className="text-base font-bold text-[var(--ink)] mt-0.5">{selectedCase.title}</h3>
                  <p className="text-xs text-[var(--muted)] mt-1">{selectedCase.location.wardName} • {selectedCase.location.address}</p>
                </div>
                <StatusBadge status={selectedCase.status} />
              </div>

              {/* Side-by-Side Before vs After Evidence */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[var(--green)]" />
                  <span>সরেজমিন কাজের পূর্বাপর প্রমাণক (Before vs After Evidence):</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before Evidence */}
                  <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--line)] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-red-600">কাজের পূর্বের অবস্থা (Before)</span>
                      <span className="text-[10px] text-[var(--muted)]">নাগরিক ইনটেক</span>
                    </div>
                    <div className="aspect-video w-full rounded-lg bg-black/10 flex items-center justify-center overflow-hidden border border-[var(--line)]">
                      {selectedCase.initialEvidence && selectedCase.initialEvidence[0]?.url ? (
                        <img
                          src={selectedCase.initialEvidence[0].url}
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4 text-xs text-[var(--muted)]">
                          <Camera className="w-6 h-6 mx-auto mb-1 opacity-40" />
                          <span>প্রাথমিক ছবি সংরক্ষিত আছে</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--muted)] italic">
                      "নাগরিক কর্তৃক রিপোর্টকৃত প্রাথমিক সমস্যার ছবি"
                    </p>
                  </div>

                  {/* After Evidence */}
                  <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--line)] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-700">কাজের পরের অবস্থা (After Proof)</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">মাঠপর্যায়ের প্রমাণক</span>
                    </div>
                    <div className="aspect-video w-full rounded-lg bg-black/10 flex items-center justify-center overflow-hidden border border-emerald-300 dark:border-emerald-800">
                      <img
                        src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80"
                        alt="After completion"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                      ✓ ড্রেন ডেসিল্টিং ও রাস্তা মেরামত সম্পন্ন প্রমাণক আপলোডকৃত
                    </p>
                  </div>
                </div>
              </div>

              {/* R&D Rule Callout */}
              <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--line)] text-xs text-[var(--muted)] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--green)] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[var(--ink)]">R&D Rule S8:</strong> শুধুমাত্র প্রমাণক আপলোড করলেই কাজ সম্পন্ন হয় না। সমাধান সন্তোষজনক বিবেচিত হলে নাগরিক মতামতের অপেক্ষায় রাখা হবে অথবা সমন্বয়ক কর্তৃক চূড়ান্ত সমাপ্তি অনুমোদিত হবে।
                </span>
              </div>

              {/* Notes Input */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-[var(--ink)]">সমন্বয়কের অডিট মন্তব্য বা পুনঃকাজের নির্দেশনা:</label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="কাজের গুণগত মান নিশ্চিত হয়েছে কি না বা কোনো ঘাটতি থাকলে সুস্পষ্ট নির্দেশনা লিখুন..."
                  className="w-full p-2.5 bg-[var(--bg)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--green)]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDecision('rework_required')}
                  className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>পুনরায় কাজের নির্দেশ (Rework)</span>
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDecision('approved')}
                  className="px-5 py-2 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>প্রমাণক সঠিক ও অনুমোদিত</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center text-xs text-[var(--muted)] bg-[var(--paper)] rounded-2xl border border-[var(--line)]">
            পর্যালোচনার জন্য বাম পাশের তালিকা থেকে একটি কেস নির্বাচন করুন।
          </div>
        )}
      </div>
    </div>
  );
};
