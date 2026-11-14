import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { toBanglaNumber } from '../../utils/formatters';
import { Sliders, Plus, CheckCircle2, Shield, Search, ArrowRight } from 'lucide-react';

export const AdminRulesPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [rules, setRules] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    rule_code: '',
    name_bn: '',
    problem_category: 'drain',
    target_asset_type: 'drain',
    department_id: '',
    priority_level_default: 'medium',
    lead_rule_description_bn: '',
    supporting_departments: [] as string[]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [rList, dList] = await Promise.all([
        apiClient.admin.getRules(),
        apiClient.admin.getDepartments()
      ]);
      setRules(rList || []);
      setDepartments(dList || []);
      if (dList && dList.length > 0 && !formData.department_id) {
        setFormData(prev => ({ ...prev, department_id: dList[0].id }));
      }
    } catch (e) {
      console.error('Failed to load rules', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rule_code || !formData.name_bn || !formData.department_id || !formData.lead_rule_description_bn) {
      showError('রুল কোড, শিরোনাম, দায়িত্বপ্রাপ্ত বিভাগ ও বিবরণ আবশ্যক।');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.admin.createRule(formData);
      showSuccess('দায়িত্ব বণ্টন বিধি সফলভাবে সিস্টেমে সংরক্ষিত ও অডিটে লিপিবদ্ধ হয়েছে।');
      setShowModal(false);
      setFormData({
        rule_code: '',
        name_bn: '',
        problem_category: 'drain',
        target_asset_type: 'drain',
        department_id: departments[0]?.id || '',
        priority_level_default: 'medium',
        lead_rule_description_bn: '',
        supporting_departments: []
      });
      loadData();
    } catch (err: any) {
      showError(err.message || 'বিধি তৈরিতে ত্রুটি');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = rules.filter(r =>
    r.name_bn?.toLowerCase().includes(search.toLowerCase()) ||
    r.rule_code?.toLowerCase().includes(search.toLowerCase()) ||
    r.department_name_bn?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ৪: বিধি ও এআই গভর্ন্যান্স (Table 23)
            </span>
            <span className="text-xs text-[var(--muted)]">স্বয়ংক্রিয় দায়িত্ব কাট-অফ ও অ্যাসেট ম্যাপিং</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            দায়িত্ব বণ্টন নীতিমালা ইঞ্জিন (Responsibility Rules Engine)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            নাগরিক সমস্যা ও সিটি কর্পোরেশনের অ্যাসেট ভিত্তিক প্রাতিষ্ঠানিক দায়িত্ব বিধি ও বিভাগ বণ্টন
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন দায়িত্ব বিধি সংযোজন</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="রুল কোড, নাম বা বিভাগ দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
          />
        </div>
        <span className="text-xs font-mono text-[var(--muted)]">
          মোট দায়িত্ব বিধি: {toBanglaNumber(rules.length)} টি
        </span>
      </div>

      {/* Rules Table */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-bold">
                <th className="p-3.5">রুল কোড</th>
                <th className="p-3.5">নীতিমালার শিরোনাম</th>
                <th className="p-3.5">সম্পর্কিত সম্পদ / ক্যাটাগরি</th>
                <th className="p-3.5">প্রধান দায়িত্বপ্রাপ্ত বিভাগ</th>
                <th className="p-3.5">ডিফল্ট প্রায়োরিটি</th>
                <th className="p-3.5">কার্যপদ্ধতি ও নির্দেশনা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">দায়িত্ব নীতিমালা লোড হচ্ছে...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">কোনো নীতিমালা পাওয়া যায়নি</td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-[var(--bg)] transition">
                    <td className="p-3.5 font-mono font-bold text-[var(--ink)]">{r.rule_code}</td>
                    <td className="p-3.5 font-bold text-[var(--ink)]">{r.name_bn}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)]">
                        {r.target_asset_type || r.problem_category}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-emerald-800 dark:text-emerald-400">
                      {r.department_name_bn || '—'}
                    </td>
                    <td className="p-3.5 font-mono uppercase text-[11px] text-[var(--muted)]">
                      {r.priority_level_default}
                    </td>
                    <td className="p-3.5 text-[var(--muted)] max-w-sm truncate leading-relaxed">
                      {r.lead_rule_description_bn}
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
              <h3 className="font-bold text-base text-[var(--ink)]">নতুন দায়িত্ব বণ্টন বিধি যুক্ত করুন</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--muted)] hover:text-[var(--ink)] text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">রুল কোড (Unique Code) *</label>
                  <input
                    type="text"
                    required
                    value={formData.rule_code}
                    onChange={e => setFormData({ ...formData, rule_code: e.target.value })}
                    placeholder="RULE-DRAIN-02"
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">ক্যাটাগরি *</label>
                  <select
                    value={formData.problem_category}
                    onChange={e => setFormData({ ...formData, problem_category: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                  >
                    <option value="drain">ড্রেন ও পয়ঃনিষ্কাশন</option>
                    <option value="waste">বর্জ্য ব্যবস্থাপনা</option>
                    <option value="road">সড়ক ও অবকাঠামো</option>
                    <option value="street_light">বিদ্যুৎ ও সড়কবাতি</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--ink)] mb-1">বিধিমালার শিরোনাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={formData.name_bn}
                  onChange={e => setFormData({ ...formData, name_bn: e.target.value })}
                  placeholder="যেমন: কালভার্ট আউটলেট ও সংযোগ ড্রেন পরিচ্ছন্নতা বিধি"
                  className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">প্রধান দায়িত্বপ্রাপ্ত বিভাগ *</label>
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
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">ডিফল্ট প্রায়োরিটি</label>
                  <select
                    value={formData.priority_level_default}
                    onChange={e => setFormData({ ...formData, priority_level_default: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                  >
                    <option value="emergency">জরুরি (Emergency)</option>
                    <option value="high">উচ্চ (High)</option>
                    <option value="medium">মাঝারি (Medium)</option>
                    <option value="low">সাধারণ (Low)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--ink)] mb-1">কার্যপদ্ধতি ও দায়িত্ব বিবরণ (বাংলা) *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.lead_rule_description_bn}
                  onChange={e => setFormData({ ...formData, lead_rule_description_bn: e.target.value })}
                  placeholder="কোন পরিস্থিতিতে কোন বিভাগ প্রাথমিক পদক্ষেপ নেবে এবং কোন সংস্থা সমন্বয় করবে..."
                  className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] leading-relaxed"
                />
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
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'দায়িত্ব বিধি সংরক্ষণ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
