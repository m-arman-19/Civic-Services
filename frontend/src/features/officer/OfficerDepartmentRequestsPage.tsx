import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge } from '../../components/common/Badge';
import { CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight, ShieldCheck, Inbox, Sparkles, MapPin } from 'lucide-react';

export const OfficerDepartmentRequestsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaskForReject, setSelectedTaskForReject] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiClient.tasks.getDepartmentRequests(currentUser?.departmentId);
      setRequests(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'দাপ্তরিক অনুরোধ তালিকা লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser?.departmentId]);

  const handleAccept = async (taskId: string) => {
    try {
      await apiClient.tasks.accept(taskId);
      setActionSuccessMessage('টাস্কের দায়িত্ব সফলভাবে গৃহীত হয়েছে।');
      setTimeout(() => setActionSuccessMessage(null), 3000);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'টাস্ক গ্রহণ করা সম্ভব হয়নি।');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForReject || !rejectionReason.trim()) return;

    try {
      await apiClient.tasks.reject(selectedTaskForReject.id, rejectionReason.trim());
      setSelectedTaskForReject(null);
      setRejectionReason('');
      setActionSuccessMessage('টাস্ক প্রত্যাখ্যান সম্পন্ন এবং পর্যালোচনার জন্য সমন্বয়কের নিকট প্রেরিত হয়েছে।');
      setTimeout(() => setActionSuccessMessage(null), 3000);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'টাস্ক প্রত্যাখ্যান ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-in fade-in duration-150">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)] text-xs font-mono tracking-wider uppercase font-semibold">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{currentUser?.departmentName || 'ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight mt-1.5">
            আগত দাপ্তরিক কাজের অনুরোধ ও দায়িত্ব গ্রহণ
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            এআই ও ওয়ার্ড সমন্বয়কারী কর্তৃক নির্ধারিত কাজের পর্যালোচনা ও আনুষ্ঠানিক স্বীকৃতি গেট।
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            to="/officer/tasks"
            className="civic-btn-secondary text-xs py-2 px-3.5"
          >
            আমার চলতি কাজ
          </Link>
          <Link
            to="/officer/assignment-queue"
            className="civic-btn-secondary text-xs py-2 px-3.5"
          >
            অপেক্ষারত কিউ
          </Link>
        </div>
      </div>

      {/* Action Success Notification */}
      {actionSuccessMessage && (
        <div className="p-3.5 rounded-lg bg-[var(--status-low-bg)] border border-[var(--status-low-border)] text-[var(--status-low)] text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-lg bg-[var(--status-emergency-bg)] border border-[var(--status-emergency-border)] text-[var(--status-emergency)] text-xs font-semibold flex items-center gap-2.5 shadow-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Request Cards */}
      {loading ? (
        <div className="p-12 text-center text-[var(--muted)] text-xs civic-card">
          দাপ্তরিক অনুরোধ কিউ লোড হচ্ছে...
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center text-[var(--muted)] civic-card space-y-2.5">
          <Inbox className="w-10 h-10 text-[var(--muted)] mx-auto opacity-60" aria-hidden="true" />
          <h3 className="text-base font-bold text-[var(--ink)]">কোনো নতুন কাজের অনুরোধ অপেক্ষমাণ নেই</h3>
          <p className="text-xs text-[var(--muted)]">এই মুহূর্তে আপনার দপ্তরের জন্য কোনো নতুন টাস্ক অপেক্ষারত নেই।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isAccepted = req.acceptance_status === 'accepted';
            const isRejected = req.acceptance_status === 'rejected';

            return (
              <div
                key={req.id}
                className="civic-card p-5 sm:p-6 hover:border-[var(--ink)] transition-all shadow-xs space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3.5 border-b border-[var(--line-subtle)]">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--ink)] bg-[var(--paper-elevated)] px-2.5 py-0.5 rounded-md border border-[var(--line)]">
                        #{req.case_id || req.id}
                      </span>
                      <PriorityBadge priority={req.priority} />
                      <span className="text-xs text-[var(--muted)] flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[var(--muted)]" aria-hidden="true" />
                        <span>{req.ward_name_bn || 'ওয়ার্ড ৩'}</span>
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[var(--ink)] leading-snug">
                      {req.title_bn}
                    </h3>
                  </div>

                  <div className="flex sm:flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-[var(--ink)] font-bold flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-[var(--muted)]" aria-hidden="true" />
                      <span>{req.sla_remaining_bn || 'এসএলএ বাকি'}</span>
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                      isAccepted ? 'bg-[var(--status-low-bg)] text-[var(--status-low)] border-[var(--status-low-border)]' :
                      isRejected ? 'bg-[var(--status-emergency-bg)] text-[var(--status-emergency)] border-[var(--status-emergency-border)]' :
                      'bg-[var(--paper-elevated)] text-[var(--muted)] border-[var(--line)]'
                    }`}>
                      {isAccepted ? '✓ গৃহীত (Accepted)' :
                       isRejected ? '✕ প্রত্যাখ্যাত' : 'পর্যালোচনা অপেক্ষারত'}
                    </span>
                  </div>
                </div>

                {/* AI Routing Rationale */}
                {req.ai_routing_rationale && (
                  <div className="p-3.5 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] text-xs text-[var(--ink)] flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[var(--muted)] shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <strong className="text-[var(--ink)] block mb-0.5 text-xs font-semibold">এআই দায়িত্ব নির্ধারণ ও এখতিয়ার ব্যাখ্যা:</strong>
                      <span className="text-[var(--muted)] leading-relaxed">{req.ai_routing_rationale}</span>
                    </div>
                  </div>
                )}

                {/* Prerequisite status notice */}
                {req.prerequisite_note && (
                  <div className="p-3 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] text-xs text-[var(--ink)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[var(--status-low)] shrink-0" aria-hidden="true" />
                      <span className="leading-relaxed">{req.prerequisite_note}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                      req.prerequisites_completed
                        ? 'bg-[var(--status-low-bg)] text-[var(--status-low)] border-[var(--status-low-border)]'
                        : 'bg-[var(--status-high-bg)] text-[var(--status-high)] border-[var(--status-high-border)]'
                    }`}>
                      {req.prerequisites_completed ? 'পূর্বশর্ত প্রস্তুত' : 'অপেক্ষমাণ'}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--line-subtle)]">
                  <div className="text-xs text-[var(--muted)]">
                    দাখিল তারিখ: <span className="font-mono">{req.created_at ? new Date(req.created_at).toLocaleDateString('bn-BD') : 'আজ'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isAccepted && !isRejected && (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedTaskForReject(req)}
                          className="civic-btn-danger text-xs py-1.5 px-3"
                        >
                          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>প্রত্যাখ্যান (Reject)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAccept(req.id)}
                          className="civic-btn-primary text-xs py-1.5 px-3.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>দায়িত্ব গ্রহণ করুন (Accept)</span>
                        </button>
                      </>
                    )}
                    <Link
                      to={`/officer/tasks/${req.id}`}
                      className="civic-btn-secondary text-xs py-1.5 px-3"
                    >
                      <span>বিস্তারিত</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mandatory Reason Rejection Modal */}
      {selectedTaskForReject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="civic-card-elevated rounded-xl max-w-lg w-full p-6 border border-[var(--line)] bg-[var(--paper)] shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-[var(--status-emergency)]" aria-hidden="true" />
                <h3 className="text-base font-bold text-[var(--ink)]">
                  টাস্ক প্রত্যাখ্যানের কারণ প্রদান করুন
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskForReject(null)}
                className="text-[var(--muted)] hover:text-[var(--ink)] p-1 cursor-pointer rounded-md"
                aria-label="বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed">
              সিটি কর্পোরেশন নীতিমালার অধীনে দাপ্তরিক প্রত্যাখ্যানের জন্য বাধ্যতামূলক কারণ উল্লেখ করা আবশ্যক। এটি কেস হিস্ট্রিতে অপরিবর্তনীয়ভাবে লিপিবদ্ধ থাকবে এবং সমন্বয়কের নিকট পর্যালোচনায় প্রেরিত হবে।
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                  প্রত্যাখ্যানের কারণ (বাংলায় লিখুন):
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="যেমন: সড়কটি বর্তমানে অন্য সংস্থার খনন কাজের আওতাভুক্ত থাকায় ড্রেনেজ কাজ পরিচালনা সম্ভব হচ্ছে না..."
                  className="civic-input text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForReject(null)}
                  className="civic-btn-secondary text-xs py-1.5 px-3.5"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!rejectionReason.trim()}
                  className="civic-btn-danger text-xs py-1.5 px-4 disabled:opacity-50"
                >
                  প্রত্যাখ্যান নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
