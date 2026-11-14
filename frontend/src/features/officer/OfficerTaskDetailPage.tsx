import React, { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { MediaUploader } from '../../components/media/MediaUploader';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { MediaAttachment, TaskStatus } from '../../types';
import { calculateSlaCountdown, toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  ArrowLeft,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  MapPin,
  FileText,
  ShieldCheck
} from 'lucide-react';

export const OfficerTaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { cases, updateTask, submitProof } = useCases();
  const { currentUser } = useAuth();

  // Find parent case and task
  let parentCase = cases.find(c => c.tasks.some(t => t.id === id));
  if (!parentCase && location.state?.caseId) {
    parentCase = cases.find(c => c.id === location.state.caseId);
  }
  if (!parentCase) parentCase = cases[0];

  const task = parentCase?.tasks.find(t => t.id === id) || parentCase?.tasks[0];

  const [evidenceAttachments, setEvidenceAttachments] = useState<MediaAttachment[]>([
    {
      id: 'proof_sample_1',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
      caption: 'সংস্কার সমাধান সম্পন্ন: বর্জ্য অপসারিত ও ড্রেন উন্মুক্ত',
      uploadedAt: new Date().toISOString(),
      uploaderRole: 'field_officer',
      isPrivacyMasked: true
    }
  ]);
  const [resolutionNotes, setResolutionNotes] = useState(
    'ড্রেনের মুখে জমে থাকা প্লাস্টিক ও কঠিন বর্জ্য পুরোপুরি অপসারণ করে ড্রেনের পানি চলাচল স্বাভাবিক করা হয়েছে।'
  );
  const [waitingReasonInput, setWaitingReasonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!task || !parentCase) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h2 className="text-base font-bold text-slate-800">টাস্কটি খুঁজে পাওয়া যায়নি</h2>
        <Link to="/officer" className="text-xs text-emerald-700 font-semibold mt-2 inline-block">
          ← কার্য তালিকায় ফিরুন
        </Link>
      </div>
    );
  }

  const sla = calculateSlaCountdown(task.slaDeadline);

  const handleStartInspection = async () => {
    await updateTask(parentCase.id, task.id, 'in_inspection', currentUser.name);
  };

  const handleMarkInProgress = async () => {
    await updateTask(parentCase.id, task.id, 'in_progress', currentUser.name);
  };

  const handleAddWaitingReason = async () => {
    if (!waitingReasonInput.trim()) return;
    await updateTask(parentCase.id, task.id, 'in_progress', currentUser.name, waitingReasonInput);
    setWaitingReasonInput('');
  };

  const handleSubmitResolutionProof = async () => {
    if (evidenceAttachments.length === 0) {
      alert('সমাধান প্রমাণের জন্য অন্তত একটি ছবি বা ভিডিও আপলোড করুন');
      return;
    }
    if (!resolutionNotes.trim()) {
      alert('সমাধানের বিবরণ লিখুন');
      return;
    }

    setIsSubmitting(true);
    await submitProof(parentCase.id, task.id, currentUser.name, evidenceAttachments, resolutionNotes);
    setIsSubmitting(false);
    navigate('/officer');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      {/* Back and Title Header */}
      {/* Back and Title Header */}
      <div className="flex items-center justify-between pb-5 border-b border-[var(--line)]">
        <Link
          to="/officer/tasks"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>মাঠ কার্যতালিকা ড্যাশবোর্ডে ফিরুন</span>
        </Link>
        <div className="flex items-center gap-3">
          <StatusBadge status={task.status} />
          <span className="text-sm font-medium text-[var(--muted)]">
            এসএলএ: <strong className="text-[var(--ink)] font-mono">{sla.text}</strong>
          </span>
        </div>
      </div>

      {/* Task Summary Card */}
      <div className="p-6 sm:p-7 rounded-2xl civic-card shadow-sm space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-[var(--ink)] bg-[var(--bg)] px-3 py-1 rounded-lg border border-[var(--line)]">
                #{parentCase.id}
              </span>
              <span className="text-sm font-bold text-[var(--ink)]">
                ধাপ {toBanglaNumber(task.sequenceOrder)}: {task.departmentName}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] leading-snug">{task.title}</h1>
          </div>
        </div>

        <p className="text-sm text-[var(--ink)] bg-[var(--bg)] p-4 rounded-xl border border-[var(--line)] leading-relaxed">
          {task.description}
        </p>

        {/* Location & Case Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[var(--ink)] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--ink)] block text-sm font-semibold">{parentCase.location.address}</strong>
              <span className="text-xs text-[var(--muted)]">{parentCase.location.wardName} ({parentCase.location.landmark})</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[var(--muted)] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs text-[var(--muted)] block">এসএলএ সময়সীমা:</span>
              <strong className="text-[var(--ink)] text-sm font-mono">{formatBanglaDate(task.slaDeadline)}</strong>
            </div>
          </div>
        </div>

        {/* Quick Progress Buttons for Field Staff */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--line)]">
          <span className="text-sm font-semibold text-[var(--muted)] mr-1">ফিল্ড স্ট্যাটাস আপডেট:</span>
          <button
            type="button"
            onClick={handleStartInspection}
            className="civic-btn-secondary text-sm px-4 py-2.5"
          >
            ১. পরিদর্শন শুরু করুন
          </button>
          <button
            type="button"
            onClick={handleMarkInProgress}
            className="civic-btn-primary text-sm px-4 py-2.5"
          >
            ২. সংস্কার কাজ চলমান
          </button>
        </div>
      </div>

      {/* Dependency Blocker / Waiting Reason Reporter */}
      <div className="p-6 rounded-2xl civic-card border-[var(--status-medium-line)] bg-[var(--status-medium-bg)] shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-sm font-bold text-[var(--status-medium)]">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>কাজের অগ্রগতি স্থবির হওয়ার কারণ যোগ করুন (Waiting Blocker):</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={waitingReasonInput}
            onChange={e => setWaitingReasonInput(e.target.value)}
            placeholder="যেমন: বৃষ্টিপাতের কারণে ড্রেনের পানি নিষ্কাশনে দেরি হচ্ছে..."
            className="civic-input text-sm flex-1"
          />
          <button
            type="button"
            onClick={handleAddWaitingReason}
            className="civic-btn-secondary text-sm px-5 py-3 shrink-0"
          >
            স্থবির কারণ যোগ করুন
          </button>
        </div>
        {task.waitingReason && (
          <p className="text-xs text-[var(--status-medium)] font-medium pt-1">
            বর্তমান স্থবিরতা: <span className="underline font-bold">{task.waitingReason}</span>
          </p>
        )}
      </div>

      {/* Resolution Proof Uploader (M8 Evidence Verification) */}
      <div className="p-6 sm:p-7 rounded-2xl civic-card shadow-sm space-y-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--ink)] flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[var(--status-low)]" />
            <span>সমাধানের প্রমাণ ও ছবি আপলোড (Resolution Evidence)</span>
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            কাজ সম্পন্নের পর সুস্পষ্ট ছবি/ভিডিও আপলোড করুন যা নাগরিকের প্রাথমিক সমস্যার সাথে তুলনাযোগ্য
          </p>
        </div>

        {/* Media Uploader with simulated compression */}
        <MediaUploader
          attachments={evidenceAttachments}
          onAttachmentsChange={setEvidenceAttachments}
          uploaderRole="field_officer"
        />

        {/* Resolution Notes */}
        <div>
          <label className="block text-sm font-bold text-[var(--ink)] mb-2">
            মাঠ সমাধান নোট ও বিবরণ (Resolution Notes):
          </label>
          <textarea
            rows={3}
            value={resolutionNotes}
            onChange={e => setResolutionNotes(e.target.value)}
            placeholder="কাজের বিস্তারিত বিবরণ লিখুন..."
            className="civic-input text-sm leading-relaxed"
          />
        </div>

        {/* Submit Proof Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSubmitResolutionProof}
            disabled={isSubmitting}
            className="civic-btn-primary flex items-center gap-2 px-6 py-3.5 text-sm font-bold shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>সমাধান প্রমাণ জমা দিন ও টাস্ক সমাপ্ত করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
