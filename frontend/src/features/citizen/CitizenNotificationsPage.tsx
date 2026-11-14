import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services/aiGateService';
import { AppNotification } from '../../types';
import { formatBanglaDate } from '../../utils/formatters';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck, FileText, ArrowRight } from 'lucide-react';

export const CitizenNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    notificationService.getNotifications().then(setNotifications);
  }, []);

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    const updated = await notificationService.getNotifications();
    setNotifications(updated);
  };

  const handleMarkAll = async () => {
    await notificationService.markAllAsRead();
    const updated = await notificationService.getNotifications();
    setNotifications(updated);
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'action_required':
      case 'objection_filed':
        return <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />;
      case 'evidence_submitted':
      case 'status_update':
        return <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-[var(--ink)]" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            বিজ্ঞপ্তি ও <span className="underline decoration-2 underline-offset-4">নোটিফিকেশন সেন্টার</span>
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1 font-medium">অভিযোগের হালনাগাদ ও সিটি কর্পোরেশনের বার্তা</p>
        </div>

        <button
          onClick={handleMarkAll}
          className="text-xs font-bold text-[var(--ink)] hover:underline cursor-pointer"
        >
          সবগুলো পঠিত চিহ্নিত করুন
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map(n => (
          <div
            key={n.id}
            onClick={() => handleMarkRead(n.id)}
            className={`rounded-2xl p-4 sm:p-5 flex items-start gap-4 transition border cursor-pointer shadow-xs ${
              !n.isRead
                ? 'bg-[var(--paper)] border-l-4 border-l-[var(--ink)] border-[var(--line)] hover:bg-[var(--bg)]'
                : 'bg-[var(--paper)] border border-[var(--line)] hover:bg-[var(--bg)]'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] shrink-0 mt-0.5">
              {getIcon(n.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-sm font-bold text-[var(--ink)] leading-snug">{n.title}</h3>
                <span className="text-xs text-[var(--muted)] font-mono whitespace-nowrap">
                  {formatBanglaDate(n.createdAt)}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed font-medium">{n.message}</p>

              {n.actionLink && (
                <Link
                  to={n.actionLink}
                  className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-[var(--ink)] hover:underline"
                >
                  <span>বিস্তারিত দেখতে ক্লিক করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
