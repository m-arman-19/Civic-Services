import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { useCases } from '../../context/CaseContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  MessageSquareWarning,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Filter,
  Image as ImageIcon,
  Clock,
  UserCheck,
  FileText
} from 'lucide-react';

interface ObjectionItem {
  case_id: string;
  tracking_number: string;
  title: string;
  ward_id: string;
  priority: string;
  citizen_feedback: string;
  feedback_date: string;
  tasks_count: number;
  status: string;
}

export const CoordinatorObjectionsPage: React.FC = () => {
  const { cases } = useCases();
  const [objections, setObjections] = useState<ObjectionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Review modal state
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rework_required'>('rework_required');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchObjections = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await apiClient.coordinator.getObjections();
      if (Array.isArray(res)) {
        setObjections(res);
      } else if (res && Array.isArray(res.items)) {
        setObjections(res.items);
      } else {
        // Fallback from context if API returns empty
        const fallback: ObjectionItem[] = cases
          .filter(c => (c.citizenSatisfactionRating && c.citizenSatisfactionRating <= 2) || !!c.objection)
          .map(c => ({
            case_id: c.id,
            tracking_number: c.trackingNumber,
            title: c.title,
            ward_id: String(c.location.wardName || c.location.wardId),
            priority: c.priority,
            citizen_feedback: c.citizenFeedback || c.objection?.notes || 'সমাধান সন্তোষজনক নয়, কাজ অসমাপ্ত রয়ে গেছে।',
            feedback_date: c.objection?.submittedAt || c.updatedAt,
            tasks_count: c.tasks?.length || 1,
            status: c.status
          }));
        setObjections(fallback);
      }
    } catch (err: any) {
      console.warn('Could not fetch objections from backend, using context cases:', err);
      const fallback: ObjectionItem[] = cases
        .filter(c => (c.citizenSatisfactionRating && c.citizenSatisfactionRating <= 2) || c.status === 'reopened' || !!c.objection)
        .map(c => ({
          case_id: c.id,
          tracking_number: c.trackingNumber,
          title: c.title,
          ward_id: String(c.location.wardName || c.location.wardId),
          priority: c.priority,
          citizen_feedback: c.citizenFeedback || c.objection?.notes || 'সমাধান সন্তোষজনক নয়, পুনরায় পরিদর্শনের দাবি জানাচ্ছি।',
          feedback_date: c.objection?.submittedAt || c.updatedAt,
          tasks_count: c.tasks?.length || 1,
          status: c.status
        }));
      setObjections(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObjections();
  }, [cases]);

  const handleOpenReview = (caseId: string, defaultAction: 'approved' | 'rework_required') => {
    setSelectedCaseId(caseId);
    setReviewAction(defaultAction);
    setReviewNotes('');
    setSuccessMsg(null);
  };

  const handleSubmitReview = async () => {
    if (!selectedCaseId) return;
    if (!reviewNotes.trim()) {
      alert('পর্যালোচনা নোট বা নির্দেশনা প্রদান বাধ্যতামূলক।');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await apiClient.coordinator.reviewResolution(selectedCaseId, {
        decision: reviewAction,
        notes: reviewNotes,
        exception_documented: reviewAction === 'approved'
      });
      setSuccessMsg(
        reviewAction === 'rework_required'
          ? 'নাগরিক আপত্তির প্রেক্ষিতে কেসটি সংশ্লিষ্ট বিভাগে পুনঃকাজের জন্য ফেরত পাঠানো হয়েছে।'
          : 'নাগরিক আপত্তি পর্যালোচনাপূর্বক সমাধান বহাল রাখা হয়েছে।'
      );
      // Remove or update the objection locally
      setObjections(prev => prev.filter(o => o.case_id !== selectedCaseId));
      setTimeout(() => {
        setSelectedCaseId(null);
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      console.error('Failed to submit resolution review:', err);
      setError(err?.response?.data?.detail || err.message || 'পর্যালোচনা সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCaseData = cases.find(c => c.id === selectedCaseId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in text-[var(--ink)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
              M5 রেজোলিউশন ও নাগরিক প্রতিক্রিয়া
            </span>
            <span className="text-xs text-[var(--muted)]">আপত্তি নিষ্পত্তি ও পুনঃকাজের নির্দেশনা</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            নাগরিক আপত্তি ও অসন্তোষ পর্যালোচনা (Citizen Objections)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            সমাধান ঘোষণার পর নাগরিকের আপত্তি এবং অসন্তোষযুক্ত কেসসমূহের নিরপেক্ষ পর্যালোচনা ও পুনঃকাজের নির্দেশ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/coordinator"
            className="px-3.5 py-1.5 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] text-xs text-[var(--ink)] hover:bg-[var(--line)]/20 transition"
          >
            ← ড্যাশবোর্ডে ফিরুন
          </Link>
          <button
            onClick={fetchObjections}
            className="px-3 py-1.5 rounded-lg bg-[var(--paper)] border border-[var(--line)] text-xs text-[var(--ink)] hover:bg-[var(--line)]/20 transition cursor-pointer"
          >
            রিফ্রেশ
          </button>
        </div>
      </div>

      {/* R&D Governance Alert */}
      <div className="civic-card rounded-xl p-4 bg-amber-500/5 border-amber-500/30 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-[var(--ink)]">নাগরিক অধিকার ও সেবামূলক জবাবদিহিতা (R&D Section 11.3)</div>
          <p className="text-[var(--muted)] leading-relaxed">
            নাগরিকের আপত্তির প্রেক্ষিতে স্বয়ংক্রিয়ভাবে কেস সমাপ্ত ঘোষণা বা অবহেলা করা নিষিদ্ধ। সমন্বয়ক হিসেবে প্রতিটি আপত্তি নিরপেক্ষভাবে মূল্যায়ন করে মাঠ পর্যায়ের কাজে ঘাটতি থাকলে অবশ্যই <strong>পুনঃকাজের আদেশ (Rework Directive)</strong> দিতে হবে।
          </p>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="civic-card rounded-xl p-12 text-center text-xs text-[var(--muted)] space-y-2">
          <Clock className="w-6 h-6 animate-spin mx-auto text-[#166534]" />
          <div>নাগরিক আপত্তি ও অসন্তোষ তালিকা লোড হচ্ছে...</div>
        </div>
      ) : objections.length === 0 ? (
        <div className="civic-card rounded-xl p-12 text-center text-xs text-[var(--muted)] space-y-2">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 opacity-80" />
          <div className="font-semibold text-sm text-[var(--ink)]">কোনো সক্রিয় নাগরিক আপত্তি অনিষ্পন্ন নেই</div>
          <p>সকল সমাধানকৃত কেসে নাগরিক সন্তুষ্টি নিশ্চিত হয়েছে অথবা আপত্তি নিষ্পত্তি সম্পন্ন হয়েছে।</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>মোট অমীমাংসিত আপত্তি: <strong className="text-[var(--ink)]">{toBanglaNumber(objections.length)}টি</strong></span>
            <span>সর্বশেষ হালনাগাদ: {formatBanglaDate(new Date().toISOString())}</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {objections.map(item => (
              <div
                key={item.case_id}
                className="civic-card rounded-xl p-5 border border-amber-500/20 bg-[var(--paper)] hover:border-amber-500/40 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
                  <div className="flex items-center gap-2">
                    <MessageSquareWarning className="w-4 h-4 text-amber-600" />
                    <span className="font-mono text-xs font-bold text-[var(--ink)]">
                      {item.tracking_number}
                    </span>
                    <span className="text-xs text-[var(--muted)]">| ওয়ার্ড: {item.ward_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={item.priority as any} />
                    <StatusBadge status={item.status as any} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-[var(--ink)]">{item.title}</h3>
                  <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                    <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      নাগরিকের আপত্তি / অসন্তোষের বিবরণ:
                    </div>
                    <p className="text-[var(--ink)] italic leading-relaxed">
                      "{item.citizen_feedback}"
                    </p>
                    <div className="text-[10px] text-[var(--muted)] pt-1">
                      জমা প্রদানের সময়: {formatBanglaDate(item.feedback_date)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-[var(--muted)]">
                    সম্পর্কিত টাস্ক: <strong>{toBanglaNumber(item.tasks_count)}টি</strong> | PII সংবেদনশীল তথ্য গোপন রাখা হয়েছে
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/coordinator/cases/${item.case_id}`}
                      className="px-3 py-1.5 rounded-lg border border-[var(--line)] text-xs text-[var(--ink)] hover:bg-[var(--bg)] transition inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 text-[var(--muted)]" />
                      কেস বিবরণী
                    </Link>
                    <button
                      onClick={() => handleOpenReview(item.case_id, 'approved')}
                      className="px-3 py-1.5 rounded-lg border border-emerald-600/30 text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold transition cursor-pointer"
                    >
                      সমাধান বহাল রাখুন
                    </button>
                    <button
                      onClick={() => handleOpenReview(item.case_id, 'rework_required')}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      পুনঃকাজের নির্দেশ দিন (Rework)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review & Directive Modal */}
      {selectedCaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="civic-card rounded-xl max-w-xl w-full p-6 space-y-4 bg-[var(--paper)] border border-[var(--line)] shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#166534]" />
                <h3 className="font-bold text-sm text-[var(--ink)]">
                  সমন্বয়ক পর্যালোচনা সিদ্ধান্ত ও নির্দেশনা
                </h3>
              </div>
              <button
                onClick={() => setSelectedCaseId(null)}
                className="text-[var(--muted)] hover:text-[var(--ink)] text-xs font-mono"
              >
                ✕ বন্ধ
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs">
                {successMsg}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1">
                  পর্যালোচনা সিদ্ধান্ত নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewAction('rework_required')}
                    className={`p-3 rounded-lg border text-left text-xs transition cursor-pointer ${
                      reviewAction === 'rework_required'
                        ? 'border-amber-600 bg-amber-500/10 text-amber-900 font-bold'
                        : 'border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                      পুনঃকাজ আবশ্যক (Rework)
                    </div>
                    <div className="text-[11px] font-normal text-[var(--muted)]">
                      নাগরিকের আপত্তি যুক্তিসঙ্গত, সংশ্লিষ্ট বিভাগকে কাজটি পুনরায় করতে হবে।
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewAction('approved')}
                    className={`p-3 rounded-lg border text-left text-xs transition cursor-pointer ${
                      reviewAction === 'approved'
                        ? 'border-emerald-600 bg-emerald-500/10 text-emerald-900 font-bold'
                        : 'border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      সমাধান বহাল (Uphold)
                    </div>
                    <div className="text-[11px] font-normal text-[var(--muted)]">
                      প্রমাণপত্র অনুযায়ী নির্ধারিত কাজ সম্পন্ন, প্রশাসনিক কারণ নথিভুক্ত করে কেস বন্ধ হবে।
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1">
                  দাপ্তরিক পর্যালোচনা ও মাঠ পর্যায়ের জন্য সুনির্দিষ্ট নির্দেশনা *
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder={
                    reviewAction === 'rework_required'
                      ? 'পুনঃকাজের সুনির্দিষ্ট পরিধি, ঘাটতি এবং সমাপ্তির শর্ত উল্লেখ করুন...'
                      : 'সমাধান বহাল রাখার দাপ্তরিক যুক্তি ও সন্তুষ্টির কারণ নথিভুক্ত করুন...'
                  }
                  rows={4}
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
                onClick={handleSubmitReview}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer ${
                  reviewAction === 'rework_required'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'সংরক্ষণ হচ্ছে...' : 'সিদ্ধান্ত চূড়ান্ত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
