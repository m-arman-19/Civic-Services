import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';
import { Eye, RefreshCw } from 'lucide-react';

interface TransparencyPolicy {
  public_dashboard_enabled: boolean;
  min_cluster_threshold_for_public_view: number;
  mask_citizen_names: boolean;
  mask_citizen_phones: boolean;
  mask_exact_gps_coordinates: boolean;
  gps_fuzz_radius_meters: number;
  excluded_sensitive_categories: string[];
  public_sla_reporting_delay_hours: number;
  updated_at: string;
}

export const GovernanceTransparencyPolicyPage: React.FC = () => {
  const [policy, setPolicy] = useState<TransparencyPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const res = await apiClient.governance.getTransparencyPolicy();
      setPolicy(res.transparency_policy || res);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'উন্মুক্ত নাগরিক তথ্য ও গোপনীয়তা নীতিমালা লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  const handleToggle = (key: keyof TransparencyPolicy) => {
    if (!policy) return;
    setPolicy({
      ...policy,
      [key]: !policy[key],
    });
  };

  const handleNumberChange = (key: keyof TransparencyPolicy, value: number) => {
    if (!policy) return;
    setPolicy({
      ...policy,
      [key]: value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policy) return;
    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(null);
      await apiClient.governance.updateTransparencyPolicy(policy);
      setSaveSuccess('উন্মুক্ত নাগরিক ড্যাশবোর্ড ও গোপনীয়তা নীতিমালা সফলভাবে হালনাগাদ করা হয়েছে।');
    } catch (err: any) {
      setError(err?.message || 'নীতিমালা হালনাগাদ ব্যর্থ হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-editorial">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[var(--line)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider bg-[var(--paper-elevated)] text-[var(--ink)] border border-[var(--line)] shadow-xs">
              <Eye className="w-3.5 h-3.5" />
              পাবলিক ট্রান্সপারেন্সি ও সেফটি
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)] font-bangla flex items-center gap-3">
            উন্মুক্ত পোর্টাল ও গোপনীয়তা থ্রেশহোল্ড নীতিমালা (Public Transparency & Privacy Policy)
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed font-bangla">
            সিটি কর্পোরেশনের নাগরিকদের জন্য উন্মুক্ত ড্যাশবোর্ড প্রদর্শন, জিও-কোঅর্ডিনেট ব্লারিং এবং সংবেদনশীল তথ্য গোপনীয়তা সুরক্ষা নিয়ন্ত্রণ।
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={fetchPolicy}
            disabled={loading}
            className="p-2 text-xs font-bold rounded-lg border border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--paper-elevated)] text-[var(--ink)] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bangla">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bangla">
          {saveSuccess}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-muted font-bangla border border-line bg-paper">
          নীতিমালা লোড হচ্ছে...
        </div>
      ) : policy ? (
        <form onSubmit={handleSave} className="space-y-6">
          {/* General Visibility */}
          <div className="bg-paper border border-line p-6 space-y-4">
            <h2 className="text-lg font-bold text-ink font-bangla border-b border-line pb-2">
              ১. উন্মুক্ত ড্যাশবোর্ড অ্যাক্টিভেশন
            </h2>
            <div className="flex items-center justify-between py-2 border-b border-line">
              <div>
                <p className="font-semibold text-ink font-bangla">পাবলিক ড্যাশবোর্ড সক্রিয়করণ (Public Dashboard)</p>
                <p className="text-xs text-muted font-bangla">সাধারণ নাগরিকদের জন্য সামগ্রিক সেবা পরিসংখ্যান উন্মুক্ত রাখা হবে কিনা।</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('public_dashboard_enabled')}
                className={`px-4 py-1.5 text-xs font-bold font-mono tracking-wider transition-colors ${
                  policy.public_dashboard_enabled ? 'bg-black text-white' : 'bg-gray-200 text-ink'
                }`}
              >
                {policy.public_dashboard_enabled ? 'সক্রিয় (ENABLED)' : 'নিষ্ক্রিয় (DISABLED)'}
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-ink font-bangla">সর্বনিম্ন ক্লাস্টার থ্রেশহোল্ড (Minimum Cluster Threshold)</p>
                <p className="text-xs text-muted font-bangla">উন্মুক্ত ম্যাপে সমস্যা প্রদর্শনের জন্য একটি অঞ্চলে ন্যূনতম রিপোর্টের সংখ্যা (একক নাগরিকের বাড়ি যেন চিহ্নিত না হয়)।</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={policy.min_cluster_threshold_for_public_view}
                  onChange={(e) => handleNumberChange('min_cluster_threshold_for_public_view', parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-1.5 border border-line bg-white text-right font-mono text-sm"
                />
                <span className="text-xs text-muted font-bangla">টি রিপোর্ট</span>
              </div>
            </div>
          </div>

          {/* Privacy & Masking */}
          <div className="bg-paper border border-line p-6 space-y-4">
            <h2 className="text-lg font-bold text-ink font-bangla border-b border-line pb-2">
              ২. নাগরিক গোপনীয়তা ও পিআইআই মাস্কিং নীতি (Citizen Privacy & PII Masking)
            </h2>

            <div className="flex items-center justify-between py-2 border-b border-line">
              <div>
                <p className="font-semibold text-ink font-bangla">নাগরিকের নাম মাস্কিং (Mask Citizen Names)</p>
                <p className="text-xs text-muted font-bangla">উন্মুক্ত পাবলিক ভিউতে আবেদনকারীর ব্যক্তিগত নাম সম্পূর্ণ গোপন রাখা বাধ্যতামূলক।</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('mask_citizen_names')}
                className={`px-4 py-1.5 text-xs font-bold font-mono tracking-wider ${
                  policy.mask_citizen_names ? 'bg-black text-white' : 'bg-gray-200 text-ink'
                }`}
              >
                {policy.mask_citizen_names ? 'বাধ্যতামূলক (ENFORCED)' : 'উন্মুক্ত (OFF)'}
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-line">
              <div>
                <p className="font-semibold text-ink font-bangla">মোবাইল নম্বর মাস্কিং (Mask Citizen Phones)</p>
                <p className="text-xs text-muted font-bangla">উন্মুক্ত ফিডে ও সমন্বয়ক বহির্ভূত স্তরে ফোন নম্বর আংশিক বা সম্পূর্ণ ঢেকে রাখা।</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('mask_citizen_phones')}
                className={`px-4 py-1.5 text-xs font-bold font-mono tracking-wider ${
                  policy.mask_citizen_phones ? 'bg-black text-white' : 'bg-gray-200 text-ink'
                }`}
              >
                {policy.mask_citizen_phones ? 'বাধ্যতামূলক (ENFORCED)' : 'উন্মুক্ত (OFF)'}
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-line">
              <div>
                <p className="font-semibold text-ink font-bangla">সঠিক জিপিএস সমন্বয় অস্পষ্টকরণ (Mask Exact GPS Coordinates)</p>
                <p className="text-xs text-muted font-bangla">সুনির্দিষ্ট ব্যক্তি-বাসভবন সুরক্ষার্থে পাবলিক ম্যাপে সুনির্দিষ্ট স্থানাঙ্ক ব্লার করা।</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('mask_exact_gps_coordinates')}
                className={`px-4 py-1.5 text-xs font-bold font-mono tracking-wider ${
                  policy.mask_exact_gps_coordinates ? 'bg-black text-white' : 'bg-gray-200 text-ink'
                }`}
              >
                {policy.mask_exact_gps_coordinates ? 'সক্রিয় (BLURRED)' : 'সরাসরি (EXACT)'}
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-ink font-bangla">জিপিএস অস্পষ্টকরণ ব্যাসার্ধ (GPS Fuzz Radius)</p>
                <p className="text-xs text-muted font-bangla">পাবলিক পিনের জন্য এলোমেলো বিচ্যুতি ব্যাসার্ধ (মিটারে)।</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="25"
                  value={policy.gps_fuzz_radius_meters}
                  onChange={(e) => handleNumberChange('gps_fuzz_radius_meters', parseInt(e.target.value) || 0)}
                  className="w-24 px-3 py-1.5 border border-line bg-white text-right font-mono text-sm"
                />
                <span className="text-xs text-muted font-bangla">মিটার</span>
              </div>
            </div>
          </div>

          {/* Sensitive Categories & SLA Delay */}
          <div className="bg-paper border border-line p-6 space-y-4">
            <h2 className="text-lg font-bold text-ink font-bangla border-b border-line pb-2">
              ৩. পাবলিক ড্যাশবোর্ড থেকে বাদ দেওয়া সংবেদনশীল বিভাগসমূহ
            </h2>
            <p className="text-xs text-muted font-bangla">
              নিম্নোক্ত বিভাগসমূহের সমস্যা উন্মুক্ত ম্যাপে প্রদর্শিত হবে না (কেবল অভ্যন্তরীণ ওয়ার্কস্পেসেই দেখা যাবে):
            </p>
            <div className="flex flex-wrap gap-2">
              {(policy.excluded_sensitive_categories || []).map((cat, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-xs font-mono font-medium border border-line text-ink">
                  {cat}
                </span>
              ))}
            </div>

            <div className="pt-4 border-t border-line flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink font-bangla">পাবলিক এসএলএ বিলম্ব রিপোর্টিং (SLA Reporting Delay)</p>
                <p className="text-xs text-muted font-bangla">এসএলএ ব্যত্যয় পরিসংখ্যান সর্বসাধারণের জন্য প্রদর্শনের আগে পর্যালোচনার সুযোগ (ঘণ্টায়)।</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={policy.public_sla_reporting_delay_hours}
                  onChange={(e) => handleNumberChange('public_sla_reporting_delay_hours', parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-1.5 border border-line bg-white text-right font-mono text-sm"
                />
                <span className="text-xs text-muted font-bangla">ঘণ্টা</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted font-bangla">
              সর্বশেষ হালনাগাদ: {policy.updated_at ? new Date(policy.updated_at).toLocaleString('bn-BD') : 'এন/এ'}
            </p>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-black text-white text-sm font-semibold font-bangla hover:bg-neutral-800 disabled:opacity-50"
            >
              {saving ? 'সংরক্ষণ হচ্ছে...' : 'নীতিমালা সংরক্ষণ ও প্রয়োগ করুন'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
};
export default GovernanceTransparencyPolicyPage;
