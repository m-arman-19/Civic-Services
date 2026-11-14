import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';

interface PolicyRequest {
  id: string;
  change_category: string;
  current_version?: string;
  proposed_version?: string;
  current_configuration?: any;
  proposed_configuration?: any;
  reason: string;
  requesting_user_id: string;
  requires_dual_approval: boolean;
  approval_state: string;
  implementation_state: string;
  admin_decision?: string;
  admin_decision_notes?: string;
  admin_decision_at?: string;
  governance_decision?: string;
  governance_decision_notes?: string;
  governance_decision_at?: string;
  applied_at?: string;
  created_at: string;
}

export const AdminPolicyImplementationsPage: React.FC = () => {
  const [requests, setRequests] = useState<PolicyRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Review modal state
  const [selectedReq, setSelectedReq] = useState<PolicyRequest | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await apiClient.admin.getPolicyRequests();
      setRequests(Array.isArray(res) ? res : []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'পলিসি বাস্তবায়ন ও রিভিউ তালিকা লোড ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenReview = (req: PolicyRequest) => {
    setSelectedReq(req);
    setDecisionNotes('');
    setActionSuccess(null);
  };

  const handleTechnicalDecision = async (decision: 'approve' | 'reject') => {
    if (!selectedReq) return;
    if (!decisionNotes.trim()) {
      alert('অনুগ্রহ করে কারিগরি মতামতের বিবরণ লিখুন।');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await apiClient.admin.reviewPolicyTechnical(selectedReq.id, {
        decision,
        decision_notes: decisionNotes,
      });
      setActionSuccess(
        `অনুরোধ #${selectedReq.id.slice(0, 8)} সফলভাবে কারিগরি ${
          decision === 'approve' ? 'অনুমোদন' : 'প্রত্যাখ্যান'
        } সম্পন্ন হয়েছে।`
      );
      setSelectedReq(null);
      fetchRequests();
    } catch (err: any) {
      setError(err?.message || 'সিদ্ধান্ত সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingTechnical = requests.filter(
    (r) =>
      r.approval_state === 'pending_technical_review' ||
      (r.requires_dual_approval && !r.admin_decision && r.approval_state === 'pending_dual_review')
  );

  const historyRequests = requests.filter(
    (r) => !pendingTechnical.some((p) => p.id === r.id)
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-bangla">
            পলিসি পরিবর্তন বাস্তবায়ন ও কারিগরি পর্যালোচনা (Policy Implementation Status)
          </h1>
          <p className="text-sm text-muted font-bangla mt-1">
            সিস্টেম অ্যাডমিনিস্ট্রেটর কর্তৃক কনফিগারেশন চেঞ্জ রিকোয়েস্টের কারিগরি সম্ভাব্যতা যাচাই, ডেপ্লয়মেন্ট এবং প্রয়োগ স্থিতি।
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-black text-white">
            কারিগরি বাস্তবায়ন ট্র্যাকিং
          </span>
        </div>
      </div>

      {/* Dual Approval Enforcement Alert */}
      <div className="p-4 bg-paper border border-line flex items-start gap-3">
        <span className="font-mono text-base font-bold text-ink">ℹ</span>
        <div className="text-xs text-ink font-bangla space-y-1">
          <p className="font-bold">বাধ্যতামূলক দ্বৈত অনুমোদন ও দায়িত্বের পৃথকীকরণ (Mandatory Dual Approval):</p>
          <p className="text-muted">
            সুরক্ষিত পৌর নীতিসমূহ (দপ্তর দায়িত্ব রুলস, টাস্ক সিকোয়েন্সিং এবং এআই গেট হ্রাস) কার্যকর করতে সিস্টেম অ্যাডমিনিস্ট্রেটর এবং সিটি গভর্নেন্স প্রধান উভয়ের স্বতন্ত্র সম্মতি বাধ্যতামূলক। অ্যাডমিন একতরফাভাবে এই নীতি কার্যকর করতে পারবে না।
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bangla">
          {error}
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bangla">
          {actionSuccess}
        </div>
      )}

      {/* Pending Technical Review */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-ink font-bangla flex items-center gap-2">
            <span>কারিগরি পর্যালোচনার অপেক্ষায় (Pending Technical Review)</span>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-neutral-900 text-white rounded">
              {pendingTechnical.length}
            </span>
          </h2>
          <button
            onClick={fetchRequests}
            className="px-3 py-1 border border-line bg-paper text-xs font-mono font-semibold hover:bg-gray-100"
          >
            REFRESH
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted font-bangla border border-line bg-paper">
            অনুরোধ লোড হচ্ছে...
          </div>
        ) : pendingTechnical.length === 0 ? (
          <div className="p-6 text-center text-muted font-bangla border border-line bg-paper text-sm">
            বর্তমানে কোনো কারিগরি পর্যালোচনার অনুরোধ মুলতুবি নেই।
          </div>
        ) : (
          <div className="border border-line bg-paper overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-line bg-gray-50 text-muted uppercase tracking-wider font-mono">
                  <th className="py-2.5 px-4 font-semibold">রিকোয়েস্ট আইডি</th>
                  <th className="py-2.5 px-4 font-semibold">পরিবর্তন ক্যাটাগরি</th>
                  <th className="py-2.5 px-4 font-semibold">কারণ ও প্রসঙ্গ</th>
                  <th className="py-2.5 px-4 font-semibold">দ্বৈত অনুমোদন</th>
                  <th className="py-2.5 px-4 font-semibold">দাখিলের সময়</th>
                  <th className="py-2.5 px-4 font-semibold text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-mono">
                {pendingTechnical.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-ink truncate max-w-[120px]">
                      #{req.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-ink border border-line">
                        {req.change_category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-ink font-sans max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold ${
                        req.requires_dual_approval ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-gray-100 text-muted'
                      }`}>
                        {req.requires_dual_approval ? 'বাধ্যতামূলক (REQUIRED)' : 'একক'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted whitespace-nowrap">
                      {new Date(req.created_at).toLocaleString('bn-BD')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenReview(req)}
                        className="px-3 py-1 bg-black text-white text-xs font-semibold font-bangla hover:bg-neutral-800"
                      >
                        কারিগরি রিভিউ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-line max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="border-b border-line pb-3 flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-ink font-bangla">
                  কারিগরি সম্ভাব্যতা ও ডেপ্লয়মেন্ট রিভিউ (#{selectedReq.id.slice(0, 8)})
                </h3>
                <p className="text-xs text-muted font-mono mt-0.5">
                  ক্যাটাগরি: {selectedReq.change_category} | প্রস্তাবক: {selectedReq.requesting_user_id}
                </p>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-muted hover:text-ink font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 border border-line space-y-1">
                <span className="font-bold text-ink block font-bangla">পরিবর্তনের কারণ ও যৌক্তিকতা:</span>
                <p className="text-ink font-bangla">{selectedReq.reason}</p>
              </div>

              <div>
                <span className="font-bold text-ink block font-mono uppercase tracking-wider mb-1">
                  PROPOSED CONFIGURATION:
                </span>
                <pre className="p-2.5 bg-gray-50 border border-line font-mono text-[11px] whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {JSON.stringify(selectedReq.proposed_configuration, null, 2)}
                </pre>
              </div>

              <div>
                <label className="block font-bold text-ink uppercase tracking-wider font-mono mb-1 font-bangla">
                  কারিগরি মতামত ও ডেপ্লয়মেন্ট মূল্যায়ন (Technical Notes) *
                </label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="কারিগরি স্থিতিশীলতা, ডাটাবেজ ইমপ্যাক্ট বা ল্যাটেন্সি সংক্রান্ত পর্যবেক্ষণ লিখুন..."
                  className="w-full p-2.5 border border-line text-xs font-bangla"
                />
              </div>
            </div>

            <div className="border-t border-line pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 border border-line text-xs font-semibold font-bangla hover:bg-gray-100"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleTechnicalDecision('reject')}
                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold font-bangla hover:bg-red-700 disabled:opacity-50"
              >
                প্রত্যাখ্যান (REJECT)
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleTechnicalDecision('approve')}
                className="px-4 py-2 bg-black text-white text-xs font-semibold font-bangla hover:bg-neutral-800 disabled:opacity-50"
              >
                কারিগরি সম্মতি প্রদান (APPROVE)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historical and Applied Changes */}
      <div className="space-y-3 pt-4">
        <h2 className="text-base font-bold text-ink font-bangla">
          পলিসি বাস্তবায়ন ও প্রয়োগ ইতিহাস (Implementation & Rollout History)
        </h2>

        {historyRequests.length === 0 ? (
          <div className="p-6 text-center text-muted font-bangla border border-line bg-paper text-sm">
            ইতিহাসে কোনো পলিসি পরিবর্তন রেকর্ড পাওয়া যায়নি।
          </div>
        ) : (
          <div className="border border-line bg-paper overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-line bg-gray-50 text-muted uppercase tracking-wider font-mono">
                  <th className="py-2.5 px-4 font-semibold">আইডি</th>
                  <th className="py-2.5 px-4 font-semibold">ক্যাটাগরি</th>
                  <th className="py-2.5 px-4 font-semibold">অনুমোদন স্থিতি</th>
                  <th className="py-2.5 px-4 font-semibold">বাস্তবায়ন অবস্থা</th>
                  <th className="py-2.5 px-4 font-semibold">অ্যাডমিন সিদ্ধান্ত</th>
                  <th className="py-2.5 px-4 font-semibold">গভর্ন্যান্স সিদ্ধান্ত</th>
                  <th className="py-2.5 px-4 font-semibold">প্রয়োগের তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-mono">
                {historyRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-ink truncate max-w-[100px]">
                      #{req.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-ink">
                      {req.change_category}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold ${
                        req.approval_state === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : req.approval_state === 'rejected'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-gray-100 text-ink border border-line'
                      }`}>
                        {req.approval_state.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold ${
                        req.implementation_state === 'applied'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.implementation_state === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-muted'
                      }`}>
                        {req.implementation_state.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-ink">
                      {req.admin_decision ? req.admin_decision.toUpperCase() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-ink">
                      {req.governance_decision ? req.governance_decision.toUpperCase() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-muted whitespace-nowrap">
                      {req.applied_at ? new Date(req.applied_at).toLocaleString('bn-BD') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminPolicyImplementationsPage;
