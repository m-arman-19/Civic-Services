import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { formatBanglaDate, toBanglaNumber } from '../../utils/formatters';
import { CitizenWalkinModal, CitizenWalkinPayload } from '../../components/ward/CitizenWalkinModal';
import {
  Shield,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  UserPlus,
  MapPin,
  CheckCircle2,
  FileQuestion,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';

export const WardVerificationQueuePage: React.FC = () => {
  const { cases, createNewCase, refreshCases } = useCases();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'emergency' | 'uncertain'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [isWalkinModalOpen, setIsWalkinModalOpen] = useState(false);

  // Scoped to ward
  const wardCases = cases.filter(c => !currentUser.wardId || c.location.wardId === currentUser.wardId);
  const verificationCases = wardCases.filter(c => c.status === 'submitted' || c.status === 'verified');

  const emergencyQueue = verificationCases.filter(c => c.priority === 'emergency');
  const uncertainQueue = verificationCases.filter(c => c.aiAnalysis.confidenceScore < 80 || c.aiAnalysis.requiresHumanVerification || !c.aiAnalysis.assetId);

  const currentTabList = activeTab === 'emergency'
    ? emergencyQueue
    : activeTab === 'uncertain'
    ? uncertainQueue
    : verificationCases;

  const filtered = currentTabList.filter(c => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = filterDept === 'all' || c.aiAnalysis.proposedDepartmentId === filterDept;

    return matchesSearch && matchesDept;
  });

  const handleWalkinSubmit = async (payload: CitizenWalkinPayload) => {
    await createNewCase({
      citizenId: 'walkin_' + Date.now(),
      citizenName: payload.citizenName,
      citizenPhone: payload.citizenPhone,
      title: `${payload.address} এ ${payload.category} সমস্যা`,
      description: payload.description,
      location: {
        lat: 23.8682,
        lng: 90.3985,
        address: payload.address,
        wardId: payload.wardId,
        wardName: currentUser.wardName || `ওয়ার্ড ${payload.wardId}`,
        landmark: payload.landmark
      },
      category: payload.category as any,
      priority: payload.priority,
      estimatedResolutionDays: payload.priority === 'emergency' ? 1 : 3,
      initialEvidence: [],
      aiAnalysis: {
        category: payload.category as any,
        categoryLabel: payload.category,
        problemSummary: payload.description,
        confidenceScore: 75,
        proposedPriority: payload.priority,
        priorityReason: 'সহায়তাপ্রাপ্ত নাগরিক এন্ট্রি',
        proposedDepartmentId: payload.category === 'waste' ? 'dept_waste' : 'dept_drainage',
        proposedDepartmentName: payload.category === 'waste' ? 'বর্জ্য ব্যবস্থাপনা বিভাগ' : 'ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ',
        ruleReference: 'RULE-MANUAL-INTAKE-01',
        requiresHumanVerification: true,
        signals: ['ওয়ার্ড সেবা কেন্দ্রে নাগরিকের উপস্থিতিতে সহকারী অফিসার দ্বারা এন্ট্রি']
      }
    });
    await refreshCases();
  };

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] bg-[var(--paper-elevated)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              {currentUser.wardName || 'ওয়ার্ড ১২'} ইনটেক ডেস্ক
            </span>
            <span className="text-xs text-[var(--muted)]">নাগরিক ইনটেক ও এআই দায়িত্ব ট্রায়াজ</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] tracking-tight">
            রিপোর্ট ইনটেক ও দায়িত্ব যাচাই কিউ (Report Intake & Verification)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-2xl">
            নাগরিকদের দাখিলকৃত রিপোর্ট, অবস্থান, প্রমাণক ও এআই প্রস্তাব পর্যালোচনা করে চূড়ান্ত অনুমোদন দিন
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsWalkinModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--ink)] hover:bg-black text-[var(--paper)] text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>সহায়তাপ্রাপ্ত ইনটেক (Walk-in)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[var(--ink)] text-[var(--paper)]'
              : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>সকল ইনটেক ({toBanglaNumber(verificationCases.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('emergency')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'emergency'
              ? 'bg-rose-700 text-white'
              : 'bg-[var(--paper)] text-rose-600 hover:bg-rose-50 border border-[var(--line)]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>জরুরি সিগন্যাল ({toBanglaNumber(emergencyQueue.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('uncertain')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'uncertain'
              ? 'bg-amber-600 text-white'
              : 'bg-[var(--paper)] text-amber-600 hover:bg-amber-50 border border-[var(--line)]'
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          <span>অনিশ্চিত অবস্থান ও &lt;৮০% কনফিডেন্স ({toBanglaNumber(uncertainQueue.length)})</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="civic-card rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="কেস আইডি, সমস্যা বা এলাকা দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-xl border border-[var(--line)] focus:outline-hidden focus:border-[var(--green)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[var(--muted)] shrink-0" />
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-xl border border-[var(--line)] font-medium focus:outline-hidden focus:border-[var(--green)] cursor-pointer"
          >
            <option value="all">সকল বিভাগ ({toBanglaNumber(currentTabList.length)})</option>
            <option value="dept_drainage">ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ</option>
            <option value="dept_waste">বর্জ্য ব্যবস্থাপনা বিভাগ</option>
            <option value="dept_road">সড়ক ও অবকাঠামো বিভাগ</option>
            <option value="dept_lighting">বিদ্যুৎ ও সড়কবাতি বিভাগ</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div className="civic-card rounded-2xl overflow-hidden shadow-xs border border-[var(--line)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-semibold uppercase tracking-wider">
                <th className="p-3.5">কেস আইডি</th>
                <th className="p-3.5">সমস্যার বিবরণ</th>
                <th className="p-3.5">অবস্থান ও অ্যাসেট</th>
                <th className="p-3.5">এআই প্রস্তাবিত বিভাগ</th>
                <th className="p-3.5">কনফিডেন্স ও বিধিমালা</th>
                <th className="p-3.5">অগ্রাধিকার</th>
                <th className="p-3.5">ইনটেক চ্যানেল</th>
                <th className="p-3.5 text-right">যাচাই অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--muted)]">
                    এই ফিল্টারে কোনো অভিযোগ নেই।
                  </td>
                </tr>
              ) : (
                filtered.map(item => {
                  const isLowConf = item.aiAnalysis.confidenceScore < 80;
                  const isEmergency = item.priority === 'emergency';
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[var(--bg)] transition ${
                        isEmergency ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      <td className="p-3.5 font-mono font-bold text-[var(--ink)]">
                        #{item.id}
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="font-semibold text-[var(--ink)]">{item.title}</div>
                        <div className="text-[11px] text-[var(--muted)] truncate mt-0.5">{item.description}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1 font-medium text-[var(--ink)]">
                          <MapPin className="w-3.5 h-3.5 text-[var(--green)] shrink-0" />
                          <span>{item.location.address}</span>
                        </div>
                        {item.aiAnalysis.assetName ? (
                          <span className="text-[10px] text-[var(--green)] font-mono block mt-0.5">
                            অ্যাসেট: {item.aiAnalysis.assetName}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600 block mt-0.5">
                            ⚠️ অ্যাসেট নিশ্চিত নয় (যাচাই করুন)
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <strong className="text-[var(--green)] font-bold">{item.aiAnalysis.proposedDepartmentName}</strong>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className={`font-mono font-bold text-[11px] ${
                            isLowConf ? 'text-amber-600' : 'text-[var(--green)]'
                          }`}>
                            {toBanglaNumber(item.aiAnalysis.confidenceScore)}% {isLowConf ? '(Gate Failed)' : '(Gate Passed)'}
                          </span>
                          <span className="text-[10px] text-[var(--muted)] font-mono">{item.aiAnalysis.ruleReference}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td className="p-3.5">
                        <span className="text-[11px] font-medium text-[var(--muted)] bg-[var(--bg)] px-2 py-0.5 rounded border border-[var(--line)]">
                          {item.citizenId.startsWith('walkin') ? 'ওয়াক-ইন' : 'নাগরিক অ্যাপ'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          to={`/ward/cases/${item.id}`}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer ${
                            isEmergency
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-[var(--green)] hover:bg-[var(--green-dark)] text-white'
                          }`}
                        >
                          <span>রিভিউ ও যাচাই</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assisted Walkin Intake Modal */}
      <CitizenWalkinModal
        isOpen={isWalkinModalOpen}
        onClose={() => setIsWalkinModalOpen(false)}
        onSubmit={handleWalkinSubmit}
        wardId={currentUser.wardId || 12}
        wardName={currentUser.wardName || 'ওয়ার্ড ১২'}
      />
    </div>
  );
};
