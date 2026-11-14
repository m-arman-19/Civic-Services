import React, { useState, useEffect } from 'react';
import { useCases } from '../../context/CaseContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import apiClient from '../../services/apiClient';
import {
  Users,
  ListTodo,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Building,
  UserCheck,
  Send,
  Sliders,
  ShieldCheck,
  Flame
} from 'lucide-react';

export const CoordinatorWorkloadPage: React.FC = () => {
  const [officers, setOfficers] = useState<any[]>([]);
  const [waitingQueue, setWaitingQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [offData, queueData] = await Promise.all([
          apiClient.officers.getAvailability(),
          apiClient.tasks.getWaitingQueue()
        ]);
        if (Array.isArray(offData)) setOfficers(offData);
        if (Array.isArray(queueData)) setWaitingQueue(queueData);
      } catch (e) {
        console.error('Failed to load workload data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenAssignModal = async (task: any) => {
    setSelectedTask(task);
    try {
      const recs: any = await apiClient.tasks.getRecommendations(task.id);
      setRecommendations(recs?.recommendations || (Array.isArray(recs) ? recs : []));
    } catch (e) {
      setRecommendations([]);
    }
  };

  const handleConfirmAssignment = async (officerId: string, officerName: string) => {
    if (!selectedTask) return;
    setAssigning(true);
    try {
      await apiClient.tasks.assign(selectedTask.id, officerId, 'manual', 'সমন্বয়ক কার্যালয় থেকে নির্ধারিত');
      setAssignSuccess(`টাস্কটি সফলভাবে কর্মকর্তা ${officerName}-এর কাছে নির্ধারিত হয়েছে।`);
      // Update local state
      setWaitingQueue(prev => prev.filter(t => t.id !== selectedTask.id));
      setSelectedTask(null);
    } catch (e: any) {
      alert('অ্যাসাইনমেন্ট সম্পন্ন করতে ব্যর্থ: ' + (e?.message || 'অনুগ্রহ করে পুনরায় চেষ্টা করুন'));
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--green-light)] px-3 py-0.5 rounded-full border border-[var(--line)]">
              কেস অপারেশনস
            </span>
            <span className="text-xs text-[var(--muted)]">R&D Section 11 & Table 30 ক্যাপাসিটি ও ডিসপ্যাচ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
            অ্যাসাইনমেন্ট কিউ ও কর্মকর্তা ওয়ার্কলোড (Assignment & Workload)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            অপেক্ষমাণ টাস্ক তালিকা, এআই সুপারিশকৃত কর্মকর্তা ও বিভাগীয় সক্ষমতার রিয়েল-টাইম তথ্য
          </p>
        </div>
      </div>

      {assignSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{assignSuccess}</span>
          </div>
          <button onClick={() => setAssignSuccess(null)} className="text-xs underline cursor-pointer">
            ঠিক আছে
          </button>
        </div>
      )}

      {/* Grid: Left = Persistent Waiting Queue, Right = Officer Workload Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Persistent Waiting Queue */}
        <div className="p-5 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-[var(--green)]" />
                <span>অপেক্ষমাণ টাস্ক কিউ (Persistent Waiting Queue)</span>
              </h3>
              <p className="text-[11px] text-[var(--muted)]">
                উপযুক্ত কর্মকর্তা প্রাপ্তির অপেক্ষায় থাকা অনুমোদিত টাস্ক
              </p>
            </div>
            <span className="text-xs font-bold text-amber-600 font-mono">
              {toBanglaNumber(waitingQueue.length)} টি অপেক্ষমাণ
            </span>
          </div>

          <div className="space-y-3">
            {waitingQueue.length > 0 ? (
              waitingQueue.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-2 hover:border-[var(--green)] transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[var(--gold)]">#{item.case_id || item.id}</span>
                        <PriorityBadge priority={item.priority || 'medium'} />
                      </div>
                      <h4 className="text-xs font-bold text-[var(--ink)] mt-1">{item.title_bn}</h4>
                      <p className="text-[11px] text-[var(--muted)] mt-0.5">{item.ward_name_bn} • {item.department_name_bn}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-100 text-amber-800">
                      SLA: {toBanglaNumber(item.sla_hours || 24)}h
                    </span>
                  </div>

                  {item.prerequisite_note && (
                    <div className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{item.prerequisite_note}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
                    <span className="text-[10px] text-[var(--muted)] font-mono">কিউ পজিশন: #{toBanglaNumber(idx + 1)}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenAssignModal(item)}
                      className="px-3 py-1 rounded-lg bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>এআই রিকমেন্ডেশনে বরাদ্দ</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[var(--muted)]">
                বর্তমানে কোনো টাস্ক কিউতে অপেক্ষমাণ নেই।
              </div>
            )}
          </div>
        </div>

        {/* Right: Officer Workload & Availability */}
        <div className="p-5 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--green)]" />
                <span>কর্মকর্তা উপস্থিতি ও ক্যাপাসিটি (Workload Distribution)</span>
              </h3>
              <p className="text-[11px] text-[var(--muted)]">
                রিয়েল-টাইম ডিউটি স্ট্যাটাস ও সক্রিয় কাজের লোড
              </p>
            </div>
            <span className="text-xs font-bold text-[var(--ink)] font-mono">
              {toBanglaNumber(officers.length)} জন কর্মকর্তা
            </span>
          </div>

          <div className="space-y-3">
            {officers.map(officer => {
              const capacityPercent = Math.round((officer.current_active_tasks / Math.max(1, officer.max_concurrent_tasks)) * 100);
              return (
                <div
                  key={officer.id}
                  className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--ink)]">{officer.name_bn}</h4>
                      <p className="text-[11px] text-[var(--muted)]">{officer.designation_bn} • {officer.ward_name_bn}</p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        officer.availability_status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : officer.availability_status === 'busy'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {officer.availability_status === 'available' ? 'ডিউটিতে প্রস্তুত' : officer.availability_status === 'busy' ? 'ব্যস্ত (Busy)' : 'ছুটিতে'}
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
                      <span>সক্রিয় কাজ: {toBanglaNumber(officer.current_active_tasks)} / {toBanglaNumber(officer.max_concurrent_tasks)} টি</span>
                      <span className="font-mono">{toBanglaNumber(capacityPercent)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[var(--paper)] border border-[var(--line)] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          capacityPercent >= 100 ? 'bg-red-500' : capacityPercent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, capacityPercent)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[var(--muted)] pt-1 border-t border-[var(--line)]">
                    <span>ফোন: {officer.official_phone || '০১৭০০-০০০০০১'}</span>
                    <span className="font-mono">দক্ষতা: {officer.skills?.join(', ') || 'ড্রেনেজ, পাইপলাইন'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Recommendation & Dispatch Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl bg-[var(--paper)] rounded-2xl border border-[var(--line)] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--green)]" />
                <span>এআই কর্মকর্তা নির্বাচন ও ডিসপ্যাচ সুপারিশ</span>
              </h3>
              <button onClick={() => setSelectedTask(null)} className="text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--line)] text-xs space-y-1">
              <div><strong className="text-[var(--ink)]">টাস্ক:</strong> {selectedTask.title_bn}</div>
              <div><strong className="text-[var(--ink)]">বিভাগ:</strong> {selectedTask.department_name_bn}</div>
              <div><strong className="text-[var(--ink)]">ওয়ার্ড:</strong> {selectedTask.ward_name_bn}</div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block">
                উপযুক্ততার ভিত্তিতে কর্মকর্তা র‌্যাঙ্কিং:
              </label>

              {recommendations.length > 0 ? (
                recommendations.map((rec, i) => (
                  <div
                    key={rec.officer_id}
                    className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] space-y-2 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[var(--paper)] border border-[var(--line)] text-[10px] font-bold flex items-center justify-center font-mono">
                          {toBanglaNumber(i + 1)}
                        </span>
                        <h4 className="text-xs font-bold text-[var(--ink)]">{rec.name_bn}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-800">
                          স্কোর: {toBanglaNumber(rec.suitability_score || 94)}%
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] mt-1">
                        ব্যাখ্যা: {rec.explanation_bn || 'ওয়ার্ড এখতিয়ারভুক্ত এবং বর্তমান লোড ন্যূনতম।'}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={assigning}
                      onClick={() => handleConfirmAssignment(rec.officer_id, rec.name_bn)}
                      className="px-3.5 py-1.5 rounded-lg bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      বরাদ্দ নিশ্চিত করুন
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-[var(--muted)] bg-[var(--bg)] rounded-xl">
                  নির্দিষ্ট ফিল্টার অনুযায়ী স্বয়ংক্রিয় সুপারিশ লোড হচ্ছে...
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
