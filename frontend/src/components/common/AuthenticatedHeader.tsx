import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { APP_NAME_BN } from '../../constants';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Sparkles,
  LogOut,
  User,
  Shield,
  Wrench,
  GitMerge,
  Code,
  Sun,
  Moon,
  Landmark,
  Menu,
  X
} from 'lucide-react';

export const AuthenticatedHeader: React.FC = () => {
  const { currentUser, activeRole, logout, setDevDemoDrawerOpen, isSidebarOpen, toggleSidebar } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = () => {
    switch (activeRole) {
      case 'ward_desk':
        return { label: 'ওয়ার্ড ডেস্ক', icon: <Shield className="w-3.5 h-3.5" aria-hidden="true" /> };
      case 'field_officer':
        return { label: 'দপ্তর কর্মকর্তা', icon: <Wrench className="w-3.5 h-3.5" aria-hidden="true" /> };
      case 'coordinator':
        return { label: 'কেস সমন্বয়ক', icon: <GitMerge className="w-3.5 h-3.5" aria-hidden="true" /> };
      case 'governance_head':
        return { label: 'সিটি গভর্নেন্স প্রধান', icon: <Landmark className="w-3.5 h-3.5" aria-hidden="true" /> };
      case 'admin':
        return { label: 'সিস্টেম অ্যাডমিন', icon: <Shield className="w-3.5 h-3.5" aria-hidden="true" /> };
      default:
        return { label: 'নাগরিক', icon: <User className="w-3.5 h-3.5" aria-hidden="true" /> };
    }
  };

  const badge = getRoleBadge();

  return (
    <header className="lux-topbar sticky top-0 z-40 py-2.5 px-4 sm:px-6 shadow-xs border-b border-[var(--line)] bg-[var(--paper)]">
      <div className="max-w-[1540px] mx-auto flex items-center justify-between gap-4">
        {/* Brand & Active Workspace */}
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Hamburger Trigger */}
          {activeRole !== 'citizen' && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper-elevated)] md:hidden transition cursor-pointer"
              title="মেনু খুলুন/বন্ধ করুন"
              aria-label="Toggle Sidebar Navigation"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group" aria-label="Home">
            <div className="w-8 h-8 rounded-lg bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center shadow-xs group-hover:opacity-90 transition">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-extrabold text-xs tracking-wider uppercase text-[var(--ink)] leading-none">
                NAGORIK SATHI <span className="font-black">AI</span>
              </span>
              <span className="text-[11px] font-semibold text-[var(--muted)] mt-0.5">
                {APP_NAME_BN}
              </span>
            </div>
          </Link>

          <span className="text-[var(--line)] hidden sm:inline" aria-hidden="true">|</span>

          {/* Active Role Indicator */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[var(--paper-elevated)] text-[var(--ink)] border border-[var(--line)] shadow-xs">
            {badge.icon}
            <span>{badge.label} ওয়ার্কস্পেস</span>
          </div>
        </div>

        {/* Right User Meta & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition cursor-pointer shadow-xs"
            title="থিম পরিবর্তন (Light / Dark)"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
          </button>

          {/* Developer Demo Tooling Trigger */}
          <button
            type="button"
            onClick={() => setDevDemoDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-xs font-bold text-[var(--ink)] hover:bg-[var(--paper-elevated)] transition cursor-pointer shadow-xs"
            title="রোল পরিবর্তন মেনু"
          >
            <Code className="h-3.5 w-3.5 text-[var(--muted)]" aria-hidden="true" />
            <span className="hidden md:inline">রোল পরিবর্তন</span>
          </button>

          {/* Interactive Notifications Dropdown */}
          <NotificationDropdown />

          {/* User Profile Info */}
          {currentUser && (
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[var(--line)]">
              <div className="w-7 h-7 rounded-full bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser.name ? currentUser.name.slice(0, 1) : 'ন'}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <p className="font-bold text-xs text-[var(--ink)] leading-none">{currentUser.name}</p>
                <p className="text-[11px] text-[var(--muted)] font-medium mt-0.5 max-w-[180px] truncate">{currentUser.designation || currentUser.role}</p>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-md text-[var(--muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer ml-1"
                title="লগআউট"
                aria-label="লগআউট"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
