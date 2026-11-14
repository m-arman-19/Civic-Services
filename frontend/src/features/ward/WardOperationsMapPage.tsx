import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  MapPin,
  Filter,
  Layers,
  Sparkles,
  AlertTriangle,
  Flame,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  Info
} from 'lucide-react';
import { Case, PriorityLevel, ProblemCategory } from '../../types';

export const WardOperationsMapPage: React.FC = () => {
  const { cases } = useCases();
  const { currentUser } = useAuth();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAssets, setShowAssets] = useState<boolean>(true);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [selectedIncident, setSelectedIncident] = useState<Case | null>(null);

  // Scoped cases
  const wardCases = cases.filter(c => !currentUser.wardId || c.location.wardId === currentUser.wardId);

  const filteredCases = wardCases.filter(c => {
    const matchPriority = selectedPriority === 'all' || c.priority === selectedPriority;
    const matchCategory = selectedCategory === 'all' || c.category === selectedCategory;
    return matchPriority && matchCategory;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [23.8682, 90.3985], // Ward 12 / Dhaka Center
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Nagorik Sathi AI Ward Map',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    filteredCases.forEach(item => {
      const isEmergency = item.priority === 'emergency';
      const isHigh = item.priority === 'high';
      const isVerified = item.status === 'verified' || item.status === 'in_progress';

      // Pin Color according to priority
      const pinColor = isEmergency
        ? '#dc2626' // red
        : isHigh
        ? '#d97706' // amber
        : '#16a34a'; // green

      const markerHtml = `
        <div style="
          background-color: ${pinColor};
          width: ${isEmergency ? '28px' : '22px'};
          height: ${isEmergency ? '28px' : '22px'};
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 10px;
          cursor: pointer;
        ">
          ${isEmergency ? '!' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-map-pin',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([item.location.lat, item.location.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedIncident(item);
      });

      marker.bindTooltip(`
        <div style="font-size: 11px; padding: 2px 4px;">
          <strong>#${item.id}</strong><br/>
          <span>${item.title.slice(0, 35)}...</span>
        </div>
      `);

      markersLayerRef.current?.addLayer(marker);
    });

    // If there are cases, fit map bounds
    if (filteredCases.length > 0 && mapRef.current) {
      const group = L.featureGroup(markersLayerRef.current.getLayers() as L.Marker[]);
      mapRef.current.fitBounds(group.getBounds().pad(0.15));
    }
  }, [filteredCases]);

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] bg-[var(--paper-elevated)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              {currentUser.wardName || 'ওয়ার্ড ১২'}
            </span>
            <span className="text-xs text-[var(--muted)]">স্থানিক মনিটরিং ও জিওগ্রাফিক কমান্ড</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] tracking-tight">
            ওয়ার্ড অপারেশন্স ও অ্যাসেট মানচিত্র (Ward Operations Map)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-2xl">
            ঘটনার অবস্থান, অগ্রাধিকার, নিয়মিত অ্যাসেট এবং হটস্পট ক্লাস্টার মানচিত্রে পর্যবেক্ষণ করুন
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)]">
            পিন সংখ্যা: <strong className="text-[var(--green)] font-bold">{toBanglaNumber(filteredCases.length)}</strong>
          </span>
        </div>
      </div>

      {/* Map Controls & Filters */}
      <div className="civic-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span className="text-xs text-[var(--muted)] font-medium">অগ্রাধিকার:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-lg border border-[var(--line)] font-semibold cursor-pointer"
            >
              <option value="all">সকল</option>
              <option value="emergency">জরুরি (Emergency - Red)</option>
              <option value="high">উচ্চ (High - Amber)</option>
              <option value="medium">মাঝারি (Medium)</option>
              <option value="low">সাধারণ (Low)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--muted)] font-medium">ক্যাটাগরি:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-lg border border-[var(--line)] font-semibold cursor-pointer"
            >
              <option value="all">সকল ক্যাটাগরি</option>
              <option value="drainage">ড্রেনেজ</option>
              <option value="waste">বর্জ্য</option>
              <option value="road_engineering">সড়ক</option>
              <option value="lighting">সড়ক বাতি</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showAssets}
              onChange={(e) => setShowAssets(e.target.checked)}
              className="rounded text-[var(--green)]"
            />
            <span className="font-medium text-[var(--ink)]">ভেরিফাইড অ্যাসেট লেয়ার</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={(e) => setShowHotspots(e.target.checked)}
              className="rounded text-orange-600"
            />
            <span className="font-medium text-[var(--ink)]">হটস্পট জোন</span>
          </label>
        </div>
      </div>

      {/* Map Canvas & Detail Modal */}
      <div className="civic-card rounded-2xl overflow-hidden border border-[var(--line)] relative h-[650px] shadow-xs">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Selected Incident Drawer / Popover */}
        {selectedIncident && (
          <div className="absolute top-4 right-4 z-20 max-w-sm w-full civic-card rounded-2xl p-5 shadow-2xl border border-[var(--line)] bg-[var(--paper)] animate-fade-in space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-[var(--ink)]">#{selectedIncident.id}</span>
                  <PriorityBadge priority={selectedIncident.priority} />
                </div>
                <h4 className="text-sm font-bold text-[var(--ink)] mt-1.5">{selectedIncident.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="w-7 h-7 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--muted)] line-clamp-3 leading-relaxed">
              {selectedIncident.description}
            </p>

            <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs space-y-1">
              <div className="flex items-start gap-1 font-semibold text-[var(--ink)]">
                <MapPin className="w-3.5 h-3.5 text-[var(--green)] shrink-0 mt-0.5" />
                <span>{selectedIncident.location.address}</span>
              </div>
              {selectedIncident.aiAnalysis.assetName && (
                <div className="text-[11px] text-[var(--green)] font-mono">
                  সম্পর্কিত অ্যাসেট: {selectedIncident.aiAnalysis.assetName}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
              <StatusBadge status={selectedIncident.status} />
              <Link
                to={`/ward/cases/${selectedIncident.id}`}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-1 cursor-pointer"
              >
                <span>কেস বিস্তারিত</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-20 civic-card rounded-xl p-3 bg-[var(--paper)]/95 backdrop-blur-xs border border-[var(--line)] shadow-md text-xs space-y-1.5">
          <div className="font-bold text-[var(--ink)] text-[11px] uppercase tracking-wider">মানচিত্র সংকেত</div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" />
            <span>জরুরি নিরাপত্তা ঝুঁকি (Emergency)</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span>উচ্চ অগ্রাধিকার (High)</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
            <span>মাঝারি ও সাধারণ (Standard)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
