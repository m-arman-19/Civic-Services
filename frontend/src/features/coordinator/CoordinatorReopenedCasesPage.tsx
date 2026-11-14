import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  RotateCcw,
  AlertTriangle,
  FileText,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Send,
  Layers,
  ExternalLink
} from 'lucide-react';

export const CoordinatorReopenedCasesPage: React.FC = () => {
  const { cases } = useCases();
  const [filterDept, setFilterDept] = useState<string>('all');
  const [promptSentMap, setPromptSentMap] = useState<Record<string, boolean>>({});

  // Filter cases that are reopened or contain reopened tasks
  const reopenedCases = cases.filter(c =>
    c.status === 'reopened' ||
    c.tasks?.some(t => (t.status as any) === 'reopened' || t.status === 'rejected') ||
    (c.citizenSatisfactionRating && c.citizenSatisfactionRating <= 2)
  );

  const displayedCases = reopenedCases.filter(c => {
    if (filterDept === 'all') return true;
    const caseDept = (c as any).department || c.tasks?.[0]?.departmentId || c.aiAnalysis?.proposedDepartmentId;
    return caseDept === filterDept || c.tasks?.some(t => t.departmentId === filterDept || (t as any).department === filterDept);
  });

  const handleSendUrgentNotice = (caseId: string) => {
    setPromptSentMap(prev => ({ ...prev, [caseId]: true }));
    setTimeout(() => {
      setPromptSentMap(prev => ({ ...prev, [caseId]: false }));
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in text-[var(--ink)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/30">
              M5 পুনর্বিবেচনা ও পুনরাবৃত্ত টাস্ক
            </span>
            <span className="text-xs text-[var(--muted)]">পুনঃউন্মুক্ত কেস ও কাজের পুনরাবৃত্তি মনিটর</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            পুনঃউন্মুক্ত কেস ও পুনরাবৃত্ত কাজ (Reopened Cases)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            যথাযথভাবে সম্পন্ন না হওয়ায় বা নাগরিক আপত্তিতে পুনরায় খোলা কেসসমূহের কাজের পরিধি ও পুনরায় জমা দেওয়ার শর্তাবলী
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

      {/* R&D Standard Directive */}
      <div className="civic-card rounded-xl p-4 bg-rose-500/5 border-rose-500/30 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-[var(--ink)]">পুনঃউন্মুক্ত কেসের গুণগত মানদণ্ড (R&D Section 11.3)</div>
          <p className="text-[var(--muted)] leading-relaxed">
            কোনো কেস পুনরায় উন্মুক্ত হলে শুধুমাত্র পূর্ববর্তী সমাধান দেখিয়ে সমাপ্ত ঘোষণা করা যাবে না। সংশোধিত কাজের নতুন প্রমাণপত্র (AFTER প্রুফ) আপলোড করতে হবে এবং সমন্বয়কের অনুমোদন ব্যতিরেকে কেসটি ক্লোজার স্টেজে পৌঁছাবে না।
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted)]">বিভাগ ফিল্টার:</span>
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] focus:outline-none"
          >
            <option value="all">সকল বিভাগ</option>
            <option value="waste_management">বর্জ্য ব্যবস্থাপনা (Waste Management)</option>
            <option value="engineering">প্রকৌশল ও সড়ক (Engineering)</option>
            <option value="electrical">বিদ্যুৎ ও সড়কবাতি (Electrical)</option>
            <option value="health">স্বাস্থ্য ও মশক নিধন (Health)</option>
          </select>
        </div>

        <div className="text-xs text-[var(--muted)]">
          মোট পুনঃউন্মুক্ত কেস: <strong className="text-rose-700">{toBanglaNumber(displayedCases.length)}টি</strong>
        </div>
      </div>

      {/* Cases List */}
      {displayedCases.length === 0 ? (
        <div className="civic-card rounded-xl p-12 text-center text-xs text-[var(--muted)] space-y-2">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 opacity-80" />
          <div className="font-semibold text-sm text-[var(--ink)]">বর্তমানে কোনো কেস পুনঃউন্মুক্ত অবস্থায় নেই</div>
          <p>সকল বিভাগ তাদের নির্ধারিত কাজ মানসম্মতভাবে সম্পন্ন করেছে।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedCases.map(c => {
            const reopenedTasks = c.tasks?.filter(t => (t.status as any) === 'reopened' || t.status === 'rejected') || [];
            const reopenReason =
              c.citizenFeedback ||
              c.objection?.notes ||
              'পূর্ববর্তী সমাধানে ঘাটতি পাওয়া যাওয়ায় সমন্বয়কের নির্দেশে পুনরায় উন্মুক্ত করা হয়েছে।';
            const reopenActor = c.objection?.submittedAt
              ? 'নাগরিক অসন্তোষ ও রিভিউ গেটওয়ে'
              : 'কেন্দ্রীয় কেস সমন্বয়ক';

            return (
              <div
                key={c.id}
                className="civic-card rounded-xl p-5 border border-rose-500/20 bg-[var(--paper)] space-y-4"
              >
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-rose-600" />
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

                {/* Case Title and Reopen Context */}
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-[var(--ink)]">{c.title}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 space-y-1">
                      <div className="font-semibold text-rose-900 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        পুনঃউন্মুক্ত করার সুনির্দিষ্ট কারণ:
                      </div>
                      <p className="text-[var(--ink)] italic">"{reopenReason}"</p>
                      <div className="text-[10px] text-[var(--muted)] pt-1">
                        উন্মুক্তকারী কর্তৃপক্ষ: <strong>{reopenActor}</strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] space-y-1">
                      <div className="font-semibold text-[var(--ink)] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#166534]" />
                        পুনরায় পর্যালোচনায় জমা দেওয়ার আবশ্যিক শর্তাবলী:
                      </div>
                      <ul className="list-disc list-inside text-[var(--muted)] space-y-0.5 text-[11px]">
                        <li>সংশোধিত কাজের সুস্পষ্ট নতুন ছবি (AFTER Photo) আপলোড।</li>
                        <li>মাঠ কর্মকর্তার পরিদর্শন ও সুপারভাইজারের প্রতিস্বাক্ষর।</li>
                        <li>নাগরিককে কাজ সমাপ্তির প্রত্যক্ষ নোটিফিকেশন প্রদান।</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Repeated Tasks Breakdown */}
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#166534]" />
                    যেসব কাজ পুনরায় সম্পাদন করতে হবে (Repeated Work Scope):
                  </div>

                  <div className="space-y-2">
                    {c.tasks?.map((t, idx) => (
                      <div
                        key={t.id || idx}
                        className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          (t.status as any) === 'reopened' || t.status === 'rejected'
                            ? 'bg-rose-500/10 border-rose-500/30'
                            : 'bg-[var(--paper-elevated)] border-[var(--line)]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--ink)]">{t.title}</span>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)]">
                              {t.departmentName || t.departmentId}
                            </span>
                            {((t.status as any) === 'reopened' || t.status === 'rejected') && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-500/20 px-2 py-0.2 rounded">
                                পুনরায় করণীয়
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--muted)]">
                            দায়িত্বপ্রাপ্ত কর্মকর্তা: {t.assignedOfficerName || 'এখনও নির্ধারিত হয়নি'} | এসএলএ: {toBanglaNumber(t.slaTargetHours || 24)} ঘণ্টা
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={t.status as any} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--line)]">
                  <div className="text-xs text-[var(--muted)]">
                    সর্বশেষ আপডেট: {formatBanglaDate(c.updatedAt)}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/coordinator/sequence-planner?caseId=${c.id}`}
                      className="px-3 py-1.5 rounded-lg border border-[var(--line)] text-xs text-[var(--ink)] hover:bg-[var(--bg)] transition inline-flex items-center gap-1"
                    >
                      টাস্ক সিকোয়েন্স প্ল্যানার
                    </Link>
                    <Link
                      to={`/coordinator/cases/${c.id}`}
                      className="px-3 py-1.5 rounded-lg border border-[var(--line)] text-xs text-[var(--ink)] hover:bg-[var(--bg)] transition inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 text-[var(--muted)]" />
                      কেস বিস্তারিত
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleSendUrgentNotice(c.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-700 text-white hover:bg-rose-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3 h-3" />
                      {promptSentMap[c.id] ? 'জরুরি নোটিশ প্রেরিত!' : 'বিভাগকে তাগিদ নোটিশ পাঠান'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
