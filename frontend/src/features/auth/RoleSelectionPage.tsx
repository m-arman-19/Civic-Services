import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Building2, ClipboardList, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { DEMO_ROLES } from '../../constants';

const icons = [UserRound, ClipboardList, BriefcaseBusiness, UsersRound, ShieldCheck, Building2];
const paths: Record<string, string> = {
  citizen: '/login/citizen',
  ward_desk: '/login/ward',
  field_officer: '/login/officer',
  coordinator: '/login/coordinator',
  admin: '/login/admin',
  governance_head: '/login/governance'
};
const copy: Record<string, { title: string; description: string; badge: string }> = {
  citizen: { title: 'নাগরিক (Citizen)', description: 'সমস্যা দাখিল, টাইমলাইন দেখা ও সমাধান আপত্তি।', badge: 'Citizen Portal' },
  ward_desk: { title: 'ওয়ার্ড ডেস্ক (Ward Desk)', description: 'যাচাই কিউ (<৮০% AI), ডুপ্লিকেট শনাক্তকরণ ও ওয়াক-ইন গ্রহণ।', badge: 'Ward Operations' },
  field_officer: { title: 'দপ্তর কর্মকর্তা (Dept Officer)', description: 'দাপ্তরিক অনুরোধ গ্রহণ/প্রত্যাখ্যান, উপস্থিতি ও প্রমাণ আপলোড।', badge: 'Field Operations' },
  coordinator: { title: 'কেস সমন্বয়ক (Case Coordinator)', description: 'বহু-বিভাগীয় টাস্ক ক্রম আনলক, এসএলএ মনিটরিং ও হটস্পট।', badge: 'Central Command' },
  admin: { title: 'সিস্টেম অ্যাডমিন (System Administrator)', description: 'প্ল্যাটফর্ম অপারেশন, অ্যাকাউন্ট প্রোভিশনিং ও সিস্টেম অডিট।', badge: 'Technical Platform' },
  governance_head: { title: 'সিটি গভর্নেন্স প্রধান (City Governance Head)', description: 'পৌর নীতিমালা, দ্বৈত অনুমোদন, সার্ভিস গভর্ন্যান্স ও এসএলএ টার্গেটস।', badge: 'Municipal Governance' }
};

export const RoleSelectionPage: React.FC = () => (
  <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12 animate-in fade-in duration-200">
    <Link to="/" className="mb-6 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition">
      <ArrowLeft size={16} aria-hidden="true" /> মূল পাতায় ফেরত যান (Public Home)
    </Link>
    <header className="mb-6 space-y-2">
      <div className="text-[10px] font-mono tracking-widest text-[var(--muted)] uppercase">
        NAGORIK SATHI AI · ROLE SELECTION
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
        পৌর ভূমিকা নির্বাচন করুন · <span className="font-light text-[var(--muted)]">Select Persona</span>
      </h1>
      <p className="text-xs text-[var(--muted)] leading-relaxed">
        নাগরিক সাথী এআই প্ল্যাটফর্মের ৬টি পৃথক অপারেশনাল ওয়ার্কস্পেস রয়েছে। প্রযুক্তি প্ল্যাটফর্ম ও পৌর সুশাসনের দায়িত্ব পৃথকীকরণে সিস্টেম অ্যাডমিন ও সিটি গভর্নেন্স প্রধানের স্বতন্ত্র ইন্টারফেস রয়েছে।
      </p>
    </header>

    <div className="space-y-3">
      {DEMO_ROLES.map((role, index) => {
        const Icon = icons[index] || Building2;
        const roleInfo = copy[role.role] || { title: role.title, description: role.subtitle, badge: role.role };
        return (
          <Link
            key={role.role}
            to={paths[role.role] || `/login/${role.role}`}
            className="group flex items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 transition hover:border-[var(--line-strong)] hover:bg-[var(--paper-elevated)] cursor-pointer shadow-xs"
          >
            <span className="flex min-w-0 items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] group-hover:scale-105 transition-transform">
                <Icon size={19} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--ink)] transition">
                  {roleInfo.title}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-[var(--muted)]">
                  {roleInfo.description}
                </span>
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-[var(--muted)]">
              <span className="hidden sm:inline px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[10px] font-mono text-[var(--ink)]">
                {roleInfo.badge}
              </span>
              <ArrowRight size={16} aria-hidden="true" className="group-hover:translate-x-1 group-hover:text-[var(--ink)] transition-transform" />
            </span>
          </Link>
        );
      })}
    </div>
  </main>
);
export default RoleSelectionPage;
