import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';

export const AdminTechnicalConfigPage: React.FC = () => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [readOnlyNotice, setReadOnlyNotice] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await apiClient.admin.getTechnicalConfig();
      setConfig(res.technical_configuration || {});
      setReadOnlyNotice(res.read_only_notice || '');
      setUpdatedAt(res.updated_at || '');
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'কারিগরি কনফিগারেশন লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleChange = (key: string, value: any) => {
    setConfig({
      ...config,
      [key]: value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(null);
      await apiClient.admin.updateTechnicalConfig(config);
      setSaveSuccess('কারিগরি কনফিগারেশন সফলভাবে হালনাগাদ করা হয়েছে।');
      fetchConfig();
    } catch (err: any) {
      setError(err?.message || 'কনফিগারেশন সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-bangla">
            কারিগরি প্ল্যাটফর্ম কনফিগারেশন (Technical Platform Configuration)
          </h1>
          <p className="text-sm text-muted font-bangla mt-1">
            সার্ভার এনভায়রনমেন্ট, সেশন নীতি, হার রদবদল সীমা (Rate Limiting) এবং লগিং লেভেল ব্যবস্থাপনা।
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-black text-white">
            সিস্টেম অ্যাডমিনিস্ট্রেশন
          </span>
        </div>
      </div>

      {/* Mandatory Separation Notice */}
      <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bangla space-y-1">
        <p className="font-bold flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-600"></span>
          দায়িত্ব পৃথকীকরণ সতর্কতা (Separation of Duties Policy):
        </p>
        <p>
          {readOnlyNotice ||
            'ম্যুনিসিপ্যাল পলিসি ভ্যারিয়েবল (এসএলএ লক্ষ্যমাত্রা, দপ্তর দায়িত্ব রুলস, এবং এআই কনফিডেন্স গেট) সরাসরি এখানে পরিবর্তন করা নিষেধ। এগুলোর জন্য সিটি গভর্নেন্স প্রধানের দ্বৈত অনুমোদন প্রক্রিয়ায় পলিসি চেঞ্জ রিকুয়েস্ট দাখিল করুন।'}
        </p>
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
          কনফিগারেশন লোড হচ্ছে...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-paper border border-line p-6 space-y-4">
            <h2 className="text-base font-bold text-ink uppercase tracking-wider font-mono border-b border-line pb-2">
              সার্ভার ও নিরাপত্তা প্যারামিটার
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1">
                  ENVIRONMENT
                </label>
                <input
                  type="text"
                  disabled
                  value={config.environment || 'development'}
                  className="w-full px-3 py-2 border border-line bg-gray-100 text-muted font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1">
                  LOG LEVEL
                </label>
                <select
                  value={config.log_level || 'INFO'}
                  onChange={(e) => handleChange('log_level', e.target.value)}
                  className="w-full px-3 py-2 border border-line bg-white font-mono text-xs"
                >
                  <option value="DEBUG">DEBUG</option>
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1">
                  SESSION TIMEOUT (MINUTES)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={config.session_timeout_minutes || 60}
                  onChange={(e) => handleChange('session_timeout_minutes', parseInt(e.target.value) || 60)}
                  className="w-full px-3 py-2 border border-line bg-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1">
                  MAX UPLOAD SIZE (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={config.max_upload_size_mb || 10}
                  onChange={(e) => handleChange('max_upload_size_mb', parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 border border-line bg-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1">
                  RATE LIMIT (REQUESTS / MIN)
                </label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={config.rate_limit_per_minute || 120}
                  onChange={(e) => handleChange('rate_limit_per_minute', parseInt(e.target.value) || 120)}
                  className="w-full px-3 py-2 border border-line bg-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1">
                  BACKGROUND WORKER CONCURRENCY
                </label>
                <input
                  type="number"
                  min="1"
                  max="32"
                  value={config.background_worker_concurrency || 4}
                  onChange={(e) => handleChange('background_worker_concurrency', parseInt(e.target.value) || 4)}
                  className="w-full px-3 py-2 border border-line bg-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1">
                ALLOWED CORS ORIGINS (COMMA SEPARATED)
              </label>
              <input
                type="text"
                value={Array.isArray(config.cors_origins) ? config.cors_origins.join(', ') : config.cors_origins || ''}
                onChange={(e) => handleChange('cors_origins', e.target.value.split(',').map((s) => s.trim()))}
                className="w-full px-3 py-2 border border-line bg-white font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted font-mono">
              সর্বশেষ পরিবর্তন: {updatedAt ? new Date(updatedAt).toLocaleString('bn-BD') : 'এন/এ'}
            </p>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-black text-white text-sm font-semibold font-bangla hover:bg-neutral-800 disabled:opacity-50"
            >
              {saving ? 'সংরক্ষণ হচ্ছে...' : 'কারিগরি সেটিংস হালনাগাদ করুন'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
export default AdminTechnicalConfigPage;
