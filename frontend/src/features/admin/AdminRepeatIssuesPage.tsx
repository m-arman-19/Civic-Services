import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { toBanglaNumber } from '../../utils/formatters';
import { Flame, AlertTriangle, MapPin, Layers, CheckCircle2, TrendingUp } from 'lucide-react';

export const AdminRepeatIssuesPage: React.FC = () => {
  const [repeatIssues, setRepeatIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRepeat = async () => {
      try {
        const data = await apiClient.admin.getRepeatIssues();
        setRepeatIssues(data || []);
      } catch (e) {
        console.error('Failed to load repeat issues', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRepeat();
  }, []);

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200">মারাত্মক (Critical)</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200">উচ্চ (High)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200">মাঝারি (Medium)</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ৮: অ্যানালিটিক্স ও স্বচ্ছতা (Spatial Intelligence)
            </span>
            <span className="text-xs text-[var(--muted)]">পুনরাবৃত্ত সমস্যা ও ক্লাস্টার ঘনত্ব</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            রিপিট-ইস্যু ও হটস্পট অ্যানালিটিক্স (Repeat-Issue Analytics)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            গত ৯০ দিনে একই সম্পদ বা স্থানে বারবার উদ্ভূত নাগরিক সমস্যার ক্লাস্টার বিশ্লেষণ
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <Flame className="w-4 h-4 text-amber-600" />
          <span>স্থায়ী অবকাঠামো সংস্কার সুপারিশ:</span>
        </div>
        <p className="leading-relaxed">
          কোনো নির্দিষ্ট জোনে ৯০ দিনে ১০টির বেশি পুনরাবৃত্ত অভিযোগ এলে এআই ইঞ্জিন সংশ্লিষ্ট সম্পদকে 'ক্রনিক অবকাঠামোগত ত্রুটি' হিসেবে চিহ্নিত করে বার্ষিক বাজেটে স্থায়ী মেরামতের জন্য সুপারিশ করে।
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-[var(--muted)]">হটস্পট ডেটা লোড হচ্ছে...</div>
      ) : repeatIssues.length === 0 ? (
        <div className="p-12 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-base text-[var(--ink)]">কোনো সক্রিয় পুনরাবৃত্ত হটস্পট নেই</h3>
          <p className="text-xs text-[var(--muted)]">সকল এলাকায় সমস্যার পুনরাবৃত্তি নিরাপদ সীমার মধ্যে রয়েছে।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repeatIssues.map(issue => (
            <div key={issue.zone_id} className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[var(--ink)]">{issue.zone_code}</span>
                {getSeverityBadge(issue.severity_level)}
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-700 dark:text-amber-400 font-mono">
                    {toBanglaNumber(issue.incident_count)}
                  </span>
                  <span className="text-xs text-[var(--muted)] font-medium">টি ঘটনা (গত ৯০ দিন)</span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1">প্রভাব ব্যাসার্ধ: {toBanglaNumber(issue.radius_meters)} মিটার এলাকা</p>
              </div>

              <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)]">
                <span>স্থিতি: নিবিড় পর্যবেক্ষণ</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">ফিল্ড টাস্ক চলমান</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
