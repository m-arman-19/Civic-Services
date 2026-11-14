import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { toBanglaNumber } from '../../utils/formatters';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  Inbox,
  Sliders,
  RefreshCw
} from 'lucide-react';

export const OfficerWorkloadPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkload = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.officers.getWorkloadSummary(currentUser.departmentId);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'কাজের চাপ ও সক্ষমতার বিবরণ লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkload();
  }, [currentUser.departmentId]);

  const officers = summary?.officers || [];
  const totalOfficers = summary?.total_officers || officers.length;
  const availableOfficers = summary?.available_officers || officers.filter((o: any) => o.availability_status === 'available').length;
  const busyOfficers = summary?.busy_or_at_capacity || officers.filter((o: any) => o.availability_status === 'busy').length;
  const leaveOfficers = officers.filter((o: any) => o.availability_status === 'on_leave' || o.availability_status === 'offline').length;

  const totalMaxCapacity = officers.reduce((acc: number, o: any) => acc + (o.max_tasks || 3), 0);
  const totalActiveTasks = officers.reduce((acc: number, o: any) => acc + (o.active_tasks || 0), 0);
  const avgUtilization = totalMaxCapacity > 0 ? Math.round((totalActiveTasks / totalMaxCapacity) * 100) : 0;

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink)] bg-[var(--paper-elevated)] px-2.5 py-0.5 rounded-md border border-[var(--line)]">
              {currentUser.departmentName || 'দাপ্তরিক ওয়ার্কস্পেস'}
            </span>
            <span className="text-[10px] font-mono text-[var(--muted)] bg-[var(--paper-elevated)] px-2 py-0.5 rounded-md border border-[var(--line-subtle)]">
              Workload & Capacity Analytics
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            বিভাগীয় কাজের চাপ ও সক্ষমতা বিশ্লেষণ
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            মাঠ পর্যায়ের জনবলের বর্তমান কাজের বণ্টন, মোট সক্ষমতা এবং বিতরণ ভারসাম্যতা পর্যবেক্ষণ
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/officer/requests"
            className="civic-btn-secondary text-xs py-2 px-3"
          >
            নতুন অনুরোধ কিউ
          </Link>
          <Link
            to="/officer/assignment-queue"
            className="civic-btn-secondary text-xs py-2 px-3"
          >
            অপেক্ষারত কিউ
          </Link>
          <button
            onClick={fetchWorkload}
            disabled={loading}
            className="p-2 text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--ink)] rounded-lg transition cursor-pointer shadow-xs"
            title="রিফ্রেশ"
            aria-label="রিফ্রেশ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[var(--ink)]' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-[var(--status-emergency-bg)] border border-[var(--status-emergency-border)] text-[var(--status-emergency)] rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl civic-card shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] block">মোট কর্মকর্তা</span>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--ink)] font-mono mt-1">{toBanglaNumber(totalOfficers)}</div>
        </div>
        <div className="p-4 rounded-xl civic-card shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--status-low)] block">উপলব্ধ (Available)</span>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--status-low)] font-mono mt-1">{toBanglaNumber(availableOfficers)}</div>
        </div>
        <div className="p-4 rounded-xl civic-card shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--status-medium)] block">ব্যস্ত (Busy)</span>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--ink)] font-mono mt-1">{toBanglaNumber(busyOfficers)}</div>
        </div>
        <div className="p-4 rounded-xl civic-card shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--status-high)] block">ছুটি / অফলাইন</span>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--status-high)] font-mono mt-1">{toBanglaNumber(leaveOfficers)}</div>
        </div>
        <div className="p-4 rounded-xl civic-card shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] block">গড় সক্ষমতা ব্যবহার</span>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--ink)] font-mono mt-1">{toBanglaNumber(avgUtilization)}%</div>
        </div>
      </div>

      {/* Capacity Utilization Distribution */}
      <div className="civic-card p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--line-subtle)]">
          <h2 className="text-sm sm:text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--muted)]" aria-hidden="true" />
            <span>কর্মকর্তাভিত্তিক কাজের চাপ বণ্টন তালিকা</span>
          </h2>
          <Link
            to="/officer/availability"
            className="text-xs font-semibold text-[var(--ink)] hover:underline flex items-center gap-1 transition"
          >
            <span>সক্ষমতা নিয়ন্ত্রণ</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[var(--muted)] space-y-2">
            <div className="w-7 h-7 border-2 border-[var(--ink)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">কাজের চাপের বিবরণ লোড হচ্ছে...</p>
          </div>
        ) : officers.length === 0 ? (
          <div className="p-10 text-center text-[var(--muted)]">
            <Users className="w-8 h-8 mx-auto text-[var(--muted)] opacity-60 mb-2" aria-hidden="true" />
            <p className="text-sm font-semibold text-[var(--ink)]">কোনো কর্মকর্তার তালিকা পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--line-subtle)]">
            {officers.map((officer: any) => {
              const active = officer.active_tasks || 0;
              const max = officer.max_tasks || 3;
              const pct = Math.min(100, Math.round((active / max) * 100));

              return (
                <div key={officer.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm sm:text-base text-[var(--ink)]">{officer.name_bn || officer.id}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        officer.availability_status === 'available'
                          ? 'bg-[var(--status-low-bg)] text-[var(--status-low)] border-[var(--status-low-border)]'
                          : officer.availability_status === 'busy'
                          ? 'bg-[var(--paper-elevated)] text-[var(--muted)] border-[var(--line)]'
                          : 'bg-[var(--status-high-bg)] text-[var(--status-high)] border-[var(--status-high-border)]'
                      }`}>
                        {officer.availability_status === 'available' ? 'উপলব্ধ' : officer.availability_status === 'busy' ? 'ব্যস্ত' : 'ছুটি/অফলাইন'}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--muted)] flex flex-wrap items-center gap-3">
                      <span>ওয়ার্ড: <strong className="text-[var(--ink)]">{officer.ward ? toBanglaNumber(officer.ward) : 'সকল'}</strong></span>
                      <span>•</span>
                      <span>পদবি: <strong className="text-[var(--ink)]">{officer.designation || 'মাঠ কর্মকর্তা'}</strong></span>
                    </div>
                  </div>

                  {/* Utilization Bar */}
                  <div className="flex items-center gap-3 w-full sm:w-80">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1.5">
                        <span>সক্ষমতা ব্যবহার:</span>
                        <strong className="font-mono text-[var(--ink)] text-xs">{toBanglaNumber(active)}/{toBanglaNumber(max)} ({toBanglaNumber(pct)}%)</strong>
                      </div>
                      <div className="w-full bg-[var(--paper-elevated)] border border-[var(--line)] rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            pct >= 100 ? 'bg-[var(--status-emergency)]' : pct >= 70 ? 'bg-[var(--status-high)]' : 'bg-[var(--ink)]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/officer/requests"
          className="civic-card p-4 hover:border-[var(--ink)] transition flex items-center justify-between group cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)] transition">
              <Inbox className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--ink)]">নতুন অনুরোধ কিউ</h3>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">অনুমোদনের জন্য আগত কাজ</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--ink)] group-hover:translate-x-1 transition" aria-hidden="true" />
        </Link>

        <Link
          to="/officer/assignment-queue"
          className="civic-card p-4 hover:border-[var(--ink)] transition flex items-center justify-between group cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)] transition">
              <Clock className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--ink)]">অপেক্ষারত কিউ</h3>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">প্রেরণ ও অগ্রাধিকার তালিকা</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--ink)] group-hover:translate-x-1 transition" aria-hidden="true" />
        </Link>

        <Link
          to="/officer/availability"
          className="civic-card p-4 hover:border-[var(--ink)] transition flex items-center justify-between group cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)] transition">
              <Sliders className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--ink)]">প্রাপ্যতা ও সক্ষমতা</h3>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">ডিউটি ও সর্বোচ্চ কাজের সীমা</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--ink)] group-hover:translate-x-1 transition" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};
