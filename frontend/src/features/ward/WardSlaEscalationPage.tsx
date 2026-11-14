import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  Clock,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldAlert,
  PauseCircle,
  PlayCircle,
  Send,
  Layers,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const WardSlaEscalationPage: React.FC = () => {
  const { cases } = useCases();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'breached' | 'paused'>('all');

  // Scoped to ward
  const wardCases = cases.filter(c => !currentUser.wardId || c.location.wardId === currentUser.wardId);

  // Active cases with SLA tracking
  const activeSlaCases = wardCases.filter(c => c.status !== 'closed' && c.status !== 'merged');

  // Paused cases (waiting on prerequisite)
  const pausedCases = activeSlaCases.filter(c =>
    c.tasks.some(t => t.status === 'pending_dependency' || (t as any).waitingReason)
  );

  // Breached or near breach
  const breachedCases = activeSlaCases.filter(c => c.priority === 'emergency' || c.priority === 'high');

  const displayList = activeTab === 'breached'
    ? breachedCases
    : activeTab === 'paused'
    ? pausedCases
    : activeSlaCases;

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] bg-[var(--paper-elevated)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              {currentUser.wardName || 'ওয়ার্ড ১২'}
            </span>
            <span className="text-xs text-[var(--muted)]">এসএলএ ল্যাডার ও এস্কেপলেশন কমান্ড</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] tracking-tight">
            এসএলএ ও এস্কেলেশন মনিটর (SLA & Escalation Tracker)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-2xl">
            সিটি কর্পোরেশন নির্ধারিত রেসপন্স/রেজোলিউশন সময়সীমা, বিরতির কারণ ও এস্কেপলেশন ইতিহাস
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3.5 py-1.5 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)]">
            সক্রিয় টাইমার: <strong className="text-[var(--green)]">{toBanglaNumber(activeSlaCases.length)}টি কেস</strong>
          </span>
        </div>
      </div>

      {/* SLA Policy Grid (City Corporation Standard Table 12 & 13) */}
      <div className="civic-card rounded-2xl p-6 border border-[var(--line)] bg-[var(--paper-elevated)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--green)]" />
            <span>সিটি কর্পোরেশন অনুমোদিত এসএলএ পলিসি (Approved SLA Ladders)</span>
          </h3>
          <span className="text-[10px] font-mono text-[var(--muted)]">R&D v1.2 / CCC Rule 2026</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-rose-700 font-bold">জরুরি (Emergency)</strong>
              <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold">LADDER S</span>
            </div>
            <div className="text-rose-900 font-mono">রেসপন্স: ২ ঘণ্টা | সমাধান: ৬ ঘণ্টা</div>
            <p className="text-[11px] text-rose-700">এসকেপলেশন: ৪ ঘণ্টা পর সমন্বয়কারী, ৮ ঘণ্টা পর বিভাগীয় প্রধান</p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-amber-800 font-bold">উচ্চ (High)</strong>
              <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-mono text-[10px] font-bold">LADDER A</span>
            </div>
            <div className="text-amber-900 font-mono">রেসপন্স: ১২ ঘণ্টা | সমাধান: ২৪ ঘণ্টা</div>
            <p className="text-[11px] text-amber-700">এসকেপলেশন: ১৮ ঘণ্টা পর রিমাইন্ডার, ৩৬ ঘণ্টা পর সমন্বয়কারী</p>
          </div>

          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-indigo-800 font-bold">মাঝারি (Medium)</strong>
              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-[10px] font-bold">LADDER B</span>
            </div>
            <div className="text-indigo-900 font-mono">রেসপন্স: ৪৮ ঘণ্টা | সমাধান: ৭২ ঘণ্টা</div>
            <p className="text-[11px] text-indigo-700">এসকেপলেশন: ৬০ ঘণ্টা পর সমন্বয়কারী এলার্ট</p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--paper)] space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-[var(--ink)] font-bold">সাধারণ (Low)</strong>
              <span className="px-2 py-0.5 rounded bg-[var(--bg)] text-[var(--muted)] font-mono text-[10px] font-bold border border-[var(--line)]">LADDER C</span>
            </div>
            <div className="text-[var(--ink)] font-mono">রেসপন্স: ১২০ ঘণ্টা | সমাধান: ১৬৮ ঘণ্টা</div>
            <p className="text-[11px] text-[var(--muted)]">পরিকল্পিত শিডিউল অনুযায়ী রক্ষণাবেক্ষণ</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[var(--ink)] text-[var(--paper)]'
              : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>সকল সক্রিয় কেস ({toBanglaNumber(activeSlaCases.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('breached')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'breached'
              ? 'bg-rose-700 text-white'
              : 'bg-[var(--paper)] text-rose-600 hover:bg-rose-50 border border-[var(--line)]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>জরুরি / ঝুঁকিপূর্ণ ({toBanglaNumber(breachedCases.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('paused')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'paused'
              ? 'bg-amber-600 text-white'
              : 'bg-[var(--paper)] text-amber-600 hover:bg-amber-50 border border-[var(--line)]'
          }`}
        >
          <PauseCircle className="w-4 h-4" />
          <span>আইনানুগ বিরতিপ্রাপ্ত (Paused on Prerequisite) ({toBanglaNumber(pausedCases.length)})</span>
        </button>
      </div>

      {/* Active SLA Cases Table */}
      <div className="civic-card rounded-2xl overflow-hidden shadow-xs border border-[var(--line)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-semibold uppercase tracking-wider">
                <th className="p-3.5">কেস আইডি</th>
                <th className="p-3.5">সমস্যার বিবরণ</th>
                <th className="p-3.5">দায়িত্বপ্রাপ্ত বিভাগ</th>
                <th className="p-3.5">অগ্রাধিকার</th>
                <th className="p-3.5">টাইমার অবস্থা</th>
                <th className="p-3.5">এসএলএ ল্যাডার পর্যায়</th>
                <th className="p-3.5 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {displayList.map(item => {
                const isPaused = item.tasks.some(t => t.status === 'pending_dependency' || (t as any).waitingReason);
                const isEmergency = item.priority === 'emergency';
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
                      <strong className="text-[var(--green)] font-bold">
                        {item.humanVerification?.confirmedDepartmentName || item.aiAnalysis.proposedDepartmentName}
                      </strong>
                    </td>

                    <td className="p-3.5">
                      <PriorityBadge priority={item.priority} />
                    </td>

                    <td className="p-3.5">
                      {isPaused ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            <PauseCircle className="w-3.5 h-3.5" />
                            <span>টাইমার বিরতিপ্রাপ্ত (Paused)</span>
                          </span>
                          <span className="text-[10px] text-[var(--muted)] block">
                            কারণ: পূর্ববর্তী কাজের অপেক্ষমাণ
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[var(--green-light)] text-[var(--green)]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>টাইমার চলমান (Active)</span>
                          </span>
                          <span className="text-[10px] font-mono text-[var(--muted)] block">
                            দাখিল: {formatBanglaDate(item.submittedAt)}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5">
                      {isEmergency ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 font-mono">
                          EMERGENCY ALERT
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--bg)] text-[var(--muted)] border border-[var(--line)]">
                          স্বাভাবিক পর্যায় (Normal)
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      <Link
                        to={`/ward/cases/${item.id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--green)] text-xs font-bold text-[var(--ink)] transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>কেস মনিটর</span>
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
    </div>
  );
};
