import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Eye,
  Camera,
  MapPin,
  Clock,
  ShieldAlert,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

export const WardEvidenceReviewPage: React.FC = () => {
  const { cases } = useCases();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'proofs' | 'objections'>('proofs');

  const wardCases = cases.filter(c => !currentUser.wardId || c.location.wardId === currentUser.wardId);

  // Cases with completion proof uploaded (status = resolved_pending_citizen or tasks with resolutionEvidence)
  const proofCases = wardCases.filter(c =>
    c.status === 'resolved_pending_citizen' ||
    c.tasks.some(t => t.resolutionEvidence && t.resolutionEvidence.length > 0)
  );

  // Cases with citizen objections
  const objectionCases = wardCases.filter(c => c.status === 'reopened' || c.objection);

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] bg-[var(--paper-elevated)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              M8 সমাধান ও ভেরিফিকেশন
            </span>
            <span className="text-xs text-[var(--muted)]">প্রমাণক যাচাই ও নাগরিক সন্তুষ্টি তদারকি</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] tracking-tight">
            প্রমাণক ও নিষ্পত্তি পুনঃপর্যালোচনা (Evidence Review & Re-review)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-2xl">
            মাঠ পর্যায়ের সমাধান প্রমাণক এবং নাগরিকের দাখিলকৃত আপত্তি ও পুনঃতদন্ত পর্যালোচনা
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3.5 py-1.5 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)]">
            পর্যালোচনায়: <strong className="text-[var(--green)]">{toBanglaNumber(proofCases.length + objectionCases.length)}</strong>
          </span>
        </div>
      </div>

      {/* R&D Rule Notice */}
      <div className="civic-card rounded-2xl p-4 bg-[var(--paper-elevated)] border border-[var(--line)] flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-[var(--green)] shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-[var(--ink)]">R&D নিষ্পত্তিকরণ নীতি (Closure Authority Rule):</strong>
          <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
            কর্মকর্তা কর্তৃক সমাধান প্রমাণ আপলোড (Resolved Proof Uploaded) চূড়ান্ত সমাপ্তি নয়। নাগরিকের সন্তুষ্টিমূলক সম্মতি অথবা সমন্বয়কারী (Coordinator) কর্তৃক পর্যালোচনার পরই কেস বন্ধ (Closed) হতে পারে। নাগরিক আপত্তি জানালে একই কেসে কাজটি স্বয়ংক্রিয়ভাবে Reopened হয়।
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2">
        <button
          onClick={() => setActiveTab('proofs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'proofs'
              ? 'bg-[var(--ink)] text-[var(--paper)]'
              : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>সমাধান প্রমাণক ({toBanglaNumber(proofCases.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('objections')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'objections'
              ? 'bg-rose-700 text-white'
              : 'bg-[var(--paper)] text-rose-600 hover:bg-rose-50 border border-[var(--line)]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>নাগরিক আপত্তি ও পুনঃতদন্ত ({toBanglaNumber(objectionCases.length)})</span>
        </button>
      </div>

      {/* PROOFS TAB */}
      {activeTab === 'proofs' && (
        <div className="space-y-4">
          {proofCases.length === 0 ? (
            <div className="civic-card rounded-2xl p-12 text-center text-[var(--muted)] text-xs">
              এই মুহূর্তে কোনো নতুন সমাধান প্রমাণক পর্যালোচনার অপেক্ষায় নেই।
            </div>
          ) : (
            proofCases.map(item => (
              <div key={item.id} className="civic-card rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--ink)]">#{item.id}</span>
                      <PriorityBadge priority={item.priority} />
                      <StatusBadge status={item.status} />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--ink)] mt-1">{item.title}</h3>
                  </div>
                  <span className="text-[11px] text-[var(--muted)] font-mono">
                    হালনাগাদ: {formatBanglaDate(item.updatedAt)}
                  </span>
                </div>

                {/* BEFORE & AFTER PHOTO COMPARISON */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before: Citizen Report Media */}
                  <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--line)] space-y-2">
                    <span className="text-[11px] font-bold text-[var(--muted)] block">
                      ১. নাগরিকের দাখিলকৃত প্রাথমিক ছবি (Before):
                    </span>
                    {item.initialEvidence && item.initialEvidence[0] ? (
                      <div className="rounded-lg overflow-hidden aspect-video bg-black/10 relative">
                        <img
                          src={item.initialEvidence[0].url}
                          alt="Citizen evidence"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2 text-[10px] text-white">
                          {item.initialEvidence[0].caption || 'নাগরিকের ছবি'}
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-[var(--paper)] rounded-lg border border-[var(--line)] flex items-center justify-center text-[11px] text-[var(--muted)]">
                        ছবি সংযুক্তি নেই
                      </div>
                    )}
                  </div>

                  {/* After: Staff Resolution Proof */}
                  <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--line)] space-y-2">
                    <span className="text-[11px] font-bold text-[var(--green)] block">
                      ২. ফিল্ড কর্মকর্তার সমাপ্তি প্রমাণক (Completion Proof):
                    </span>
                    {item.tasks.some(t => t.resolutionEvidence && t.resolutionEvidence.length > 0) ? (
                      <div className="rounded-lg overflow-hidden aspect-video bg-black/10 relative">
                        <img
                          src={item.tasks.find(t => t.resolutionEvidence && t.resolutionEvidence.length > 0)?.resolutionEvidence?.[0].url}
                          alt="Completion proof"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2 text-[10px] text-white flex justify-between">
                          <span>ফিল্ড সমাধান প্রমাণক</span>
                          <span className="text-[var(--green)]">✓ অডিট সংরক্ষিত</span>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-[var(--paper)] rounded-lg border border-[var(--line)] flex items-center justify-center text-[11px] text-[var(--muted)]">
                        প্রমাণক প্রক্রিয়াধীন
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
                  <span className="text-[11px] text-[var(--muted)]">
                    অবস্থান: <strong className="text-[var(--ink)]">{item.location.address}</strong>
                  </span>
                  <Link
                    to={`/ward/cases/${item.id}`}
                    className="px-4 py-2 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>কেস বিস্তারিত ও রিভিউ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* OBJECTIONS TAB */}
      {activeTab === 'objections' && (
        <div className="space-y-4">
          {objectionCases.length === 0 ? (
            <div className="civic-card rounded-2xl p-12 text-center text-[var(--muted)] text-xs">
              এই মুহূর্তে কোনো নাগরিক আপত্তি দাখিল নেই।
            </div>
          ) : (
            objectionCases.map(item => (
              <div key={item.id} className="civic-card rounded-2xl p-6 border-l-4 border-l-rose-600 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--ink)]">#{item.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 font-mono">
                        RE-OPENED
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[var(--ink)] mt-1">{item.title}</h3>
                  </div>
                  <span className="text-[11px] text-rose-600 font-bold">
                    নাগরিক কর্তৃক সমাধান প্রত্যাখ্যাত
                  </span>
                </div>

                <div className="p-4 bg-[var(--status-emergency-bg)] rounded-xl border border-[var(--status-emergency-border)] space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                    <MessageSquare className="w-4 h-4" />
                    <span>নাগরিকের আপত্তির কারণ:</span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    {item.objection?.notes || item.objection?.reasons?.join(', ') || 'কাজ সম্পূর্ণ হয়নি। ড্রেন পরিষ্কার করার পর আবর্জনা রাস্তার পাশে ফেলে রাখা হয়েছে এবং গন্ধ ছড়াচ্ছে।'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
                  <span className="text-[11px] text-[var(--muted)]">
                    আগের দায়িত্বপ্রাপ্ত বিভাগ: <strong className="text-[var(--ink)]">{item.humanVerification?.confirmedDepartmentName || item.aiAnalysis.proposedDepartmentName}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/ward/routing"
                      className="px-3.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--green)] text-xs font-semibold text-[var(--ink)] transition cursor-pointer"
                    >
                      পুনরায় রি-রুট
                    </Link>
                    <Link
                      to={`/ward/cases/${item.id}`}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>পুনঃতদন্ত অর্ডার জারি</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
