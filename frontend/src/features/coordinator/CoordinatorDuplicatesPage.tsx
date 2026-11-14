import React, { useState, useEffect } from 'react';
import { useCases } from '../../context/CaseContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import apiClient from '../../services/apiClient';
import {
  FileText,
  GitMerge,
  RotateCcw,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface CandidatePair {
  masterCaseId: string;
  duplicateCaseId: string;
  masterTitle: string;
  duplicateTitle: string;
  similarityScore: number;
  distanceMeters: number;
  wardName: string;
  category: string;
  detectedAt: string;
  status: 'pending' | 'merged' | 'rejected';
}

export const CoordinatorDuplicatesPage: React.FC = () => {
  const { cases } = useCases();
  const [candidates, setCandidates] = useState<CandidatePair[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'merged' | 'rejected'>('pending');
  const [inspectModal, setInspectModal] = useState<CandidatePair | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Generate realistic duplicate candidates from cases
    const pairs: CandidatePair[] = [
      {
        masterCaseId: cases[0]?.id || 'NS-2026-000184',
        duplicateCaseId: cases[1]?.id || 'NS-2026-000185',
        masterTitle: cases[0]?.title || 'প্রধান সড়কের ড্রেনের ম্যানহোল ভাঙা ও ময়লা জমে পানি উপচে পড়া',
        duplicateTitle: 'রাস্তার ম্যানহোল ঢাকনাহীন অবস্থায় খোলা পড়ে আছে ও দুর্গন্ধ ছড়াচ্ছে',
        similarityScore: 92,
        distanceMeters: 45,
        wardName: cases[0]?.location.wardName || '৩ নং পাঁচলাইশ ওয়ার্ড',
        category: 'ড্রেনেজ ও নর্দমা',
        detectedAt: new Date().toISOString(),
        status: 'pending'
      },
      {
        masterCaseId: cases[2]?.id || 'NS-2026-000186',
        duplicateCaseId: cases[3]?.id || 'NS-2026-000187',
        masterTitle: 'মোড়ের ডাস্টবিন উপচে সড়কে ময়লার স্তূপ',
        duplicateTitle: 'বাজার সংলগ্ন প্রধান রাস্তায় আবর্জনার স্তূপ পথচারী চলাচল বিঘ্নিত',
        similarityScore: 88,
        distanceMeters: 75,
        wardName: '৪ নং চান্দগাঁও ওয়ার্ড',
        category: 'বর্জ্য ব্যবস্থাপনা',
        detectedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'pending'
      },
      {
        masterCaseId: cases[4]?.id || 'NS-2026-000188',
        duplicateCaseId: cases[5]?.id || 'NS-2026-000189',
        masterTitle: 'সড়কের পিচ উঠে গিয়ে বড় গর্ত সৃষ্টি',
        duplicateTitle: 'রাস্তা ভাঙা, যানবাহন চলাচলে মারাত্মক ঝুঁকি',
        similarityScore: 84,
        distanceMeters: 120,
        wardName: '২ নং জালালাবাদ ওয়ার্ড',
        category: 'সড়ক ও অবকাঠামো',
        detectedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        status: 'merged'
      }
    ];
    setCandidates(pairs);
    setLoading(false);
  }, [cases]);

  const handleMerge = async (pair: CandidatePair) => {
    try {
      await apiClient.ward.mergeDuplicate(pair.masterCaseId, pair.duplicateCaseId, 'সমন্বয়ক কর্তৃক ডুপ্লিকেট মার্জ নিশ্চিত');
      setCandidates(prev => prev.map(p => p.duplicateCaseId === pair.duplicateCaseId ? { ...p, status: 'merged' } : p));
      setActionSuccess(`কেস #${pair.duplicateCaseId} সফলভাবে প্রধান কেস #${pair.masterCaseId}-এ মার্জ করা হয়েছে। মূল নাগরিকের ট্র্যাকিং অক্ষুণ্ণ রয়েছে।`);
      setInspectModal(null);
    } catch (e: any) {
      alert('মার্জ কার্যক্রমে ত্রুটি ঘটেছে');
    }
  };

  const handleReject = async (pair: CandidatePair) => {
    try {
      setCandidates(prev => prev.map(p => p.duplicateCaseId === pair.duplicateCaseId ? { ...p, status: 'rejected' } : p));
      setActionSuccess(`ডুপ্লিকেট প্রস্তাব প্রত্যাখ্যান করা হয়েছে। কেস দুটি পৃথক ও স্বতন্ত্র হিসেবে পরিচালিত হবে।`);
      setInspectModal(null);
    } catch (e: any) {
      alert('প্রত্যাখ্যানে ত্রুটি ঘটেছে');
    }
  };

  const handleReverseUnmerge = async (pair: CandidatePair) => {
    try {
      await apiClient.ward.unmergeDuplicate(pair.duplicateCaseId, 'ভুল মার্জ সংশোধনে সমন্বয়ক কর্তৃক আন-মার্জ');
      setCandidates(prev => prev.map(p => p.duplicateCaseId === pair.duplicateCaseId ? { ...p, status: 'pending' } : p));
      setActionSuccess(`মার্জ সফলভাবে বাতিল (Reverse Unmerge) করা হয়েছে। কেস #${pair.duplicateCaseId} তার পূর্ববর্তী স্বাধীন অবস্থায় ফিরে এসেছে।`);
    } catch (e: any) {
      alert('আন-মার্জ সম্পন্ন করতে ব্যর্থ');
    }
  };

  const filteredCandidates = candidates.filter(c => c.status === activeTab);

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--green-light)] px-3 py-0.5 rounded-full border border-[var(--line)]">
              কেস অপারেশনস
            </span>
            <span className="text-xs text-[var(--muted)]">R&D Section 10.8 রিভার্সিবল মার্জ আর্কিটেকচার</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
            ডুপ্লিকেট ইনসিডেন্ট রিভিউ হাব (Duplicate Incident Review)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            জিপিএস দূরত্ব, সময়, সমস্যার ধরন ও টেক্সট মিলের ভিত্তিতে সম্ভাব্য ডুপ্লিকেট রিপোর্ট পর্যালোচনা ও রিভার্সিবল মার্জ
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-xs underline cursor-pointer">
            ঠিক আছে
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-[var(--green)] text-white'
              : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
          }`}
        >
          পর্যালোচনা অপেক্ষমাণ ({toBanglaNumber(candidates.filter(c => c.status === 'pending').length)})
        </button>
        <button
          onClick={() => setActiveTab('merged')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'merged'
              ? 'bg-emerald-700 text-white'
              : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
          }`}
        >
          মার্জকৃত ক্লাস্টার ({toBanglaNumber(candidates.filter(c => c.status === 'merged').length)})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'rejected'
              ? 'bg-red-600 text-white'
              : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
          }`}
        >
          প্রত্যাখ্যাত / স্বতন্ত্র ({toBanglaNumber(candidates.filter(c => c.status === 'rejected').length)})
        </button>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCandidates.map((pair, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-[var(--green)]/10 text-[var(--green)]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-xs font-bold text-[var(--ink)]">সাদৃশ্য স্কোর: {toBanglaNumber(pair.similarityScore)}%</span>
                  <span className="text-[10px] text-[var(--muted)] block">দূরত্ব: ~{toBanglaNumber(pair.distanceMeters)} মিটার</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)]">
                {pair.wardName}
              </span>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Master Case */}
              <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--line)] space-y-1">
                <span className="text-[10px] font-bold text-[var(--green)] uppercase tracking-wider block">
                  মাস্টার কেস (Primary)
                </span>
                <span className="font-mono text-xs font-bold text-[var(--gold)] block">#{pair.masterCaseId}</span>
                <p className="text-[11px] text-[var(--ink)] font-medium line-clamp-3 leading-relaxed">
                  {pair.masterTitle}
                </p>
              </div>

              {/* Duplicate Candidate */}
              <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--line)] space-y-1">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                  ডুপ্লিকেট প্রার্থী (Duplicate)
                </span>
                <span className="font-mono text-xs font-bold text-[var(--gold)] block">#{pair.duplicateCaseId}</span>
                <p className="text-[11px] text-[var(--ink)] font-medium line-clamp-3 leading-relaxed">
                  {pair.duplicateTitle}
                </p>
              </div>
            </div>

            {/* Privacy note */}
            <div className="text-[10px] text-[var(--muted)] flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--green)]" />
              <span>রিপোর্টারের পরিচয় ও ফোন নম্বর সম্পূর্ণ সুরক্ষিত; মার্জ হলেও পৃথক নাগরিক ট্র্যাকিং বজায় থাকবে।</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              {pair.status === 'pending' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleReject(pair)}
                    className="px-3.5 py-1.5 rounded-xl bg-[var(--bg)] hover:bg-red-50 hover:text-red-600 border border-[var(--line)] text-xs font-bold transition cursor-pointer"
                  >
                    স্বতন্ত্র হিসেবে চিহ্নিত করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMerge(pair)}
                    className="px-4 py-1.5 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    <span>মার্জ অনুমোদন করুন</span>
                  </button>
                </>
              ) : pair.status === 'merged' ? (
                <button
                  type="button"
                  onClick={() => handleReverseUnmerge(pair)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>মার্জ রিভার্স করুন (Reverse Unmerge)</span>
                </button>
              ) : (
                <span className="text-xs text-[var(--muted)]">স্বতন্ত্র কেস হিসেবে সক্রিয়</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
