import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { toBanglaNumber } from '../../utils/formatters';
import {
  CheckSquare, ShieldCheck, AlertTriangle, CheckCircle2,
  XCircle, Clock, Plus, ArrowRight, RefreshCw, Sliders, GitFork, Landmark
} from 'lucide-react';

export const GovernanceApprovalsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [decisionNotes, setDecisionNotes] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [showProposeModal, setShowProposeModal] = useState<boolean>(false);

  // Privileged Role Requests State
  const [activeSection, setActiveSection] = useState<'policies' | 'privileged_roles'>('policies');
  const [privRequests, setPrivRequests] = useState<any[]>([]);
  const [privLoading, setPrivLoading] = useState<boolean>(false);
  const [selectedPrivReq, setSelectedPrivReq] = useState<any | null>(null);
  const [privDecisionNotes, setPrivDecisionNotes] = useState<string>('');

  // Proposal Form State
  const [propCategory, setPropCategory] = useState<string>('RESPONSIBILITY_RULE');
  const [propVersion, setPropVersion] = useState<string>('1.2');
  const [propReason, setPropReason] = useState<string>('');
  const [propPayloadStr, setPropPayloadStr] = useState<string>('{\n  "note": "নতুন পৌর প্রবিধান"\n}');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await apiClient.governance.getPolicyRequests(filter);
      setRequests(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivRequests = async () => {
    setPrivLoading(true);
    try {
      const data = await apiClient.governance.getPrivilegedRoleRequests();
      setPrivRequests(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setPrivLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'policies') {
      fetchRequests();
    } else {
      fetchPrivRequests();
    }
  }, [filter, activeSection]);

  const handleDecision = async (decision: 'approve' | 'reject') => {
    if (!selectedReq) return;
    setActionLoading(true);
    try {
      const res = await apiClient.governance.decidePolicyRequest(selectedReq.id, {
        decision,
        decision_notes: decisionNotes
      });
      if (res) {
        alert(res.message_bn || 'সিদ্ধান্ত সফলভাবে রেকর্ড করা হয়েছে।');
        setSelectedReq(null);
        setDecisionNotes('');
        fetchRequests();
      }
    } catch (e: any) {
      alert(e.message || 'অনুমোদনে সমস্যা দেখা দিয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrivDecision = async (decision: 'approve' | 'reject') => {
    if (!selectedPrivReq) return;
    setActionLoading(true);
    try {
      const res = await apiClient.governance.decidePrivilegedRoleRequest(selectedPrivReq.id, decision, privDecisionNotes);
      if (res) {
        alert(res.message_bn || 'সিদ্ধান্ত সফলভাবে রেকর্ড করা হয়েছে।');
        setSelectedPrivReq(null);
        setPrivDecisionNotes('');
        fetchPrivRequests();
      }
    } catch (e: any) {
      alert(e.message || 'অনুমোদনে সমস্যা দেখা দিয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      let parsedPayload: any;
      try {
        parsedPayload = JSON.parse(propPayloadStr);
      } catch (err) {
        alert('কনফিগারেশন পে-লোডটি একটি বৈধ JSON হতে হবে।');
        setActionLoading(false);
        return;
      }

      const res = await apiClient.governance.proposePolicyRequest({
        change_category: propCategory,
        proposed_version: propVersion,
        reason: propReason,
        proposed_configuration: parsedPayload
      });
      if (res) {
        alert(res.message_bn || 'প্রস্তাবনা গৃহীত হয়েছে।');
        setShowProposeModal(false);
        setPropReason('');
        fetchRequests();
      }
    } catch (e: any) {
      alert(e.message || 'প্রস্তাবনা দাখিলে সমস্যা হয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (approvalState: string, implState: string) => {
    if (approvalState === 'approved' && implState === 'applied') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3" /> কার্যকর (Applied)
        </span>
      );
    }
    if (approvalState === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          <XCircle className="w-3 h-3" /> বাতিলকৃত (Rejected)
        </span>
      );
    }
    if (implState === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-3 h-3" /> রি-ভ্যালিডেশন ব্যর্থ (Failed)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
        <Clock className="w-3 h-3" /> বিচারাধীন (Pending Approval)
      </span>
    );
  };

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-editorial">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[var(--line)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider bg-[var(--paper-elevated)] text-[var(--ink)] border border-[var(--line)] shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              দ্বৈত স্বাক্ষর ও পৌর সম্মতি
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)] font-bangla flex items-center gap-3">
            পলিসি পরিবর্তন ও দ্বৈত অনুমোদন ডেস্ক
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
            সুরক্ষিত পৌর দায়িত্ব বিধি, টাস্ক সিকোয়েন্সিং এবং এআই কনফিডেন্স গেটের দ্বৈত অনুমোদন পর্যবেক্ষণ
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowProposeModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            নতুন নীতি প্রস্তাব দাখিল
          </button>
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Section Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveSection('policies')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
            activeSection === 'policies'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted/50 text-muted-foreground hover:text-foreground'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>পৌর পলিসি অনুমোদন (Policy Changes)</span>
        </button>

        <button
          onClick={() => {
            setActiveSection('privileged_roles');
            fetchPrivRequests();
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
            activeSection === 'privileged_roles'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-muted/50 text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>সিটি গভর্নেন্স পদবী অনুমোদন (Privileged Roles)</span>
          {privRequests.filter(r => r.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-amber-800 font-black">
              {toBanglaNumber(privRequests.filter(r => r.status === 'pending').length)}
            </span>
          )}
        </button>
      </div>

      {activeSection === 'policies' ? (
        <>
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-border text-xs">
            {[
              { key: 'all', label: 'সকল প্রস্তাবনা' },
              { key: 'pending_governance_approval', label: 'গভর্নেন্স পর্যালোচনার অপেক্ষায়' },
              { key: 'pending_technical_review', label: 'কারিগরি পর্যালোচনার অপেক্ষায়' },
              { key: 'approved', label: 'অনুমোদিত ও কার্যকর' },
              { key: 'rejected', label: 'বাতিলকৃত' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`pb-2.5 px-3 font-medium transition-colors border-b-2 -mb-px ${
                  filter === tab.key
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

      {/* Requests Table */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ক্যাটেগরি / বিষয়</th>
                <th className="py-3 px-4">প্রস্তাবিত সংস্করণ</th>
                <th className="py-3 px-4">যৌক্তিকতা ও প্রেক্ষাপট</th>
                <th className="py-3 px-4">কারিগরি সিদ্ধান্ত (অ্যাডমিন)</th>
                <th className="py-3 px-4">গভর্নেন্স সিদ্ধান্ত</th>
                <th className="py-3 px-4">স্থিতি</th>
                <th className="py-3 px-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    অনুমোদন তালিকা লোড হচ্ছে...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    কোনো পলিসি পরিবর্তনের প্রস্তাবনা পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      <div className="flex items-center gap-1.5 font-semibold">
                        {r.change_category === 'AI_CONFIDENCE_GATE' && <Sliders className="w-3.5 h-3.5 text-primary" />}
                        {r.change_category === 'TASK_SEQUENCING_RULE' && <GitFork className="w-3.5 h-3.5 text-primary" />}
                        {r.change_category === 'RESPONSIBILITY_RULE' && <Landmark className="w-3.5 h-3.5 text-primary" />}
                        {r.change_category}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        ID: {r.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-muted-foreground">{r.current_version || '1.0'}</span>
                      <span className="mx-1.5 text-muted-foreground">→</span>
                      <span className="font-bold text-foreground">{r.proposed_version}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-muted-foreground truncate" title={r.reason}>
                      {r.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.admin_decision === 'approved' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ অনুমোদিত</span>
                      ) : r.admin_decision === 'rejected' ? (
                        <span className="text-red-600 dark:text-red-400 font-medium">✕ প্রত্যাখ্যাত</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">অপেক্ষমাণ</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.governance_head_decision === 'approved' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ অনুমোদিত</span>
                      ) : r.governance_head_decision === 'rejected' ? (
                        <span className="text-red-600 dark:text-red-400 font-medium">✕ প্রত্যাখ্যাত</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">পর্যালোচনা আবশ্যক</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(r.approval_state, r.implementation_state)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReq(r)}
                        className="px-2.5 py-1 rounded border border-border hover:bg-muted text-foreground transition-colors"
                      >
                        বিস্তারিত ও সিদ্ধান্ত
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      ) : (
        /* Privileged Role Approvals Table */
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs">
            <h3 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>সিটি গভর্নেন্স প্রধান পদবী অনুমোদন ডেস্ক (Privileged Authority Elevation)</span>
            </h3>
            <p className="text-amber-800 dark:text-amber-300">
              ক্ষমতার বিভাজন নীতি অনুযায়ী সিস্টেম অ্যাডমিনিস্ট্রেটর একতরফাভাবে এই পদবী দিতে পারেন না। আপনার একক অনুমোদনে টার্গেট অ্যাকাউন্টের ভূমিকা পরিবর্তিত হবে।
            </p>
          </div>

          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">টার্গেট কর্মী</th>
                    <th className="py-3 px-4">অনুরোধকৃত পদবী</th>
                    <th className="py-3 px-4">আবেদনকারী অ্যাডমিন</th>
                    <th className="py-3 px-4">যৌক্তিকতা</th>
                    <th className="py-3 px-4">স্থিতি</th>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {privLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        অনুমোদন তালিকা লোড হচ্ছে...
                      </td>
                    </tr>
                  ) : privRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        কোনো প্রিভিলেজড রোল আবেদন পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    privRequests.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-foreground">{r.target_user_name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{r.target_user_email}</div>
                          <span className="text-[10px] text-muted-foreground">বর্তমান রোল: {r.target_user_current_role}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            {r.requested_role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-muted-foreground">
                          {r.requesting_admin_name || r.requesting_admin_id}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground max-w-xs">{r.justification}</td>
                        <td className="py-3.5 px-4">
                          {r.status === 'approved' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              অনুমোদিত
                            </span>
                          )}
                          {r.status === 'rejected' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              প্রত্যাখ্যাত
                            </span>
                          )}
                          {r.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              সিদ্ধান্ত আবশ্যক
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground font-mono">
                          {r.created_at?.slice(0, 10)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {r.status === 'pending' ? (
                            <button
                              onClick={() => {
                                setSelectedPrivReq(r);
                                setPrivDecisionNotes('');
                              }}
                              className="px-2.5 py-1 rounded bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors shadow-sm"
                            >
                              সিদ্ধান্ত দিন
                            </button>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">নিষ্পন্ন</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Privileged Role Decision Modal */}
      {selectedPrivReq && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>সিটি গভর্নেন্স পদবী অনুমোদন সিদ্ধান্ত</span>
              </h3>
              <button
                onClick={() => setSelectedPrivReq(null)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕ বন্ধ করুন
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-muted/40 rounded border border-border space-y-1">
                <div>টার্গেট কর্মী: <span className="font-bold text-foreground">{selectedPrivReq.target_user_name}</span></div>
                <div>আবেদনকৃত পদবী: <span className="font-bold text-amber-700 font-mono">{selectedPrivReq.requested_role}</span></div>
                <div>আবেদনকারী অ্যাডমিন: <span className="font-mono text-foreground">{selectedPrivReq.requesting_admin_name || selectedPrivReq.requesting_admin_id}</span></div>
                <div className="mt-1 text-muted-foreground">যৌক্তিকতা: {selectedPrivReq.justification}</div>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">গভর্নেন্স সিদ্ধান্ত নোট (Decision Notes):</label>
                <textarea
                  rows={3}
                  value={privDecisionNotes}
                  onChange={(e) => setPrivDecisionNotes(e.target.value)}
                  placeholder="অনুমোদন বা প্রত্যাখ্যানের কারণ ও পৌর রেফারেন্স..."
                  className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setSelectedPrivReq(null)}
                className="px-3.5 py-1.5 rounded text-xs border border-border text-muted-foreground hover:bg-muted"
              >
                বাতিল
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handlePrivDecision('reject')}
                className="px-3.5 py-1.5 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                প্রত্যাখ্যান করুন (Reject)
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handlePrivDecision('approve')}
                className="px-3.5 py-1.5 rounded text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                অনুমোদন ও কার্যকর করুন (Approve)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                পলিসি পরিবর্তন পর্যালোচনা ও সিদ্ধান্ত
              </h3>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕ বন্ধ করুন
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded border border-border/60">
                <div>
                  <span className="text-muted-foreground block">পলিসি ক্যাটেগরি:</span>
                  <span className="font-semibold text-foreground">{selectedReq.change_category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">সংস্করণ রূপান্তর:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {selectedReq.current_version || '1.0'} → {selectedReq.proposed_version}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block">প্রস্তাবনার যৌক্তিকতা:</span>
                  <p className="text-foreground mt-0.5">{selectedReq.reason}</p>
                </div>
              </div>

              {selectedReq.admin_notes && (
                <div className="p-3 bg-muted/20 border border-border rounded">
                  <span className="text-muted-foreground block font-medium">সিস্টেম অ্যাডমিনের কারিগরি নোট:</span>
                  <p className="text-foreground mt-0.5">{selectedReq.admin_notes}</p>
                </div>
              )}

              <div>
                <span className="text-muted-foreground block mb-1">প্রস্তাবিত কনফিগারেশন পে-লোড:</span>
                <pre className="p-2.5 rounded bg-muted/70 text-[11px] font-mono text-foreground overflow-x-auto max-h-36">
                  {JSON.stringify(selectedReq.proposed_configuration, null, 2)}
                </pre>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">গভর্নেন্স সিদ্ধান্ত নোট (বাধ্যতামূলক):</label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="পৌর কার্যনির্বাহী কমিটির অনুমোদন সূত্র অথবা বাতিলের কারণ উল্লেখ করুন..."
                  className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                onClick={() => setSelectedReq(null)}
                className="px-3.5 py-1.5 rounded text-xs border border-border text-muted-foreground hover:bg-muted"
              >
                ফিরে যান
              </button>
              <button
                disabled={actionLoading || !decisionNotes.trim()}
                onClick={() => handleDecision('reject')}
                className="px-3.5 py-1.5 rounded text-xs font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                বাতিল করুন (Reject)
              </button>
              <button
                disabled={actionLoading || !decisionNotes.trim()}
                onClick={() => handleDecision('approve')}
                className="px-3.5 py-1.5 rounded text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                অনুমোদন করুন (Approve)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Propose Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handlePropose} className="bg-card border border-border rounded-lg max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                নতুন পৌর নীতি প্রস্তাব উত্থাপন
              </h3>
              <button
                type="button"
                onClick={() => setShowProposeModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕ বন্ধ করুন
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">নীতি ক্যাটেগরি:</label>
                <select
                  value={propCategory}
                  onChange={(e) => setPropCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-xs"
                >
                  <option value="RESPONSIBILITY_RULE">RESPONSIBILITY_RULE (দায়িত্ব নির্ধারণ বিধি)</option>
                  <option value="TASK_SEQUENCING_RULE">TASK_SEQUENCING_RULE (টাস্ক সিকোয়েন্সিং রুল)</option>
                  <option value="AI_CONFIDENCE_GATE">AI_CONFIDENCE_GATE (এআই কনফিডেন্স গেট)</option>
                  <option value="SLA_POLICY">SLA_POLICY (এসএলএ পলিসি)</option>
                  <option value="PUBLIC_DASHBOARD">PUBLIC_DASHBOARD (পাবলিক ড্যাশবোর্ড পলিসি)</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">প্রস্তাবিত সংস্করণ নম্বর:</label>
                <input
                  type="text"
                  value={propVersion}
                  onChange={(e) => setPropVersion(e.target.value)}
                  placeholder="যেমন: 1.3"
                  className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">প্রস্তাবনার যৌক্তিকতা ও প্রেক্ষাপট:</label>
                <textarea
                  rows={3}
                  value={propReason}
                  onChange={(e) => setPropReason(e.target.value)}
                  placeholder="কী কারণে নীতি পরিবর্তন প্রয়োজন তা বিশদভাবে বর্ণনা করুন..."
                  className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">প্রস্তাবিত কনফিগারেশন JSON:</label>
                <textarea
                  rows={4}
                  value={propPayloadStr}
                  onChange={(e) => setPropPayloadStr(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-border bg-background text-foreground font-mono text-[11px]"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowProposeModal(false)}
                className="px-3.5 py-1.5 rounded text-xs border border-border text-muted-foreground hover:bg-muted"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                প্রস্তাব দাখিল করুন
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
