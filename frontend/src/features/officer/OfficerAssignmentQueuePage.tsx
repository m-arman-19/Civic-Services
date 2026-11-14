import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { toBanglaNumber, formatBanglaDate, calculateSlaCountdown } from '../../utils/formatters';
import { OfficerAssignmentRecommendationModal } from './OfficerAssignmentRecommendationModal';
import {
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Layers,
  Sparkles,
  MapPin,
  Calendar,
  UserCheck
} from 'lucide-react';

export const OfficerAssignmentQueuePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoDispatching, setAutoDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any | null>(null);

  // Recommendation modal state
  const [selectedTaskForAssign, setSelectedTaskForAssign] = useState<{ id: string; title: string; ward?: number } | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.tasks.getWaitingQueue(currentUser?.departmentId);
      setQueueItems(data);
    } catch (err: any) {
      setError(err.message || 'অপেক্ষার কিউ লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [currentUser?.departmentId]);

  const handleAutoDispatch = async () => {
    try {
      setAutoDispatching(true);
      setDispatchResult(null);
      const res = await apiClient.tasks.autoDispatch(currentUser?.departmentId);
      setDispatchResult(res);
      await fetchQueue();
    } catch (err: any) {
      alert(err.message || 'স্বয়ংক্রিয় প্রেরণ প্রক্রিয়া ব্যর্থ হয়েছে।');
    } finally {
      setAutoDispatching(false);
    }
  };

  const activeQueue = queueItems.filter(item => item.status === 'queued' || item.status === 'blocked');

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xs font-mono tracking-widest text-[var(--ink)] bg-[var(--paper)] px-3.5 py-1 rounded-full border border-[var(--line)] uppercase font-semibold">
              {currentUser?.departmentName || 'ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ'}
            </span>
            <span className="text-xs font-mono text-[var(--muted)] bg-[var(--bg)] px-2.5 py-1 rounded-md border border-[var(--line)]">
              Persistent DB Queue
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
            অ্যাসাইনমেন্ট অপেক্ষার কিউ (Task Assignment Waiting Queue)
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5">
            কর্মকর্তার প্রাপ্যতা ঘাটতি বা পূর্বশর্তের কারণে অপেক্ষারত কাজের শৃঙ্খলাবদ্ধ অগ্রাধিকার তালিকা।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAutoDispatch}
            disabled={autoDispatching || activeQueue.length === 0}
            className="flex items-center gap-2.5 px-5 py-3 text-sm font-bold rounded-xl civic-btn-primary shadow-sm disabled:opacity-40 transition cursor-pointer active:scale-95"
          >
            <Zap className={`w-4.5 h-4.5 ${autoDispatching ? 'animate-spin' : ''}`} />
            <span>{autoDispatching ? 'প্রেরণ চলছে...' : 'স্বয়ংক্রিয় প্রেরণ (Auto-Dispatch Now)'}</span>
          </button>
          <button
            type="button"
            onClick={fetchQueue}
            disabled={loading}
            className="p-3 text-[var(--ink)] bg-[var(--paper)] border border-[var(--line)] hover:bg-[var(--paper-elevated)] rounded-xl transition cursor-pointer shadow-sm"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4.5 h-4.5 text-[var(--ink)] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Auto-Dispatch Feedback Alert */}
      {dispatchResult && (
        <div className="p-4 rounded-xl bg-[var(--status-low-bg)] border border-[var(--status-low-line)] text-sm space-y-1.5 shadow-sm text-[var(--status-low)] animate-in fade-in">
          <div className="flex items-center gap-2.5 font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>স্বয়ংক্রিয় প্রেরণ প্রক্রিয়াকরণ সম্পন্ন!</span>
          </div>
          <p className="text-[var(--muted)] text-sm">
            {dispatchResult.message || 'যোগ্য কর্মকর্তাদের অনুকূলে স্বয়ংক্রিয়ভাবে টাস্ক প্রেরণ করা হয়েছে।'}
          </p>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl civic-card shadow-sm">
          <span className="text-sm font-bold text-[var(--muted)]">সক্রিয় অপেক্ষারত (Queued)</span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[var(--ink)] mt-2">
            {toBanglaNumber(activeQueue.filter(i => i.status === 'queued').length)}
          </div>
        </div>
        <div className="p-6 rounded-2xl civic-card shadow-sm">
          <span className="text-sm font-bold text-[var(--muted)]">মোট কিউ হিস্ট্রি</span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[var(--ink)] mt-2">
            {toBanglaNumber(queueItems.length)}
          </div>
        </div>
        <div className="p-6 rounded-2xl civic-card shadow-sm">
          <span className="text-sm font-bold text-[var(--muted)]">পূর্বশর্তে অবরুদ্ধ</span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[var(--status-medium)] mt-2">
            {toBanglaNumber(activeQueue.filter(i => i.status === 'blocked').length)}
          </div>
        </div>
        <div className="p-6 rounded-2xl civic-card shadow-sm">
          <span className="text-sm font-bold text-[var(--muted)]">সক্ষমতা ঘাটতিতে অপেক্ষমাণ</span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[var(--status-low)] mt-2">
            {toBanglaNumber(activeQueue.filter(i => i.status === 'queued' && i.eligibility_state === 'ready').length)}
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm font-bold text-[var(--ink)] px-1">
          <span>অপেক্ষার ক্রম তালিকা (অগ্রাধিকার ও এসএলএ ঝুঁকি অনুযায়ী সাজানো):</span>
          <span className="text-[var(--ink)] font-mono">{toBanglaNumber(activeQueue.length)} টি টাস্ক অপেক্ষমাণ</span>
        </div>

        {loading ? (
          <div className="p-14 text-center text-[var(--muted)] rounded-2xl civic-card space-y-3">
            <div className="w-9 h-9 border-2 border-[var(--ink)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm">কিউ তালিকা লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-[var(--status-emergency-bg)] border border-[var(--status-emergency-line)] text-[var(--status-emergency)] rounded-xl text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : activeQueue.length === 0 ? (
          <div className="p-14 text-center text-[var(--muted)] rounded-2xl civic-card space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[var(--status-low)] mx-auto opacity-75" />
            <h3 className="text-lg font-bold text-[var(--ink)]">বর্তমানে কোনো টাস্ক অপেক্ষার কিউতে নেই</h3>
            <p className="text-sm text-[var(--muted)]">সকল অনুমোদিত কাজ যথাসময়ে উপযুক্ত কর্মকর্তার অনুকূলে বরাদ্দ রয়েছে।</p>
          </div>
        ) : (
          activeQueue.map((item, idx) => {
            const isPrereqBlocked = item.status === 'blocked';
            const isEmergency = item.priority === 'emergency';

            return (
              <div
                key={item.id}
                className="p-6 sm:p-7 rounded-2xl civic-card hover:border-[var(--line-strong)] transition shadow-sm space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] font-mono text-sm font-bold flex items-center justify-center shrink-0">
                      {toBanglaNumber(idx + 1)}
                    </span>
                    <span className="font-mono text-xs font-bold text-[var(--ink)] bg-[var(--bg)] px-3 py-1 rounded-lg border border-[var(--line)]">
                      টাস্ক #{item.task_id}
                    </span>
                    <span className="text-sm font-bold text-[var(--ink)]">
                      {item.ward_name_bn || 'ওয়ার্ড ৩ (মিরপুর)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                      isEmergency
                        ? 'bg-[var(--status-emergency-bg)] text-[var(--status-emergency)] border-[var(--status-emergency-line)]'
                        : item.priority === 'high'
                        ? 'bg-[var(--status-high-bg)] text-[var(--status-high)] border-[var(--status-high-line)]'
                        : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--line)]'
                    }`}>
                      {item.priority_bn || item.priority}
                    </span>
                    <span className="text-sm text-[var(--ink)] flex items-center gap-1.5 font-bold font-mono">
                      <Clock className="w-4 h-4 text-[var(--muted)]" />
                      <span>{item.sla_remaining_bn || 'এসএলএ বাকি'}</span>
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h3 className="text-lg font-bold text-[var(--ink)]">
                    {item.task_title_bn || `টাস্ক #${item.task_id}`}
                  </h3>
                  <div className="flex flex-wrap items-center gap-5 mt-2 text-sm text-[var(--muted)]">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[var(--ink)]" />
                      কেস: <strong className="text-[var(--ink)] font-mono">#{item.case_id}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[var(--ink)]" />
                      কিউতে অপেক্ষার সময়: {toBanglaNumber(item.waiting_hours || 1.5)} ঘণ্টা
                    </span>
                    <span className="text-[var(--muted)] font-mono text-xs">
                      এসএলএ ঝুঁকি: <span className="text-[var(--status-medium)] uppercase font-bold">{item.sla_breach_risk || 'Normal'}</span>
                    </span>
                  </div>
                </div>

                {/* Waiting reason & status */}
                <div className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2.5">
                    {isPrereqBlocked ? (
                      <span className="flex items-center gap-1.5 text-[var(--status-medium)] font-semibold bg-[var(--status-medium-bg)] px-3 py-1 rounded-lg border border-[var(--status-medium-line)] text-xs">
                        <Lock className="w-4 h-4" />
                        পূর্বশর্ত অপূর্ণ
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[var(--status-low)] font-semibold bg-[var(--status-low-bg)] px-3 py-1 rounded-lg border border-[var(--status-low-line)] text-xs">
                        <UserCheck className="w-4 h-4" />
                        কর্মকর্তা বরাদ্দ অপেক্ষমাণ
                      </span>
                    )}
                    <span className="text-[var(--ink)] text-sm">{item.waiting_reason_bn || 'কোনো যোগ্য কর্মকর্তা খালি নেই'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedTaskForAssign({ id: item.task_id, title: item.task_title_bn || item.task_id, ward: 3 })}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl civic-btn-primary font-bold text-sm transition cursor-pointer shadow-sm active:scale-95 shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>ম্যানুয়াল বরাদ্দ (Assign)</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recommendation & Assignment Modal */}
      {selectedTaskForAssign && (
        <OfficerAssignmentRecommendationModal
          isOpen={true}
          taskId={selectedTaskForAssign.id}
          taskTitle={selectedTaskForAssign.title}
          wardNumber={selectedTaskForAssign.ward}
          onClose={() => setSelectedTaskForAssign(null)}
          onAssigned={() => {
            setSelectedTaskForAssign(null);
            fetchQueue();
          }}
        />
      )}
    </div>
  );
};
