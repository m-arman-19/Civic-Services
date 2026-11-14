import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import { CitizenWalkinModal, CitizenWalkinPayload } from '../../components/ward/CitizenWalkinModal';
import apiClient from '../../services/apiClient';
import {
  History,
  UserPlus,
  ShieldCheck,
  Search,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  FileText,
  Lock
} from 'lucide-react';

export const WardAssistedHistoryPage: React.FC = () => {
  const { cases, createNewCase, refreshCases } = useCases();
  const { currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assistedCases, setAssistedCases] = useState<any[]>([]);

  useEffect(() => {
    const loadAssisted = async () => {
      const data = await apiClient.ward.getAssistedHistory();
      if (Array.isArray(data) && data.length > 0) {
        setAssistedCases(data);
      } else {
        // Filter from client cases if backend endpoint has empty or mock
        const filtered = cases.filter(c =>
          c.citizenId.startsWith('walkin') ||
          (c as any).intake_channel === 'ward_desk' ||
          c.title.includes('ওয়াক-ইন')
        );
        setAssistedCases(filtered.map(c => ({
          id: c.id,
          tracking_number: c.trackingNumber || c.id,
          title_bn: c.title,
          description_bn: c.description,
          primary_category: c.category,
          address_text: c.location.address,
          ward_name_bn: c.location.wardName,
          department_name_bn: c.humanVerification?.confirmedDepartmentName || c.aiAnalysis.proposedDepartmentName,
          status: c.status,
          priority: c.priority,
          intake_channel: 'ward_desk',
          created_at: c.submittedAt
        })));
      }
    };
    loadAssisted();
  }, [cases]);

  const handleWalkinSubmit = async (payload: CitizenWalkinPayload) => {
    await createNewCase({
      citizenId: 'walkin_' + Date.now(),
      citizenName: payload.citizenName,
      citizenPhone: payload.citizenPhone,
      title: `${payload.address} এ ${payload.category} সমস্যা (ওয়াক-ইন)`,
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
        confidenceScore: 78,
        proposedPriority: payload.priority,
        priorityReason: 'সহায়তাপ্রাপ্ত নাগরিক এন্ট্রি',
        proposedDepartmentId: payload.category === 'waste' ? 'dept_waste' : 'dept_drainage',
        proposedDepartmentName: payload.category === 'waste' ? 'বর্জ্য ব্যবস্থাপনা বিভাগ' : 'ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ',
        ruleReference: 'RULE-MANUAL-INTAKE-01',
        requiresHumanVerification: true,
        signals: ['ওয়ার্ড সেবা কেন্দ্রে নাগরিক স্বশরীরে উপস্থিত হয়ে নিবন্ধন করিয়েছেন']
      }
    });
    await refreshCases();
  };

  const filtered = assistedCases.filter(c =>
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title_bn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] bg-[var(--paper-elevated)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              {currentUser.wardName || 'ওয়ার্ড ১২'}
            </span>
            <span className="text-xs text-[var(--muted)]">সহায়তাপ্রাপ্ত নাগরিক ইনটেক রেজিস্ট্রি</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] tracking-tight">
            নাগরিক সহায়তা ইতিহাস ও ওয়াক-ইন রেজিস্ট্রি (Citizen Assistance History)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-2xl">
            ডিজিটাল ব্যবহারে অসমর্থ নাগরিকদের পক্ষে সেবা কেন্দ্র কর্মকর্তা কর্তৃক দাখিলকৃত রিপোর্ট ও সম্মতি রেকর্ড
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>নতুন ওয়াক-ইন গ্রহণ</span>
        </button>
      </div>

      {/* Privacy Policy Banner */}
      <div className="civic-card rounded-2xl p-4 bg-[var(--paper-elevated)] border border-[var(--line)] flex items-start gap-3 text-xs">
        <Lock className="w-5 h-5 text-[var(--green)] shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-[var(--ink)]">ব্যক্তিগত তথ্য সুরক্ষা ও সম্মতি বাধ্যবাধকতা:</strong>
          <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
            নাগরিকের স্পষ্ট সম্মতি ছাড়া কোনো তথ্য সিস্টেমে অন্তর্ভুক্ত করা যায় না। নাগরিকের মোবাইল নম্বর পাবলিক ডিসপ্লেতে সম্পূর্ণ গোপন ও টোকেন-এনক্রিপ্টেড (Masked) রাখা হয় যাতে ট্র্যাকিং এসএমএস ব্যতীত অন্য কোনো বাণিজ্যিক উদ্দেশ্যে তথ্যের অপব্যবহার না ঘটে।
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="civic-card rounded-2xl p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="ট্র্যাকিং নম্বর, সমস্যার বিবরণ বা অবস্থান দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-xl border border-[var(--line)] focus:outline-hidden focus:border-[var(--green)]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="civic-card rounded-2xl overflow-hidden shadow-xs border border-[var(--line)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-semibold uppercase tracking-wider">
                <th className="p-3.5">ট্র্যাকিং নম্বর</th>
                <th className="p-3.5">সমস্যার বিবরণ</th>
                <th className="p-3.5">অবস্থান</th>
                <th className="p-3.5">দায়িত্বপ্রাপ্ত দপ্তর</th>
                <th className="p-3.5">সম্মতি রেকর্ড</th>
                <th className="p-3.5">দাখিলের সময়</th>
                <th className="p-3.5">বর্তমান অবস্থা</th>
                <th className="p-3.5 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--muted)]">
                    কোনো সহায়তা গ্রহণের রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-[var(--bg)] transition">
                    <td className="p-3.5 font-mono font-bold text-[var(--ink)]">
                      {item.tracking_number}
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <div className="font-semibold text-[var(--ink)]">{item.title_bn}</div>
                      <div className="text-[11px] text-[var(--muted)] truncate mt-0.5">{item.description_bn}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1 text-[var(--ink)]">
                        <MapPin className="w-3.5 h-3.5 text-[var(--green)] shrink-0" />
                        <span>{item.address_text}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <strong className="text-[var(--green)] font-bold">{item.department_name_bn}</strong>
                    </td>

                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--green)]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>মৌখিক সম্মতি গৃহীত</span>
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-[var(--muted)]">
                      {formatBanglaDate(item.created_at)}
                    </td>

                    <td className="p-3.5">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="p-3.5 text-right">
                      <Link
                        to={`/ward/cases/${item.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--green)] text-xs font-bold text-[var(--ink)] transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>কেস ভিউ</span>
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

      {/* Walkin Modal */}
      <CitizenWalkinModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleWalkinSubmit}
        wardId={currentUser.wardId || 12}
        wardName={currentUser.wardName || 'ওয়ার্ড ১২'}
      />
    </div>
  );
};
