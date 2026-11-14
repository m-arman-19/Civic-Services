import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Menu,
  X,
  LogIn,
  Sun,
  Moon,
  ArrowRight,
  Code
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const PublicNavbar: React.FC = () => {
  const location = useLocation();
  const { setDevDemoDrawerOpen } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [isEasyMode, setIsEasyMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleEasyMode = () => {
    setIsEasyMode(!isEasyMode);
    document.body.classList.toggle('easy-mode');
  };

  const navLinks = [
    { label: language === 'bn' ? 'মূল পাতা' : 'Overview', path: '/', num: '01' },
    { label: language === 'bn' ? 'সমস্যা জানান' : 'Report', path: '/report', num: '02' },
    { label: language === 'bn' ? 'নগর মানচিত্র' : 'City Map', path: '/map', num: '03' },
    { label: language === 'bn' ? 'সেবা নির্দেশিকা' : 'Services', path: '/services', num: '04' },
    { label: language === 'bn' ? 'নাগরিক স্বচ্ছতা' : 'Transparency', path: '/transparency', num: '05' }
  ];

  return (
    <>
      <header
        className={`lux-topbar sticky top-0 z-40 w-full transition-all duration-200 border-b border-[var(--line)] ${
          isScrolled ? 'py-2.5 shadow-xs' : 'py-3.5'
        }`}
      >
        <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer" aria-label="Nagorik Sathi AI Home">
            <div className="w-8 h-8 rounded-lg bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center shadow-xs group-hover:opacity-90 transition">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wider text-[var(--ink)] uppercase flex items-center gap-1.5 leading-none">
                NAGORIK SATHI <span className="text-[10px] px-1 py-0.2 rounded bg-[var(--paper-elevated)] text-[var(--ink)] font-semibold border border-[var(--line)]">AI</span>
              </span>
              <span className="text-[10px] font-medium tracking-tight text-[var(--muted)] mt-0.5">
                নাগরিক সেবা প্ল্যাটফর্ম · দ্য কানেক্টেড সিটি
              </span>
            </div>
          </Link>

          {/* Center Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Main Navigation">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-semibold tracking-wide transition-colors relative py-1.5 ${
                    isActive
                      ? 'text-[var(--ink)] font-bold'
                      : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--ink)] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Easy UI Mode Toggle */}
            <button
              type="button"
              onClick={toggleEasyMode}
              className={`hidden sm:inline-flex items-center px-2.5 py-1.5 rounded-md border text-[11px] font-semibold transition cursor-pointer ${
                isEasyMode
                  ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]'
                  : 'bg-[var(--paper)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)] hover:border-[var(--ink)]'
              }`}
            >
              {isEasyMode ? 'সহজ মোড সক্রিয়' : 'সহজ পাঠ'}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center rounded-md border border-[var(--line)] bg-[var(--paper)] p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`px-2 py-0.5 rounded font-semibold transition cursor-pointer ${
                  language === 'bn' ? 'bg-[var(--ink)] text-[var(--paper)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                বাং
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded font-semibold transition cursor-pointer ${
                  language === 'en' ? 'bg-[var(--ink)] text-[var(--paper)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                EN
              </button>
            </div>

            {/* Theme Toggle (Dark / Light) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition cursor-pointer"
              aria-label="থিম পরিবর্তন করুন"
              title="Dark / Light Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
            </button>

            {/* Demo Role Switcher Trigger */}
            <button
              type="button"
              onClick={() => setDevDemoDrawerOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--paper-elevated)] hover:bg-[var(--line-subtle)] text-[var(--ink)] border border-[var(--line)] text-xs font-semibold transition cursor-pointer shadow-xs"
              title="সকল রোল ওয়ার্কস্পেস ডেমো"
            >
              <Code className="w-3.5 h-3.5 text-[var(--muted)]" aria-hidden="true" />
              <span>রোল ডেমো</span>
            </button>

            {/* Login / Portal Entry Button */}
            <Link
              to="/login"
              className="civic-btn-primary text-xs py-1.5 px-3"
            >
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
              <span>লগইন পোর্টাল</span>
            </Link>

            {/* Mobile Hamburger Menu */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-elevated)] transition cursor-pointer"
              aria-label="মেনু খুলুন"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--paper)] text-[var(--ink)] flex flex-col p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
            <span className="text-xs font-extrabold tracking-wider text-[var(--ink)] uppercase">
              NAGORIK SATHI AI
            </span>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-md border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--paper-elevated)] transition cursor-pointer"
              aria-label="মেনু বন্ধ করুন"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <nav className="my-6 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-3 border-b border-[var(--line-subtle)] text-base font-medium text-[var(--ink)] hover:text-[var(--accent)] transition"
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[var(--muted)]">{link.num}</span>
                  <span>{link.label}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-[var(--muted)]" aria-hidden="true" />
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setDevDemoDrawerOpen(true);
              }}
              className="flex-1 civic-btn-secondary text-xs py-2.5"
            >
              রোল ডেমো
            </button>
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 civic-btn-primary text-xs py-2.5"
            >
              লগইন পোর্টাল
            </Link>
          </div>
        </div>
      )}
    </>
  );
};
