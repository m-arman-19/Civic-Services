import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, CheckCircle2, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { notificationService } from '../../services/aiGateService';
import { AppNotification } from '../../types';
import { formatBanglaDate, toBanglaNumber } from '../../utils/formatters';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationService.markAllAsRead();
    await loadNotifications();
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      await notificationService.markAsRead(notif.id);
      await loadNotifications();
    }
    setIsOpen(false);
    if (notif.actionLink) {
      navigate(notif.actionLink);
    } else if (notif.caseId) {
      navigate(`/cases/${notif.caseId}`);
    }
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
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="p-2 rounded-lg border border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--ink)] relative transition cursor-pointer shadow-xs"
        title="বিজ্ঞপ্তি ও অ্যালার্ট"
        aria-label="বিজ্ঞপ্তি খুলুন"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-[var(--accent-fg)] shadow-xs">
            {toBanglaNumber(unreadCount)}
          </span>
        )}
      </button>

      {/* Floating Popup / Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[var(--paper)] border border-[var(--line)] shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--paper-elevated)]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--ink)]">বিজ্ঞপ্তি</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold text-[var(--ink)] bg-[var(--paper)] border border-[var(--line)] px-1.5 py-0.5 rounded-full">
                  {toBanglaNumber(unreadCount)}টি নতুন
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--ink)] flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>সব পঠিত</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[var(--line-subtle)]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--muted)]">
                কোনো নতুন বিজ্ঞপ্তি নেই
              </div>
            ) : (
              notifications.slice(0, 5).map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-[var(--paper-elevated)] ${
                    !n.isRead ? 'bg-[var(--paper-elevated)]/60' : ''
                  }`}
                >
                  <div className="p-1.5 rounded-md bg-[var(--paper)] border border-[var(--line)] shrink-0 mt-0.5 text-[var(--ink)]">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[var(--ink)] truncate">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" aria-label="Unread" />
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--muted)] line-clamp-2 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-[var(--muted)]">
                      <span>{formatBanglaDate(n.createdAt)}</span>
                      {n.caseId && (
                        <span className="font-mono text-[var(--ink)] font-semibold">
                          #{n.caseId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-[var(--line)] bg-[var(--paper-elevated)] text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[var(--ink)] hover:underline inline-flex items-center gap-1.5"
            >
              <span>সকল বিজ্ঞপ্তি দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
