import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, Save, History, ArrowUpRight, ArrowDownRight, Clock, Sliders } from 'lucide-react';
import { formatBanglaDate, toBanglaNumber } from '../../utils/formatters';

export const AdminAiGatePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [gateConfig, setGateConfig] = useState<any>(null);
  const [thresholdPercent, setThresholdPercent] = useState<number>(80);
  const [reason, setReason] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await apiClient.admin.getAiGate();
      setGateConfig(data);
      if (data && typeof data.current_threshold === 'number') {
        setThresholdPercent(Math.round(data.current_threshold * 100));
      }
    } catch (e) {
      console.error('Failed to load AI gate config', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showError('সেফটি গেট পরিবর্তনের দাপ্তরিক কারণ উল্লেখ করা বাধ্যতামূলক।');
      return;
    }

    const currentThreshold = gateConfig?.current_threshold ?? 0.80;
    const newThreshold = thresholdPercent / 100;

    try {
      setIsSaving(true);
      const res = await apiClient.admin.updateAiGate(newThreshold, reason);

      if (res.status === 'pending_dual_approval') {
        showSuccess(res.message_bn || 'গেট হ্রাস করার আবেদন দ্বৈত অনুমোদনের জন্য অপেক্ষমাণ তালিকায় পাঠানো হয়েছে।');
      } else {
        showSuccess(res.message_bn || 'সেফটি গেট সফলভাবে বৃদ্ধি ও সক্রিয় করা হয়েছে।');
      }
      setReason('');
      fetchConfig();
    } catch (err: any) {
      showError(err.message || 'সেফটি গেট আপডেট ব্যর্থ');
    } finally {
      setIsSaving(false);
    }
  };

  const currentPercent = Math.round((gateConfig?.current_threshold ?? 0.80) * 100);
  const isLowering = thresholdPercent < currentPercent;
  const isRaising = thresholdPercent > currentPercent;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ৪: এআই গভর্ন্যান্স (R&D Section 10.11 / Table 33)
            </span>
            <span className="text-xs text-[var(--muted)]">স্বয়ংক্রিয় দায়িত্ব কাট-অফ ও সেফটি গেট</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            এআই কনফিডেন্স গেট গভর্ন্যান্স (AI Confidence Gate Policy)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            স্বয়ংক্রিয় দায়িত্ব প্রস্তাবনা এবং মানব যাচাইয়ের জন্য কনফিডেন্স কাট-অফ থ্রেশহোল্ড নির্ধারণ করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)]">
            ডিফল্ট ডিজাইন মান: ৮০%
          </span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-[var(--muted)]">গেট কনফিগারেশন লোড হচ্ছে...</div>
      ) : (
        <div className="space-y-6">
          {/* Current Status Hero */}
          <div className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">চলতি সক্রিয় থ্রেশহোল্ড</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-[var(--ink)] font-mono">
                  {toBanglaNumber(currentPercent)}%
                </span>
                <span className="text-xs text-[var(--muted)] font-medium">কনফিডেন্স স্কোর</span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                ৮০% বা তদূর্ধ্ব কনফিডেন্সে সরাসরি ওয়ার্ড ডেস্কে সুপারিশ প্রদান। এর নিচে হলে বাধ্যতামূলক হিউম্যান-ইন-দ্য-লুপ ট্রায়াজ।
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs space-y-1.5 min-w-[200px]">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">অনুমোদন স্থিতি:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">সক্রিয় (Active)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">আদি ডিজাইন মান:</span>
                <span className="font-mono text-[var(--ink)]">৮০% (0.80)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">অপেক্ষমাণ দ্বৈত আবেদন:</span>
                <span className="font-mono font-bold text-amber-700">
                  {toBanglaNumber(gateConfig?.pending_approval_requests?.length || 0)} টি
                </span>
              </div>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-5 shadow-sm">
            <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2 border-b border-[var(--line)] pb-3">
              <Sliders className="w-4 h-4 text-[#166534]" />
              <span>কাট-অফ থ্রেশহোল্ড সমন্বয় ও গভর্ন্যান্স ফ্লো</span>
            </h3>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[var(--ink)] mb-2">
                <span>প্রস্তাবিত কনফিডেন্স কাট-অফ:</span>
                <span className="font-mono text-base font-bold text-[#166534]">
                  {toBanglaNumber(thresholdPercent)}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={thresholdPercent}
                onChange={e => setThresholdPercent(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-[var(--bg)] rounded-lg appearance-none cursor-pointer accent-[#166534]"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono mt-1">
                <span>৫০% (ন্যূনতম শিথিল)</span>
                <span>৮০% (আদি ডিজাইন কাট-অফ)</span>
                <span>৯৫% (সর্বোচ্চ কঠোর)</span>
              </div>
            </div>

            {/* Governance Flow Notice Banner */}
            {isLowering && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <ArrowDownRight className="w-4 h-4 text-amber-600" />
                  <span>গেট হ্রাসকরণ প্রটোকল (Dual Approval Required):</span>
                </div>
                <p className="leading-relaxed">
                  সেফটি গেট {toBanglaNumber(currentPercent)}% থেকে কমিয়ে {toBanglaNumber(thresholdPercent)}% এ নামানোর প্রস্তাব সরাসরি কার্যকর হবে না। এটি অপরিবর্তনীয় অডিটে লিপিবদ্ধ হবে এবং দ্বিতীয় একজন স্বাধীন প্রশাসকের অনুমোদনের জন্য কিউতে জমা হবে।
                </p>
              </div>
            )}

            {isRaising && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <ArrowUpRight className="w-4 h-4 text-blue-600" />
                  <span>নিরাপত্তা বৃদ্ধি প্রটোকল (Admin Solo Authority):</span>
                </div>
                <p className="leading-relaxed">
                  সেফটি গেট বৃদ্ধি করার ক্ষেত্রে ঝুঁকি না থাকায় এটি একক প্রশাসক সিদ্ধান্তে অবিলম্বে কার্যকর ও অডিটে সংরক্ষিত হবে।
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                পরিবর্তনের প্রাতিষ্ঠানিক কারণ ও ন্যায্যতা <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="কেন থ্রেশহোল্ড পরিবর্তন প্রয়োজন তা বিস্তারিত লিখুন (অডিটে সংরক্ষিত হবে)..."
                className="w-full text-xs p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] leading-relaxed focus:outline-none focus:border-[var(--ink)]"
              />
            </div>

            <div className="pt-2 border-t border-[var(--line)] flex justify-end">
              <button
                type="submit"
                disabled={isSaving || thresholdPercent === currentPercent}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--ink)] text-[var(--bg)] text-xs font-bold hover:opacity-90 transition disabled:opacity-40 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isSaving
                    ? 'সংরক্ষণ হচ্ছে...'
                    : isLowering
                    ? 'দ্বৈত অনুমোদনের আবেদন দাখিল করুন'
                    : 'থ্রেশহোল্ড আপডেট ও কার্যকর করুন'}
                </span>
              </button>
            </div>
          </form>

          {/* Pending Dual Approvals Section */}
          {gateConfig?.pending_approval_requests && gateConfig.pending_approval_requests.length > 0 && (
            <div className="p-5 rounded-2xl bg-[var(--paper)] border border-amber-300 dark:border-amber-800 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>বর্তমান অপেক্ষমাণ অনুমোদন আবেদনসমূহ:</span>
              </h4>
              <div className="space-y-2">
                {gateConfig.pending_approval_requests.map((p: any) => (
                  <div key={p.id} className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-amber-700">
                        {toBanglaNumber((p.proposed_payload?.threshold || 0) * 100)}% কাট-অফ প্রস্তাব
                      </span>
                      <p className="text-[11px] text-[var(--muted)] mt-0.5">"{p.reason}"</p>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--muted)]">{formatBanglaDate(p.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
