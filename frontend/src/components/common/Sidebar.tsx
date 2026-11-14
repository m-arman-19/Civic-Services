import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Shield,
  FileText,
  MapPin,
  Users,
  Sparkles,
  Sliders,
  Settings,
  AlertTriangle,
  GitBranch,
  BookOpen,
  Inbox,
  Clock,
  UserCheck,
  BarChart2,
  ListTodo,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Share2,
  ArrowRightLeft,
  CheckSquare,
  Flame,
  UserPlus,
  ShieldAlert,
  RotateCcw,
  Activity,
  Building2,
  History,
  Lock,
  X
} from 'lucide-react';

interface NavGroup {
  id: string;
  title: string;
  items: {
    label: string;
    path: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

export const Sidebar: React.FC = () => {
  const { activeRole, currentUser, isSidebarOpen, setSidebarOpen } = useAuth();
  const location = useLocation();

  // Collapsible sections for Ward Desk, Coordinator, and Admin
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    overview: false,
    operations: false,
    intelligence: false,
    reports: false,
    coord_overview: false,
    coord_operations: false,
    coord_resolution: false,
    coord_monitoring: false,
    coord_governance: false,
    admin_gov: false,
    admin_identity: false,
    admin_civic_data: false,
    admin_rules_ai: false,
    admin_service_knowledge: false,
    admin_sla_ops: false,
    admin_audit_sec: false,
    admin_analytics_transparency: false
  });

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  if (activeRole === 'citizen') {
    return null;
  }

  // Ward Desk Groups
  const wardGroups: NavGroup[] = [
    {
      id: 'overview',
      title: 'ওভারভিউ',
      items: [
        { label: 'ওয়ার্ড ওভারভিউ', path: '/ward', icon: <Layers className="w-4 h-4" /> },
        { label: 'ওয়ার্ক কিউ', path: '/ward/work-queue', icon: <ListTodo className="w-4 h-4" /> }
      ]
    },
    {
      id: 'operations',
      title: 'কেস অপারেশনস',
      items: [
        { label: 'ইনটেক ও যাচাইকরণ', path: '/ward/verification', icon: <Shield className="w-4 h-4" /> },
        { label: 'AI সুপারিশ রিভিউ (৮০%)', path: '/ward/ai-review', icon: <Sparkles className="w-4 h-4" /> },
        { label: 'বিভাগীয় রাউটিং', path: '/ward/routing', icon: <Share2 className="w-4 h-4" /> },
        { label: 'মাল্টি-ডিপার্টমেন্ট প্ল্যানার', path: '/ward/planner', icon: <GitBranch className="w-4 h-4" /> },
        { label: 'ডুপ্লিকেট ম্যানেজার', path: '/ward/duplicates', icon: <FileText className="w-4 h-4" /> },
        { label: 'ডিপার্টমেন্ট হ্যান্ডওভার', path: '/ward/handovers', icon: <ArrowRightLeft className="w-4 h-4" /> },
        { label: 'প্রমাণপত্র রিভিউ ও আপত্তি', path: '/ward/evidence-review', icon: <CheckSquare className="w-4 h-4" /> }
      ]
    },
    {
      id: 'intelligence',
      title: 'ওয়ার্ড ইন্টেলিজেন্স',
      items: [
        { label: 'ওয়ার্ড অপারেশনস ম্যাপ', path: '/ward/map', icon: <MapPin className="w-4 h-4" /> },
        { label: 'রিপিট হটস্পট ও সম্পদ', path: '/ward/hotspots', icon: <Flame className="w-4 h-4" /> },
        { label: 'এসএলএ ও এস্কেলেশন', path: '/ward/sla-escalations', icon: <AlertTriangle className="w-4 h-4" /> }
      ]
    },
    {
      id: 'reports',
      title: 'রিপোর্টস ও হিস্ট্রি',
      items: [
        { label: 'ওয়ার্ড রিপোর্টস ও ইনসাইট', path: '/ward/reports', icon: <BarChart2 className="w-4 h-4" /> },
        { label: 'সহায়তাপ্রাপ্ত ইনটেক অডিট', path: '/ward/assisted-history', icon: <UserPlus className="w-4 h-4" /> }
      ]
    }
  ];

  // Coordinator Navigation Groups (R&D Section 2)
  const coordinatorGroups: NavGroup[] = [
    {
      id: 'coord_overview',
      title: 'সারসংক্ষেপ ও বোর্ড (Overview)',
      items: [
        { label: 'সমন্বয়ক ড্যাশবোর্ড', path: '/coordinator', icon: <Layers className="w-4 h-4" /> },
        { label: 'ইউনিফাইড কেস বোর্ড', path: '/coordinator/cases', icon: <Inbox className="w-4 h-4" /> }
      ]
    },
    {
      id: 'coord_operations',
      title: 'কেস অপারেশন ও সমন্বয় (Operations)',
      items: [
        { label: 'মাল্টি-ডিপার্টমেন্ট সমন্বয়', path: '/coordinator/multi-dept', icon: <GitBranch className="w-4 h-4" /> },
        { label: 'টাস্ক সিকোয়েন্স প্ল্যানার', path: '/coordinator/sequence-planner', icon: <ListTodo className="w-4 h-4" /> },
        { label: 'ডিপার্টমেন্ট হ্যান্ডওভার', path: '/coordinator/handovers', icon: <ArrowRightLeft className="w-4 h-4" /> },
        { label: 'অ্যাসাইনমেন্ট কিউ ও ওয়ার্কলোড', path: '/coordinator/workload', icon: <UserCheck className="w-4 h-4" /> },
        { label: 'ডুপ্লিকেট ইনসিডেন্ট রিভিউ', path: '/coordinator/duplicates', icon: <FileText className="w-4 h-4" /> }
      ]
    },
    {
      id: 'coord_resolution',
      title: 'সমাধান যাচাই ও পর্যালোচনা (Review)',
      items: [
        { label: 'প্রমাণপত্র রিভিউ (Evidence)', path: '/coordinator/evidence-review', icon: <CheckSquare className="w-4 h-4" /> },
        { label: 'নাগরিক আপত্তি (Objections)', path: '/coordinator/objections', icon: <ShieldAlert className="w-4 h-4" /> },
        { label: 'পুনঃউন্মুক্ত কেস (Reopened)', path: '/coordinator/reopened-cases', icon: <RotateCcw className="w-4 h-4" /> },
        { label: 'ক্লোজার রিভিউ (Closure)', path: '/coordinator/closure-review', icon: <ShieldCheck className="w-4 h-4" /> }
      ]
    },
    {
      id: 'coord_monitoring',
      title: 'নজরদারি ও গোয়েন্দা তথ্য (Monitoring)',
      items: [
        { label: 'এসএলএ ও এস্কেলেশন', path: '/coordinator/escalations', icon: <AlertTriangle className="w-4 h-4" /> },
        { label: 'নগর ঘটনা মানচিত্র (Map)', path: '/coordinator/map', icon: <MapPin className="w-4 h-4" /> },
        { label: 'হটস্পট অ্যানালিটিক্স', path: '/coordinator/hotspots', icon: <Flame className="w-4 h-4" /> }
      ]
    },
    {
      id: 'coord_governance',
      title: 'প্রতিবেদন ও সুশাসন (Governance)',
      items: [
        { label: 'বিভাগীয় কর্মদক্ষতা', path: '/coordinator/department-performance', icon: <BarChart2 className="w-4 h-4" /> },
        { label: 'কেস অডিট হিস্ট্রি', path: '/coordinator/case-audit', icon: <FileText className="w-4 h-4" /> },
        { label: 'সেবা স্তর লক্ষ্যমাত্রা (SLA)', path: '/coordinator/sla-targets', icon: <Sliders className="w-4 h-4" /> }
      ]
    }
  ];

  // City Governance Head Groups (Municipal Policy & Service Governance)
  const governanceGroups: NavGroup[] = [
    {
      id: 'gov_overview',
      title: 'ওভারভিউ ও অনুমোদন (Governance & Approvals)',
      items: [
        { label: 'গভর্ন্যান্স ওভারভিউ', path: '/governance', icon: <Layers className="w-4 h-4" /> },
        { label: 'পেন্ডিং পলিসি অনুমোদন', path: '/governance/approvals', icon: <ShieldAlert className="w-4 h-4" /> }
      ]
    },
    {
      id: 'gov_rules',
      title: 'পৌর নীতিমালা ও গেট (Municipal Policy & Gates)',
      items: [
        { label: 'দপ্তর দায়িত্ব নীতিমালা', path: '/governance/responsibility-rules', icon: <Sliders className="w-4 h-4" /> },
        { label: 'টাস্ক-সিকোয়েন্সিং রুলস', path: '/governance/task-sequencing', icon: <GitBranch className="w-4 h-4" /> },
        { label: 'এআই কনফিডেন্স গেট অনুমোদন', path: '/governance/ai-gate', icon: <Sparkles className="w-4 h-4" /> },
        { label: 'এসএলএ ও এস্কেলেশন লক্ষ্যমাত্রা', path: '/governance/sla-policy', icon: <Clock className="w-4 h-4" /> }
      ]
    },
    {
      id: 'gov_performance',
      title: 'পারফরম্যান্স ও স্বচ্ছতা (Analytics & Transparency)',
      items: [
        { label: 'সার্ভিস পারফরম্যান্স অ্যানালিটিক্স', path: '/governance/service-performance', icon: <BarChart2 className="w-4 h-4" /> },
        { label: 'হটস্পট ও পুনরাবৃত্ত সমস্যা', path: '/governance/recurring-issues', icon: <Flame className="w-4 h-4" /> },
        { label: 'পাবলিক ট্রান্সপারেন্সি নীতিমালা', path: '/governance/transparency-policy', icon: <CheckSquare className="w-4 h-4" /> },
        { label: 'পলিসি ও অনুমোদন ইতিহাস', path: '/governance/history', icon: <History className="w-4 h-4" /> }
      ]
    }
  ];

  // System Administrator Groups (Technical Platform Operations)
  const adminGroups: NavGroup[] = [
    {
      id: 'admin_ops',
      title: 'প্ল্যাটফর্ম অপারেশনস ও হেলথ (Platform Ops)',
      items: [
        { label: 'সিস্টেম ওভারভিউ', path: '/admin', icon: <Layers className="w-4 h-4" /> },
        { label: 'সিস্টেম হেলথ ড্যাশবোর্ড', path: '/admin/health', icon: <Activity className="w-4 h-4" /> },
        { label: 'ইনফ্রাস্ট্রাকচার ও ইন্টিগ্রেশন', path: '/admin/infrastructure', icon: <Sliders className="w-4 h-4" /> },
        { label: 'কারিগরি কনফিগারেশন', path: '/admin/technical-config', icon: <Settings className="w-4 h-4" /> },
        { label: 'পলিসি বাস্তবায়ন স্থিতি', path: '/admin/policy-implementations', icon: <ShieldAlert className="w-4 h-4" /> }
      ]
    },
    {
      id: 'admin_identity',
      title: 'আইডেন্টিটি ও এক্সেস কন্ট্রোল (IAM)',
      items: [
        { label: 'ইউজার ম্যানেজমেন্ট', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
        { label: 'রোল ও RBAC ম্যাট্রিক্স', path: '/admin/roles', icon: <ShieldCheck className="w-4 h-4" /> },
        { label: 'অ্যাকাউন্ট স্ট্যাটাস ও সুরক্ষা', path: '/admin/accounts', icon: <Lock className="w-4 h-4" /> }
      ]
    },
    {
      id: 'admin_civic_data',
      title: 'নাগরিক ডেটা রেজিস্ট্রি (Civic Registry)',
      items: [
        { label: 'ডিপার্টমেন্ট ডিরেক্টরি', path: '/admin/departments', icon: <Building2 className="w-4 h-4" /> },
        { label: 'অফিসার ডিরেক্টরি', path: '/admin/officers', icon: <UserCheck className="w-4 h-4" /> },
        { label: 'ওয়ার্ড ও অ্যাসেট রেজিস্ট্রি', path: '/admin/registry', icon: <MapPin className="w-4 h-4" /> }
      ]
    },
    {
      id: 'admin_audit_sec',
      title: 'অডিট ও সিকিউরিটি ইন্টিগ্রিটি (Audit & Security)',
      items: [
        { label: 'ইমিউটেবল অডিট লগ', path: '/admin/audit', icon: <FileText className="w-4 h-4" /> },
        { label: 'সিকিউরিটি ইভেন্টস মনিটরিং', path: '/admin/security-events', icon: <ShieldAlert className="w-4 h-4" /> },
        { label: 'কনফিগারেশন চেঞ্জ হিস্ট্রি', path: '/admin/config-history', icon: <History className="w-4 h-4" /> }
      ]
    }
  ];

  // Auto-expand group if active path is inside it
  useEffect(() => {
    const groupsToCheck =
      activeRole === 'ward_desk'
        ? wardGroups
        : activeRole === 'coordinator'
        ? coordinatorGroups
        : activeRole === 'admin'
        ? adminGroups
        : activeRole === 'governance_head'
        ? governanceGroups
        : [];
    groupsToCheck.forEach(group => {
      if (group.items.some(it => location.pathname === it.path)) {
        setCollapsedGroups(prev => ({ ...prev, [group.id]: false }));
      }
    });
  }, [location.pathname, activeRole]);

  const officerItems = [
    { label: 'আমার নির্ধারিত কাজ', path: '/officer', icon: <Layers className="w-4 h-4" /> },
    { label: 'দাপ্তরিক অনুরোধ গ্রহণ/প্রত্যাখ্যান', path: '/officer/requests', icon: <Inbox className="w-4 h-4" /> },
    { label: 'অ্যাসাইনমেন্ট কিউ ও রিকমেন্ডার', path: '/officer/assignment-queue', icon: <ListTodo className="w-4 h-4" /> },
    { label: 'উপস্থিতি ও ক্যাপাসিটি', path: '/officer/availability', icon: <UserCheck className="w-4 h-4" /> },
    { label: 'বিভাগীয় ওয়ার্কলোড', path: '/officer/workload', icon: <BarChart2 className="w-4 h-4" /> },
    { label: 'ঘটনাস্থল মানচিত্র', path: '/map', icon: <MapPin className="w-4 h-4" /> }
  ];

  const activeGroupedNav =
    activeRole === 'ward_desk'
      ? wardGroups
      : activeRole === 'coordinator'
      ? coordinatorGroups
      : activeRole === 'governance_head'
      ? governanceGroups
      : activeRole === 'admin'
      ? adminGroups
      : null;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[var(--paper)] text-[var(--muted)] border-r border-[var(--line)] shadow-2xl flex flex-col md:static md:z-0 md:shadow-none md:min-h-[calc(100vh-70px)] shrink-0 select-none transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${!isSidebarOpen && 'hidden md:flex'}
      `}>
        {/* Workspace Header Strip */}
        <div className="p-3.5 border-b border-[var(--line)] bg-[var(--paper-elevated)] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--ink)]">
                {activeRole === 'ward_desk' && 'ওয়ার্ড ডেস্ক কমান্ড'}
                {activeRole === 'field_officer' && 'দপ্তর কর্মকর্তা ওয়ার্কস্পেস'}
                {activeRole === 'coordinator' && 'সেন্ট্রাল কেস কোঅর্ডিনেশন'}
                {activeRole === 'governance_head' && 'সিটি গভর্নেন্স ও পলিসি'}
                {activeRole === 'admin' && 'সিস্টেম অ্যাডমিন প্ল্যাটফর্ম'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink)]" aria-hidden="true" />
            </div>
            <p className="text-[11px] text-[var(--muted)] font-medium">অপারেশনাল কন্ট্রোল মেন্যু</p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--ink)] md:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav List */}
        <nav className="p-2.5 space-y-3 flex-1 overflow-y-auto" aria-label="Sidebar Navigation">
          {activeGroupedNav ? (
            activeGroupedNav.map(group => {
              const isCollapsed = !!collapsedGroups[group.id];
              return (
                <div key={group.id} className="space-y-0.5">
                  {/* Collapsible Group Header */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    <span>{group.title}</span>
                    {isCollapsed ? (
                      <ChevronRight className="w-3 h-3 opacity-60" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-3 h-3 opacity-60" aria-hidden="true" />
                    )}
                  </button>

                  {/* Items in group */}
                  {!isCollapsed && (
                    <div className="space-y-0.5 pl-0.5">
                      {group.items.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer group ${
                              isActive
                                ? 'bg-[var(--paper-elevated)] text-[var(--ink)] border border-[var(--line)] font-bold shadow-xs'
                                : 'text-[var(--muted)] hover:bg-[var(--paper-elevated)] hover:text-[var(--ink)]'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`p-1 rounded-sm border transition ${
                                isActive
                                  ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]'
                                  : 'bg-[var(--paper)] text-[var(--muted)] border-[var(--line)] group-hover:text-[var(--ink)] group-hover:border-[var(--ink)]'
                              }`}>
                                {item.icon}
                              </span>
                              <span className="truncate">{item.label}</span>
                            </div>
                            <ChevronRight className={`w-3 h-3 transition-transform ${
                              isActive ? 'text-[var(--ink)] translate-x-0.5' : 'text-transparent group-hover:text-[var(--muted)]'
                            }`} aria-hidden="true" />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            officerItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition cursor-pointer group ${
                    isActive
                      ? 'bg-[var(--paper-elevated)] text-[var(--ink)] border border-[var(--line)] shadow-xs font-bold'
                      : 'text-[var(--muted)] hover:bg-[var(--paper-elevated)] hover:text-[var(--ink)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`p-1 rounded-sm border transition ${
                      isActive
                        ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]'
                        : 'bg-[var(--paper)] text-[var(--muted)] border-[var(--line)] group-hover:text-[var(--ink)]'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3 h-3 transition-transform ${
                    isActive ? 'text-[var(--ink)] translate-x-0.5' : 'text-transparent group-hover:text-[var(--muted)]'
                  }`} aria-hidden="true" />
                </Link>
              );
            })
          )}
        </nav>

        {/* Official Identity & Audit Stamp Card */}
        <div className="p-3 m-2.5 bg-[var(--paper-elevated)] rounded-lg border border-[var(--line)] space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {currentUser?.name ? currentUser.name.slice(0, 1) : 'ন'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-[var(--ink)] truncate">{currentUser?.name || 'অফিসিয়াল ইউজার'}</h4>
              <p className="text-[10px] text-[var(--muted)] truncate">{currentUser?.designation || currentUser?.departmentName || 'সমন্বয়ক কার্যালয়'}</p>
            </div>
          </div>

          <div className="pt-1.5 border-t border-[var(--line)] flex items-center justify-between text-[10px] text-[var(--muted)]">
            <span className="flex items-center gap-1 font-medium text-[var(--ink)]">
              <ShieldCheck className="w-3 h-3 text-[var(--status-low)]" aria-hidden="true" />
              <span>অডিট সিকিউরড</span>
            </span>
            <span className="font-mono text-[var(--muted)] text-[9px]">SHA-256</span>
          </div>
        </div>
      </aside>
    </>
  );
};
