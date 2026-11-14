import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { MUNICIPAL_DEPARTMENTS } from '../../constants';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  Route,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Filter
} from 'lucide-react';

export const WardRoutingPage: React.FC = () => {
  const { cases, verifyCaseResponsibility } = useCases();
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [selectedCaseForReroute, setSelectedCaseForReroute] = useState<any | null>(null);
  const [newDeptId, setNewDeptId] = useState('dept_drainage');
  const [rerouteReason, setRerouteReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wardCases = cases.filter(c => !currentUser.wardId || c.location.wardId === currentUser.wardId);

  const filteredCases = wardCases.filter(c => {
    const matchSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.address.toLowerCase().includes(searchTerm.toLowerCase());

    const currentDept = c.humanVerification?.confirmedDepartmentId || c.aiAnalysis.proposedDepartmentId;
    const matchDept = selectedDeptFilter === 'all' || currentDept === selectedDeptFilter;

    return matchSearch && matchDept;
  });

  const handleReroute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseForReroute || !rerouteReason.trim()) return;

    setIsSubmitting(true);
    const deptObj = MUNICIPAL_DEPARTMENTS.find(d => d.id === newDeptId);
    await verifyCaseResponsibility(
      selectedCaseForReroute.id,
      currentUser.name,
      newDeptId,
      deptObj?.name || 'নির্বাচিত বিভাগ',
      true,
      `দাপ্তরিক রাউটিং সংশোধন: ${rerouteReason}`
    );
    setIsSubmitting(false);
    setSelectedCaseForReroute(null);
    setRerouteReason('');
  };

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] bg-[var(--paper-elevated)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              {currentUser.wardName || 'ওয়ার্ড ১২'}
            </span>
            <span className="text-xs text-[var(--muted)]">বিভাগীয় এখতিয়ার ও রাউটিং ব্যবস্থাপনা</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] tracking-tight">
            বিভাগীয় রাউটিং ও দায় বণ্টন (Department Routing & Handover)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-2xl">
            লিড বিভাগ, সহায়ক বিভাগ, গ্রহণের অবস্থা এবং প্রত্যাখ্যানের কারণ তদারকি করুন
          </p>
        </div>

        <Link
          to="/ward/planner"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <Route className="w-4 h-4" />
          <span>বহু-বিভাগীয় প্ল্যানার (3-Stage Demo)</span>
        </Link>
      </div>

      {/* Demonstration Banner for Multi-dept */}
      <div className="civic-card rounded-2xl p-5 border border-[var(--line)] bg-[var(--paper-elevated)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 font-mono text-[10px] font-bold">
              R&D DEMO WORKFLOW
            </span>
            <strong className="text-xs font-bold text-[var(--ink)]">
              বর্জ্য অপসারণ → ড্রেন পরিষ্কার → সড়ক মেরামত
            </strong>
          </div>
          <p className="text-xs text-[var(--muted)]">
            ড্রেনের ময়লা অপসারণ না হওয়া পর্যন্ত ড্রেন ফ্লাশিং শুরু হতে পারবে না; ড্রেনের কাজ শেষ না হওয়া পর্যন্ত সড়কের পিচঢালাই অবরুদ্ধ (Blocked) থাকবে।
          </p>
        </div>

        <Link
          to="/ward/planner"
          className="px-4 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs font-bold text-[var(--ink)] hover:border-[var(--green)] transition shrink-0 inline-flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <span>প্ল্যানারে দেখুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="civic-card rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="কেস আইডি, সমস্যা বা অবস্থান দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-xl border border-[var(--line)] focus:outline-hidden focus:border-[var(--green)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[var(--muted)] shrink-0" />
          <select
            value={selectedDeptFilter}
            onChange={e => setSelectedDeptFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-xl border border-[var(--line)] font-medium focus:outline-hidden focus:border-[var(--green)] cursor-pointer"
          >
            <option value="all">সকল বিভাগ</option>
            <option value="dept_drainage">ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ</option>
            <option value="dept_waste">বর্জ্য ব্যবস্থাপনা বিভাগ</option>
            <option value="dept_road">সড়ক ও অবকাঠামো বিভাগ</option>
            <option value="dept_lighting">বিদ্যুৎ বিভাগ</option>
          </select>
        </div>
      </div>

      {/* Routing Table */}
      <div className="civic-card rounded-2xl overflow-hidden shadow-xs border border-[var(--line)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-semibold uppercase tracking-wider">
                <th className="p-3.5">কেস আইডি</th>
                <th className="p-3.5">সমস্যার শিরোনাম</th>
                <th className="p-3.5">প্রধান দায়িত্বপ্রাপ্ত বিভাগ</th>
                <th className="p-3.5">সহায়ক বিভাগসমূহ</th>
                <th className="p-3.5">দায়িত্বের ভিত্তি (Rule Code)</th>
                <th className="p-3.5">দাপ্তরিক অবস্থা</th>
                <th className="p-3.5 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filteredCases.map(item => {
                const leadDept = item.humanVerification?.confirmedDepartmentName || item.aiAnalysis.proposedDepartmentName;
                const hasRejection = item.tasks.some(t => (t as any).acceptance_status === 'rejected');
                const rejectionReason = item.tasks.find(t => (t as any).acceptance_status === 'rejected')?.waitingReason;

                return (
                  <tr key={item.id} className="hover:bg-[var(--bg)] transition">
                    <td className="p-3.5 font-mono font-bold text-[var(--ink)]">
                      #{item.id}
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="font-semibold text-[var(--ink)]">{item.title}</div>
                      <div className="text-[11px] text-[var(--muted)] truncate">{item.location.address}</div>
                    </td>
                    <td className="p-3.5">
                      <strong className="text-[var(--green)] font-bold">{leadDept}</strong>
                      {item.humanVerification?.isOverridden && (
                        <span className="text-[10px] text-amber-600 block">মানব কর্মকর্তা কর্তৃক ওভাররাইডকৃত</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {item.tasks.length > 1 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.tasks.slice(1).map(t => (
                            <span key={t.id} className="px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[10px] text-[var(--muted)]">
                              {t.departmentName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-[var(--muted)]">— একক বিভাগ —</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono text-xs text-[var(--gold)] font-semibold">
                        {item.aiAnalysis.ruleReference}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {hasRejection ? (
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                            প্রত্যাখ্যাত (Returned)
                          </span>
                          {rejectionReason && (
                            <span className="text-[10px] text-rose-600 block mt-0.5 max-w-[140px] truncate">
                              কারণ: {rejectionReason}
                            </span>
                          )}
                        </div>
                      ) : (
                        <StatusBadge status={item.status} />
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCaseForReroute(item);
                          setNewDeptId(item.aiAnalysis.proposedDepartmentId);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--green)] text-xs font-semibold text-[var(--ink)] transition cursor-pointer"
                      >
                        রি-রুট
                      </button>
                      <Link
                        to={`/ward/cases/${item.id}`}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>কেস ভিউ</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reroute Modal */}
      {selectedCaseForReroute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
          <div className="civic-card bg-[var(--paper)] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[var(--line)]">
            <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--paper-elevated)]">
              <div>
                <h3 className="text-base font-bold text-[var(--ink)]">
                  দাপ্তরিক দায়িত্ব রি-রুট (Re-assign Department)
                </h3>
                <span className="text-xs font-mono text-[var(--muted)]">#{selectedCaseForReroute.id}</span>
              </div>
              <button
                onClick={() => setSelectedCaseForReroute(null)}
                className="w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReroute} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                  নতুন দায়িত্বপ্রাপ্ত বিভাগ নির্বাচন করুন *
                </label>
                <select
                  value={newDeptId}
                  onChange={e => setNewDeptId(e.target.value)}
                  className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--green)] font-semibold cursor-pointer"
                >
                  {MUNICIPAL_DEPARTMENTS.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                  পুনঃনির্ধারণের যৌক্তিক কারণ (বাধ্যতামূলক) *
                </label>
                <textarea
                  rows={3}
                  value={rerouteReason}
                  onChange={e => setRerouteReason(e.target.value)}
                  placeholder="যেমন: পূর্ববর্তী দপ্তর জানিয়েছে এটি তাদের অধীন নয় / জিপিএস বাউন্ডারি অনুযায়ী অন্য বিভাগের কাজ..."
                  required
                  className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--green)] leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setSelectedCaseForReroute(null)}
                  className="px-4 py-2 border border-[var(--line)] rounded-lg text-xs text-[var(--muted)] hover:text-[var(--ink)] font-medium transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !rerouteReason.trim()}
                  className="px-5 py-2.5 bg-[var(--green)] hover:bg-[var(--green-dark)] text-white rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'ওভাররাইড সংরক্ষণ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
