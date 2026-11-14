import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import { Users, UserPlus, Shield, Lock, Unlock, CheckCircle2, XCircle, Search, Edit2 } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New user form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    role: 'ward_desk',
    is_active: true,
    assigned_ward_ids: [] as string[],
    assigned_department_ids: [] as string[]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [uList, dList, wList] = await Promise.all([
        apiClient.admin.getUsers(),
        apiClient.admin.getDepartments(),
        apiClient.admin.getWards()
      ]);
      setUsers(uList || []);
      setDepartments(dList || []);
      setWards(wList || []);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (userId: string, currentActive: boolean) => {
    try {
      await apiClient.admin.toggleUserStatus(userId);
      showSuccess(`ব্যবহারকারী অ্যাকাউন্ট ${currentActive ? 'লক' : 'সক্রিয়'} করা হয়েছে।`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      showError('পূর্ণ নাম প্রদান করা আবশ্যক।');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.admin.createUser(formData);
      showSuccess('ব্যবহারকারী সফলভাবে তালিকাভুক্ত হয়েছে। ডিফল্ট পাসওয়ার্ড: Pass1234!');
      setShowModal(false);
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        role: 'ward_desk',
        is_active: true,
        assigned_ward_ids: [],
        assigned_department_ids: []
      });
      loadData();
    } catch (err: any) {
      showError(err.message || 'ব্যবহারকারী তৈরি ব্যর্থ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200">সিস্টেম অ্যাডমিন</span>;
      case 'coordinator':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200">কোঅর্ডিনেটর</span>;
      case 'dept_officer':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200">দপ্তর কর্মকর্তা</span>;
      case 'ward_desk':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200">ওয়ার্ড ডেস্ক</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[var(--bg)] text-[var(--muted)] border border-[var(--line)]">নাগরিক (Citizen)</span>;
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ২: ইউজার ও এক্সেস কন্ট্রোল (RBAC)
            </span>
            <span className="text-xs text-[var(--muted)]">নাগরিক প্রোফাইল প্রাইভেসি সংরক্ষিত</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            ব্যবহারকারী প্রশাসন (User Management)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            সিটি কর্পোরেশনের সকল প্রাতিষ্ঠানিক কর্মকর্তা ও সহায়ক কর্মীদের ভূমিকা ও স্থিতি নিয়ন্ত্রণ করুন
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>নতুন কর্মকর্তা নিবন্ধন</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="নাম, ফোন বা রোল দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
          />
        </div>

        <div className="text-xs text-[var(--muted)] font-mono">
          মোট ইউজার: {toBanglaNumber(users.length)} | সক্রিয়: {toBanglaNumber(users.filter(u => u.is_active).length)}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-bold">
                <th className="p-3.5">কর্মকর্তা / ব্যবহারকারীর নাম</th>
                <th className="p-3.5">যোগাযোগ (ফোন / ইমেইল)</th>
                <th className="p-3.5">ভূমিকা (RBAC Role)</th>
                <th className="p-3.5">নিবন্ধন তারিখ</th>
                <th className="p-3.5">অ্যাকাউন্ট স্থিতি</th>
                <th className="p-3.5 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">ব্যবহারকারীর তালিকা লোড হচ্ছে...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">কোনো ব্যবহারকারী পাওয়া যায়নি</td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-[var(--bg)] transition">
                    <td className="p-3.5 font-bold text-[var(--ink)]">{u.full_name}</td>
                    <td className="p-3.5 text-[var(--muted)] font-mono">
                      <div>{u.phone || '—'}</div>
                      <div className="text-[10px]">{u.email || '—'}</div>
                    </td>
                    <td className="p-3.5">{getRoleBadge(u.role)}</td>
                    <td className="p-3.5 font-mono text-[var(--muted)]">
                      {formatBanglaDate(u.created_at)}
                    </td>
                    <td className="p-3.5">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                          সক্রিয় (Active)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300">
                          <XCircle className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
                          লক করা (Locked)
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleStatus(u.id, u.is_active)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition cursor-pointer ${
                          u.is_active
                            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-300 hover:bg-amber-100'
                            : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        {u.is_active ? 'লক করুন' : 'আনলক করুন'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-bold text-base text-[var(--ink)]">নতুন ব্যবহারকারী কর্মকর্তা নিবন্ধন</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[var(--muted)] hover:text-[var(--ink)] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[var(--ink)] mb-1">
                  পূর্ণ নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="যেমন: ইঞ্জিনিয়ার কামরুল হাসান"
                  className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">অফিসিয়াল ফোন</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="০১৭১১০০০০..."
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">ইমেইল ঠিকানা</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="officer@ccc.gov.bd"
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--ink)] mb-1">ভূমিকা (Role)</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                >
                  <option value="ward_desk">ওয়ার্ড ডেস্ক কর্মকর্তা (Ward Desk)</option>
                  <option value="dept_officer">দপ্তর কর্মকর্তা (Field Officer)</option>
                  <option value="coordinator">সেন্ট্রাল কোঅর্ডিনেটর (Coordinator)</option>
                  <option value="admin">সিস্টেম অ্যাডমিনিস্ট্রেটর (Admin)</option>
                  <option value="citizen">নাগরিক (Citizen)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[var(--line)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)] cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[var(--ink)] text-[var(--bg)] font-bold hover:opacity-90 cursor-pointer"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'ব্যবহারকারী তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
