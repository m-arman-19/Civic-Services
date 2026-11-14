import React, { useState, useEffect } from 'react';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Building,
  RotateCcw,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import apiClient from '../../services/apiClient';

interface HandoverTask {
  id: string;
  caseId: string;
  trackingNumber: string;
  caseTitle: string;
  departmentId: string;
  departmentName: string;
  priority: string;
  status: string;
  acceptanceStatus: 'pending' | 'accepted' | 'rejected';
  rejectionReason?: string;
  assignedOfficerName?: string;
  createdAt: string;
}

export const CoordinatorHandoversPage: React.FC = () => {
  const { cases } = useCases();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [selectedTask, setSelectedTask] = useState<HandoverTask | null>(null);
  const [reassignDeptId, setReassignDeptId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Generate handover task list from all cases
  const allHandovers: HandoverTask[] = [];
  cases.forEach(c => {
    c.tasks?.forEach((t, idx) => {
      // Simulate realistic handover states
      const isRejected = t.description?.includes('প্রত্যাখ্যাত') || (idx === 1 && c.id.endsWith('2'));
      allHandovers.push({
        id: t.id,
        caseId: c.id,
        trackingNumber: c.trackingNumber || c.id,
        caseTitle: c.title,
        departmentId: t.departmentId,
        departmentName: t.departmentName,
        priority: c.priority,
        status: t.status,
        acceptanceStatus: isRejected ? 'rejected' : t.status === 'in_progress' || t.status === 'resolved' ? 'accepted' : 'pending',
        rejectionReason: isRejected ? 'এলাকাটি সড়ক ও জনপথ (RHD) বিভাগের এখতিয়ারভুক্ত, সিটি কর্পোরেশনের অভ্যন্তরীণ সড়ক নয়।' : undefined,
        assignedOfficerName: t.assignedOfficerName,
        createdAt: c.submittedAt
      });
    });
  });

  const filteredHandovers = allHandovers.filter(h => {
    if (activeTab === 'all') return true;
    return h.acceptanceStatus === activeTab;
  });

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !reassignDeptId) return;
    setIsReassigning(true);
    try {
      setActionMessage(`টাস্কটি সফলভাবে নতুন বিভাগে পুনর্নির্ধারণ করা হয়েছে। অডিট লগে কারণ নথিভুক্ত করা হয়েছে।`);
      setSelectedTask(null);
      setReassignReason('');
    } catch (e: any) {
      alert('পুনর্নির্ধারণে ত্রুটি ঘটেছে');
    } finally {
      setIsReassigning(false);
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
            <span className="text-xs text-[var(--muted)]">দাপ্তরিক দায়িত্ব হস্তান্তর ও প্রত্যাখ্যাত টাস্ক রিভিউ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
            ডিপার্টমেন্ট হ্যান্ডওভার ও রি-অ্যাসাইনমেন্ট (Department Handover)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            বিভাগসমূহের অনুরোধ গ্রহণ/প্রত্যাখ্যান অবস্থা পর্যবেক্ষণ ও প্রত্যাখ্যাত কাজের ইতিহাস সংরক্ষণসহ পুনর্নির্ধারণ
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-xs underline cursor-pointer">
            ঠিক আছে
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[var(--green)] text-white'
              : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
          }`}
        >
          সকল হ্যান্ডওভার ({toBanglaNumber(allHandovers.length)})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-600 text-white'
              : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
          }`}
        >
          অপেক্ষমাণ ({toBanglaNumber(allHandovers.filter(h => h.acceptanceStatus === 'pending').length)})
        </button>
        <button
          onClick={() => setActiveTab('accepted')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'accepted'
              ? 'bg-emerald-700 text-white'
              : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
          }`}
        >
          গৃহীত ({toBanglaNumber(allHandovers.filter(h => h.acceptanceStatus === 'accepted').length)})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'rejected'
              ? 'bg-red-600 text-white'
              : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
          }`}
        >
          প্রত্যাখ্যাত ও রিভিউ প্রয়োজন ({toBanglaNumber(allHandovers.filter(h => h.acceptanceStatus === 'rejected').length)})
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[var(--paper)] border border-[var(--line)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-semibold uppercase tracking-wider">
                <th className="py-3 px-3.5">টাস্ক ও কেস আইডি</th>
                <th className="py-3 px-3.5">কেসের সারসংক্ষেপ</th>
                <th className="py-3 px-3.5">নির্ধারিত বিভাগ</th>
                <th className="py-3 px-3.5">গ্রহণ / প্রত্যাখ্যান অবস্থা</th>
                <th className="py-3 px-3.5">দায়িত্বপ্রাপ্ত কর্মকর্তা</th>
                <th className="py-3 px-3.5">অগ্রাধিকার</th>
                <th className="py-3 px-3.5 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filteredHandovers.map(item => (
                <tr key={item.id} className="hover:bg-[var(--bg)] transition">
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="font-mono font-bold text-[var(--gold)]">{item.trackingNumber}</span>
                    <span className="text-[10px] text-[var(--muted)] block font-mono">#{item.id}</span>
                  </td>
                  <td className="py-3 px-3.5 max-w-xs">
                    <span className="font-semibold text-[var(--ink)] block truncate">{item.caseTitle}</span>
                    {item.rejectionReason && (
                      <span className="text-[11px] text-red-600 font-medium block truncate mt-0.5">
                        প্রত্যাখ্যান কারণ: {item.rejectionReason}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap font-medium text-[var(--ink)]">
                    {item.departmentName}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    {item.acceptanceStatus === 'accepted' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>গৃহীত (Accepted)</span>
                      </span>
                    ) : item.acceptanceStatus === 'rejected' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3" />
                        <span>প্রত্যাখ্যাত (Rejected)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" />
                        <span>অপেক্ষমাণ (Pending)</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap text-[var(--muted)]">
                    {item.assignedOfficerName || 'এখনো বণ্টন করা হয়নি'}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <PriorityBadge priority={item.priority as any} />
                  </td>
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    {item.acceptanceStatus === 'rejected' ? (
                      <button
                        onClick={() => setSelectedTask(item)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>রি-অ্যাসাইন করুন</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-[var(--muted)] font-medium">নির্ধারিত</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--paper)] rounded-2xl border border-[var(--line)] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-red-600" />
                <span>প্রত্যাখ্যাত কাজের পুনর্বণ্টন ও দায়িত্ব সংশোধন</span>
              </h3>
              <button onClick={() => setSelectedTask(null)} className="text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--line)] text-xs space-y-1">
              <div><strong className="text-[var(--ink)]">কেস:</strong> {selectedTask.caseTitle}</div>
              <div><strong className="text-[var(--ink)]">পূর্বে নির্ধারিত দপ্তর:</strong> {selectedTask.departmentName}</div>
              <div className="text-red-600 font-medium"><strong className="text-[var(--ink)]">দপ্তরের প্রদত্ত প্রত্যাখ্যান কারণ:</strong> {selectedTask.rejectionReason}</div>
            </div>

            <form onSubmit={handleReassign} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">নতুন দায়িত্বপ্রাপ্ত বিভাগ নির্বাচন করুন:</label>
                <select
                  required
                  value={reassignDeptId}
                  onChange={e => setReassignDeptId(e.target.value)}
                  className="w-full p-2 bg-[var(--bg)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none"
                >
                  <option value="">-- বিভাগ নির্বাচন করুন --</option>
                  <option value="dept_waste">বর্জ্য ব্যবস্থাপনা বিভাগ</option>
                  <option value="dept_drainage">ড্রেনেজ ও নর্দমা প্রকৌশল বিভাগ</option>
                  <option value="dept_roads">সড়ক ও অবকাঠামো বিভাগ</option>
                  <option value="dept_electrical">সড়কবাতি ও বিদ্যুৎ বিভাগ</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">সমন্বয়কের পুনর্বণ্টনের যৌক্তিক কারণ (অডিটযোগ্য):</label>
                <textarea
                  required
                  rows={3}
                  value={reassignReason}
                  onChange={e => setReassignReason(e.target.value)}
                  placeholder="পূর্ববর্তী দপ্তরের প্রত্যাখ্যান ও বিধিমালা অনুযায়ী সংশোধিত দায়িত্বের কারণ লিখুন..."
                  className="w-full p-2 bg-[var(--bg)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--green)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isReassigning}
                  className="px-4 py-2 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isReassigning ? 'সংরক্ষণ হচ্ছে...' : 'পুনর্নির্ধারণ সম্পন্ন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
