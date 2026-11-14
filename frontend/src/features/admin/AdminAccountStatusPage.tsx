import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  Users, UserPlus, Shield, ShieldCheck, ShieldAlert, Lock, Unlock,
  Key, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Search, Filter,
  History, Clock, FileText, ArrowRight, Copy, Check, Eye, EyeOff, LogOut,
  UserCheck, ShieldOff, ChevronLeft, ChevronRight, AlertCircle, Award
} from 'lucide-react';

export const AdminAccountStatusPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  // Active Tab: 'dashboard' | 'directory' | 'create' | 'identifiers' | 'security' | 'privileged'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'create' | 'identifiers' | 'security' | 'privileged'>('dashboard');

  // Loading states
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(true);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Data states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [accountsData, setAccountsData] = useState<{ total: number; page: number; limit: number; accounts: any[] }>({
    total: 0,
    page: 1,
    limit: 15,
    accounts: []
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [privilegedRequests, setPrivilegedRequests] = useState<any[]>([]);

  // Directory Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>('active');
  const [statusReason, setStatusReason] = useState<string>('');

  const [showIdentifierModal, setShowIdentifierModal] = useState<boolean>(false);
  const [identifierType, setIdentifierType] = useState<string>('email');
  const [newIdentifierVal, setNewIdentifierVal] = useState<string>('');
  const [identifierReason, setIdentifierReason] = useState<string>('');

  const [showIdentifierHistoryModal, setShowIdentifierHistoryModal] = useState<boolean>(false);
  const [userIdentifierHistory, setUserIdentifierHistory] = useState<any[]>([]);

  const [showResetPasswordModal, setShowResetPasswordModal] = useState<boolean>(false);
  const [resetReason, setResetReason] = useState<string>('প্রশাসনিক অনুমোদন অনুযায়ী পাসওয়ার্ড রিসেট');
  const [requireChangeAtLogin, setRequireChangeAtLogin] = useState<boolean>(true);
  const [revokeSessionsOnReset, setRevokeSessionsOnReset] = useState<boolean>(true);

  // One-time Temporary Password Display Modal
  const [temporaryPasswordData, setTemporaryPasswordData] = useState<{
    user_name: string;
    identifier: string;
    temporary_password: string;
    expires_in_hours: number;
    must_change_password: boolean;
  } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);

  // Create User Form State
  const [createFormData, setCreateFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'ward_desk',
    department_id: '',
    ward_id: '',
    account_status: 'active',
    require_password_change: true
  });

  // Privileged Role Request Modal
  const [showPrivilegedModal, setShowPrivilegedModal] = useState<boolean>(false);
  const [privTargetUserId, setPrivTargetUserId] = useState<string>('');
  const [privRequestedRole, setPrivRequestedRole] = useState<string>('governance_head');
  const [privJustification, setPrivJustification] = useState<string>('');

  // ----------------------------------------------------
  // Initial Data Fetching
  // ----------------------------------------------------
  const fetchDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const data = await apiClient.admin.getAccountsDashboard();
      setDashboardData(data);
    } catch (e) {
      console.error('Failed to load dashboard', e);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchAccounts = async (page = currentPage) => {
    setLoadingAccounts(true);
    try {
      const data = await apiClient.admin.getAccountsPaginated({
        page,
        limit: 15,
        search: searchQuery || undefined,
        role: filterRole || undefined,
        account_status: filterStatus || undefined
      });
      setAccountsData(data || { total: 0, page: 1, limit: 15, accounts: [] });
    } catch (e) {
      console.error('Failed to load accounts list', e);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const fetchSecurityEvents = async () => {
    setLoadingHistory(true);
    try {
      const events = await apiClient.admin.getSecurityHistory({ limit: 40 });
      setSecurityEvents(events || []);
    } catch (e) {
      console.error('Failed to load security events', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchPrivilegedRequests = async () => {
    try {
      const list = await apiClient.admin.getPrivilegedRoleRequests();
      setPrivilegedRequests(list || []);
    } catch (e) {
      console.error('Failed to load privileged requests', e);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchPrivilegedRequests();
    // Load departments & wards for creation form
    apiClient.admin.getDepartments().then(setDepartments).catch(() => {});
    apiClient.admin.getWards().then(setWards).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'directory') {
      fetchAccounts(currentPage);
    } else if (activeTab === 'security') {
      fetchSecurityEvents();
    } else if (activeTab === 'privileged') {
      fetchPrivilegedRequests();
    }
  }, [activeTab, currentPage, filterRole, filterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAccounts(1);
  };

  // ----------------------------------------------------
  // Action Handlers
  // ----------------------------------------------------
  const handleUpdateStatus = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await apiClient.admin.updateAccountStatus(selectedUser.id, newStatus, statusReason);
      showSuccess(res.message_bn || 'অ্যাকাউন্ট স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে।');
      setShowStatusModal(false);
      setSelectedUser(null);
      setStatusReason('');
      fetchAccounts(currentPage);
      fetchDashboard();
    } catch (e: any) {
      showError(e.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeIdentifier = async () => {
    if (!selectedUser || !newIdentifierVal.trim()) {
      showError('নতুন শনাক্তকারী প্রদান আবশ্যক।');
      return;
    }
    setActionLoading(true);
    try {
      const res = await apiClient.admin.changeLoginIdentifier(selectedUser.id, {
        identifier_type: identifierType,
        new_identifier: newIdentifierVal.trim(),
        reason: identifierReason
      });
      showSuccess(res.message_bn || 'লগইন শনাক্তকারী সফলভাবে পরিবর্তিত হয়েছে।');
      setShowIdentifierModal(false);
      setSelectedUser(null);
      setNewIdentifierVal('');
      setIdentifierReason('');
      fetchAccounts(currentPage);
      fetchDashboard();
    } catch (e: any) {
      showError(e.message || 'শনাক্তকারী পরিবর্তন ব্যর্থ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewIdentifierHistory = async (user: any) => {
    setSelectedUser(user);
    try {
      const hist = await apiClient.admin.getIdentifierHistory(user.id);
      setUserIdentifierHistory(hist || []);
      setShowIdentifierHistoryModal(true);
    } catch (e: any) {
      showError(e.message || 'ইতিহাস লোড করতে ব্যর্থ');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await apiClient.admin.resetPasswordAdmin(selectedUser.id, {
        require_change_at_next_login: requireChangeAtLogin,
        revoke_existing_sessions: revokeSessionsOnReset,
        reason: resetReason
      });
      setShowResetPasswordModal(false);
      // Open the one-time temporary password display
      setTemporaryPasswordData({
        user_name: selectedUser.full_name,
        identifier: selectedUser.email || selectedUser.phone || selectedUser.id,
        temporary_password: res.temporary_password,
        expires_in_hours: res.expires_in_hours || 24,
        must_change_password: res.must_change_password
      });
      setSelectedUser(null);
      showSuccess('পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে।');
      fetchDashboard();
    } catch (e: any) {
      showError(e.message || 'পাসওয়ার্ড রিসেট ব্যর্থ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeSessions = async (userId: string, userName: string) => {
    if (!confirm(`${userName}-এর সকল সক্রিয় লগইন সেশন বাতিল করতে চান?`)) return;
    try {
      await apiClient.admin.revokeSessions(userId);
      showSuccess(`${userName}-এর সকল সক্রিয় সেশন সফলভাবে বাতিল করা হয়েছে।`);
      fetchDashboard();
    } catch (e: any) {
      showError(e.message || 'সেশন বাতিল ব্যর্থ');
    }
  };

  const handleForcePasswordChange = async (userId: string, userName: string) => {
    try {
      await apiClient.admin.forcePasswordChange(userId);
      showSuccess(`${userName}-এর জন্য পরবর্তী লগইনে বাধ্যতামূলক পাসওয়ার্ড পরিবর্তন সক্রিয় করা হয়েছে।`);
      fetchAccounts(currentPage);
      fetchDashboard();
    } catch (e: any) {
      showError(e.message || 'বাধ্যতামূলক পাসওয়ার্ড পরিবর্তন সেট ব্যর্থ');
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.full_name.trim() || !createFormData.email.trim()) {
      showError('পূর্ণ নাম এবং ইমেইল প্রদান করা আবশ্যক।');
      return;
    }

    if (createFormData.role === 'governance_head') {
      showError('সিস্টেম অ্যাডমিনিস্ট্রেটর একতরফাভাবে সিটি গভর্নেন্স প্রধান পদবী বরাদ্দ করতে পারবেন না। বিশেষ অনুমোদন ট্যাব ব্যবহার করুন।');
      return;
    }

    setActionLoading(true);
    try {
      const res = await apiClient.admin.createUser({
        full_name: createFormData.full_name.trim(),
        email: createFormData.email.trim(),
        phone: createFormData.phone.trim() || undefined,
        role: createFormData.role,
        account_status: createFormData.account_status,
        require_password_change: createFormData.require_password_change,
        assigned_department_ids: createFormData.department_id ? [createFormData.department_id] : [],
        assigned_ward_ids: createFormData.ward_id ? [createFormData.ward_id] : []
      });

      // Show temporary password if generated
      if (res.temporary_password) {
        setTemporaryPasswordData({
          user_name: createFormData.full_name,
          identifier: createFormData.email,
          temporary_password: res.temporary_password,
          expires_in_hours: res.expires_in_hours || 24,
          must_change_password: res.must_change_password
        });
      }

      showSuccess('সদস্য অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।');
      setCreateFormData({
        full_name: '',
        email: '',
        phone: '',
        role: 'ward_desk',
        department_id: '',
        ward_id: '',
        account_status: 'active',
        require_password_change: true
      });
      fetchDashboard();
      setActiveTab('directory');
    } catch (e: any) {
      showError(e.message || 'অ্যাকাউন্ট তৈরি ব্যর্থ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitPrivilegedRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privTargetUserId || !privJustification.trim()) {
      showError('টার্গেট ব্যবহারকারী ও প্রশাসনিক যৌক্তিকতা আবশ্যক।');
      return;
    }
    setActionLoading(true);
    try {
      const res = await apiClient.admin.submitPrivilegedRoleRequest({
        target_user_id: privTargetUserId,
        requested_role: privRequestedRole,
        justification: privJustification.trim()
      });
      showSuccess(res.message_bn || 'সিটি গভর্নেন্স প্রধান অনুমোদন আবেদন সফলভাবে দাখিল হয়েছে।');
      setShowPrivilegedModal(false);
      setPrivJustification('');
      setPrivTargetUserId('');
      fetchPrivilegedRequests();
      fetchDashboard();
    } catch (e: any) {
      showError(e.message || 'বিশেষ ভূমিকা আবেদন দাখিল ব্যর্থ');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'governance_head':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">সিটি গভর্নেন্স প্রধান</span>;
      case 'admin':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300">সিস্টেম অ্যাডমিন</span>;
      case 'coordinator':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">কেস কোঅর্ডিনেটর</span>;
      case 'dept_officer':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">দপ্তর কর্মকর্তা</span>;
      case 'ward_desk':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-300">ওয়ার্ড ডেস্ক</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-800 border border-neutral-300">নাগরিক (Citizen)</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 className="w-3 h-3" /> সক্রিয়</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300"><Clock className="w-3 h-3" /> অপেক্ষারত</span>;
      case 'suspended':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300"><Lock className="w-3 h-3" /> স্থগিত</span>;
      case 'deactivated':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-neutral-200 text-neutral-700 border border-neutral-300"><ShieldOff className="w-3 h-3" /> নিষ্ক্রিয়</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              সিস্টেম অ্যাডমিনিস্ট্রেটর ওয়ার্কস্পেস • নিরাপত্তা প্রশাসন
            </span>
            <span className="text-xs text-[var(--muted)]">অ্যাকাউন্ট ও পরিচিতি ব্যবস্থাপনা (IAM)</span>
          </div>
          <h1 className="text-2xl font-black text-[var(--ink)] tracking-tight">
            অ্যাকাউন্ট ব্যবস্থাপনা ও পরিচয় নিরাপত্তা (Account & Identity Management)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            নাগরিকের তথ্যের সুরক্ষা বজায় রেখে কর্মকর্তা-কর্মচারীদের একাউন্ট লাইফসাইকেল, পরিচয় পরিবর্তন ও পাসওয়ার্ড নিরাপত্তা পরিচালনা
          </p>
        </div>

        {/* Global Action Quick Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>নতুন সদস্য অ্যাকাউন্ট</span>
          </button>
          <button
            onClick={() => setShowPrivilegedModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-sm"
          >
            <Award className="w-4 h-4" />
            <span>সিটি গভর্নেন্স পদবী আবেদন</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] overflow-x-auto pb-px text-xs font-bold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-[var(--ink)] text-[var(--ink)]'
              : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>ড্যাশবোর্ড ও মেট্রিক্স</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'directory'
              ? 'border-[var(--ink)] text-[var(--ink)]'
              : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>অ্যাকাউন্ট ডিরেক্টরি ({dashboardData ? toBanglaNumber(dashboardData.summary?.total_accounts || 0) : '...'})</span>
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'create'
              ? 'border-[var(--ink)] text-[var(--ink)]'
              : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>নতুন অ্যাকাউন্ট তৈরি</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-[var(--ink)] text-[var(--ink)]'
              : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>নিরাপত্তা ও পাসওয়ার্ড লগ</span>
        </button>

        <button
          onClick={() => setActiveTab('privileged')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'privileged'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400'
              : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>বিশেষ ভূমিকা আবেদন ({toBanglaNumber(privilegedRequests.filter(r => r.status === 'pending').length)})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DASHBOARD & METRICS                                                */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {loadingDashboard ? (
            <div className="p-12 text-center text-sm text-[var(--muted)]">ড্যাশবোর্ড তথ্য লোড হচ্ছে...</div>
          ) : (
            <>
              {/* Top Row KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>সর্বমোট অ্যাকাউন্ট</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-black text-[var(--ink)]">
                    {toBanglaNumber(dashboardData?.summary?.total_accounts || 0)}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">নিবন্ধিত প্রোফাইল</p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>সক্রিয় (Active)</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {toBanglaNumber(dashboardData?.summary?.active_accounts || 0)}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">লগইন ও কার্যক্রম সচল</p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>অপেক্ষারত (Pending)</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {toBanglaNumber(dashboardData?.summary?.pending_accounts || 0)}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">ভেরিফিকেশন বাকি</p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>স্থগিত (Suspended)</span>
                    <Lock className="w-4 h-4 text-rose-600" />
                  </div>
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    {toBanglaNumber(dashboardData?.summary?.suspended_accounts || 0)}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">প্রশাসনিক সাময়িক লক</p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>লকআউট (Lockout)</span>
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-2xl font-black text-red-700 dark:text-red-400">
                    {toBanglaNumber(dashboardData?.summary?.locked_accounts || 0)}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">৫টি ব্যর্থ লগইনে লক</p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>বাধ্যতামূলক পাসওয়ার্ড বদল</span>
                    <Key className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    {toBanglaNumber(dashboardData?.summary?.must_change_password_count || 0)}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">পরবর্তী লগইনে পরিবর্তন</p>
                </div>
              </div>

              {/* Two Column Grid: Review Queue & Security Events */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Accounts Requiring Review */}
                <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>প্রশাসনিক পর্যালোচনা আবশ্যক (Accounts Requiring Review)</span>
                    </h3>
                    <span className="text-xs text-[var(--muted)]">
                      {toBanglaNumber(dashboardData?.accounts_requiring_review?.length || 0)} টি অ্যাকাউন্ট
                    </span>
                  </div>

                  {(!dashboardData?.accounts_requiring_review || dashboardData.accounts_requiring_review.length === 0) ? (
                    <div className="p-6 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--line)] rounded-lg">
                      কোনো অ্যাকাউন্টে জরুরি পর্যালোচনা আবশ্যক নেই।
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--line)] text-xs">
                      {dashboardData.accounts_requiring_review.map((item: any) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                          <div>
                            <p className="font-bold text-[var(--ink)]">{item.full_name}</p>
                            <p className="text-[11px] text-[var(--muted)]">{item.identifier}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {getRoleBadge(item.role)}
                              <span className="text-[10px] text-rose-600 font-bold">{item.flag_reason}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedUser(item);
                              setShowStatusModal(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold rounded bg-[var(--bg)] border border-[var(--line)] hover:bg-[var(--line)] transition-all"
                          >
                            পদক্ষেপ নিন
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Login-Identifier Changes */}
                <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-600" />
                      <span>সাম্প্রতিক ইউজারনেম ও লগইন আইডি পরিবর্তন (Identifier Changes)</span>
                    </h3>
                    <span className="text-xs text-[var(--muted)]">অপরিবর্তনীয় অডিট লগ</span>
                  </div>

                  {(!dashboardData?.recent_identifier_changes || dashboardData.recent_identifier_changes.length === 0) ? (
                    <div className="p-6 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--line)] rounded-lg">
                      সাম্প্রতিক কোনো লগইন শনাক্তকারী পরিবর্তন নথিভুক্ত হয়নি।
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--line)] text-xs">
                      {dashboardData.recent_identifier_changes.map((item: any) => (
                        <div key={item.id} className="py-2.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[var(--ink)]">{item.user_name}</span>
                            <span className="text-[11px] text-[var(--muted)] font-mono">{formatBanglaDate(item.changed_at)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-neutral-500 font-mono">{item.old_identifier || '(নেই)'}</span>
                            <ArrowRight className="w-3 h-3 text-[var(--muted)]" />
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">{item.new_identifier}</span>
                          </div>
                          {item.reason && (
                            <p className="text-[10px] text-[var(--muted)] italic">কারণ: {item.reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Row: Recent Security Events Preview */}
              <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>সাম্প্রতিক নিরাপত্তা কার্যক্রম ও পাসওয়ার্ড ইভেন্ট ট্রেইল</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('security')}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>সম্পূর্ণ লগ দেখুন</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                        <th className="py-2 px-3 font-semibold">ইভেন্ট</th>
                        <th className="py-2 px-3 font-semibold">অ্যাকাউন্ট আইডি</th>
                        <th className="py-2 px-3 font-semibold">কর্তা (Actor)</th>
                        <th className="py-2 px-3 font-semibold">সময়</th>
                        <th className="py-2 px-3 font-semibold">ফলাফল</th>
                        <th className="py-2 px-3 font-semibold">অডিট হ্যাশ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]">
                      {dashboardData?.recent_security_events?.map((ev: any) => (
                        <tr key={ev.id} className="hover:bg-[var(--bg)]/50">
                          <td className="py-2 px-3 font-mono font-bold text-[var(--ink)]">{ev.action}</td>
                          <td className="py-2 px-3 font-mono text-[var(--muted)]">{ev.resource_id?.slice(0, 8)}...</td>
                          <td className="py-2 px-3 text-[var(--muted)]">{ev.actor_role}</td>
                          <td className="py-2 px-3 text-[var(--muted)] font-mono">{formatBanglaDate(ev.created_at)}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              SUCCESS
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-[10px] text-neutral-400">
                            {ev.integrity_hash?.slice(0, 10)}...
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ACCOUNT DIRECTORY (Search, Filter, Actions, Lifecycle Transitions) */}
      {/* ========================================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] flex flex-col md:flex-row items-center gap-3 justify-between">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="নাম, মাস্কড ইমেইল বা ফোন দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 text-xs font-bold rounded-lg bg-[var(--ink)] text-[var(--bg)] hover:opacity-90"
              >
                অনুসন্ধান
              </button>
            </form>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] font-medium"
              >
                <option value="">সকল ভূমিকা (All Roles)</option>
                <option value="governance_head">সিটি গভর্নেন্স প্রধান</option>
                <option value="admin">সিস্টেম অ্যাডমিন</option>
                <option value="coordinator">কেস কোঅর্ডিনেটর</option>
                <option value="dept_officer">দপ্তর কর্মকর্তা</option>
                <option value="ward_desk">ওয়ার্ড ডেস্ক</option>
                <option value="citizen">নাগরিক (Citizen)</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] font-medium"
              >
                <option value="">সকল স্ট্যাটাস (All Status)</option>
                <option value="active">সক্রিয় (Active)</option>
                <option value="pending">অপেক্ষারত (Pending)</option>
                <option value="suspended">স্থগিত (Suspended)</option>
                <option value="deactivated">নিষ্ক্রিয় (Deactivated)</option>
              </select>

              <button
                onClick={() => fetchAccounts(currentPage)}
                className="p-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:bg-[var(--line)] text-[var(--ink)]"
                title="রিফ্রেশ"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>মোট অ্যাকাউন্ট: {toBanglaNumber(accountsData.total)} জন</span>
              <span>পৃষ্ঠা: {toBanglaNumber(accountsData.page)}</span>
            </div>

            {loadingAccounts ? (
              <div className="p-12 text-center text-xs text-[var(--muted)]">লোড হচ্ছে...</div>
            ) : accountsData.accounts.length === 0 ? (
              <div className="p-12 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--line)] rounded-lg">
                কোনো অ্যাকাউন্ট পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                      <th className="py-2.5 px-3 font-semibold">সদস্য ও পরিচিতি</th>
                      <th className="py-2.5 px-3 font-semibold">ভূমিকা (Role)</th>
                      <th className="py-2.5 px-3 font-semibold">লাইফসাইকেল স্ট্যাটাস</th>
                      <th className="py-2.5 px-3 font-semibold">নিরাপত্তা অবস্থা</th>
                      <th className="py-2.5 px-3 font-semibold">নিবন্ধন তারিখ</th>
                      <th className="py-2.5 px-3 font-semibold text-right">প্রশাসনিক পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {accountsData.accounts.map((user: any) => (
                      <tr key={user.id} className="hover:bg-[var(--bg)]/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-[var(--ink)]">{user.full_name}</div>
                          <div className="text-[11px] text-[var(--muted)] font-mono">{user.identifier}</div>
                          {user.is_verified && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                              <CheckCircle2 className="w-2.5 h-2.5" /> যাচাইকৃত
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="py-3 px-3">
                          {getStatusBadge(user.account_status)}
                        </td>
                        <td className="py-3 px-3 space-y-1">
                          {user.is_locked ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              🔒 লকড (Lockout)
                            </span>
                          ) : (
                            <span className="inline-block text-[10px] text-emerald-600 font-medium">স্বাভাবিক</span>
                          )}
                          {user.must_change_password && (
                            <div>
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                🔑 পাসওয়ার্ড পরিবর্তন আবশ্যক
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-[var(--muted)]">
                          {formatBanglaDate(user.created_at)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Lifecycle Status Button */}
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setNewStatus(user.account_status || 'active');
                                setShowStatusModal(true);
                              }}
                              className="px-2 py-1 text-[11px] font-bold rounded bg-[var(--bg)] border border-[var(--line)] hover:bg-[var(--line)] text-[var(--ink)]"
                              title="স্ট্যাটাস পরিবর্তন (সক্রিয়/স্থগিত/নিষ্ক্রিয়)"
                            >
                              স্ট্যাটাস
                            </button>

                            {/* Password Reset */}
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowResetPasswordModal(true);
                              }}
                              className="px-2 py-1 text-[11px] font-bold rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 hover:bg-amber-100"
                              title="পাসওয়ার্ড রিসেট ও টেম্পোরারি পাসওয়ার্ড"
                            >
                              রিসেট
                            </button>

                            {/* Change Identifier */}
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIdentifierType('email');
                                setNewIdentifierVal('');
                                setShowIdentifierModal(true);
                              }}
                              className="px-2 py-1 text-[11px] font-bold rounded bg-[var(--bg)] border border-[var(--line)] hover:bg-[var(--line)] text-[var(--ink)]"
                              title="লগইন ইমেইল বা আইডি পরিবর্তন"
                            >
                              আইডি বদল
                            </button>

                            {/* View Identifier History */}
                            <button
                              onClick={() => handleViewIdentifierHistory(user)}
                              className="p-1 rounded bg-[var(--bg)] border border-[var(--line)] hover:bg-[var(--line)] text-[var(--muted)]"
                              title="আইডি পরিবর্তনের ইতিহাস"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>

                            {/* Revoke Sessions */}
                            <button
                              onClick={() => handleRevokeSessions(user.id, user.full_name)}
                              className="p-1 rounded bg-[var(--bg)] border border-[var(--line)] hover:bg-rose-50 hover:text-rose-600 text-[var(--muted)]"
                              title="সেশন বাতিল করুন"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {accountsData.total > accountsData.limit && (
              <div className="flex items-center justify-between pt-4 border-t border-[var(--line)] text-xs">
                <span className="text-[var(--muted)]">
                  পৃষ্ঠা {toBanglaNumber(accountsData.page)} / {toBanglaNumber(Math.ceil(accountsData.total / accountsData.limit))}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded border border-[var(--line)] bg-[var(--bg)] disabled:opacity-40 hover:bg-[var(--line)]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage >= Math.ceil(accountsData.total / accountsData.limit)}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-1.5 rounded border border-[var(--line)] bg-[var(--bg)] disabled:opacity-40 hover:bg-[var(--line)]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CREATE MEMBER ACCOUNT                                              */}
      {/* ========================================================================= */}
      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto p-6 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-5">
          <div className="border-b border-[var(--line)] pb-3">
            <h2 className="text-lg font-bold text-[var(--ink)] flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              <span>নতুন সদস্য বা কর্মকর্তা অ্যাকাউন্ট তৈরি (Provision Member Account)</span>
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              অনুমোদিত রোল ও স্কোপ অনুযায়ী নতুন কর্মী অ্যাকাউন্ট তালিকাভুক্ত করুন। ডিফল্ট শক্তিশালী টেম্পোরারি পাসওয়ার্ড স্বয়ংক্রিয়ভাবে তৈরি হবে।
            </p>
          </div>

          <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[var(--ink)] mb-1">পূর্ণ নাম (Full Name) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: ইঞ্জিনিয়ার আবুল হাসনাত"
                value={createFormData.full_name}
                onChange={(e) => setCreateFormData({ ...createFormData, full_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">লগইন ইমেইল (Login Email) *</label>
                <input
                  type="email"
                  required
                  placeholder="user@municipality.gov.bd"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">মোবাইল নম্বর (Official Phone)</label>
                <input
                  type="text"
                  placeholder="০১৭১১০০০০০০"
                  value={createFormData.phone}
                  onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">দায়িত্ব ও ভূমিকা (Role) *</label>
                <select
                  value={createFormData.role}
                  onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] font-medium"
                >
                  <option value="ward_desk">ওয়ার্ড ডেস্ক (Ward Desk Staff)</option>
                  <option value="dept_officer">দপ্তর কর্মকর্তা (Department Officer)</option>
                  <option value="coordinator">কেস কোঅর্ডিনেটর (Case Coordinator)</option>
                  <option value="admin">সিস্টেম অ্যাডমিনিস্ট্রেটর (Technical Admin)</option>
                  <option value="governance_head">সিটি গভর্নেন্স প্রধান (City Governance Head - সীমাবদ্ধ)</option>
                  <option value="citizen">নাগরিক (Citizen)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">প্রাথমিক অ্যাকাউন্ট স্ট্যাটাস</label>
                <select
                  value={createFormData.account_status}
                  onChange={(e) => setCreateFormData({ ...createFormData, account_status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] font-medium"
                >
                  <option value="active">সরাসরি সক্রিয় (Active)</option>
                  <option value="pending">অপেক্ষারত ও যাচাই আবশ্যক (Pending)</option>
                </select>
              </div>
            </div>

            {/* Privileged Role Warning */}
            {createFormData.role === 'governance_head' && (
              <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>সীমাবদ্ধ ভূমিকা (Privileged Role Restriction)</span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  ক্ষমতার পৃথকীকরণ নীতি অনুযায়ী, সিস্টেম অ্যাডমিনিস্ট্রেটর একতরফাভাবে সিটি গভর্নেন্স প্রধান পদবী দিতে পারেন না। এটি করতে &apos;বিশেষ ভূমিকা আবেদন&apos; ট্যাব থেকে গভর্নেন্স প্রধানের অনুমোদন দাখিল করুন।
                </p>
              </div>
            )}

            {/* Department Scope (if dept_officer) */}
            {createFormData.role === 'dept_officer' && (
              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">দপ্তর স্কোপ (Department Scope)</label>
                <select
                  value={createFormData.department_id}
                  onChange={(e) => setCreateFormData({ ...createFormData, department_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] font-medium"
                >
                  <option value="">দপ্তর নির্বাচন করুন</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name_bn || d.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Ward Scope (if ward_desk) */}
            {createFormData.role === 'ward_desk' && (
              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">ওয়ার্ড স্কোপ (Ward Scope)</label>
                <select
                  value={createFormData.ward_id}
                  onChange={(e) => setCreateFormData({ ...createFormData, ward_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] font-medium"
                >
                  <option value="">ওয়ার্ড নির্বাচন করুন</option>
                  {wards.map((w: any) => (
                    <option key={w.id} value={w.id}>ওয়ার্ড {w.ward_number_bn || w.ward_number}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Security Hygiene Checkbox */}
            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createFormData.require_password_change}
                  onChange={(e) => setCreateFormData({ ...createFormData, require_password_change: e.target.checked })}
                  className="rounded text-[var(--ink)] focus:ring-[var(--ink)]"
                />
                <span className="font-bold text-[var(--ink)]">প্রথম লগইনে বাধ্যতামূলক পাসওয়ার্ড পরিবর্তন (Forced Password Change)</span>
              </label>
              <p className="text-[11px] text-[var(--muted)] pl-5">
                সদস্য প্রথমবার অস্থায়ী পাসওয়ার্ড দিয়ে প্রবেশের পরই নতুন পাসওয়ার্ড সেট করতে বাধ্য হবেন।
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('directory')}
                className="px-4 py-2 rounded-lg border border-[var(--line)] hover:bg-[var(--line)] text-[var(--ink)]"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={actionLoading || createFormData.role === 'governance_head'}
                className="px-5 py-2 rounded-lg bg-[var(--ink)] text-[var(--bg)] font-bold hover:opacity-90 disabled:opacity-40 transition-all"
              >
                {actionLoading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি নিশ্চিত করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SECURITY & PASSWORD ACTIVITY HISTORY                               */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span>নিরাপত্তা ও পাসওয়ার্ড কার্যকলাপ ইতিহাস (Security & Password History)</span>
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                লগইন ব্যর্থতা, লকআউট, পাসওয়ার্ড পরিবর্তন ও সেশন বাতিলের অপরিবর্তনীয় নিরাপত্তা অডিট লগ
              </p>
            </div>
            <button
              onClick={fetchSecurityEvents}
              className="p-2 rounded-lg border border-[var(--line)] hover:bg-[var(--line)] text-[var(--ink)]"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loadingHistory ? (
            <div className="p-12 text-center text-xs text-[var(--muted)]">নিরাপত্তা লগ লোড হচ্ছে...</div>
          ) : securityEvents.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--line)] rounded-lg">
              কোনো নিরাপত্তা ইভেন্ট নথিভুক্ত হয়নি।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                    <th className="py-2.5 px-3 font-semibold">ইভেন্ট টাইপ</th>
                    <th className="py-2.5 px-3 font-semibold">টার্গেট রিসোর্স</th>
                    <th className="py-2.5 px-3 font-semibold">কর্তা (Actor)</th>
                    <th className="py-2.5 px-3 font-semibold">কারণ / নোট</th>
                    <th className="py-2.5 px-3 font-semibold">তারিখ ও সময়</th>
                    <th className="py-2.5 px-3 font-semibold">ইনটিগ্রিটি হ্যাশ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {securityEvents.map((ev: any) => (
                    <tr key={ev.id} className="hover:bg-[var(--bg)]/50">
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold text-[var(--ink)]">{ev.action}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[var(--muted)]">
                        {ev.resource_type}: {ev.resource_id?.slice(0, 8)}...
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--bg)] border border-[var(--line)]">
                          {ev.actor_role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[var(--muted)]">
                        {ev.reason || 'স্বাভাবিক নিরাপত্তা ইভেন্ট'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[var(--muted)]">
                        {formatBanglaDate(ev.created_at)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-emerald-600">
                        {ev.integrity_hash?.slice(0, 12)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PRIVILEGED ROLE REQUESTS (Dual Review Workflow)                    */}
      {/* ========================================================================= */}
      {activeTab === 'privileged' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span>সিটি গভর্নেন্স প্রধান পদবী অনুমোদন প্রক্রিয়া (Dual Authority Workflow)</span>
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                সিস্টেম অ্যাডমিন কোনো অ্যাকাউন্টকে একক সিদ্ধান্তে &apos;সিটি গভর্নেন্স প্রধান&apos; পদে উন্নীত করতে পারবেন না। আবেদনের পর বর্তমান সিটি গভর্নেন্স প্রধানের অনুমোদন সাপেক্ষে পদবী কার্যকর হবে।
              </p>
            </div>
            <button
              onClick={() => setShowPrivilegedModal(true)}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-all whitespace-nowrap shadow-sm"
            >
              নতুন অনুমোদন আবেদন দাখিল
            </button>
          </div>

          <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
            <h3 className="font-bold text-sm text-[var(--ink)]">আবেদন ও অনুমোদনের তালিকা (Privileged Role Requests Trail)</h3>

            {privilegedRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--line)] rounded-lg">
                কোনো প্রিভিলেজড রোল আবেদন পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                      <th className="py-2.5 px-3 font-semibold">টার্গেট ব্যবহারকারী</th>
                      <th className="py-2.5 px-3 font-semibold">আবেদনকৃত পদবী</th>
                      <th className="py-2.5 px-3 font-semibold">যৌক্তিকতা (Justification)</th>
                      <th className="py-2.5 px-3 font-semibold">স্ট্যাটাস</th>
                      <th className="py-2.5 px-3 font-semibold">তারিখ</th>
                      <th className="py-2.5 px-3 font-semibold">গভর্নেন্স সিদ্ধান্ত নোট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {privilegedRequests.map((r: any) => (
                      <tr key={r.id} className="hover:bg-[var(--bg)]/50">
                        <td className="py-3 px-3">
                          <div className="font-bold text-[var(--ink)]">{r.target_user_name || r.target_user_id}</div>
                          <div className="text-[11px] text-[var(--muted)]">{r.target_user_email}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            {r.requested_role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[var(--muted)] max-w-xs">{r.justification}</td>
                        <td className="py-3 px-3">
                          {r.status === 'approved' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              অনুমোদিত (Approved)
                            </span>
                          )}
                          {r.status === 'rejected' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              প্রত্যাখ্যাত (Rejected)
                            </span>
                          )}
                          {r.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              অপেক্ষারত (Pending Review)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-[var(--muted)]">
                          {formatBanglaDate(r.created_at)}
                        </td>
                        <td className="py-3 px-3 text-[var(--muted)] italic">
                          {r.decision_notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ONE-TIME TEMPORARY PASSWORD DISPLAY DIALOG                       */}
      {/* ========================================================================= */}
      {temporaryPasswordData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6 space-y-5 animate-scale-up">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[var(--ink)]">এককালীন অস্থায়ী পাসওয়ার্ড (Temporary Password)</h3>
              <p className="text-xs text-[var(--muted)]">
                অ্যাকাউন্ট: <span className="font-bold text-[var(--ink)]">{temporaryPasswordData.user_name}</span> ({temporaryPasswordData.identifier})
              </p>
            </div>

            {/* Password Display Box */}
            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-center space-y-2">
              <div className="text-2xl font-mono font-black tracking-wider text-[var(--ink)] select-all py-1">
                {temporaryPasswordData.temporary_password}
              </div>
              <button
                onClick={() => copyToClipboard(temporaryPasswordData.temporary_password)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 transition-all"
              >
                {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPassword ? 'কপি হয়েছে!' : 'পাসওয়ার্ড কপি করুন'}</span>
              </button>
            </div>

            {/* Warning Banner */}
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-1 text-xs text-rose-800 dark:text-rose-300">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>নিরাপত্তা সতর্কতা — এটি পুনরায় আর কখনো দেখা যাবে না</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-400">
                এই পাসওয়ার্ডটি ডাটাবেজে সংরক্ষণ করা হয় না এবং কোনো অডিট লগে লেখা হয় না। উইন্ডোটি বন্ধ করার পর এটি আর পুনরুদ্ধার করা সম্ভব হবে না। ব্যবহারকারীকে এটি নিরাপদ মাধ্যমে হস্তান্তর করুন।
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={() => setTemporaryPasswordData(null)}
                className="w-full py-2.5 text-xs font-bold rounded-lg bg-[var(--ink)] text-[var(--bg)] hover:opacity-90"
              >
                আমি পাসওয়ার্ডটি সংরক্ষণ করেছি (বন্ধ করুন)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LIFECYCLE STATUS TRANSITION (Activate, Suspend, Deactivate)     */}
      {/* ========================================================================= */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-[var(--ink)]">
              অ্যাকাউন্ট স্ট্যাটাস পরিবর্তন: {selectedUser.full_name}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">নতুন লাইফসাইকেল স্ট্যাটাস</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] font-medium"
                >
                  <option value="active">সক্রিয় (Active) — লগইন অনুমোদিত</option>
                  <option value="pending">অপেক্ষারত (Pending) — পরিচয় যাচাই প্রয়োজন</option>
                  <option value="suspended">স্থগিত (Suspended) — সাময়িক ব্লক</option>
                  <option value="deactivated">নিষ্ক্রিয় (Deactivated) — স্থায়ীভাবে বন্ধ</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">প্রশাসনিক কারণ বা রেফারেন্স (Reason) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="স্ট্যাটাস পরিবর্তনের কারণ উল্লেখ করুন..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedUser(null);
                }}
                className="px-3.5 py-2 text-xs rounded-lg border border-[var(--line)] hover:bg-[var(--line)] text-[var(--ink)]"
              >
                বাতিল
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 disabled:opacity-40"
              >
                {actionLoading ? 'হালনাগাদ হচ্ছে...' : 'স্ট্যাটাস নিশ্চিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CHANGE LOGIN IDENTIFIER (Email / Phone / Username)              */}
      {/* ========================================================================= */}
      {showIdentifierModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-[var(--ink)]">
              লগইন শনাক্তকারী পরিবর্তন: {selectedUser.full_name}
            </h3>
            <p className="text-xs text-[var(--muted)]">
              বর্তমান আইডি: <span className="font-mono font-bold text-[var(--ink)]">{selectedUser.identifier}</span>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">শনাক্তকারীর ধরন (Identifier Type)</label>
                <select
                  value={identifierType}
                  onChange={(e) => setIdentifierType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] font-medium"
                >
                  <option value="email">লগইন ইমেইল (Email)</option>
                  <option value="phone">ভেরিফাইড মোবাইল নম্বর (Phone)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">নতুন শনাক্তকারী মান (New Identifier) *</label>
                <input
                  type={identifierType === 'email' ? 'email' : 'text'}
                  required
                  placeholder={identifierType === 'email' ? 'new_email@domain.com' : '০১৭১১০০০০০০'}
                  value={newIdentifierVal}
                  onChange={(e) => setNewIdentifierVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">পরিবর্তনের কারণ (Change Reason)</label>
                <input
                  type="text"
                  placeholder="যেমন: কর্মকর্তা অনুরোধক্রমে অথবা প্রাতিষ্ঠানিক মেইল আপডেট"
                  value={identifierReason}
                  onChange={(e) => setIdentifierReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowIdentifierModal(false);
                  setSelectedUser(null);
                }}
                className="px-3.5 py-2 text-xs rounded-lg border border-[var(--line)] hover:bg-[var(--line)] text-[var(--ink)]"
              >
                বাতিল
              </button>
              <button
                onClick={handleChangeIdentifier}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 disabled:opacity-40"
              >
                {actionLoading ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: IDENTIFIER HISTORY DRAWER                                       */}
      {/* ========================================================================= */}
      {showIdentifierHistoryModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--ink)]">
                শনাক্তকারী পরিবর্তনের ইতিহাস: {selectedUser.full_name}
              </h3>
              <button
                onClick={() => setShowIdentifierHistoryModal(false)}
                className="p-1 rounded hover:bg-[var(--line)] text-[var(--muted)]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {userIdentifierHistory.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--line)] rounded-lg">
                এই অ্যাকাউন্টের কোনো পূর্ববর্তী শনাক্তকারী পরিবর্তনের রেকর্ড নেই।
              </div>
            ) : (
              <div className="divide-y divide-[var(--line)] max-h-80 overflow-y-auto text-xs">
                {userIdentifierHistory.map((h: any) => (
                  <div key={h.id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--ink)] uppercase text-[10px] bg-[var(--bg)] px-2 py-0.5 rounded border border-[var(--line)]">
                        {h.identifier_type}
                      </span>
                      <span className="font-mono text-[var(--muted)]">{formatBanglaDate(h.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-neutral-500">{h.old_identifier || '(নেই)'}</span>
                      <ArrowRight className="w-3 h-3 text-[var(--muted)]" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">{h.new_identifier}</span>
                    </div>
                    {h.reason && <p className="text-[10px] text-[var(--muted)] italic">কারণ: {h.reason}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PASSWORD RESET DIALOG                                           */}
      {/* ========================================================================= */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-[var(--ink)]">
              পাসওয়ার্ড রিসেট: {selectedUser.full_name}
            </h3>
            <p className="text-xs text-[var(--muted)]">
              সিস্টেমে সুরক্ষিত র্যান্ডম অস্থায়ী পাসওয়ার্ড তৈরি হবে যা স্ক্রিনে একবার প্রদর্শিত হবে।
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">রিসেট কারণ বা রেফারেন্স</label>
                <input
                  type="text"
                  value={resetReason}
                  onChange={(e) => setResetReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireChangeAtLogin}
                  onChange={(e) => setRequireChangeAtLogin(e.target.checked)}
                  className="rounded text-[var(--ink)] focus:ring-[var(--ink)]"
                />
                <span className="font-bold text-[var(--ink)]">পরবর্তী লগইনে পাসওয়ার্ড পরিবর্তন বাধ্যতামূলক (Forced)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={revokeSessionsOnReset}
                  onChange={(e) => setRevokeSessionsOnReset(e.target.checked)}
                  className="rounded text-[var(--ink)] focus:ring-[var(--ink)]"
                />
                <span className="font-bold text-[var(--ink)]">বিদ্যমান সকল সক্রিয় সেশন অবিলম্বে বাতিল করুন (Revoke Sessions)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setSelectedUser(null);
                }}
                className="px-3.5 py-2 text-xs rounded-lg border border-[var(--line)] hover:bg-[var(--line)] text-[var(--ink)]"
              >
                বাতিল
              </button>
              <button
                onClick={handleResetPassword}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40"
              >
                {actionLoading ? 'রিসেট হচ্ছে...' : 'অস্থায়ী পাসওয়ার্ড তৈরি করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: PRIVILEGED ROLE REQUEST SUBMISSION (System Admin -> Governance) */}
      {/* ========================================================================= */}
      {showPrivilegedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>সিটি গভর্নেন্স প্রধান পদবীর অনুমোদন আবেদন</span>
            </h3>
            <p className="text-xs text-[var(--muted)]">
              সিটি গভর্নেন্স হেড পদবী পাওয়ার জন্য বর্তমান গভর্নেন্স প্রধানের অনুমোদন আবশ্যক।
            </p>

            <form onSubmit={handleSubmitPrivilegedRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">টার্গেট ব্যবহারকারী (Target User) *</label>
                <select
                  required
                  value={privTargetUserId}
                  onChange={(e) => setPrivTargetUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] font-medium"
                >
                  <option value="">ব্যবহারকারী নির্বাচন করুন</option>
                  {accountsData.accounts.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role}) — {u.identifier}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">অনুরোধকৃত পদবী</label>
                <input
                  type="text"
                  disabled
                  value="governance_head (সিটি গভর্নেন্স প্রধান)"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">প্রশাসনিক যৌক্তিকতা ও পটভূমি (Justification) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="কেন এই কর্মকর্তাকে সিটি গভর্নেন্স প্রধান পদে নিয়োগ দেয়া প্রয়োজন..."
                  value={privJustification}
                  onChange={(e) => setPrivJustification(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrivilegedModal(false)}
                  className="px-3.5 py-2 text-xs rounded-lg border border-[var(--line)] hover:bg-[var(--line)] text-[var(--ink)]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40"
                >
                  {actionLoading ? 'দাখিল হচ্ছে...' : 'আবেদন দাখিল করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminAccountStatusPage;
