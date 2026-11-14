import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center civic-card max-w-lg mx-auto my-6 shadow-xs">
      <div className="w-12 h-12 rounded-xl bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--muted)] flex items-center justify-center mb-3">
        {icon || <Inbox className="w-6 h-6" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-bold text-[var(--ink)] tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 max-w-sm leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 civic-btn-primary"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="space-y-3 w-full animate-pulse p-4 civic-card" role="status" aria-label="লোড হচ্ছে...">
      <div className="h-6 bg-[var(--paper-elevated)] rounded-md w-1/3 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-[var(--paper-elevated)] rounded-lg w-full" />
      ))}
    </div>
  );
};
