import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  GitMerge,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowDown
} from 'lucide-react';

export const CoordinatorMultiDeptListPage: React.FC = () => {
  const { cases } = useCases();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const [activeTab, setActiveTab] = useState<string>(initialFilter); // all, stalled, in_progress, resolved

  // Compound cases with multiple departmental tasks
  const multiDeptCases = useMemo(() => {
    return cases.filter(c => c.tasks && c.tasks.length > 1);
  }, [cases]);

  const filteredCases = useMemo(() => {
    if (activeTab === 'stalled') {
      return multiDeptCases.filter(c => c.tasks?.some(t => t.waitingReason));
    }
    if (activeTab === 'in_progress') {
      return multiDeptCases.filter(c => c.status === 'in_progress');
    }
    if (activeTab === 'resolved') {
      return multiDeptCases.filter(c => c.status === 'resolved_pending_citizen' || c.status === 'closed');
    }
    return multiDeptCases;
  }, [multiDeptCases, activeTab]);

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--green-light)] px-3 py-0.5 rounded-full border border-[var(--line)]">
              কেস অপারেশনস
            </span>
            <span className="text-xs text-[var(--muted)]">আন্তঃবিভাগীয় কর্মপ্রবাহ ও যৌথ সমন্বয়</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
            বহু-বিভাগীয় সমন্বয় হাব (Multi-Department Coordination)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            বর্জ্য ব্যবস্থাপনা, ড্রেনেজ প্রকৌশল এবং সড়ক ও অবকাঠামো বিভাগের আন্তঃনির্ভরশীল যৌগিক কেস মনিটরিং
          </p>
        </div>

        <Link
          to="/coordinator/sequence-planner"
          className="px-4 py-2 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
        >
          <GitMerge className="w-4 h-4" />
          <span>নতুন সিকোয়েন্স অনুমোদন</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[var(--green)] text-white'
              : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
          }`}
        >
          সকল সমন্বিত কেস ({toBanglaNumber(multiDeptCases.length)})
        </button>
        <button
          onClick={() => setActiveTab('stalled')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'stalled'
              ? 'bg-amber-600 text-white'
              : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
          }`}
        >
          পূর্বশর্তে স্থবির ({toBanglaNumber(multiDeptCases.filter(c => c.tasks?.some(t => t.waitingReason)).length)})
        </button>
        <button
          onClick={() => setActiveTab('in_progress')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'in_progress'
              ? 'bg-[var(--green)] text-white'
              : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
          }`}
        >
          চলমান টাস্ক ({toBanglaNumber(multiDeptCases.filter(c => c.status === 'in_progress').length)})
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'resolved'
              ? 'bg-emerald-700 text-white'
              : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
          }`}
        >
          নিষ্পন্ন / সমাপ্ত ({toBanglaNumber(multiDeptCases.filter(c => c.status === 'resolved_pending_citizen' || c.status === 'closed').length)})
        </button>
      </div>

      {/* Grid of Multi-Department Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCases.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-xs space-y-4 hover:border-[var(--green)] transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-xs font-bold text-[var(--gold)]">
                  {item.trackingNumber || item.id}
                </span>
                <h3 className="text-sm font-bold text-[var(--ink)] mt-0.5">{item.title}</h3>
                <p className="text-xs text-[var(--muted)] mt-1">{item.location.wardName} • {item.location.address}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <PriorityBadge priority={item.priority} />
                <StatusBadge status={item.status} />
              </div>
            </div>

            {/* Sequential Steps Viewer */}
            <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--line)] space-y-2">
              <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                ধারাবাহিক কাজের সিকোয়েন্স ও ডিপেন্ডেন্সি:
              </span>
              <div className="space-y-2">
                {item.tasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--paper)] border border-[var(--line)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[var(--bg)] border border-[var(--line)] text-[10px] font-bold flex items-center justify-center font-mono">
                        {toBanglaNumber(idx + 1)}
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--ink)]">{task.title}</span>
                        <span className="text-[10px] text-[var(--muted)] ml-2 font-mono">({task.departmentName})</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        task.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : task.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.status === 'resolved' ? 'সম্পন্ন' : task.status === 'in_progress' ? 'চলমান' : 'অপেক্ষমাণ'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
              <span className="text-[11px] text-[var(--muted)]">
                দাখিলের তারিখ: {formatBanglaDate(item.submittedAt)}
              </span>
              <Link
                to={`/coordinator/cases/${item.id}`}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold transition flex items-center gap-1"
              >
                <span>কেস সমন্বয় করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
