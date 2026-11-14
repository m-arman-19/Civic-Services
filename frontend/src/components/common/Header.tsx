import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME_BN, APP_TAGLINE } from '../../constants';
import {
  Home,
  PlusCircle,
  FileText,
  MapPin,
  BookOpen,
  Bell,
  BarChart3,
  Shield,
  Layers,
  Wrench,
  Sparkles
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

export const Header: React.FC = () => {
  const { currentUser, activeRole } = useAuth();
  const location = useLocation();

  const citizenNav: NavItem[] = [
    { label: 'হোম', path: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'সমস্যা জানাবেন', path: '/report', icon: <PlusCircle className="w-4 h-4" />, highlight: true },
    { label: 'আমার অভিযোগ', path: '/cases', icon: <FileText className="w-4 h-4" /> },
    { label: 'সিটি ম্যাপ', path: '/map', icon: <MapPin className="w-4 h-4" /> },
    { label: 'সেবাসমূহ', path: '/services', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'স্বচ্ছতা ড্যাশবোর্ড', path: '/transparency', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  const wardNav: NavItem[] = [
    { label: 'ড্যাশবোর্ড', path: '/ward', icon: <Layers className="w-4 h-4" /> },
    { label: 'ভেরিফিকেশন কিউ', path: '/ward/verification', icon: <Shield className="w-4 h-4" /> },
    { label: 'ম্যাপ ও হটস্পট', path: '/map', icon: <MapPin className="w-4 h-4" /> },
    { label: 'ডুপ্লিকেট ম্যানেজার', path: '/ward/duplicates', icon: <FileText className="w-4 h-4" /> }
  ];

  const officerNav: NavItem[] = [
    { label: 'আমার কার্যতালিকা', path: '/officer', icon: <Wrench className="w-4 h-4" /> },
    { label: 'সিটি ম্যাপ', path: '/map', icon: <MapPin className="w-4 h-4" /> }
  ];

  const coordinatorNav: NavItem[] = [
    { label: 'কমান্ড ওভারভিউ', path: '/coordinator', icon: <Layers className="w-4 h-4" /> },
    { label: 'হটস্পট অ্যানালিটিক্স', path: '/coordinator/hotspots', icon: <MapPin className="w-4 h-4" /> },
    { label: 'এসএলএ মনিটর', path: '/coordinator/escalations', icon: <Shield className="w-4 h-4" /> }
  ];

  const adminNav: NavItem[] = [
    { label: 'প্রশাসন প্যানেল', path: '/admin', icon: <Shield className="w-4 h-4" /> },
    { label: 'ব্যবহারকারী ও রোল', path: '/admin/users', icon: <Layers className="w-4 h-4" /> },
    { label: 'এআই গেট কনফিগ', path: '/admin/ai-gate', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'অডিট লগ', path: '/admin/audit', icon: <FileText className="w-4 h-4" /> }
  ];

  const getNavLinks = (): NavItem[] => {
    switch (activeRole) {
      case 'ward_desk':
        return wardNav;
      case 'field_officer':
        return officerNav;
      case 'coordinator':
        return coordinatorNav;
      case 'admin':
        return adminNav;
      default:
        return citizenNav;
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-[var(--paper)] border-b border-[var(--line)] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center shadow-xs group-hover:border-[var(--ink)] transition">
            <Sparkles className="w-5 h-5 text-[var(--ink)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[var(--ink)] tracking-tight leading-none">
                {APP_NAME_BN}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)]">
                AI Platform
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)] font-normal hidden sm:block mt-0.5 leading-none">
              {APP_TAGLINE}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map(item => {
            const isActive = location.pathname === item.path;
            if (item.highlight) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-1.5 ml-2 px-4 py-2 rounded-xl bg-[var(--ink)] text-[var(--paper)] text-xs font-bold shadow-xs hover:opacity-90 transition"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-[var(--bg)] text-[var(--ink)] font-bold border border-[var(--line)]'
                    : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--bg)]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Profile & Notifications */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/notifications"
            className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--bg)] border border-[var(--line)] relative transition"
            title="বিজ্ঞপ্তি"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
