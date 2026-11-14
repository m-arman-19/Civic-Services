import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { formatBanglaDate, toBanglaNumber } from '../../utils/formatters';
import {
  Layers,
  Search,
  Filter,
  ArrowRight,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  Route,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { PriorityLevel, CaseStatus, ProblemCategory } from '../../types';

export const WardWorkQueuePage: React.FC = () => {
  const { cases } = useCases();
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPriority = searchParams.get('priority') || 'all';
  const initialStatus = searchParams.get('status') || 'all';
  const initialCategory = searchParams.get('category') || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>(initialPriority);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  // Scoped to ward
  const wardCases = useMemo(() => {
    return cases.filter(c => !currentUser.wardId || c.location.wardId === currentUser.wardId);
  }, [cases, currentUser.wardId]);

  const filteredCases = useMemo(() => {
    return wardCases.filter(c => {
      const matchSearch =
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.location.landmark && c.location.landmark.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchPriority = selectedPriority === 'all' || c.priority === selectedPriority;
      const matchStatus = selectedStatus === 'all' || c.status === selectedStatus;
      const matchCategory = selectedCategory === 'all' || c.category === selectedCategory;

      return matchSearch && matchPriority && matchStatus && matchCategory;
    });
  }, [wardCases, searchTerm, selectedPriority, selectedStatus, selectedCategory]);

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] bg-[var(--paper-elevated)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              {currentUser.wardName || 'ওয়ার্ড ১২'}
            </span>
            <span className="text-xs text-[var(--muted)]">সার্বিক ওয়ার্ক কিউ ও কেস ট্র্যাকার</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] tracking-tight">
            ওয়ার্ড সার্বিক কর্মপরিকল্পনা তালিকা (Ward Work Queue)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            ওয়ার্ডের আওতাধীন সকল সক্রিয় ও সমাপ্ত নাগরিক সেবা কাজের কেন্দ্রীয় তালিকা
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono px-3.5 py-1.5 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] shadow-xs">
            মোট প্রদর্শিত: <strong className="text-[var(--green)] font-bold">{toBanglaNumber(filteredCases.length)}</strong> / {toBanglaNumber(wardCases.length)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="civic-card rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-center gap-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="কেস আইডি, সমস্যার শিরোনাম, সড়ক বা এলাকা দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2.5 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-xl border border-[var(--line)] focus:outline-hidden focus:border-[var(--green)]"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 w-full lg:w-auto">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-xl border border-[var(--line)] font-medium focus:outline-hidden focus:border-[var(--green)] cursor-pointer"
          >
            <option value="all">সকল অগ্রাধিকার</option>
            <option value="emergency">জরুরি (Emergency)</option>
            <option value="high">উচ্চ (High)</option>
            <option value="medium">মাঝারি (Medium)</option>
            <option value="low">সাধারণ (Low)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-xl border border-[var(--line)] font-medium focus:outline-hidden focus:border-[var(--green)] cursor-pointer"
          >
            <option value="all">সকল অবস্থা</option>
            <option value="submitted">যাচাইয়ের অপেক্ষায়</option>
            <option value="verified">যাচাইকৃত</option>
            <option value="in_progress">কাজ চলমান</option>
            <option value="under_inspection">পরিদর্শন চলছে</option>
            <option value="resolved_pending_citizen">সমাধান (প্রমাণ আপলোড)</option>
            <option value="reopened">আপত্তিকৃত (Reopened)</option>
            <option value="closed">বন্ধ (Closed)</option>
            <option value="merged">ডুপ্লিকেট মার্জকৃত</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-xl border border-[var(--line)] font-medium focus:outline-hidden focus:border-[var(--green)] cursor-pointer"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            <option value="drainage">ড্রেনেজ ও নর্দমা</option>
            <option value="waste">বর্জ্য ব্যবস্থাপনা</option>
            <option value="road_engineering">সড়ক ও অবকাঠামো</option>
            <option value="lighting">সড়ক বাতি</option>
            <option value="water_supply">পানি সরবরাহ</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="civic-card rounded-2xl overflow-hidden shadow-xs border border-[var(--line)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">কেস আইডি</th>
                <th className="py-3.5 px-4">সমস্যার সারসংক্ষেপ</th>
                <th className="py-3.5 px-4">অবস্থান ও ল্যান্ডমার্ক</th>
                <th className="py-3.5 px-4">দায়িত্বপ্রাপ্ত বিভাগ</th>
                <th className="py-3.5 px-4">অগ্রাধিকার</th>
                <th className="py-3.5 px-4">বর্তমান অবস্থা</th>
                <th className="py-3.5 px-4">দাখিলের তারিখ</th>
                <th className="py-3.5 px-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--muted)]">
                    কোনো কেস পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় দেখুন।
                  </td>
                </tr>
              ) : (
                filteredCases.map(item => (
                  <tr key={item.id} className="hover:bg-[var(--bg)] transition group cursor-pointer">
                    <td className="py-4 px-4 font-mono font-bold text-[var(--ink)]">
                      #{item.id}
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-semibold text-[var(--ink)] leading-snug">{item.title}</div>
                      <div className="text-[11px] text-[var(--muted)] truncate mt-0.5">{item.description}</div>
                    </td>
                    <td className="py-4 px-4 text-[var(--muted)]">
                      <div className="font-medium text-[var(--ink)]">{item.location.address}</div>
                      {item.location.landmark && (
                        <div className="text-[10px] text-[var(--muted)]">{item.location.landmark}</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[var(--green)]">
                        {item.humanVerification?.confirmedDepartmentName || item.aiAnalysis.proposedDepartmentName}
                      </div>
                      {item.aiAnalysis.assetName && (
                        <div className="text-[10px] text-[var(--muted)] font-mono truncate max-w-[160px]">
                          {item.aiAnalysis.assetName}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-4 px-4 font-mono text-[var(--muted)]">
                      {formatBanglaDate(item.submittedAt)}
                    </td>
                    <td className="py-4 px-4 text-right space-x-1.5">
                      <Link
                        to={`/ward/cases/${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--paper-elevated)] hover:bg-[var(--line)]/20 border border-[var(--line)] text-xs font-semibold text-[var(--ink)] transition cursor-pointer"
                      >
                        <span>বিস্তারিত</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
