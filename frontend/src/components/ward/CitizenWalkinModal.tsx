import React, { useState } from 'react';
import { PriorityLevel } from '../../types';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export interface CitizenWalkinPayload {
  citizenPhone: string;
  citizenName: string;
  category: string;
  description: string;
  address: string;
  landmark?: string;
  wardId: number;
  priority: PriorityLevel;
  consentConfirmed: boolean;
}

interface CitizenWalkinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CitizenWalkinPayload) => Promise<void> | void;
  wardId: number;
  wardName?: string;
}

export const CitizenWalkinModal: React.FC<CitizenWalkinModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  wardId,
  wardName = 'ওয়ার্ড ১২'
}) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('waste');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!consentConfirmed) {
      setErrorMessage('নাগরিকের স্পষ্ট সম্মতি ব্যতীত তথ্য নিবন্ধন করা সম্ভব নয়।');
      return;
    }
    if (!phone.trim() || !description.trim() || !address.trim()) {
      setErrorMessage('অনুগ্রহ করে মোবাইল নম্বর, ঠিকানা ও সমস্যার বিবরণ প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        citizenPhone: phone.trim(),
        citizenName: name.trim() || 'নাম প্রকাশে অনিচ্ছুক নাগরিক',
        category,
        description: description.trim(),
        address: address.trim(),
        landmark: landmark.trim(),
        wardId,
        priority: isEmergency ? 'emergency' : 'medium',
        consentConfirmed
      });
      onClose();
    } catch {
      setErrorMessage('অভিযোগ দাখিল করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div className="civic-card bg-[var(--paper)] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[var(--line)]">
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--paper-elevated)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--bg)] px-2 py-0.5 rounded border border-[var(--line)]">
                সহায়তাপ্রাপ্ত ইনটেক
              </span>
              <span className="text-xs text-[var(--muted)]">{wardName} সেবা কেন্দ্র</span>
            </div>
            <h3 className="text-base font-bold text-[var(--ink)] mt-1">
              নাগরিক ওয়াক-ইন অভিযোগ এন্ট্রি (Assisted Citizen Intake)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[var(--status-emergency-bg)] border border-[var(--status-emergency-border)] text-xs text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                নাগরিকের মোবাইল নম্বর *
              </label>
              <input
                type="tel"
                placeholder="017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--accent)] font-mono"
              />
              <span className="text-[10px] text-[var(--muted)] mt-0.5 block">এসএমএস ট্র্যাকিংয়ের জন্য আবশ্যক</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">নাগরিকের নাম</label>
              <input
                type="text"
                placeholder="নাম (ঐচ্ছিক)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1">সমস্যার বিভাগ *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--accent)]"
            >
              <option value="waste">বর্জ্য ব্যবস্থাপনা (Waste Management)</option>
              <option value="drainage">ড্রেনেজ ও নর্দমা (Drainage & Sewerage)</option>
              <option value="road_engineering">সড়ক ও অবকাঠামো (Roads)</option>
              <option value="lighting">সড়ক বাতি ও বিদ্যুৎ (Street Lighting)</option>
              <option value="water_supply">পানি সরবরাহ (Water Supply)</option>
              <option value="encroachment">অবৈধ দখল ও ফুটপাত (Encroachment)</option>
              <option value="vector_control">মশা ও রোগ নিয়ন্ত্রণ (Mosquito/Vector)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">ঘটনাস্থলের ঠিকানা *</label>
              <input
                type="text"
                placeholder="রোড # ৪, বাড়ি # ১২..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">পরিচিত ল্যান্ডমার্ক</label>
              <input
                type="text"
                placeholder="উত্তরা মেডিকেল সংলগ্ন..."
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1">অভিযোগের পূর্ণ বিবরণ *</label>
            <textarea
              rows={3}
              placeholder="নাগরিকের মৌখিক বিবরণ বাংলায় লিখুন..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--accent)] leading-relaxed"
            />
          </div>

          {/* Emergency Alert Option */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--status-emergency-bg)] border border-[var(--status-emergency-border)] text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
              className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
            />
            <div>
              <strong className="font-bold text-rose-700 block">জরুরি নাগরিক ঝুঁকি (Emergency Signal)</strong>
              <span className="text-[11px] text-[var(--muted)]">
                খোলা ম্যানহোল, ছিঁড়ে পড়া বিদ্যুৎ তার বা তাৎক্ষণিক জীবন সুরক্ষার হুমকি হলে চিহ্নিত করুন
              </span>
            </div>
          </label>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={consentConfirmed}
              onChange={(e) => setConsentConfirmed(e.target.checked)}
              className="mt-0.5 rounded text-[var(--green)] focus:ring-[var(--green)]"
            />
            <div>
              <strong className="font-bold text-[var(--ink)] block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[var(--green)]" />
                <span>নাগরিক সম্মতি ও ডেটা প্রটেকশন অনুমোদন *</span>
              </strong>
              <span className="text-[11px] text-[var(--muted)]">
                নাগরিকের মৌখিক/লিখিত সম্মতি গৃহীত হয়েছে এবং নাগরিককে অবহিত করা হয়েছে যে কেবল কার্য সম্পাদনের উদ্দেশ্যে তার ফোন নম্বর ব্যবহৃত হবে।
              </span>
            </div>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--line)] rounded-lg text-xs text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--bg)] font-medium transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[var(--green)] hover:bg-[var(--green-dark)] text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? 'দাখিল হচ্ছে...' : 'অভিযোগ দাখিল ও ট্র্যাকিং নম্বর তৈরি'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
