import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { DepartmentTask, TaskStatus } from '../../types';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  Route,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Lock,
  Unlock,
  AlertCircle,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2
} from 'lucide-react';

export const WardMultiDeptPlannerPage: React.FC = () => {
  const { cases, approveSequence, getCase } = useCases();
  const { currentUser } = useAuth();

  // Find demo compound case (e.g. NS-2026-000184 or first case with multiple tasks)
  const compoundCase = cases.find(c => c.tasks && c.tasks.length > 1) || cases[0];
  const [selectedCaseId, setSelectedCaseId] = useState<string>(compoundCase?.id || '');

  const activeCase = getCase(selectedCaseId) || compoundCase;

  // Local state for planning tasks
  const [plannedTasks, setPlannedTasks] = useState<DepartmentTask[]>(activeCase?.tasks || []);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalNote, setApprovalNote] = useState('বর্জ্য অপসারণ → ড্রেন পরিষ্কার → সড়ক মেরামত সমন্বিত কর্মপরিকল্পনা অনুমোদিত।');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle case selection change
  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    const c = getCase(id);
    if (c) {
      setPlannedTasks(c.tasks);
      setSuccessMessage('');
    }
  };

  // Reorder task step
  const moveTask = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= plannedTasks.length) return;

    const updated = [...plannedTasks];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);

    // Re-assign sequence orders & prerequisites
    const sequenced = updated.map((t, idx) => ({
      ...t,
      sequenceOrder: idx + 1,
      prerequisiteTaskId: idx > 0 ? updated[idx - 1].id : undefined,
      prerequisiteDeptName: idx > 0 ? updated[idx - 1].departmentName : undefined,
      status: idx === 0 ? ('ready' as TaskStatus) : ('pending_dependency' as TaskStatus)
    }));

    setPlannedTasks(sequenced);
  };

  const handleApprove = async () => {
    if (!activeCase) return;
    setIsApproving(true);
    await approveSequence(activeCase.id, currentUser.name, plannedTasks);
    setIsApproving(false);
    setSuccessMessage('কর্মপরিকল্পনা ও কার্য-অনুক্রম সফলভাবে অনুমোদিত হয়েছে। ওয়ার্ক-অর্ডার মাঠ পর্যায়ে সক্রিয়।');
  };

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--paper-elevated)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              M7 কর্মপরিকল্পনা ও পর্যায়ক্রম
            </span>
            <span className="text-xs text-[var(--muted)]">বহু-বিভাগীয় ডিপেন্ডেন্সি ইঞ্জিন</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] tracking-tight">
            বহু-বিভাগীয় কেস প্ল্যানার (Multi-Department Case Planner)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-2xl">
            R&D স্ট্যান্ডার্ড প্রদর্শনী দৃশ্যকল্প: বর্জ্য অপসারণ → ড্রেন পরিষ্কার → সড়ক মেরামত
          </p>
        </div>

        {/* Case Selector Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-[var(--muted)] font-medium">নির্বাচিত কেস:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => handleSelectCase(e.target.value)}
            className="px-3.5 py-2 text-xs bg-[var(--paper)] text-[var(--ink)] rounded-xl border border-[var(--line)] font-mono font-bold focus:outline-hidden focus:border-[var(--green)] cursor-pointer"
          >
            {cases.map(c => (
              <option key={c.id} value={c.id}>
                #{c.id} ({c.title.slice(0, 30)}...)
              </option>
            ))}
          </select>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-[var(--green-light)] border border-[#bbf7d0] text-xs text-[#166534] flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {/* R&D 3-STAGE VISUAL DEPENDENCY STEPPER */}
      <div className="civic-card rounded-2xl p-6 border border-[var(--line)] bg-[var(--paper-elevated)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-2">
            <Route className="w-4 h-4 text-[var(--green)]" />
            <span>৩-ধাপের ডিপেন্ডেন্সি প্রবাহ (Sequential Dependency Flow)</span>
          </h3>
          <span className="text-[11px] text-[var(--muted)]">
            একটি কাজের সমাপ্তি না হওয়া পর্যন্ত পরবর্তী কাজের ফিল্ড অ্যাকশন অবরুদ্ধ থাকবে
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Step 1: Waste */}
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--paper)] space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--green-light)] text-[var(--green)]">
                ধাপ ১: প্রাথমিক
              </span>
              <span className="text-[11px] font-mono text-[var(--muted)]">SLA: ১২ ঘণ্টা</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--ink)]">১. বর্জ্য ব্যবস্থাপনা বিভাগ</h4>
            <p className="text-xs text-[var(--muted)]">
              ড্রেনের মুখের কঠিন বর্জ্য ও উপরিভাগের ময়লা অপসারণ করা।
            </p>
            <div className="pt-2 border-t border-[var(--line)] text-[11px] text-[var(--green)] font-semibold flex items-center gap-1">
              <Unlock className="w-3.5 h-3.5" />
              <span>পূর্বশর্ত সম্পন্ন (সক্রিয়)</span>
            </div>
          </div>

          {/* Step 2: Drainage */}
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--paper)] space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                ধাপ ২: ডিপেন্ডেন্ট
              </span>
              <span className="text-[11px] font-mono text-[var(--muted)]">SLA: ২৪ ঘণ্টা</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--ink)]">২. ড্রেনেজ প্রকৌশল বিভাগ</h4>
            <p className="text-xs text-[var(--muted)]">
              ড্রেনের পলি উত্তোলন, চ্যানেল ফ্লাশিং ও স্ল্যাব মেরামত করা।
            </p>
            <div className="pt-2 border-t border-[var(--line)] text-[11px] text-amber-600 font-semibold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              <span>ধাপ ১ এর সমাপ্তির অপেক্ষায়</span>
            </div>
          </div>

          {/* Step 3: Road */}
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--paper)] space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600">
                ধাপ ৩: চূড়ান্ত ধাপ
              </span>
              <span className="text-[11px] font-mono text-[var(--muted)]">SLA: ৪৮ ঘণ্টা</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--ink)]">৩. সড়ক ও অবকাঠামো বিভাগ</h4>
            <p className="text-xs text-[var(--muted)]">
              জলাবদ্ধতায় ক্ষতিগ্রস্ত সড়কের পিচঢালাই ও স্থায়ী কার্পেটিং।
            </p>
            <div className="pt-2 border-t border-[var(--line)] text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              <span>ধাপ ১ ও ২ এর সমাপ্তির অপেক্ষায়</span>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE TASK SEQUENCER */}
      <div className="civic-card rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
          <div>
            <h3 className="text-base font-bold text-[var(--ink)]">
              অনুমোদিত কার্য-অনুক্রম ও পূর্বশর্ত সমন্বয়
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              কাজের ক্রম পরিবর্তন করতে তীর চিহ্নে ক্লিক করুন; দায়িত্বপ্রাপ্ত কর্মকর্তাদের কাজের রিকমেন্ডার সক্রিয় হবে
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {plannedTasks.map((task, idx) => (
            <div
              key={task.id}
              className="p-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center font-bold text-xs font-mono text-[var(--ink)] shrink-0 mt-0.5">
                  {toBanglaNumber(idx + 1)}
                </span>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm font-bold text-[var(--ink)]">{task.title}</strong>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--paper)] border border-[var(--line)] text-[var(--green)]">
                      {task.departmentName}
                    </span>
                    {(idx === 0 || task.sequenceOrder === 1) && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--gold)] text-white font-mono">
                        LEAD TASK
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)]">{task.description}</p>
                  {idx > 0 && (
                    <div className="text-[11px] text-amber-600 flex items-center gap-1 pt-1 font-medium">
                      <Lock className="w-3 h-3" />
                      <span>পূর্বশর্ত: ধাপ {toBanglaNumber(idx)} ({plannedTasks[idx - 1].departmentName}) সমাপ্ত হতে হবে</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Move Up/Down */}
              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => moveTask(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--line)]/30 text-[var(--ink)] disabled:opacity-30 cursor-pointer"
                  title="উপরে স্থানান্তর"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveTask(idx, 'down')}
                  disabled={idx === plannedTasks.length - 1}
                  className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--line)]/30 text-[var(--ink)] disabled:opacity-30 cursor-pointer"
                  title="নিচে স্থানান্তর"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Approval Form */}
        <div className="pt-4 border-t border-[var(--line)] space-y-3">
          <label className="block text-xs font-semibold text-[var(--ink)]">
            সমন্বয়কারীর অনুমোদন নোট (Approval Note) *
          </label>
          <input
            type="text"
            value={approvalNote}
            onChange={(e) => setApprovalNote(e.target.value)}
            className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-xl p-3 focus:outline-hidden focus:border-[var(--green)]"
          />

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleApprove}
              disabled={isApproving}
              className="px-6 py-3 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold transition shadow-xs disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isApproving ? 'অনুমোদন হচ্ছে...' : 'পর্যায়ক্রম ও কর্মপরিকল্পনা চূড়ান্ত অনুমোদন করুন'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
