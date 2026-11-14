import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { getStoredHotspots } from '../../services/storage';
import { HotspotZone, Case } from '../../types';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  MapPin,
  Filter,
  Layers,
  ShieldAlert,
  Flame,
  ArrowRight,
  ExternalLink,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';

export const CoordinatorMapPage: React.FC = () => {
  const { cases } = useCases();
  const [hotspots, setHotspots] = useState<HotspotZone[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Filters
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setHotspots(getStoredHotspots());
  }, []);

  const filteredCases = cases.filter(c => {
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
    if (deptFilter !== 'all') {
      const caseDept = (c as any).department || c.tasks?.[0]?.departmentId || c.aiAnalysis?.proposedDepartmentId;
      const matchesTask = c.tasks?.some(t => t.departmentId === deptFilter || (t as any).department === deptFilter);
      if (caseDept !== deptFilter && !matchesTask) return false;
    }
    if (wardFilter !== 'all' && (c.location.wardName || String(c.location.wardId)) !== wardFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in text-[var(--ink)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
              M6 জিওস্পেশিয়াল নগর কমান্ড
            </span>
            <span className="text-xs text-[var(--muted)]">নগরব্যাপী ঘটনা ও সম্পদ অবস্থান পর্যবেক্ষণ</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            নগর ঘটনা মানচিত্র ও সম্পদ পর্যবেক্ষণ (City Incident Map)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            এখতিয়ারভুক্ত সকল ওয়ার্ডের সক্রিয় সমস্যা, মাল্টি-ডিপার্টমেন্ট সমন্বয় এবং পুনরাবৃত্ত হটস্পট ক্লাস্টার
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/coordinator"
            className="px-3.5 py-1.5 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] text-xs text-[var(--ink)] hover:bg-[var(--line)]/20 transition"
          >
            ← ড্যাশবোর্ডে ফিরুন
          </Link>
        </div>
      </div>

      {/* R&D Security and PII Masking Note */}
      <div className="civic-card rounded-xl p-3 bg-[var(--paper-elevated)] border border-[var(--line)] text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#166534]" />
          <span className="text-[var(--muted)]">
            নিরাপত্তা নির্দেশিকা: মানচিত্রে নাগরিকের ব্যক্তিগত পরিচয় (PII) এবং মোবাইল নম্বর গোপন রাখা হয়েছে।
          </span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)]">
          ফিল্টারকৃত ঘটনা: <strong>{toBanglaNumber(filteredCases.length)}টি</strong>
        </span>
      </div>

      {/* Filter Bar */}
      <div className="civic-card rounded-xl p-4 bg-[var(--paper)] border border-[var(--line)] flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-[var(--muted)] font-semibold">
          <Filter className="w-3.5 h-3.5 text-[#166534]" />
          ফিল্টারসমূহ:
        </div>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
        >
          <option value="all">সকল অগ্রাধিকার</option>
          <option value="critical">জরুরি (Emergency)</option>
          <option value="high">উচ্চ (High)</option>
          <option value="medium">মাঝারি (Medium)</option>
          <option value="low">সাধারণ (Low)</option>
        </select>

        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
        >
          <option value="all">সকল বিভাগ</option>
          <option value="waste_management">বর্জ্য ব্যবস্থাপনা</option>
          <option value="engineering">প্রকৌশল ও সড়ক</option>
          <option value="electrical">বিদ্যুৎ ও সড়কবাতি</option>
          <option value="health">স্বাস্থ্য ও মশক নিধন</option>
        </select>

        <select
          value={wardFilter}
          onChange={e => setWardFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
        >
          <option value="all">সকল ওয়ার্ড</option>
          <option value="ওয়ার্ড ১২">ওয়ার্ড ১২ (মিরপুর)</option>
          <option value="ওয়ার্ড ১">ওয়ার্ড ১ (উত্তরা)</option>
          <option value="ওয়ার্ড ১৯">ওয়ার্ড ১৯ (গুলশান/বনানী)</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
        >
          <option value="all">সকল অবস্থা</option>
          <option value="submitted">নতুন দাখিল</option>
          <option value="in_progress">চলমান</option>
          <option value="resolved_proof_uploaded">প্রমাণক প্রাপ্ত</option>
          <option value="closed">সমাপ্ত</option>
        </select>

        {(priorityFilter !== 'all' || deptFilter !== 'all' || wardFilter !== 'all' || statusFilter !== 'all') && (
          <button
            onClick={() => {
              setPriorityFilter('all');
              setDeptFilter('all');
              setWardFilter('all');
              setStatusFilter('all');
            }}
            className="text-[11px] text-[var(--muted)] hover:text-rose-600 underline ml-auto"
          >
            ফিল্টার রিসেট
          </button>
        )}
      </div>

      {/* Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl overflow-hidden border border-[var(--line)] shadow-lg bg-[var(--paper)]">
          <InteractiveMap
            cases={filteredCases}
            hotspots={hotspots}
            height="560px"
            selectedCaseId={selectedCaseId || undefined}
            onSelectCase={id => setSelectedCaseId(id)}
            showHotspotsToggle={true}
          />
        </div>

        {/* Side Panel: Selected Case or Instructions */}
        <div className="space-y-4">
          {selectedCase ? (
            <div className="civic-card rounded-xl p-5 border border-[#166534]/30 bg-[var(--paper)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                <span className="text-xs font-mono font-bold text-[#166534]">
                  {selectedCase.trackingNumber}
                </span>
                <button
                  onClick={() => setSelectedCaseId(null)}
                  className="text-xs text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  ✕ বন্ধ
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <PriorityBadge priority={selectedCase.priority} />
                  <StatusBadge status={selectedCase.status} />
                </div>
                <h3 className="font-bold text-sm text-[var(--ink)]">{selectedCase.title}</h3>
                <p className="text-xs text-[var(--muted)] mt-1">{selectedCase.description}</p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-[var(--ink)] font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#166534]" />
                  অবস্থান ও এখতিয়ার:
                </div>
                <div className="text-[11px] text-[var(--muted)] pl-5">
                  {selectedCase.location.address || 'চিহ্নিত ভৌগোলিক স্থান'}<br />
                  ওয়ার্ড: {selectedCase.location.wardName || selectedCase.location.wardId} | জোন: মিরপুর-২
                </div>
                <div className="text-[10px] text-[var(--muted)] pl-5 pt-1 border-t border-[var(--line)]">
                  স্থানাঙ্ক: {selectedCase.location.lat ? selectedCase.location.lat.toFixed(4) : '23.8500'}, {selectedCase.location.lng ? selectedCase.location.lng.toFixed(4) : '90.3900'}
                </div>
              </div>

              {/* Department & Tasks */}
              <div className="space-y-1 text-xs">
                <div className="text-[var(--muted)] font-semibold">সংশ্লিষ্ট বিভাগ ও অগ্রগতি:</div>
                <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-1 text-[11px]">
                  <div>প্রধান বিভাগ: <strong className="text-[var(--ink)]">{(selectedCase as any).department || selectedCase.tasks?.[0]?.departmentName || selectedCase.aiAnalysis?.proposedDepartmentName || 'বর্জ্য ব্যবস্থাপনা'}</strong></div>
                  <div>মোট টাস্ক: {toBanglaNumber(selectedCase.tasks?.length || 1)}টি</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to={`/coordinator/cases/${selectedCase.id}`}
                  className="w-full py-2 rounded-lg bg-[#166534] text-white hover:bg-[#14532d] text-xs font-bold text-center transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  সম্পূর্ণ কেস বিবরণী ও অডিট
                </Link>
                <Link
                  to={`/coordinator/sequence-planner?caseId=${selectedCase.id}`}
                  className="w-full py-2 rounded-lg border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--bg)] text-xs font-semibold text-center transition"
                >
                  টাস্ক সিকোয়েন্স প্ল্যানার
                </Link>
              </div>
            </div>
          ) : (
            <div className="civic-card rounded-xl p-6 border border-[var(--line)] bg-[var(--paper)] text-center space-y-3">
              <MapPin className="w-8 h-8 text-[var(--muted)] mx-auto opacity-60" />
              <div className="font-bold text-sm text-[var(--ink)]">ঘটনার বিস্তারিত দেখতে মানচিত্রে পিন নির্বাচন করুন</div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                মানচিত্রের যেকোনো মার্কার বা হটস্পট পলিগনে ক্লিক করলে সংশ্লিষ্ট ঘটনার অনুমোদিত সারসংক্ষেপ ও বিভাগীয় অগ্রগতি প্রদর্শিত হবে।
              </p>
            </div>
          )}

          {/* Quick Stats Widget */}
          <div className="civic-card rounded-xl p-4 border border-[var(--line)] bg-[var(--paper)] space-y-2 text-xs">
            <div className="font-bold text-[var(--ink)] flex items-center gap-1.5 pb-2 border-b border-[var(--line)]">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              নগর হটস্পট সংক্ষিপ্ত তথ্য
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
              <span>মোট চিহ্নিত অঞ্চল:</span>
              <strong className="text-[var(--ink)]">{toBanglaNumber(hotspots.length)}টি</strong>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
              <span>সর্বাধিক সমস্যা অঞ্চল:</span>
              <strong className="text-amber-700">মিরপুর সেকশন ১১ ড্রেনেজ</strong>
            </div>
            <Link
              to="/coordinator/hotspots"
              className="text-[11px] text-[#166534] hover:underline block pt-1 font-semibold"
            >
              হটস্পট বিস্তারিত অ্যানালিটিক্স দেখুন →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
