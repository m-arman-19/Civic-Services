import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import apiClient from '../../services/apiClient';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Clock,
  ShieldCheck,
  UserCheck,
  Send,
  Filter,
  Search,
  Eye
} from 'lucide-react';

interface HandoverItem {
  id: string;
  case_id: string;
  title_bn: string;
  department_name_bn: string;
  ward_name_bn: string;
  priority: string;
  acceptance_status: 'pending' | 'accepted' | 'rejected';
  rejection_reason_bn?: string;
  sla_remaining_bn: string;
  prerequisites_completed: boolean;
  assigned_officer_name_bn?: string;
  created_at: string;
}

export const WardHandoverPage: React.FC = () => {
  const { cases } = useCases();
  const { currentUser } = useAuth();

  const [handoverList, setHandoverList] = useState<HandoverItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [escalatedTasks, setEscalatedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadHandovers = async () => {
      // Pull department incoming requests from apiClient
      const reqs = await apiClient.tasks.getDepartmentRequests();
      if (Array.isArray(reqs)) {
        setHandoverList(reqs.map((r: any) => ({
          id: r.id,
          case_id: r.case_id,
          title_bn: r.title_bn,
          department_name_bn: r.department_name_bn,
          ward_name_bn: r.ward_name_bn,
          priority: r.priority,
          acceptance_status: r.acceptance_status || 'pending',
          rejection_reason_bn: r.rejection_reason_bn || (r.acceptance_status === 'rejected' ? 'এখতিয়ার বহির্ভূত এলাকা হিসেবে রিপোর্ট করা হয়েছে' : undefined),
          sla_remaining_bn: r.sla_remaining_bn || '৪ ঘণ্টা ৩০ মি.',
          prerequisites_completed: r.prerequisites_completed ?? true,
          assigned_officer_name_bn: r.assigned_officer_name_bn,
          created_at: r.created_at
        })));
      }
    };
    loadHandovers();
  }, [cases]);

  const handleEscalate = (taskId: string) => {
    setEscalatedTasks(prev => ({ ...prev, [taskId]: true }));
  };

  const filtered = handoverList.filter(item => {
    const matchSearch =
      item.case_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title_bn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department_name_bn.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === 'all' || item.acceptance_status === filterStatus;

    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] bg-[var(--paper-elevated)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              {currentUser.wardName || 'ওয়ার্ড ১২'}
            </span>
            <span className="text-xs text-[var(--muted)]">দপ্তর হস্তান্তর ও ওয়ার্ক-অর্ডার ট্র্যাকিং</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] tracking-tight">
            বিভাগীয় হ্যান্ডওভার ও গ্রহণযোগ্যতা মনিটর (Department Handover)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-2xl">
            অনুমোদিত কাজ দপ্তর কর্তৃক গৃহীত হয়েছে কি না এবং প্রত্যাখ্যাত কাজের কারণ পর্যালোচনা করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3.5 py-1.5 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)]">
            মোট হ্যান্ডওভার: <strong className="text-[var(--green)]">{toBanglaNumber(handoverList.length)}</strong>
          </span>
        </div>
      </div>

      {/* RBAC Governance Note */}
      <div className="civic-card rounded-2xl p-4 bg-[var(--paper-elevated)] border border-[var(--line)] flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-[var(--green)] shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-[var(--ink)]">দায়িত্ব বণ্টন নীতিমালা (RBAC Governance Notice):</strong>
          <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
            ওয়ার্ড ডেস্ক কর্মকর্তা হিসেবে আপনি হ্যান্ডওভারের গ্রহণযোগ্যতা তদারকি ও বিলম্বের ক্ষেত্রে সমন্বয়কারী বরাবর এস্কেলেট করতে পারেন। তবে একক ফিল্ড কর্মকর্তার কাছে সরাসরি ফোর্স-ডিসপ্যাচ করার এখতিয়ার সংশ্লিষ্ট বিভাগীয় প্রধান ও সমন্বয়কারীর জন্য সংরক্ষিত।
          </p>
        </div>
      </div>

      {/* Search and Status Filter */}
      <div className="civic-card rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="কেস আইডি, কাজের শিরোনাম বা বিভাগ দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-xl border border-[var(--line)] focus:outline-hidden focus:border-[var(--green)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[var(--muted)] shrink-0" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-xl border border-[var(--line)] font-medium focus:outline-hidden focus:border-[var(--green)] cursor-pointer"
          >
            <option value="all">সকল অবস্থা</option>
            <option value="pending">গ্রহণের অপেক্ষায় (Pending Acceptance)</option>
            <option value="accepted">গৃহীত (Accepted)</option>
            <option value="rejected">প্রত্যাখ্যাত (Rejected with Reason)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="civic-card rounded-2xl overflow-hidden shadow-xs border border-[var(--line)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-semibold uppercase tracking-wider">
                <th className="p-3.5">টাস্ক / কেস আইডি</th>
                <th className="p-3.5">কাজের বিবরণ</th>
                <th className="p-3.5">হস্তান্তরিত বিভাগ</th>
                <th className="p-3.5">অগ্রাধিকার ও SLA</th>
                <th className="p-3.5">গ্রহণের অবস্থা</th>
                <th className="p-3.5">নির্ধারিত কর্মকর্তা</th>
                <th className="p-3.5 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filtered.map(item => {
                const isRejected = item.acceptance_status === 'rejected';
                const isPending = item.acceptance_status === 'pending';
                const isEscalated = escalatedTasks[item.id];

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-[var(--bg)] transition ${
                      isRejected ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-[var(--ink)]">{item.id}</div>
                      <div className="text-[11px] font-mono text-[var(--muted)]">কেস: {item.case_id}</div>
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <div className="font-semibold text-[var(--ink)]">{item.title_bn}</div>
                      <div className="text-[11px] text-[var(--muted)] mt-0.5">{item.ward_name_bn}</div>
                    </td>

                    <td className="p-3.5">
                      <strong className="text-[var(--green)] font-bold">{item.department_name_bn}</strong>
                    </td>

                    <td className="p-3.5">
                      <PriorityBadge priority={item.priority as any} />
                      <div className="text-[11px] text-[var(--muted)] font-mono mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>অবশিষ্ট: {item.sla_remaining_bn}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          <Clock className="w-3 h-3" />
                          <span>গ্রহণের অপেক্ষায়</span>
                        </span>
                      )}
                      {item.acceptance_status === 'accepted' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--green-light)] text-[var(--green)] border border-[var(--green)]/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>দপ্তর গৃহীত</span>
                        </span>
                      )}
                      {isRejected && (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                            <XCircle className="w-3 h-3" />
                            <span>দপ্তর কর্তৃক প্রত্যাখ্যাত</span>
                          </span>
                          {item.rejection_reason_bn && (
                            <p className="text-[10px] text-rose-700 mt-1 max-w-xs">
                              কারণ: {item.rejection_reason_bn}
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5">
                      {item.assigned_officer_name_bn ? (
                        <div className="flex items-center gap-1 font-medium text-[var(--ink)]">
                          <UserCheck className="w-3.5 h-3.5 text-[var(--green)]" />
                          <span>{item.assigned_officer_name_bn}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[var(--muted)]">দপ্তরের বণ্টন অপেক্ষমাণ</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right space-x-1.5">
                      {isRejected && (
                        <Link
                          to={`/ward/routing`}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>রি-রুট</span>
                        </Link>
                      )}

                      {isPending && !isEscalated && (
                        <button
                          type="button"
                          onClick={() => handleEscalate(item.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>সমন্বয়কারীকে এস্কেলেট</span>
                        </button>
                      )}

                      {isEscalated && (
                        <span className="text-[11px] text-[var(--green)] font-bold">
                          ✓ এস্কেলেট সম্পন্ন
                        </span>
                      )}

                      <Link
                        to={`/ward/cases/${item.case_id}`}
                        className="px-2 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--muted)] hover:text-[var(--ink)] transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
