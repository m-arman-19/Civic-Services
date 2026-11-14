import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'active';
  latency_ms?: number;
  details?: string;
  worker_count?: number;
  active_jobs?: number;
  failed_jobs_24h?: number;
  total_storage_mb?: number;
  used_storage_mb?: number;
  file_count?: number;
}

interface InfrastructureData {
  overall_status: string;
  services: ServiceStatus[];
  worker_queues: ServiceStatus[];
  storage: ServiceStatus;
  timestamp: string;
}

export const AdminInfrastructureStatusPage: React.FC = () => {
  const [data, setData] = useState<InfrastructureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInfra = async () => {
    try {
      setLoading(true);
      const res = await apiClient.admin.getInfrastructureStatus();
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'ইনফ্রাস্ট্রাকচার স্ট্যাটাস লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfra();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-bangla">
            ইনফ্রাস্ট্রাকচার ও ইন্টিগ্রেশন স্ট্যাটাস (Infrastructure & Integration Status)
          </h1>
          <p className="text-sm text-muted font-bangla mt-1">
            ডাটাবেজ কানেক্টিভিটি, ব্যাকগ্রাউন্ড ওয়ার্কার কিউ, ক্লাউড স্টোরেজ এবং এক্সটার্নাল এপিআই ইন্টিগ্রেশন মনিটরিং।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-black text-white">
            কারিগরি প্ল্যাটফর্ম অপারেশনস
          </span>
          <button
            onClick={fetchInfra}
            className="px-3 py-1 border border-line bg-paper text-xs font-mono font-semibold hover:bg-gray-100"
          >
            REFRESH
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bangla">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-muted font-bangla border border-line bg-paper">
          ইনফ্রাস্ট্রাকচার মেট্রিক্স সংগ্রহ হচ্ছে...
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Overall Status Banner */}
          <div className="p-4 border border-line bg-paper flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <p className="font-bold text-ink text-sm uppercase tracking-wide">
                  সামগ্রিক সিস্টেম স্ট্যাটাস: <span className="text-emerald-800 dark:text-emerald-300 font-bold">{data.overall_status.toUpperCase()}</span>
                </p>
                <p className="text-xs text-muted font-mono font-medium">
                  পরিমাপের সময়: {new Date(data.timestamp).toLocaleString('bn-BD')}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700">
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>

          {/* Core Services */}
          <div>
            <h2 className="text-base font-bold text-ink uppercase tracking-wider font-mono mb-3">
              কোর সার্ভিস ও কানেক্টিভিটি (Core Services & Connectivity)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.services.map((svc, idx) => (
                <div key={idx} className="p-4 border border-line bg-paper space-y-2 shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-ink">{svc.name}</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700">
                      {svc.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted font-mono font-medium">{svc.details}</p>
                  {svc.latency_ms !== undefined && (
                    <div className="pt-2 border-t border-line flex justify-between text-xs font-medium">
                      <span className="text-muted">ল্যাটেন্সি:</span>
                      <span className="font-mono font-bold text-ink">{svc.latency_ms} ms</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Background Worker Queues */}
          <div>
            <h2 className="text-base font-bold text-ink uppercase tracking-wider font-mono mb-3">
              ব্যাকগ্রাউন্ড ওয়ার্কার ও কিউ স্বাস্থ্য (Background Worker Queues)
            </h2>
            <div className="border border-line bg-paper overflow-x-auto shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-line bg-gray-50 dark:bg-zinc-900 text-muted uppercase tracking-wider font-mono">
                    <th className="py-2.5 px-4 font-semibold">কিউ নাম (Queue Name)</th>
                    <th className="py-2.5 px-4 font-semibold">স্ট্যাটাস</th>
                    <th className="py-2.5 px-4 font-semibold">ওয়ার্কার সংখ্যা</th>
                    <th className="py-2.5 px-4 font-semibold">চলমান জবস (Active)</th>
                    <th className="py-2.5 px-4 font-semibold">ব্যর্থ জবস (২৪ ঘণ্টা)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line font-mono">
                  {data.worker_queues.map((q, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50">
                      <td className="py-3 px-4 font-bold text-ink">{q.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700">
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-ink font-semibold">{q.worker_count}</td>
                      <td className="py-3 px-4 text-ink font-semibold">{q.active_jobs}</td>
                      <td className="py-3 px-4 font-bold text-ink">{q.failed_jobs_24h}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Storage Details */}
          {data.storage && (
            <div>
              <h2 className="text-base font-bold text-ink uppercase tracking-wider font-mono mb-3">
                ফাইল ও অবজেক্ট স্টোরেজ (Media & Evidence Storage)
              </h2>
              <div className="p-4 border border-line bg-paper space-y-3 shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-ink">{data.storage.name}</span>
                  <span className="text-xs font-mono font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 border border-emerald-300 dark:border-emerald-700">
                    {data.storage.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-3 bg-gray-50 border border-line">
                    <span className="text-xs text-muted block">মোট ধারনক্ষমতা</span>
                    <span className="font-mono font-bold text-lg text-ink">{data.storage.total_storage_mb} MB</span>
                  </div>
                  <div className="p-3 bg-gray-50 border border-line">
                    <span className="text-xs text-muted block">ব্যবহৃত স্টোরেজ</span>
                    <span className="font-mono font-bold text-lg text-ink">{data.storage.used_storage_mb} MB</span>
                  </div>
                  <div className="p-3 bg-gray-50 border border-line">
                    <span className="text-xs text-muted block">মোট অ্যাভিডেন্স ও ফাইল</span>
                    <span className="font-mono font-bold text-lg text-ink">{data.storage.file_count} টি</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
export default AdminInfrastructureStatusPage;
