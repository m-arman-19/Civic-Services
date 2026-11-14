import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { toBanglaNumber } from '../../utils/formatters';
import {
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Users,
  TrendingUp,
  MapPin,
  Phone,
  Shield,
  Sparkles
} from 'lucide-react';

export const OfficerAvailabilityPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.officers.getAvailability(currentUser?.departmentId);
      setOfficers(res || []);
    } catch (err: any) {
      setError(err.message || 'কর্মকর্তাদের প্রাপ্যতা ও সক্ষমতা তথ্য লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [currentUser?.departmentId]);

  const handleStatusChange = async (officerId: string, newStatus: string, maxTasks: number) => {
    try {
      setUpdatingId(officerId);
      setError(null);
      await apiClient.officers.updateAvailability(officerId, { availability_status: newStatus, max_concurrent_tasks: maxTasks });
      setSuccessMsg('কর্মকর্তার প্রাপ্যতা সফলভাবে হালনাগাদ করা হয়েছে।');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchAvailability();
    } catch (err: any) {
      setError(err.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCapacityChange = async (officerId: string, currentStatus: string, newCapacity: number) => {
    try {
      setUpdatingId(officerId);
      setError(null);
      await apiClient.officers.updateAvailability(officerId, { availability_status: currentStatus, max_concurrent_tasks: newCapacity });
      setSuccessMsg('সর্বোচ্চ সক্ষমতা সীমা সফলভাবে পরিবর্তিত হয়েছে।');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchAvailability();
    } catch (err: any) {
      setError(err.message || 'সক্ষমতা আপডেট ব্যর্থ হয়েছে।');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--status-low-bg)] text-[var(--status-low)] border border-[var(--status-low-border)]">
            উপলব্ধ (Available)
          </span>
        );
      case 'busy':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--paper-elevated)] text-[var(--muted)] border border-[var(--line)]">
            ব্যস্ত (At Capacity)
          </span>
        );
      case 'on_leave':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--status-high-bg)] text-[var(--status-high)] border border-[var(--status-high-border)]">
            ছুটিতে (On Leave)
          </span>
        );
      case 'offline':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--paper-elevated)] text-[var(--muted)] border border-[var(--line)]">
            অফলাইন (Offline)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--paper-elevated)] text-[var(--muted)] border border-[var(--line)]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)] text-xs font-mono tracking-wider uppercase font-semibold">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{currentUser?.departmentName || 'ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            কর্মকর্তার প্রাপ্যতা ও সক্ষমতা নিয়ন্ত্রণ
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            মাঠ পর্যায়ের কর্মকর্তাদের দায়িত্ব প্রাপ্তির স্থিতি এবং এককালীন সর্বোচ্চ কাজের সীমা নির্ধারণ।
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAvailability}
          disabled={loading}
          className="civic-btn-secondary text-xs py-2 px-3 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[var(--muted)] ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-[var(--status-low-bg)] border border-[var(--status-low-border)] text-[var(--status-low)] text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-[var(--status-emergency-bg)] border border-[var(--status-emergency-border)] text-[var(--status-emergency)] text-xs font-semibold flex items-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Policy Instruction Card */}
      <div className="civic-card p-4 sm:p-5 text-xs text-[var(--muted)] space-y-2 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-sm text-[var(--ink)]">
          <Shield className="w-4 h-4 text-[var(--status-low)]" aria-hidden="true" />
          <span>প্রাপ্যতা নীতি ও স্বয়ংক্রিয় রুলস:</span>
        </div>
        <p className="leading-relaxed">
          ১. কোনো কর্মকর্তার অ্যাকাউন্ট কেবল সক্রিয় থাকলেই তাকে স্বয়ংক্রিয়ভাবে উপলব্ধ হিসেবে বিবেচনা করা হবে না। প্রকৃত ডিউটি স্ট্যাটাস এবং সক্রিয় কাজের সীমা যাচাই বাধ্যতামূলক।
        </p>
        <p className="leading-relaxed">
          ২. চলতি সক্রিয় কাজ ও সর্বোচ্চ সীমার ব্যবধান (Margin) ০ হলে কর্মকর্তা স্বয়ংক্রিয়ভাবে 'ব্যস্ত' হিসেবে বিবেচিত হবেন।
        </p>
      </div>

      {/* Officers List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-[var(--muted)] civic-card">
            প্রাপ্যতা তথ্য লোড হচ্ছে...
          </div>
        ) : officers.length === 0 ? (
          <div className="p-12 text-center text-[var(--muted)] civic-card">
            <Users className="w-8 h-8 text-[var(--muted)] mx-auto mb-2 opacity-60" aria-hidden="true" />
            <p className="text-sm font-semibold text-[var(--ink)]">কোনো কর্মকর্তার তথ্য পাওয়া যায়নি</p>
          </div>
        ) : (
          officers.map(officer => {
            const isUpdating = updatingId === officer.id;
            const currentTasks = officer.current_active_tasks || 0;
            const maxTasks = officer.max_concurrent_tasks || 3;
            const capacityPercent = Math.min(100, Math.round((currentTasks / maxTasks) * 100));

            return (
              <div
                key={officer.id}
                className="civic-card p-5 sm:p-6 hover:border-[var(--ink)] transition shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-[var(--ink)]">
                        {officer.name_bn || officer.id}
                      </h3>
                      {getStatusBadge(officer.availability_status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[var(--muted)]">
                      <span className="font-medium text-[var(--ink)]">
                        {officer.designation_bn || 'সহকারী প্রকৌশলী'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[var(--muted)]" aria-hidden="true" />
                        এখতিয়ার: {officer.ward_name_bn || 'ওয়ার্ড ৩'}
                      </span>
                      {officer.official_phone && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3.5 h-3.5 text-[var(--muted)]" aria-hidden="true" />
                            {officer.official_phone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Status Selector */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-semibold text-[var(--muted)]">স্থিতি:</span>
                    <select
                      value={officer.availability_status}
                      disabled={isUpdating}
                      onChange={e => handleStatusChange(officer.id, e.target.value, maxTasks)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--paper-elevated)] text-[var(--ink)] border border-[var(--line)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                    >
                      <option value="available">উপলব্ধ (Available)</option>
                      <option value="busy">ব্যস্ত (At Capacity)</option>
                      <option value="on_leave">ছুটিতে (On Leave)</option>
                      <option value="offline">অফলাইন (Offline)</option>
                      <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                    </select>
                  </div>
                </div>

                {/* Capacity Progress Bar and Slider */}
                <div className="p-4 bg-[var(--paper-elevated)] rounded-lg border border-[var(--line)] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[var(--muted)]" aria-hidden="true" />
                      <span>চলতি কাজের চাপ ও সক্ষমতা ব্যবহার:</span>
                    </span>
                    <span className="font-bold text-[var(--ink)] font-mono text-xs">
                      {toBanglaNumber(currentTasks)} / {toBanglaNumber(maxTasks)} টি কাজ ({toBanglaNumber(capacityPercent)}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[var(--paper)] rounded-full h-2.5 overflow-hidden border border-[var(--line)]">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        capacityPercent >= 100
                          ? 'bg-[var(--status-emergency)]'
                          : capacityPercent >= 70
                          ? 'bg-[var(--status-high)]'
                          : 'bg-[var(--ink)]'
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>

                  {/* Capacity Slider Control */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    <label className="text-xs text-[var(--muted)] shrink-0 font-medium">
                      সর্বোচ্চ সক্ষমতা সীমা (Max Concurrent Tasks):
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      value={maxTasks}
                      disabled={isUpdating}
                      onChange={e => handleCapacityChange(officer.id, officer.availability_status, parseInt(e.target.value))}
                      className="w-48 accent-[var(--accent)] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-[var(--ink)] font-mono w-7 text-center bg-[var(--paper)] py-0.5 rounded border border-[var(--line)]">
                      {toBanglaNumber(maxTasks)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
