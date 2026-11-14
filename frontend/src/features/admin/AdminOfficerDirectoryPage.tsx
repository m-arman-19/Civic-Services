import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { toBanglaNumber } from '../../utils/formatters';
import { Users, UserPlus, Phone, Mail, CheckCircle2, Clock, Search, Briefcase } from 'lucide-react';

export const AdminOfficerDirectoryPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [officers, setOfficers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name_bn: '',
    name_en: '',
    designation: '',
    department_id: '',
    ward_id: '',
    zone_code: 'ZONE-B',
    official_phone: '',
    official_email: '',
    max_concurrent_tasks: 4,
    availability_status: 'available',
    is_active: true
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [offList, deptList, wardList] = await Promise.all([
        apiClient.admin.getOfficers(),
        apiClient.admin.getDepartments(),
        apiClient.admin.getWards()
      ]);
      setOfficers(offList || []);
      setDepartments(deptList || []);
      setWards(wardList || []);
      if (deptList && deptList.length > 0 && !formData.department_id) {
        setFormData(prev => ({ ...prev, department_id: deptList[0].id }));
      }
    } catch (e) {
      console.error('Failed to load officer directory', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_bn || !formData.department_id || !formData.official_phone) {
      showError('নাম, বিভাগ ও অফিসিয়াল ফোন আবশ্যক।');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.admin.createOfficer(formData);
      showSuccess('কর্মকর্তা সফলভাবে তালিকায় অন্তর্ভুক্ত হয়েছে।');
      setShowModal(false);
      setFormData({
        name_bn: '',
        name_en: '',
        designation: '',
        department_id: departments[0]?.id || '',
        ward_id: '',
        zone_code: 'ZONE-B',
        official_phone: '',
        official_email: '',
        max_concurrent_tasks: 4,
        availability_status: 'available',
        is_active: true
      });
      loadData();
    } catch (err: any) {
      showError(err.message || 'কর্মকর্তা যুক্ত করতে ত্রুটি');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            উপলব্ধ (Available)
          </span>
        );
      case 'busy':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200">
            <Clock className="w-3 h-3" />
            কাজে ব্যস্ত (Busy)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200">
            ছুটিতে (On Leave)
          </span>
        );
    }
  };

  const filtered = officers.filter(o =>
    o.name_bn?.toLowerCase().includes(search.toLowerCase()) ||
    o.designation?.toLowerCase().includes(search.toLowerCase()) ||
    o.department_name_bn?.toLowerCase().includes(search.toLowerCase()) ||
    o.official_phone?.includes(search)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ৩: নাগরিক ডেটা রেজিস্ট্রি
            </span>
            <span className="text-xs text-[var(--muted)]">ফিল্ড ও টেকনিক্যাল স্টাফ রোস্টার</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            কর্মকর্তা ডিরেক্টরি ও ক্যাপাসিটি (Officer Directory)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            বিভাগভিত্তিক দায়িত্বপ্রাপ্ত কর্মকর্তা, কর্মক্ষেত্র (ওয়ার্ড), চলতি ওয়ার্কলোড ও প্রাপ্যতা
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>নতুন কর্মকর্তা অন্তর্ভুক্তিকরণ</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="কর্মকর্তার নাম, পদবি বা ফোন দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
          />
        </div>
        <span className="text-xs font-mono text-[var(--muted)]">
          মোট কর্মকর্তা: {toBanglaNumber(officers.length)} জন
        </span>
      </div>

      {/* Officers Table */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-bold">
                <th className="p-3.5">কর্মকর্তার নাম ও পদবি</th>
                <th className="p-3.5">দায়িত্বপ্রাপ্ত বিভাগ</th>
                <th className="p-3.5">কভারেজ (ওয়ার্ড / জোন)</th>
                <th className="p-3.5">অফিসিয়াল যোগাযোগ</th>
                <th className="p-3.5">ওয়ার্কলোড (চলতি / সর্বোচ্চ)</th>
                <th className="p-3.5 text-center">প্রাপ্যতা স্থিতি</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">কর্মকর্তা তালিকা লোড হচ্ছে...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">কোনো কর্মকর্তা পাওয়া যায়নি</td>
                </tr>
              ) : (
                filtered.map(o => (
                  <tr key={o.id} className="hover:bg-[var(--bg)] transition">
                    <td className="p-3.5">
                      <div className="font-bold text-[var(--ink)]">{o.name_bn}</div>
                      <div className="text-[11px] text-[var(--muted)]">{o.designation}</div>
                    </td>
                    <td className="p-3.5 font-medium text-[var(--ink)]">{o.department_name_bn || '—'}</td>
                    <td className="p-3.5 text-[var(--muted)]">
                      <div>{o.ward_name_bn || `ওয়ার্ড ${toBanglaNumber(o.ward_number || 0)}`}</div>
                      <div className="text-[10px] font-mono text-[var(--muted)]">{o.zone_code || 'ZONE-B'}</div>
                    </td>
                    <td className="p-3.5 font-mono text-[var(--muted)]">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{o.official_phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <Mail className="w-3 h-3 text-blue-600" />
                        <span>{o.official_email}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono">
                      <span className="font-bold text-[var(--ink)]">{toBanglaNumber(o.current_active_tasks || 0)}</span> / {toBanglaNumber(o.max_concurrent_tasks || 4)} টাস্ক
                    </td>
                    <td className="p-3.5 text-center">
                      {getAvailabilityBadge(o.availability_status)}
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
              <h3 className="font-bold text-base text-[var(--ink)]">নতুন কর্মকর্তা তালিকায় সংযোজন</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--muted)] hover:text-[var(--ink)] text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">কর্মকর্তার নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name_bn}
                    onChange={e => setFormData({ ...formData, name_bn: e.target.value })}
                    placeholder="প্রকৌশলী তানভীর আহমেদ"
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">ইংরেজি নাম</label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="Engr. Tanveer Ahmed"
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">পদবি (Designation) *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="সহকারী প্রকৌশলী"
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">দায়িত্বপ্রাপ্ত বিভাগ *</label>
                  <select
                    value={formData.department_id}
                    onChange={e => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name_bn}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">অফিসিয়াল ফোন *</label>
                  <input
                    type="text"
                    required
                    value={formData.official_phone}
                    onChange={e => setFormData({ ...formData, official_phone: e.target.value })}
                    placeholder="০৩১-৬২০..."
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">অফিসিয়াল ইমেইল</label>
                  <input
                    type="email"
                    value={formData.official_email}
                    onChange={e => setFormData({ ...formData, official_email: e.target.value })}
                    placeholder="officer@ccc.gov.bd"
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
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'কর্মকর্তা যুক্ত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
