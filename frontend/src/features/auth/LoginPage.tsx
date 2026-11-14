import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ROLES } from '../../constants';
import { UserRole } from '../../types';
import {
  Shield,
  Sparkles,
  Phone,
  Lock,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Mail,
  KeyRound,
  Info
} from 'lucide-react';

const PRE_SEEDED_ACCOUNTS = [
  {
    role: 'citizen' as UserRole,
    titleBn: 'নাগরিক (Citizen)',
    idText: '০১৭১১-০০০০০১',
    passText: 'OTP: ১২৩৪৫৬',
    descBn: 'সমস্যা দাখিল, টাইমলাইন দেখা ও সমাধান আপত্তি',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700'
  },
  {
    role: 'ward_desk' as UserRole,
    titleBn: 'ওয়ার্ড ডেস্ক অফিসার (Ward Desk)',
    idText: 'warddesk@nagoriksathi.gov.bd',
    passText: 'Pass1234!',
    descBn: 'যাচাই কিউ (<৮০% AI), ডুপ্লিকেট শনাক্তকরণ ও ওয়াক-ইন গ্রহণ',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-700'
  },
  {
    role: 'field_officer' as UserRole,
    titleBn: 'দপ্তর কর্মকর্তা (Dept Officer)',
    idText: 'officer_drain@nagoriksathi.gov.bd',
    passText: 'Pass1234!',
    descBn: 'দাপ্তরিক অনুরোধ গ্রহণ/প্রত্যাখ্যান, উপস্থিতি ও প্রমাণ আপলোড',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700'
  },
  {
    role: 'coordinator' as UserRole,
    titleBn: 'কেস সমন্বয়ক (Case Coordinator)',
    idText: 'coordinator@nagoriksathi.gov.bd',
    passText: 'Pass1234!',
    descBn: 'বহু-বিভাগীয় টাস্ক ক্রম আনলক, এসএলএ মনিটরিং ও হটস্পট',
    badgeClass: 'bg-purple-50 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700'
  },
  {
    role: 'admin' as UserRole,
    titleBn: 'সিস্টেম অ্যাডমিন (Administrator)',
    idText: 'admin@nagoriksathi.gov.bd',
    passText: 'AdminPass1234!',
    descBn: 'এআই কনফিডেন্স গেট থ্রেশহোল্ড, এসএলএ ও অডিট হ্যাশ চেইন',
    badgeClass: 'bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700'
  }
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsRole } = useAuth();
  const [authMode, setAuthMode] = useState<'citizen' | 'staff'>('citizen');
  const [phoneNumber, setPhoneNumber] = useState('01711000001');
  const [email, setEmail] = useState('officer_drain@nagoriksathi.gov.bd');
  const [password, setPassword] = useState('Pass1234!');
  const [otpCode, setOtpCode] = useState('123456');
  const [isOtpSent, setIsOtpSent] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsRole('citizen', phoneNumber);
    setSuccessMessage('নাগরিক পোর্টালে সফলভাবে প্রবেশ করা হয়েছে...');
    setTimeout(() => {
      navigate('/');
    }, 400);
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let targetRole: UserRole = 'field_officer';
    if (email.includes('ward')) targetRole = 'ward_desk';
    else if (email.includes('coord')) targetRole = 'coordinator';
    else if (email.includes('admin')) targetRole = 'admin';

    loginAsRole(targetRole, email);
    setSuccessMessage(`${targetRole} ওয়ার্কস্পেসে সফলভাবে প্রবেশ করা হয়েছে...`);
    setTimeout(() => {
      if (targetRole === 'ward_desk') navigate('/ward');
      else if (targetRole === 'field_officer') navigate('/officer');
      else if (targetRole === 'coordinator') navigate('/coordinator');
      else if (targetRole === 'admin') navigate('/admin');
    }, 400);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    loginAsRole(role);
    if (role === 'citizen') navigate('/');
    else if (role === 'ward_desk') navigate('/ward');
    else if (role === 'field_officer') navigate('/officer');
    else if (role === 'coordinator') navigate('/coordinator');
    else if (role === 'admin') navigate('/admin');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-6 h-6 text-[var(--ink)]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
          নাগরিক সাথী এআই <span className="underline decoration-2 underline-offset-4">প্রবেশদ্বার</span>
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)] font-medium">
          সিটি কর্পোরেশন সমন্বিত সেবা পোর্টাল ও দায়িত্বশীল কর্মকর্তাদের ওয়ার্কস্পেস
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Form */}
        <div className="lg:col-span-6 rounded-2xl p-6 sm:p-7 border border-[var(--line)] bg-[var(--paper)] shadow-md space-y-5">
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Toggle Login Mode */}
          <div className="flex rounded-xl bg-[var(--bg)] border border-[var(--line)] p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMode('citizen'); setIsOtpSent(true); }}
              className={`flex-1 py-2.5 rounded-lg transition cursor-pointer font-bold ${
                authMode === 'citizen'
                  ? 'bg-[var(--paper)] text-[var(--ink)] shadow-xs border border-[var(--line)]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              নাগরিক লগইন (OTP)
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('staff')}
              className={`flex-1 py-2.5 rounded-lg transition cursor-pointer font-bold ${
                authMode === 'staff'
                  ? 'bg-[var(--paper)] text-[var(--ink)] shadow-xs border border-[var(--line)]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              কর্মকর্তা ও প্রশাসন (MFA)
            </button>
          </div>

          {/* Citizen OTP Form */}
          {authMode === 'citizen' ? (
            <form onSubmit={handleCitizenSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--ink)] mb-1.5">মোবাইল নম্বর:</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="০১৭১১-০০০০০১"
                    className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg)] text-[var(--ink)] rounded-xl border border-[var(--line)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)] font-medium"
                  />
                </div>
              </div>

              {isOtpSent && (
                <div className="space-y-1.5">
                  <label className="block font-semibold text-[var(--ink)]">৬-ডিজিটের ওটিপি (OTP Code):</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-9 pr-3 py-2.5 tracking-widest font-mono text-base bg-[var(--bg)] text-[var(--ink)] rounded-xl border border-[var(--line)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)] font-bold"
                    />
                  </div>
                  <span className="text-[11px] text-[var(--muted)] block font-medium">
                    * ডেমো ওটিপি হিসেবে <strong className="text-[var(--ink)] underline font-bold">123456</strong> ব্যবহার করুন।
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[var(--ink)] hover:opacity-90 text-[var(--paper)] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
              >
                <span>নাগরিক পোর্টালে প্রবেশ করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Staff Password Form */
            <form onSubmit={handleStaffSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--ink)] mb-1.5">দাপ্তরিক ইমেইল:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="officer@nagoriksathi.gov.bd"
                    className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg)] text-[var(--ink)] rounded-xl border border-[var(--line)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--ink)] mb-1.5">পাসওয়ার্ড:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg)] text-[var(--ink)] rounded-xl border border-[var(--line)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)] font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[var(--ink)] hover:opacity-90 text-[var(--paper)] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
              >
                <span>কর্মকর্তা ওয়ার্কস্পেসে প্রবেশ করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Pre-Seeded 5-Role Demo Accounts (1-Click Login) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--line)]">
            <Info className="w-4 h-4 text-[var(--ink)]" />
            <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
              ডেমো অ্যাকাউন্ট (১-ক্লিক দ্রুত প্রবেশ)
            </h3>
          </div>
          <p className="text-xs text-[var(--muted)] leading-relaxed font-medium">
            পরীক্ষা ও মূল্যায়নের সুবিধার জন্য নিচের যে কোনো রোল সিলেক্ট করে সরাসরি সম্পূর্ণ ফাংশনাল ওয়ার্কস্পেসে প্রবেশ করুন:
          </p>

          <div className="space-y-2.5 pt-1">
            {PRE_SEEDED_ACCOUNTS.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickDemoLogin(acc.role)}
                className="w-full text-left p-3.5 rounded-xl bg-[var(--paper)] hover:bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--ink)] transition flex items-center justify-between gap-3 group cursor-pointer shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--ink)] group-hover:underline transition">
                      {acc.titleBn}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${acc.badgeClass}`}>
                      {acc.role}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[var(--muted)] font-medium">
                    {acc.idText} · <span>{acc.passText}</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] font-medium">
                    {acc.descBn}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--ink)] group-hover:translate-x-1 transition shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
