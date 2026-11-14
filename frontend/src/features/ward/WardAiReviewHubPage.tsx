import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge } from '../../components/common/Badge';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Cpu,
  Layers,
  FileText
} from 'lucide-react';

export const WardAiReviewHubPage: React.FC = () => {
  const { cases } = useCases();
  const { currentUser } = useAuth();

  const [gateFilter, setGateFilter] = useState<'all' | 'above_gate' | 'below_gate'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const wardCases = cases.filter(c => !currentUser.wardId || c.location.wardId === currentUser.wardId);

  const aboveGateCases = wardCases.filter(c => c.aiAnalysis.confidenceScore >= 80);
  const belowGateCases = wardCases.filter(c => c.aiAnalysis.confidenceScore < 80);

  const filteredCases = wardCases.filter(c => {
    const matchSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.aiAnalysis.proposedDepartmentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchGate =
      gateFilter === 'all'
        ? true
        : gateFilter === 'above_gate'
        ? c.aiAnalysis.confidenceScore >= 80
        : c.aiAnalysis.confidenceScore < 80;

    return matchSearch && matchGate;
  });

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--paper-elevated)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              M4 এআই ডায়াগনস্টিক হাব
            </span>
            <span className="text-xs text-[var(--muted)]">৮০% গেটিং পলিসি ও স্বব্যাখ্যাত সিদ্ধান্ত</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] tracking-tight">
            এআই দায়িত্ব প্রস্তাবনা পর্যালোচনা (AI Recommendation Review)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-2xl">
            এআই বিশ্লেষণ কোনো চূড়ান্ত সিদ্ধান্ত নয়; ৮৩% নিয়মতান্ত্রিক দায় বণ্টন ও মানব যাচাইকরণ নীতি অনুসরণ করুন
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-xs flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[var(--green)]" />
            <span className="text-[var(--muted)]">গেট থ্রেশহোল্ড:</span>
            <strong className="font-mono text-[var(--ink)]">৮০%</strong>
          </div>
        </div>
      </div>

      {/* Explanatory Policy Banner */}
      <div className="civic-card rounded-2xl p-5 border border-[var(--line)] bg-[var(--paper-elevated)] space-y-3">
        <div className="flex items-start gap-3">
          <span className="p-2 rounded-xl bg-[var(--green-light)] text-[var(--green)] shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              এআই সেফটি ও মানব নিয়ন্ত্রণ নীতি (Human-in-the-Loop AI Gate)
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
              কনফিডেন্স স্কোর ৮০% এর বেশি হলে এবং কোনো ক্রিটিক্যাল সেফটি ফ্ল্যাগ না থাকলে সিস্টেম প্রস্তাবিত বিভাগ ও কাজের তালিকা সুপারিশ হিসেবে প্রি-ফিল করে। ৮০% এর কম স্কোর হলে কেসটি বাধ্যতামূলকভাবে ম্যানুয়াল ভেরিফিকেশন কিউতে প্রেরিত হয়। কোনো অবস্থাতেই এআই নিজে ওয়ার্ক-অর্ডার জারি বা কেস সমাপ্ত করতে পারে না।
            </p>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setGateFilter('all')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            gateFilter === 'all'
              ? 'bg-[var(--paper)] border-[var(--green)] shadow-xs'
              : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]/60'
          }`}
        >
          <span className="text-xs font-semibold text-[var(--muted)] block">মোট এআই পর্যালোচিত কেস</span>
          <div className="text-2xl font-extrabold font-mono text-[var(--ink)] mt-1">
            {toBanglaNumber(wardCases.length)}
          </div>
          <span className="text-[11px] text-[var(--muted)] mt-0.5 block">প্রাকৃতিক ভাষা ও ইমেজ প্রসেসড</span>
        </div>

        <div
          onClick={() => setGateFilter('above_gate')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            gateFilter === 'above_gate'
              ? 'bg-[var(--paper)] border-[var(--green)] shadow-xs'
              : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--green)]'
          }`}
        >
          <span className="text-xs font-semibold text-[var(--green)] block">গেট উত্তীর্ণ (≥৮০% কনফিডেন্স)</span>
          <div className="text-2xl font-extrabold font-mono text-[var(--green)] mt-1">
            {toBanglaNumber(aboveGateCases.length)}
          </div>
          <span className="text-[11px] text-[var(--green)] mt-0.5 block">প্রস্তাব অনুমোদনের জন্য প্রস্তুত</span>
        </div>

        <div
          onClick={() => setGateFilter('below_gate')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            gateFilter === 'below_gate'
              ? 'bg-[var(--paper)] border-amber-500 shadow-xs'
              : 'bg-[var(--paper)] border-[var(--line)] hover:border-amber-500'
          }`}
        >
          <span className="text-xs font-semibold text-amber-600 block">গেটিং নিচে (&lt;৮০% কনফিডেন্স)</span>
          <div className="text-2xl font-extrabold font-mono text-amber-600 mt-1">
            {toBanglaNumber(belowGateCases.length)}
          </div>
          <span className="text-[11px] text-amber-600 mt-0.5 block">বাধ্যতামূলক ম্যানুয়াল নির্ধারণ</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="civic-card rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="কেস আইডি, সমস্যা বা বিভাগ দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-xl border border-[var(--line)] focus:outline-hidden focus:border-[var(--green)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setGateFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              gateFilter === 'all' ? 'bg-[var(--ink)] text-white' : 'bg-[var(--bg)] text-[var(--muted)]'
            }`}
          >
            সকল
          </button>
          <button
            onClick={() => setGateFilter('above_gate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              gateFilter === 'above_gate' ? 'bg-[var(--green)] text-white' : 'bg-[var(--bg)] text-[var(--muted)]'
            }`}
          >
            ≥৮০%
          </button>
          <button
            onClick={() => setGateFilter('below_gate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              gateFilter === 'below_gate' ? 'bg-amber-600 text-white' : 'bg-[var(--bg)] text-[var(--muted)]'
            }`}
          >
            &lt;৮০%
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCases.map(item => {
          const isPassed = item.aiAnalysis.confidenceScore >= 80;
          return (
            <div
              key={item.id}
              className="civic-card rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[var(--green)] transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                  <span className="font-mono text-xs font-bold text-[var(--ink)]">#{item.id}</span>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                    isPassed ? 'bg-[var(--green-light)] text-[var(--green)]' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {toBanglaNumber(item.aiAnalysis.confidenceScore)}% {isPassed ? 'Gate Passed' : 'Manual Triage'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[var(--ink)] leading-snug">{item.title}</h4>
                  <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--line)] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[var(--muted)]">প্রস্তাবিত বিভাগ:</span>
                    <strong className="text-[var(--green)] font-bold">{item.aiAnalysis.proposedDepartmentName}</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-[var(--line)]">
                    <span className="text-[11px] text-[var(--muted)]">প্রস্তাবিত অগ্রাধিকার:</span>
                    <PriorityBadge priority={item.aiAnalysis.proposedPriority} />
                  </div>
                  <div className="text-[11px] text-[var(--muted)] pt-1 border-t border-[var(--line)]">
                    রেসপন্সিবিলিটি রুল: <span className="font-mono font-medium text-[var(--ink)]">{item.aiAnalysis.ruleReference}</span>
                  </div>
                </div>

                {/* Signals */}
                {item.aiAnalysis.signals && item.aiAnalysis.signals.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-[var(--muted)] block mb-1">শনাক্তকরণ সিগন্যাল:</span>
                    <ul className="text-[11px] text-[var(--muted)] space-y-1 list-disc pl-3">
                      {item.aiAnalysis.signals.slice(0, 2).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--muted)] font-mono">
                  {formatBanglaDate(item.submittedAt)}
                </span>
                <Link
                  to={`/ward/cases/${item.id}`}
                  className="px-3.5 py-1.5 rounded-lg bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>সিদ্ধান্ত পর্যালোচনা</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
