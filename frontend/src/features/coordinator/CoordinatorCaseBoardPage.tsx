import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { formatBanglaDate, toBanglaNumber } from '../../utils/formatters';
import {
  Layers,
  Search,
  Filter,
  ArrowRight,
  GitMerge,
  Clock,
  AlertTriangle,
  Building,
  MapPin,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const CoordinatorCaseBoardPage: React.FC = () => {
  const { cases } = useCases();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPriority = searchParams.get('priority') || 'all';
  const initialStatus = searchParams.get('status') || 'all';
  const initialWard = searchParams.get('ward') || 'all';
  const initialDept = searchParams.get('department') || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>(initialPriority);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedWard, setSelectedWard] = useState<string>(initialWard);
  const [selectedDept, setSelectedDept] = useState<string>(initialDept);
  const [selectedAge, setSelectedAge] = useState<string>('all'); // all, 24h, 72h, 7d

  // Extract unique departments and wards
  const wards = useMemo(() => {
    const map = new Map<string, string>();
    cases.forEach(c => {
      if (c.location.wardId && c.location.wardName) {
        map.set(String(c.location.wardId), c.location.wardName);
      }
    });
    return Array.from(map.entries());
  }, [cases]);

  const departments = useMemo(() => {
    const map = new Map<string, string>();
    cases.forEach(c => {
      c.tasks?.forEach(t => {
        if (t.departmentId && t.departmentName) {
          map.set(t.departmentId, t.departmentName);
        }
      });
    });
    return Array.from(map.entries());
  }, [cases]);

  // Filter cases
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesId = (c.trackingNumber || c.id).toLowerCase().includes(term);
        const matchesTitle = c.title.toLowerCase().includes(term);
        const matchesDesc = c.description.toLowerCase().includes(term);
        if (!matchesId && !matchesTitle && !matchesDesc) return false;
      }

      if (selectedPriority !== 'all' && c.priority !== selectedPriority) return false;
      if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
      if (selectedWard !== 'all' && String(c.location.wardId) !== selectedWard) return false;
      if (selectedDept !== 'all' && !c.tasks?.some(t => t.departmentId === selectedDept)) return false;

      if (selectedAge !== 'all') {
        const submitted = new Date(c.submittedAt).getTime();
        const now = Date.now();
        const diffHours = (now - submitted) / (1000 * 3600);
        if (selectedAge === '24h' && diffHours > 24) return false;
        if (selectedAge === '72h' && diffHours > 72) return false;
        if (selectedAge === '7d' && diffHours > 168) return false;
      }

      return true;
    });
  }, [cases, searchTerm, selectedPriority, selectedStatus, selectedWard, selectedDept, selectedAge]);

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--green-light)] px-3 py-0.5 rounded-full border border-[var(--line)]">
              কমান্ড ভিউ
            </span>
            <span className="text-xs text-[var(--muted)]">সার্বভৌম নগর এখতিয়ার ভিত্তিক কেস বোর্ড</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
            ইউনিফাইড কেস বোর্ড (Unified Case Board)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            চট্টগ্রাম সিটি কর্পোরেশনের আওতাধীন সকল সক্রিয় ও সমন্বিত কেস ফিল্টারিং এবং তাৎক্ষণিক মনিটরিং
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/coordinator/sequence-planner"
            className="px-4 py-2 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <GitMerge className="w-4 h-4" />
            <span>সিকোয়েন্স প্ল্যানার</span>
          </Link>
        </div>
      </div>

      {/* Multi-Filters Bar */}
      <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="কেস নম্বর বা বিবরণ দিয়ে অনুসন্ধান..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--bg)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--green)]"
            />
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="w-full px-2.5 py-2 bg-[var(--bg)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none"
            >
              <option value="all">সকল অগ্রাধিকার</option>
              <option value="critical">জরুরি (Emergency)</option>
              <option value="high">উচ্চ অগ্রাধিকার</option>
              <option value="medium">মাঝারি</option>
              <option value="low">সাধারণ</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-2 bg-[var(--bg)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none"
            >
              <option value="all">সকল স্ট্যাটাস</option>
              <option value="submitted">নতুন দাখিলকৃত</option>
              <option value="verified">যাচাইকৃত</option>
              <option value="in_progress">চলমান</option>
              <option value="resolved_pending_citizen">প্রমাণিত / মতামতের অপেক্ষায়</option>
              <option value="reopened">পুনরায় তদন্তাধীন</option>
              <option value="closed">সমাপ্ত (Closed)</option>
            </select>
          </div>

          {/* Ward Filter */}
          <div>
            <select
              value={selectedWard}
              onChange={e => setSelectedWard(e.target.value)}
              className="w-full px-2.5 py-2 bg-[var(--bg)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none"
            >
              <option value="all">সকল ওয়ার্ড</option>
              {wards.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full px-2.5 py-2 bg-[var(--bg)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none"
            >
              <option value="all">সকল বিভাগ</option>
              {departments.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--line)] text-xs text-[var(--muted)]">
          <span>মোট পাওয়া গেছে: <strong className="text-[var(--ink)]">{toBanglaNumber(filteredCases.length)}</strong> টি কেস</span>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedPriority('all');
              setSelectedStatus('all');
              setSelectedWard('all');
              setSelectedDept('all');
              setSelectedAge('all');
            }}
            className="hover:underline text-[var(--muted)] cursor-pointer"
          >
            ফিল্টার রিসেট
          </button>
        </div>
      </div>

      {/* Case Board Table */}
      <div className="rounded-xl bg-[var(--paper)] border border-[var(--line)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-semibold uppercase tracking-wider">
                <th className="py-3 px-3.5">কেস আইডি</th>
                <th className="py-3 px-3.5">সমস্যার সারসংক্ষেপ</th>
                <th className="py-3 px-3.5">ওয়ার্ড ও অবস্থান</th>
                <th className="py-3 px-3.5">অগ্রাধিকার</th>
                <th className="py-3 px-3.5">কাজের অগ্রগতি ও টাস্ক</th>
                <th className="py-3 px-3.5">বর্তমান অবস্থা</th>
                <th className="py-3 px-3.5">দাখিলের তারিখ</th>
                <th className="py-3 px-3.5 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filteredCases.length > 0 ? (
                filteredCases.map(item => (
                  <tr key={item.id} className="hover:bg-[var(--bg)] transition">
                    <td className="py-3 px-3.5 font-mono font-bold text-[var(--gold)] whitespace-nowrap">
                      {item.trackingNumber || item.id}
                    </td>
                    <td className="py-3 px-3.5 max-w-xs">
                      <div className="font-semibold text-[var(--ink)] truncate">{item.title}</div>
                      <div className="text-[11px] text-[var(--muted)] truncate">{item.description}</div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-medium text-[var(--ink)]">{item.location.wardName}</div>
                      <div className="text-[10px] text-[var(--muted)]">{item.location.address || 'চিহ্নিত এলাকা'}</div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.tasks && item.tasks.length > 0 ? (
                          item.tasks.map((t, idx) => (
                            <span
                              key={t.id}
                              className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                                t.status === 'resolved'
                                  ? 'bg-[var(--green-light)] text-[var(--green)] border-[var(--line)]'
                                  : t.status === 'in_progress'
                                  ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 border-amber-200'
                                  : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--line)]'
                              }`}
                            >
                              {toBanglaNumber(idx + 1)}. {t.departmentName.split(' ')[0]}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-amber-600 font-medium">প্ল্যান অপেক্ষমাণ</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-3.5 text-[var(--muted)] whitespace-nowrap">
                      {formatBanglaDate(item.submittedAt)}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <Link
                        to={`/coordinator/cases/${item.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[var(--paper)] hover:bg-[var(--green-light)] text-[var(--ink)] hover:text-[var(--green)] border border-[var(--line)] text-xs font-bold transition inline-flex items-center gap-1"
                      >
                        <span>সমন্বয় ভিউ</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--muted)] text-xs">
                    কোনো কেস পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
