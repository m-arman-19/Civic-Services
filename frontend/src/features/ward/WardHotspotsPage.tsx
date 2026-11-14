import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  Flame,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Sparkles,
  Layers,
  Wrench,
  CheckCircle2,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { HotspotZone } from '../../types';
import { INITIAL_HOTSPOTS } from '../../mocks/initialData';

export const WardHotspotsPage: React.FC = () => {
  const { cases } = useCases();
  const { currentUser } = useAuth();

  const [hotspots] = useState<HotspotZone[]>(INITIAL_HOTSPOTS);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotZone>(INITIAL_HOTSPOTS[0]);

  // Scoped to ward
  const wardCases = cases.filter(c => !currentUser.wardId || c.location.wardId === currentUser.wardId);

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--paper-elevated)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              M6 পুনরাবৃত্ত হটস্পট ইন্টেলিজেন্স
            </span>
            <span className="text-xs text-[var(--muted)]">স্থানিক ক্লাস্টারিং ও স্থায়ী সমাধান</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] tracking-tight">
            পুনরাবৃত্ত সমস্যা হটস্পট বিশ্লেষণ (Repeat-Issue Hotspots)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-2xl">
            একই স্থানে বারবার ঘটা নাগরিক সমস্যা এবং এআই ইঞ্জিনিয়ারিং পরামর্শ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3.5 py-1.5 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)]">
            শনাক্তকৃত হটস্পট: <strong className="text-orange-600">{toBanglaNumber(hotspots.length)}</strong>
          </span>
        </div>
      </div>

      {/* R&D Advisory Policy Banner */}
      <div className="civic-card rounded-2xl p-4 bg-[var(--paper-elevated)] border border-[var(--line)] flex items-start gap-3 text-xs">
        <Sparkles className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-[var(--ink)]">অ্যাডভাইজরি ক্লাস্টারিং নীতি (Traceable Hotspot Advisory):</strong>
          <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
            কোনো স্থানে ৬০ দিনের মধ্যে একই ড্রেন বা সড়কে একাধিকবার সমস্যা দেখা দিলে সিস্টেম স্বয়ংক্রিয়ভাবে ইঞ্জিনিয়ারিং হটস্পট হিসেবে চিহ্নিত করে। সাধারণ মেরামত বারবার না করে দীর্ঘমেয়াদী পাইপলাইন প্রতিস্থাপন বা স্ট্রাকচারাল রি-ডিজাইনের সুপারিশ প্রদান করা হয়।
          </p>
        </div>
      </div>

      {/* Main Grid: Left Hotspots List, Right Deep Dive & Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hotspots Cards List */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            ওয়ার্ডের সক্রিয় হটস্পট অঞ্চলসমূহ
          </h3>

          {hotspots.map(h => {
            const isSelected = selectedHotspot?.id === h.id;
            return (
              <div
                key={h.id}
                onClick={() => setSelectedHotspot(h)}
                className={`p-5 rounded-2xl border transition cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-[var(--paper)] border-[var(--green)] shadow-md'
                    : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-600 font-mono">
                    {h.severity.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-[var(--muted)]">
                    ঘটনা: <strong className="text-[var(--ink)]">{toBanglaNumber(h.incidentCount)}টি</strong>
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[var(--ink)]">{h.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-[var(--muted)] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{h.wardName}</span>
                  </div>
                </div>

                <div className="text-[11px] text-[var(--green)] font-mono">
                  অ্যাসেট কোড: {h.recurrentAsset}
                </div>
              </div>
            );
          })}
        </div>

        {/* Deep Dive & Engineering Recommendations */}
        <div className="lg:col-span-2 civic-card rounded-2xl p-6 space-y-5 border border-[var(--line)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--line)]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[var(--gold)]">{selectedHotspot.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-600 font-mono uppercase">
                  {selectedHotspot.severity} SEVERITY
                </span>
              </div>
              <h2 className="text-lg font-bold text-[var(--ink)] mt-1">
                {selectedHotspot.name}
              </h2>
            </div>

            <span className="text-xs text-[var(--muted)] font-mono">
              সর্বশেষ ঘটনা: {formatBanglaDate(selectedHotspot.lastIncidentDate)}
            </span>
          </div>

          {/* AI Engineering Advisory Card */}
          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-2">
            <div className="flex items-center gap-2 text-orange-800 font-bold text-xs">
              <Wrench className="w-4 h-4 text-orange-600" />
              <span>এআই স্ট্রাকচারাল রিমিডিয়েশন পরামর্শ (Engineering Advisory):</span>
            </div>
            <p className="text-xs text-orange-950 leading-relaxed font-medium">
              {selectedHotspot.aiSuggestion}
            </p>
          </div>

          {/* Asset & Zone Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-1">
              <span className="text-[11px] text-[var(--muted)]">বারংবার ক্ষতিগ্রস্ত অ্যাসেট:</span>
              <div className="font-bold text-[var(--ink)]">{selectedHotspot.recurrentAsset}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-1">
              <span className="text-[11px] text-[var(--muted)]">বর্তমান অবস্থা:</span>
              <div className="font-bold text-[var(--green)]">
                {selectedHotspot.status === 'active_monitoring' ? 'সক্রিয় পর্যবেক্ষণ ও প্ল্যানিং' : 'সমাধানকৃত'}
              </div>
            </div>
          </div>

          {/* Related Incidents in this Hotspot */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              এই হটস্পটের সাথে সংশ্লিষ্ট ঐতিহাসিক অভিযোগসমূহ ({toBanglaNumber(wardCases.slice(0, 3).length)}টি কেস)
            </h4>

            <div className="space-y-2">
              {wardCases.slice(0, 3).map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[var(--ink)]">#{item.id}</span>
                      <strong className="text-[var(--ink)]">{item.title}</strong>
                    </div>
                    <span className="text-[11px] text-[var(--muted)] mt-0.5 block">{item.location.address}</span>
                  </div>
                  <Link
                    to={`/ward/cases/${item.id}`}
                    className="px-3 py-1.5 rounded-lg bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--green)] text-[11px] font-bold text-[var(--ink)] transition inline-flex items-center gap-1"
                  >
                    <span>দেখুন</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
