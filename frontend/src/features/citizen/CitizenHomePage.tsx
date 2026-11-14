import React from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import {
  PlusCircle,
  FileText,
  MapPin,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';

export const CitizenHomePage: React.FC = () => {
  const { cases } = useCases();
  const { currentUser } = useAuth();

  const citizenCases = cases.filter(
    c => c.citizenId === currentUser.id || c.id === 'NS-2026-000184' || c.id === 'NS-2026-000170' || c.id === 'NS-2026-W03-1001'
  );

  const activeCasesCount = citizenCases.filter(c => c.status !== 'closed').length;
  const resolvedCasesCount = citizenCases.filter(c => c.status === 'resolved_pending_citizen' || c.status === 'closed').length;

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-in fade-in duration-150">
      {/* Calm Editorial Hero Section */}
      <section className="civic-card p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)] text-xs font-mono tracking-wider font-semibold">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>নাগরিক পোর্টাল · CITIZEN WORKSPACE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] leading-tight tracking-tight">
            আপনার এলাকার যে কোনো নাগরিক সমস্যা সরাসরি জানান
          </h1>

          <p className="text-xs sm:text-sm text-[var(--muted)] font-normal leading-relaxed">
            ছবি, অডিও রেকর্ড বা সাধারণ বাংলায় বিবরণ দিন। এআই বিশ্লেষণ শেষে সঠিক বিভাগ ও কর্মকর্তাদের কাছে পৌঁছে যাবে এবং প্রতিটি ধাপ আপনি যাচাই করতে পারবেন।
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <Link
              to="/report"
              className="civic-btn-primary text-xs py-2 px-4 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" aria-hidden="true" />
              <span>নতুন সমস্যা জানান</span>
            </Link>

            <Link
              to="/services"
              className="civic-btn-secondary text-xs py-2 px-4 shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-[var(--muted)]" aria-hidden="true" />
              <span>সেবা নির্দেশিকা</span>
            </Link>

            <Link
              to="/map"
              className="civic-btn-secondary text-xs py-2 px-4 shadow-xs"
            >
              <MapPin className="w-4 h-4 text-[var(--muted)]" aria-hidden="true" />
              <span>লাইভ ম্যাপ</span>
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Stats Counter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="civic-card p-4 sm:p-5 shadow-xs">
          <span className="text-xs text-[var(--muted)] font-medium block mb-1">মোট দাখিলকৃত</span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[var(--ink)]">{toBanglaNumber(citizenCases.length)}</div>
        </div>
        <div className="civic-card p-4 sm:p-5 shadow-xs">
          <span className="text-xs text-[var(--muted)] font-medium block mb-1">চলমান অগ্রগতি</span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[var(--status-high)]">{toBanglaNumber(activeCasesCount)}</div>
        </div>
        <div className="civic-card p-4 sm:p-5 shadow-xs">
          <span className="text-xs text-[var(--muted)] font-medium block mb-1">সমাধান সম্পন্ন</span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[var(--status-low)]">{toBanglaNumber(resolvedCasesCount)}</div>
        </div>
        <div className="civic-card p-4 sm:p-5 shadow-xs">
          <span className="text-xs text-[var(--muted)] font-medium block mb-1">যাচাইয়ের অধিকার</span>
          <div className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5 mt-1.5">
            <CheckCircle2 className="w-4 h-4 text-[var(--status-low)]" aria-hidden="true" />
            <span>আপত্তি সক্ষম</span>
          </div>
        </div>
      </div>

      {/* Governance Principle Banner */}
      <section className="civic-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[var(--muted)] shadow-xs">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[var(--status-low)] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="text-[var(--ink)] font-semibold text-xs">“AI proposes, people decide” নীতিতে পরিচালিত</strong>
            <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
              এআই কেবল সুপারিশ ও তথ্য সাজিয়ে দেয়, সমাধান ও দায়িত্ব প্রদানের প্রতিটি সিদ্ধান্ত দায়িত্বপ্রাপ্ত কর্মকর্তা যাচাই করেন।
            </p>
          </div>
        </div>
        <Link
          to="/transparency"
          className="text-xs font-semibold text-[var(--ink)] hover:underline flex items-center gap-1 shrink-0 whitespace-nowrap"
        >
          <span>পাবলিক স্বচ্ছতা রিপোর্ট</span>
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </section>

      {/* Active Cases Summary Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5 px-0.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--ink)]">
              আমার অভিযোগ ও অগ্রগতি
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">আপনার দাখিলকৃত সাম্প্রতিক সমস্যাসমূহের রিয়েল-টাইম অবস্থা</p>
          </div>
          <Link
            to="/cases"
            className="text-xs font-semibold text-[var(--ink)] hover:underline flex items-center gap-1"
          >
            <span>সবগুলো দেখুন ({toBanglaNumber(citizenCases.length)})</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {citizenCases.length === 0 ? (
          <div className="civic-card p-8 text-center text-[var(--muted)] space-y-2.5">
            <FileText className="w-8 h-8 mx-auto text-[var(--muted)] opacity-60" aria-hidden="true" />
            <p className="text-xs font-semibold text-[var(--ink)]">আপনি এখনও কোনো সমস্যা দাখিল করেননি</p>
            <Link
              to="/report"
              className="mt-2 inline-flex items-center gap-1.5 civic-btn-primary text-xs py-1.5 px-3"
            >
              <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>প্রথম সমস্যা রিপোর্ট করুন</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {citizenCases.slice(0, 4).map(c => (
              <Link
                key={c.id}
                to={`/cases/${c.id}`}
                className="civic-card p-4 sm:p-5 hover:border-[var(--ink)] transition flex flex-col justify-between gap-3 block group shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--ink)] bg-[var(--paper-elevated)] px-2 py-0.5 rounded border border-[var(--line)]">
                      #{c.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--ink)] group-hover:underline transition">
                    {c.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
                    <span className="flex items-center gap-1 text-[var(--ink)]">
                      <MapPin className="w-3.5 h-3.5 text-[var(--muted)]" aria-hidden="true" />
                      <span>{c.location.wardName || c.location.address}</span>
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">দাখিল: {formatBanglaDate(c.submittedAt)}</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[var(--line-subtle)] flex items-center justify-between text-xs font-semibold text-[var(--ink)]">
                  <span>টাইমলাইন ও প্রমাণ দেখুন</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
