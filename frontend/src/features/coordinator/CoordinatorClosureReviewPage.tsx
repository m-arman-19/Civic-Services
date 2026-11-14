import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { apiClient } from '../../services/apiClient';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Clock,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  XCircle,
  FileText
} from 'lucide-react';

export const CoordinatorClosureReviewPage: React.FC = () => {
  const { cases } = useCases();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Form states for closure
  const [satisfactionConfirmed, setSatisfactionConfirmed] = useState<boolean>(true);
  const [exceptionDocumented, setExceptionDocumented] = useState<boolean>(false);
  const [closureNotes, setClosureNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Candidate cases for closure: resolved_pending_citizen, in_progress, completed tasks, or closed cases for review
  const closureCandidates = cases.filter(c =>
    (c.status as any) === 'resolved_proof_uploaded' ||
    c.status === 'resolved_pending_citizen' ||
    c.status === 'in_progress' ||
    c.tasks?.some(t => (t.status as any) === 'completed_awaiting_review' || (t.status as any) === 'verified_completed' || t.status === 'resolved')
  );

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  const handleOpenClosureModal = (caseId: string) => {
    setSelectedCaseId(caseId);
    setErrorMsg(null);
    setSuccessMsg(null);
    setSatisfactionConfirmed(true);
    setExceptionDocumented(false);
    setClosureNotes('মাঠ পর্যায়ের কাজ ও প্রমাণক যথাযথভাবে যাচাইপূর্বক কেসটি চূড়ান্তভাবে সমাপ্ত ঘোষণা করা হলো।');
  };

  const handleExecuteClosure = async () => {
    if (!selectedCaseId) return;
    if (!closureNotes.trim()) {
      alert('কেস সমাপ্তির দাপ্তরিক নোট প্রদান বাধ্যতামূলক।');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await apiClient.coordinator.closeCase(selectedCaseId, {
        satisfaction_confirmed: satisfactionConfirmed,
        closure_notes: closureNotes,
        exception_documented: exceptionDocumented
      });

      setSuccessMsg('কেসটি সফলভাবে সমাপ্ত (Closed) ঘোষণা করা হয়েছে এবং চূড়ান্ত অডিট ট্রেইলে সংরক্ষিত হয়েছে।');
      setTimeout(() => {
        setSelectedCaseId(null);
        setSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to close case:', err);
      const detail = err?.response?.data?.detail || err.message || 'কেস সমাপ্তি ব্যর্থ হয়েছে।';
      setErrorMsg(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in text-[var(--ink)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
              M5 চূড়ান্ত নিষ্পত্তি ও ক্লোজার গেটওয়ে
            </span>
            <span className="text-xs text-[var(--muted)]">প্রমাণক যাচাই ও নাগরিক সন্তুষ্টি সাপেক্ষে কেস সমাপ্তি</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            চূড়ান্ত কেস ক্লোজার ও সমাপ্তি পর্যালোচনা (Closure Review)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            সংশ্লিষ্ট সকল বিভাগের কাজ সমাপ্তি, প্রামাণ্য আলোকচিত্র ও নাগরিক প্রতিক্রিয়া যাচাই সাপেক্ষে কেস ক্লোজ করার অনুমোদিত ডেস্ক
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/coordinator"
            className="px-3.5 py-1.5 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] text-xs text-[var(--ink)] hover:bg-[var(--line)]/20 transition"
          >
            ← ড্যাশবোর্ডে ফিরুন
          </Link>
        </div>
      </div>

      {/* R&D Compliance Governance Banner */}
      <div className="civic-card rounded-xl p-4 bg-emerald-500/5 border-emerald-500/30 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-[var(--ink)]">
            আরঅ্যান্ডডি কেস ক্লোজার নীতিমালা (R&D Section 11.3 & 14):
          </div>
          <p className="text-[var(--muted)] leading-relaxed">
            ১. কোনো অবস্থাতেই <strong>প্রমাণপত্র (AFTER Photo)</strong> আপলোড ব্যতিরেকে কেস বন্ধ করা যাবে না (ব্যতিক্রম কেবল নথিভুক্ত প্রশাসনিক আদেশে)।<br />
            ২. নাগরিকের নীরবতাকে (Silence) স্বয়ংক্রিয়ভাবে সন্তুষ্টি গণ্য করা যাবে না।<br />
            ৩. ওয়ার্ড ডেস্ক বা ফিল্ড অফিসার সরাসরি কোনো কেস চূড়ান্ত সমাপ্ত করতে পারবে না; শুধুমাত্র অনুমোদিত কেন্দ্রীয় কেস সমন্বয়ক এই অধিকার সংরক্ষণ করেন।
          </p>
        </div>
      </div>

      {/* Candidate Cases List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[var(--muted)]">
          <span>সমাপ্তি পর্যালোচনার অপেক্ষায়: <strong className="text-[var(--ink)]">{toBanglaNumber(closureCandidates.length)}টি কেস</strong></span>
          <span>সমন্বয়ক অনুমোদন ক্ষমতা: <strong className="text-emerald-700">অনুমোদিত (R&D RBAC S-Tier)</strong></span>
        </div>

        {closureCandidates.length === 0 ? (
          <div className="civic-card rounded-xl p-12 text-center text-xs text-[var(--muted)] space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 opacity-80" />
            <div className="font-semibold text-sm text-[var(--ink)]">কোনো কেস ক্লোজার পর্যালোচনার অপেক্ষায় নেই</div>
            <p>বর্তমান সকল সমাধানকৃত কেস ইতিমধ্যে সমাপ্ত অথবা মাঠ পর্যায়ে চলমান রয়েছে।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {closureCandidates.map(c => {
              const hasProof = (c.status as any) === 'resolved_proof_uploaded' || c.status === 'resolved_pending_citizen' || c.tasks?.some(t => (t.status as any) === 'verified_completed' || t.status === 'resolved');
              const hasCitizenReview = !!c.citizenFeedback;

              return (
                <div
                  key={c.id}
                  className="civic-card rounded-xl p-5 border border-[var(--line)] bg-[var(--paper)] hover:border-emerald-600/40 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-700" />
                      <span className="font-mono text-xs font-bold text-[var(--ink)]">
                        {c.trackingNumber}
                      </span>
                      <span className="text-xs text-[var(--muted)]">| ওয়ার্ড: {c.location.wardName || c.location.wardId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-[var(--ink)] mb-1">{c.title}</h3>
                    <p className="text-xs text-[var(--muted)] line-clamp-2">{c.description}</p>
                  </div>

                  {/* Checklist Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="p-3 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
                      <div>
                        <div className="font-semibold text-[var(--ink)]">বিভাগীয় কাজ সম্পন্ন</div>
                        <div className="text-[11px] text-[var(--muted)]">{toBanglaNumber(c.tasks?.length || 1)}টি টাস্ক সম্পাদিত</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center gap-2">
                      {hasProof ? (
                        <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-[var(--ink)]">সমাধান প্রমাণক (Proof)</div>
                        <div className="text-[11px] text-[var(--muted)]">
                          {hasProof ? 'AFTER ছবি আপলোডকৃত' : 'প্রমাণক অপেক্ষমাণ'}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center gap-2">
                      {hasCitizenReview ? (
                        <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-[var(--ink)]">নাগরিক মতামত</div>
                        <div className="text-[11px] text-[var(--muted)]">
                          {hasCitizenReview ? 'রেটিং ও মন্তব্য প্রাপ্ত' : 'উন্মুক্ত রিভিউ সময়কাল'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-[var(--muted)]">
                      রিপোর্টার: <strong>গোপনীয় (PII Protected)</strong> | আপডেট: {formatBanglaDate(c.updatedAt)}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/coordinator/cases/${c.id}`}
                        className="px-3 py-1.5 rounded-lg border border-[var(--line)] text-xs text-[var(--ink)] hover:bg-[var(--bg)] transition inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3 text-[var(--muted)]" />
                        কেস অডিট
                      </Link>
                      <button
                        onClick={() => handleOpenClosureModal(c.id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        চূড়ান্ত সমাপ্তি অনুমোদন করুন (Close Case)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Closure Confirmation Modal */}
      {selectedCaseId && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="civic-card rounded-xl max-w-xl w-full p-6 space-y-4 bg-[var(--paper)] border border-[var(--line)] shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-sm text-[var(--ink)]">
                  কেস চূড়ান্ত সমাপ্তি (Final Closure Authorization)
                </h3>
              </div>
              <button
                onClick={() => setSelectedCaseId(null)}
                className="text-[var(--muted)] hover:text-[var(--ink)] text-xs font-mono"
              >
                ✕ বন্ধ
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs flex items-start gap-2">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">কেস সমাপ্তি প্রত্যাখ্যাত (Backend Rule 409):</div>
                  <div>{errorMsg}</div>
                </div>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <div>{successMsg}</div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] text-xs space-y-1">
              <div className="font-bold text-[var(--ink)]">{selectedCase.title}</div>
              <div className="text-[var(--muted)]">
                ট্র্যাকিং নম্বর: <span className="font-mono">{selectedCase.trackingNumber}</span> | ওয়ার্ড: {selectedCase.location.wardName || selectedCase.location.wardId}
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={satisfactionConfirmed}
                    onChange={e => setSatisfactionConfirmed(e.target.checked)}
                    className="mt-0.5 accent-[#166534]"
                  />
                  <div>
                    <span className="font-bold text-[var(--ink)]">নাগরিক সমাধান সন্তুষ্টি যাচাইকৃত</span>
                    <p className="text-[11px] text-[var(--muted)]">
                      মাঠ পর্যায়ের কাজের বাস্তব সমাপ্তি ও নাগরিকের অভিযোগ নিরসন নিশ্চিত হয়েছে।
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={exceptionDocumented}
                    onChange={e => setExceptionDocumented(e.target.checked)}
                    className="mt-0.5 accent-amber-600"
                  />
                  <div>
                    <span className="font-bold text-amber-800">প্রশাসনিক ব্যতিক্রম নথিভুক্ত (Exception Documented)</span>
                    <p className="text-[11px] text-[var(--muted)]">
                      যদি ফটো প্রমাণক অনুপস্থিত থাকে বা দীর্ঘমেয়াদী প্রকল্পের অন্তর্ভুক্ত হওয়ায় বিশেষ দাপ্তরিক ক্ষমতাবলে বন্ধ করা হয় (R&D Section 11.3)।
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1">
                  সমন্বয়কের সমাপ্তি মন্তব্য ও অডিট নোট *
                </label>
                <textarea
                  value={closureNotes}
                  onChange={e => setClosureNotes(e.target.value)}
                  placeholder="কেস সমাপ্তির বিস্তারিত কারণ, মাঠ পরিদর্শন রিপোর্ট ও সিদ্ধান্তের রেফারেন্স..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[#166534]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setSelectedCaseId(null)}
                className="px-3.5 py-1.5 rounded-lg border border-[var(--line)] text-xs text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleExecuteClosure}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {submitting ? 'অনুমোদন হচ্ছে...' : 'কেস ক্লোজার অনুমোদন করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
