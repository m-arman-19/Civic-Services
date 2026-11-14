import React from 'react';
import { PriorityLevel, CaseStatus, TaskStatus } from '../../types';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../../constants';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  showIcon?: boolean;
}

const PRIORITY_THEME_MAP: Record<PriorityLevel, { colorVar: string; bgVar: string; borderVar: string }> = {
  emergency: {
    colorVar: 'var(--status-emergency)',
    bgVar: 'var(--status-emergency-bg)',
    borderVar: 'var(--status-emergency-border)'
  },
  high: {
    colorVar: 'var(--status-high)',
    bgVar: 'var(--status-high-bg)',
    borderVar: 'var(--status-high-border)'
  },
  medium: {
    colorVar: 'var(--status-medium)',
    bgVar: 'var(--status-medium-bg)',
    borderVar: 'var(--status-medium-border)'
  },
  low: {
    colorVar: 'var(--status-low)',
    bgVar: 'var(--status-low-bg)',
    borderVar: 'var(--status-low-border)'
  }
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  const theme = PRIORITY_THEME_MAP[priority] || PRIORITY_THEME_MAP.low;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border shadow-xs transition-colors duration-150"
      style={{
        backgroundColor: theme.bgVar,
        color: theme.colorVar,
        borderColor: theme.borderVar
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.colorVar }} />
      {config.label}
    </span>
  );
};

interface StatusBadgeProps {
  status: CaseStatus | TaskStatus;
}

interface StatusTheme {
  label?: string;
  colorVar: string;
  bgVar: string;
  borderVar: string;
}

const STATUS_THEME_MAP: Record<string, StatusTheme> = {
  submitted: {
    label: 'রিপোর্ট জমা হয়েছে',
    colorVar: 'var(--status-medium)',
    bgVar: 'var(--status-medium-bg)',
    borderVar: 'var(--status-medium-border)'
  },
  verified: {
    label: 'দায়িত্ব যাচাই সম্পন্ন',
    colorVar: 'var(--status-low)',
    bgVar: 'var(--status-low-bg)',
    borderVar: 'var(--status-low-border)'
  },
  under_inspection: {
    label: 'মাঠ পর্যায়ে পরিদর্শন চলছে',
    colorVar: 'var(--status-high)',
    bgVar: 'var(--status-high-bg)',
    borderVar: 'var(--status-high-border)'
  },
  in_progress: {
    label: 'কাজ চলছে',
    colorVar: 'var(--ink)',
    bgVar: 'var(--paper-elevated)',
    borderVar: 'var(--line)'
  },
  resolved_pending_citizen: {
    label: 'সমাধান হয়েছে (প্রমাণ আপলোডকৃত)',
    colorVar: 'var(--status-resolved)',
    bgVar: 'var(--status-resolved-bg)',
    borderVar: 'var(--status-resolved-border)'
  },
  closed: {
    label: 'চূড়ান্তভাবে বন্ধ',
    colorVar: 'var(--muted)',
    bgVar: 'var(--paper-elevated)',
    borderVar: 'var(--line-subtle)'
  },
  reopened: {
    label: 'পুনরায় তদন্তে প্রেরিত',
    colorVar: 'var(--status-emergency)',
    bgVar: 'var(--status-emergency-bg)',
    borderVar: 'var(--status-emergency-border)'
  },
  merged: {
    label: 'সংযুক্ত (ডুপ্লিকেট)',
    colorVar: 'var(--muted)',
    bgVar: 'var(--paper-subtle)',
    borderVar: 'var(--line-subtle)'
  },
  // Task status
  pending_dependency: {
    label: 'পূর্বশর্ত অপেক্ষমাণ',
    colorVar: 'var(--status-high)',
    bgVar: 'var(--status-high-bg)',
    borderVar: 'var(--status-high-border)'
  },
  ready: {
    label: 'কাজের জন্য প্রস্তুত',
    colorVar: 'var(--status-low)',
    bgVar: 'var(--status-low-bg)',
    borderVar: 'var(--status-low-border)'
  },
  in_inspection: {
    label: 'পরিদর্শনে',
    colorVar: 'var(--status-high)',
    bgVar: 'var(--status-high-bg)',
    borderVar: 'var(--status-high-border)'
  },
  resolved: {
    label: 'কাজ সম্পন্ন',
    colorVar: 'var(--status-resolved)',
    bgVar: 'var(--status-resolved-bg)',
    borderVar: 'var(--status-resolved-border)'
  },
  rejected: {
    label: 'বাতিলকৃত',
    colorVar: 'var(--status-emergency)',
    bgVar: 'var(--status-emergency-bg)',
    borderVar: 'var(--status-emergency-border)'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const isCaseStatus = status in STATUS_CONFIG;
  const label = isCaseStatus ? STATUS_CONFIG[status as CaseStatus]?.label : status;
  const styleConf = STATUS_THEME_MAP[status] || {
    label: label || status,
    colorVar: 'var(--status-medium)',
    bgVar: 'var(--status-medium-bg)',
    borderVar: 'var(--status-medium-border)'
  };

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-xs transition-colors duration-150"
      style={{
        backgroundColor: styleConf.bgVar,
        color: styleConf.colorVar,
        borderColor: styleConf.borderVar
      }}
    >
      {styleConf.label || label}
    </span>
  );
};
