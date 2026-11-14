import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  GitMerge,
  Layers,
  ArrowDown,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  Clock,
  ShieldCheck,
  Send,
  Building
} from 'lucide-react';
import { DepartmentTask } from '../../types';

export const CoordinatorSequencePlannerPage: React.FC = () => {
  const { cases, approveSequence } = useCases();
  const { currentUser } = useAuth();

  // Find cases eligible for planning (multi-department or submitted/verified)
  const planningCases = cases.filter(c => c.tasks && c.tasks.length > 0);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(planningCases[0]?.id || '');
  const activeCase = cases.find(c => c.id === selectedCaseId) || planningCases[0];

  const [plannedTasks, setPlannedTasks] = useState<DepartmentTask[]>(activeCase?.tasks || []);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Switch active case
  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    const target = cases.find(c => c.id === caseId);
    if (target) {
      setPlannedTasks([...target.tasks]);
    }
    setSuccessMessage(null);
  };

  // Reorder task up
  const moveTaskUp = (index: number) => {
    if (index === 0) return;
    const newTasks = [...plannedTasks];
    const temp = newTasks[index - 1];
    newTasks[index - 1] = newTasks[index];
    newTasks[index] = temp;

    // Recalculate sequenceOrder and dependencies
    newTasks.forEach((t, i) => {
      t.sequenceOrder = i + 1;
      t.prerequisiteTaskId = i > 0 ? newTasks[i - 1].id : undefined;
      t.prerequisiteDeptName = i > 0 ? newTasks[i - 1].departmentName : undefined;
      t.waitingReason = i > 0 ? `পূর্ববর্তী ধাপ (${newTasks[i - 1].departmentName}) সমাপ্তির অপেক্ষায়` : undefined;
    });

    setPlannedTasks(newTasks);
  };

  // Reorder task down
  const moveTaskDown = (index: number) => {
    if (index === plannedTasks.length - 1) return;
    const newTasks = [...plannedTasks];
    const temp = newTasks[index + 1];
    newTasks[index + 1] = newTasks[index];
    newTasks[index] = temp;

    // Recalculate sequenceOrder and dependencies
    newTasks.forEach((t, i) => {
      t.sequenceOrder = i + 1;
      t.prerequisiteTaskId = i > 0 ? newTasks[i - 1].id : undefined;
      t.prerequisiteDeptName = i > 0 ? newTasks[i - 1].departmentName : undefined;
      t.waitingReason = i > 0 ? `পূর্ববর্তী ধাপ (${newTasks[i - 1].departmentName}) সমাপ্তির অপেক্ষায়` : undefined;
    });

    setPlannedTasks(newTasks);
  };

  // Handle sequence approval
  const handleApprove = async () => {
    if (!activeCase) return;
    setIsSubmitting(true);
    try {
      await approveSequence(activeCase.id, currentUser.name, plannedTasks);
      setSuccessMessage('বহু-বিভাগীয় কর্মপরিকল্পনা ও পর্যায়ক্রম সফলভাবে অনুমোদিত হয়েছে। ডিপেন্ডেন্সি বিধি সক্রিয়।');
    } catch (e: any) {
      alert('অনুমোদনে ত্রুটি ঘটেছে: ' + (e?.message || 'অনুগ্রহ করে পুনরায় চেষ্টা করুন'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--green-light)] px-3 py-0.5 rounded-full border border-[var(--line)]">
              কেস অপারেশনস
            </span>
            <span className="text-xs text-[var(--muted)]">R&D Section 6.3 & 10.9 সিকোয়েন্সিং নিয়ন্ত্রণ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
            টাস্ক সিকোয়েন্স প্ল্যানার (Task Sequence Planner)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            বর্জ্য অপসারণ &rarr; ড্রেন নিষ্কাশন &rarr; সড়ক মেরামত: কার্যতালিকার কঠোর ধারাবাহিকতা নির্ধারণ ও অনুমোদন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--green)]/10 text-[var(--green)] border border-[var(--green)]/30 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>সমন্বয়ক অনুমোদন ক্ষমতা সক্রিয়</span>
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs underline cursor-pointer">
            ঠিক আছে
          </button>
        </div>
      )}

      {/* Case Selector Strip */}
      <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-2">
        <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block">
          পরিকল্পনার জন্য কেস নির্বাচন করুন:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {planningCases.map(c => (
            <button
              key={c.id}
              onClick={() => handleSelectCase(c.id)}
              className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                c.id === activeCase?.id
                  ? 'bg-[var(--green-light)] border-[var(--green)] text-[var(--ink)]'
                  : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[var(--gold)]">
                  {c.trackingNumber || c.id}
                </span>
                <PriorityBadge priority={c.priority} />
              </div>
              <h4 className="text-xs font-semibold truncate mt-1 text-[var(--ink)]">{c.title}</h4>
              <span className="text-[10px] text-[var(--muted)]">{c.location.wardName}</span>
            </button>
          ))}
        </div>
      </div>

      {activeCase && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Task Sequence Stepper & Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                <div>
                  <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                    <GitMerge className="w-4 h-4 text-[var(--green)]" />
                    <span>ধারাবাহিক টাস্ক তালিকা ও ডিপেন্ডেন্সি চেইন</span>
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    তীর চিহ্নে ক্লিক করে কাজের অগ্রাধিকার ক্রম পরিবর্তন করুন
                  </p>
                </div>
                <span className="text-xs font-bold text-[var(--green)]">
                  {toBanglaNumber(plannedTasks.length)} টি ধাপ
                </span>
              </div>

              {/* Sequential Steps List */}
              <div className="space-y-4">
                {plannedTasks.map((task, idx) => (
                  <div key={task.id} className="space-y-2">
                    <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[var(--paper)] border border-[var(--line)] text-xs font-bold flex items-center justify-center font-mono shrink-0">
                          {toBanglaNumber(idx + 1)}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-[var(--ink)]">{task.title}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--paper)] border border-[var(--line)] text-[var(--green)]">
                              {task.departmentName}
                            </span>
                            {idx === 0 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--gold)] text-white">
                                লিড ডিপার্টমেন্ট (Lead Task)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--muted)]">{task.description}</p>

                          {/* Prerequisite Note */}
                          {idx > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-medium pt-1">
                              <Lock className="w-3.5 h-3.5" />
                              <span>
                                পূর্বশর্ত: ধাপ {toBanglaNumber(idx)} ({plannedTasks[idx - 1].departmentName}) সমাপ্ত হওয়া বাধ্যতামূলক
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveTaskUp(idx)}
                          className="p-1 rounded bg-[var(--paper)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === plannedTasks.length - 1}
                          onClick={() => moveTaskDown(idx)}
                          className="p-1 rounded bg-[var(--paper)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Arrow connector */}
                    {idx < plannedTasks.length - 1 && (
                      <div className="flex items-center justify-center py-0.5">
                        <div className="flex items-center gap-1 text-[10px] text-[var(--muted)] bg-[var(--paper)] px-3 py-0.5 rounded-full border border-[var(--line)]">
                          <ArrowDown className="w-3 h-3 text-[var(--green)]" />
                          <span>পূর্বশর্ত সমাপ্তি সাপেক্ষে পরবর্তী ধাপ উন্মুক্ত হবে</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Case Summary & Approval Action */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] pb-2 border-b border-[var(--line)]">
                কেস ও ডিপেন্ডেন্সি সারসংক্ষেপ
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[var(--muted)]">কেস ট্র্যাকিং:</span>
                  <p className="font-mono font-bold text-[var(--gold)]">{activeCase.trackingNumber || activeCase.id}</p>
                </div>
                <div>
                  <span className="text-[var(--muted)]">সমস্যার শিরোনাম:</span>
                  <p className="font-semibold text-[var(--ink)]">{activeCase.title}</p>
                </div>
                <div>
                  <span className="text-[var(--muted)]">ওয়ার্ড ও এলাকা:</span>
                  <p className="text-[var(--ink)]">{activeCase.location.wardName} • {activeCase.location.address}</p>
                </div>
                <div>
                  <span className="text-[var(--muted)]">অগ্রাধিকার:</span>
                  <div className="mt-1"><PriorityBadge priority={activeCase.priority} /></div>
                </div>
              </div>

              {/* Demonstration Scenario Alert */}
              <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--line)] text-xs text-[var(--muted)] space-y-1">
                <span className="font-bold text-[var(--ink)] block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--green)]" />
                  <span>R&D ডেমো সিনারিও গাইডলাইন:</span>
                </span>
                <p className="text-[11px] leading-relaxed">
                  বর্জ্য অপসারণ সম্পন্ন না হওয়া পর্যন্ত ড্রেন পরিষ্কার শুরু করা যাবে না। অনুরূপভাবে ড্রেন নিষ্কাশন ও পানি চলাচল নিশ্চিত না করে সড়ক কার্পেটিং শুরু করা সফটওয়্যার নিয়মে নিষিদ্ধ।
                </p>
              </div>

              {/* Approval notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink)]">সমন্বয়কের অনুমোদন মন্তব্য (ঐচ্ছিক):</label>
                <textarea
                  rows={3}
                  value={approvalNotes}
                  onChange={e => setApprovalNotes(e.target.value)}
                  placeholder="অনুমোদনের বিশেষ নির্দেশনা বা সময়সীমা উল্লেখ করুন..."
                  className="w-full p-2.5 bg-[var(--bg)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--green)]"
                />
              </div>

              {/* Approve button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleApprove}
                className="w-full py-2.5 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'অনুমোদন সংরক্ষিত হচ্ছে...' : 'কর্মপরিকল্পনা চূড়ান্ত অনুমোদন করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
