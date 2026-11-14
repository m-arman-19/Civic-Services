import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { toBanglaNumber } from '../../utils/formatters';
import { Building2, Plus, Phone, Mail, CheckCircle2, XCircle, Search } from 'lucide-react';

export const AdminDepartmentDirectoryPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    code: '',
    name_bn: '',
    name_en: '',
    description: '',
    head_officer_name: '',
    hotline_number: '',
    official_email: '',
    is_active: true
  });

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await apiClient.admin.getDepartments();
      setDepartments(data || []);
    } catch (e) {
      console.error('Failed to load departments', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name_bn) {
      showError('বিভাগ কোড ও বাংলা নাম আবশ্যক।');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.admin.createDepartment(formData);
      showSuccess('বিভাগ সফলভাবে তালিকায় যুক্ত করা হয়েছে।');
      setShowModal(false);
      setFormData({
        code: '',
        name_bn: '',
        name_en: '',
        description: '',
        head_officer_name: '',
        hotline_number: '',
        official_email: '',
        is_active: true
      });
      loadDepartments();
    } catch (err: any) {
      showError(err.message || 'বিভাগ তৈরিতে ত্রুটি');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = departments.filter(d =>
    d.name_bn?.toLowerCase().includes(search.toLowerCase()) ||
    d.code?.toLowerCase().includes(search.toLowerCase()) ||
    d.head_officer_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ৩: নাগরিক ডেটা রেজিস্ট্রি
            </span>
            <span className="text-xs text-[var(--muted)]">সিটি কর্পোরেশন সাংগঠনিক কাঠামো</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            বিভাগ ডিরেক্টরি (Department Directory)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            নাগরিক সেবা ও কার্য সম্পাদনের দায়িত্বপ্রাপ্ত বিভাগসমূহ, শীর্ষ কর্মকর্তা ও অফিসিয়াল যোগাযোগ
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন বিভাগ সংযোজন</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="বিভাগের নাম বা কোড দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
          />
        </div>
        <span className="text-xs font-mono text-[var(--muted)]">
          মোট বিভাগ: {toBanglaNumber(departments.length)} টি
        </span>
      </div>

      {/* Departments Table */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-bold">
                <th className="p-3.5">বিভাগ কোড</th>
                <th className="p-3.5">বিভাগের নাম (বাংলা ও ইংরেজি)</th>
                <th className="p-3.5">প্রধান কর্মকর্তা</th>
                <th className="p-3.5">হটলাইন / ইমেইল</th>
                <th className="p-3.5">বিবরণ / এখতিয়ার</th>
                <th className="p-3.5 text-center">স্থিতি</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">বিভাগসমূহ লোড হচ্ছে...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">কোনো বিভাগ পাওয়া যায়নি</td>
                </tr>
              ) : (
                filtered.map(d => (
                  <tr key={d.id} className="hover:bg-[var(--bg)] transition">
                    <td className="p-3.5 font-mono font-bold text-[var(--ink)]">{d.code}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-[var(--ink)]">{d.name_bn}</div>
                      <div className="text-[10px] text-[var(--muted)] font-mono">{d.name_en}</div>
                    </td>
                    <td className="p-3.5 font-medium text-[var(--ink)]">{d.head_officer_name || '—'}</td>
                    <td className="p-3.5 text-[var(--muted)] font-mono">
                      {d.hotline_number && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{d.hotline_number}</span>
                        </div>
                      )}
                      {d.official_email && (
                        <div className="flex items-center gap-1 text-[10px]">
                          <Mail className="w-3 h-3 text-blue-600" />
                          <span>{d.official_email}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-[var(--muted)] max-w-xs truncate">{d.description || '—'}</td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        সক্রিয়
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-bold text-base text-[var(--ink)]">নতুন বিভাগ অন্তর্ভুক্তিকরণ</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--muted)] hover:text-[var(--ink)] text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">বিভাগ কোড (Unique Code) *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="যেমন: electrical"
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">বিভাগের নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name_bn}
                    onChange={e => setFormData({ ...formData, name_bn: e.target.value })}
                    placeholder="বিদ্যুৎ ও সড়কবাতি বিভাগ"
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--ink)] mb-1">বিভাগের নাম (ইংরেজি)</label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Electrical Department"
                  className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">প্রধান কর্মকর্তা</label>
                  <input
                    type="text"
                    value={formData.head_officer_name}
                    onChange={e => setFormData({ ...formData, head_officer_name: e.target.value })}
                    placeholder="সহকারী প্রকৌশলী"
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">অফিসিয়াল হটলাইন</label>
                  <input
                    type="text"
                    value={formData.hotline_number}
                    onChange={e => setFormData({ ...formData, hotline_number: e.target.value })}
                    placeholder="০৩১-৬২০৪৪৪"
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                  />
                </div>
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
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'বিভাগ যুক্ত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
