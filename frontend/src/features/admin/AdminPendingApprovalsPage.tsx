import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import { ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle, FileText, ArrowRight, UserCheck } from 'lucide-react';

export const AdminPendingApprovalsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [decisionNotes, setDecisionNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const data = await apiClient.admin.getPendingApprovals();
      setRequests(data || []);
    } catch (e) {
      console.error('Failed to load pending approvals', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleDecision = async (decision: 'approve' | 'reject') => {
    if (!selectedRequest) return;
    if (!decisionNotes.trim()) {
      showError('অনুমোদন বা প্রত্যাখ্যানের দাপ্তরিক কারণ/নোট প্রদান করা বাধ্যতামূলক।');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.admin.decidePendingApproval(selectedRequest.id, decision, decisionNotes);
      showSuccess(`আবেদনটি সফলভাবে ${decision === 'approve' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'} করা হয়েছে।`);
      setSelectedRequest(null);
      setDecisionNotes('');
      fetchApprovals();
    } catch (err: any) {
      showError(err.message || 'অনুমোদন প্রক্রিয়াকরণে ত্রুটি হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ১: দ্বৈত অনুমোদন গভর্ন্যান্স (R&D Table 33 / S7)
            </span>
            <span className="text-xs text-[var(--muted)]">স্বতন্ত্র দ্বিতীয় অনুমোদনকারী বাধ্যতামূলক</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            অপেক্ষমাণ দ্বৈত অনুমোদন কিউ (Pending Dual Approvals)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            এআই গেট হ্রাসকরণ বা বিধিমালার সংবেদনশীল পরিবর্তনের জন্য দ্বিতীয় স্বাধীন প্রশাসকের অনুমোদন আবশ্যক
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[var(--paper)] border border-[var(--line)] text-xs font-mono font-bold text-[var(--ink)]">
            অপেক্ষমাণ আবেদন: {toBanglaNumber(requests.length)} টি
          </span>
        </div>
      </div>

      {/* Dual Approval Explanatory Note */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>দ্বৈত নিয়ন্ত্রণ নীতি (Four-Eyes Principle):</span>
        </div>
        <p className="leading-relaxed">
          কোনো একক প্রশাসক একতরফাভাবে এআই দায়িত্ব প্রস্তাবনার ৮০% সেফটি গেট হ্রাস করতে পারবেন না। আবেদনকারী নিজে দ্বিতীয় অনুমোদনকারী হতে পারবেন না (স্বতন্ত্র অনুমোদন বাধ্যতামূলক)।
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-[var(--muted)]">অনুমোদন কিউ লোড হচ্ছে...</div>
      ) : requests.length === 0 ? (
        <div className="p-12 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-base text-[var(--ink)]">কোনো অপেক্ষমাণ দ্বৈত অনুমোদন নেই</h3>
          <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
            বর্তমানে সেফটি গেট হ্রাস বা সংরক্ষিত বিধিমালা পরিবর্তনের কোনো আবেদন অপেক্ষমাণ নেই। সিস্টেম সুস্থ ও নিরাপদ নীতিমালায় চলছে।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-2 space-y-3">
            {requests.map(req => {
              const isSelected = selectedRequest?.id === req.id;
              const isInitiator = currentUser?.id === req.initiator_user_id;

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-[var(--paper)] border-[var(--ink)] shadow-md'
                      : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--muted)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]">
                      {req.request_type === 'LOWER_CONFIDENCE_GATE' ? 'এআই গেট হ্রাস আবেদন' : req.request_type}
                    </span>
                    <span className="text-[11px] text-[var(--muted)] font-mono">
                      {formatBanglaDate(req.created_at)}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[var(--ink)]">
                      প্রস্তাবিত থ্রেশহোল্ড: {toBanglaNumber((req.proposed_payload?.threshold || 0.8) * 100)}%{' '}
                      <span className="text-xs text-[var(--muted)] font-normal">
                        (পূর্ববর্তী ছিল: {toBanglaNumber((req.proposed_payload?.previous_threshold || 0.8) * 100)}%)
                      </span>
                    </h4>
                    <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                      দাপ্তরিক কারণ: "{req.reason}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[var(--line)]">
                    <div className="flex items-center gap-1.5 text-[var(--muted)]">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>উদ্যোক্তা আইডি: {req.initiator_user_id.slice(0, 8)}...</span>
                    </div>
                    {isInitiator ? (
                      <span className="text-amber-700 dark:text-amber-400 font-semibold">
                        (আপনি উদ্যোক্তা — অনুমোদন নিষিদ্ধ)
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span>পর্যালোচনা করুন</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Decision Panel */}
          <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-4 h-fit sticky top-6">
            <h3 className="font-bold text-sm text-[var(--ink)] border-b border-[var(--line)] pb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#166534]" />
              <span>দ্বিতীয় অনুমোদনকারী সিদ্ধান্ত</span>
            </h3>

            {selectedRequest ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">আবেদনের ধরন:</span>
                    <span className="font-mono font-bold text-[var(--ink)]">{selectedRequest.request_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">প্রস্তাবিত কাট-অফ:</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                      {toBanglaNumber((selectedRequest.proposed_payload?.threshold || 0) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">স্থিতি:</span>
                    <span className="font-mono text-amber-700">Pending Review</span>
                  </div>
                </div>

                {currentUser?.id === selectedRequest.initiator_user_id ? (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300">
                    <div className="font-bold mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>স্ব-অনুমোদন ব্লক:</span>
                    </div>
                    আপনি এই পরিবর্তনের প্রাথমিক উদ্যোক্তা। R&D গভর্ন্যান্স প্রটোকল অনুযায়ী আপনাকে অন্য একজন স্বাধীন প্রশাসকের অনুমোদনের অপেক্ষা করতে হবে।
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                        অনুমোদন / প্রত্যাখ্যানের দাপ্তরিক নোট <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={decisionNotes}
                        onChange={e => setDecisionNotes(e.target.value)}
                        placeholder="দ্বৈত অনুমোদনের প্রেক্ষাপট ও ন্যায্যতা লিপিবদ্ধ করুন..."
                        className="w-full text-xs p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleDecision('approve')}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>অনুমোদন করুন</span>
                      </button>
                      <button
                        onClick={() => handleDecision('reject')}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>প্রত্যাখ্যান</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)] text-center py-6">
                তালিকা থেকে একটি আবেদন নির্বাচন করুন
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
