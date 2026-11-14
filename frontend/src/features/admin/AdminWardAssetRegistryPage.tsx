import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { toBanglaNumber } from '../../utils/formatters';
import { MapPin, Plus, Layers, Building2, CheckCircle2, Search, Filter } from 'lucide-react';

export const AdminWardAssetRegistryPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'assets' | 'wards'>('assets');
  const [assets, setAssets] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [showAssetModal, setShowAssetModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [assetForm, setAssetForm] = useState({
    asset_code: '',
    name_bn: '',
    name_en: '',
    asset_type: 'drain',
    ward_id: '',
    department_id: '',
    latitude: 22.3655,
    longitude: 91.8210,
    health_status: 'operational'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [aList, wList, dList] = await Promise.all([
        apiClient.admin.getAssets(),
        apiClient.admin.getWards(),
        apiClient.admin.getDepartments()
      ]);
      setAssets(aList || []);
      setWards(wList || []);
      setDepartments(dList || []);

      if (wList && wList.length > 0 && !assetForm.ward_id) {
        setAssetForm(prev => ({
          ...prev,
          ward_id: wList[0].id,
          department_id: dList && dList.length > 0 ? dList[0].id : ''
        }));
      }
    } catch (e) {
      console.error('Failed to load ward & asset registry', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.asset_code || !assetForm.name_bn || !assetForm.ward_id || !assetForm.department_id) {
      showError('কোড, নাম, ওয়ার্ড ও দায়িত্বপ্রাপ্ত বিভাগ নির্বাচন করা আবশ্যক।');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.admin.createAsset(assetForm);
      showSuccess('ভৌত সম্পদ (Asset) সফলভাবে নিবন্ধিত হয়েছে।');
      setShowAssetModal(false);
      setAssetForm({
        asset_code: '',
        name_bn: '',
        name_en: '',
        asset_type: 'drain',
        ward_id: wards[0]?.id || '',
        department_id: departments[0]?.id || '',
        latitude: 22.3655,
        longitude: 91.8210,
        health_status: 'operational'
      });
      loadData();
    } catch (err: any) {
      showError(err.message || 'সম্পদ তৈরিতে ত্রুটি');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAssets = assets.filter(a =>
    a.name_bn?.toLowerCase().includes(search.toLowerCase()) ||
    a.asset_code?.toLowerCase().includes(search.toLowerCase()) ||
    a.asset_type?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredWards = wards.filter(w =>
    w.ward_name_bn?.toLowerCase().includes(search.toLowerCase()) ||
    w.councillor_name?.toLowerCase().includes(search.toLowerCase()) ||
    w.zone_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              গ্রুপ ৩: নাগরিক ডেটা রেজিস্ট্রি
            </span>
            <span className="text-xs text-[var(--muted)]">জিওগ্রাফি ও অবকাঠামো ডাটাবেজ</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            ওয়ার্ড ও সম্পদ রেজিস্ট্রি (Ward & Asset Registry)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            ওয়ার্ড সীমানা, কাউন্সিলর অফিস ও সিটি কর্পোরেশনের ড্রেন, রাস্তা, এসটিএস ও সড়কবাতি সম্পদ
          </p>
        </div>

        <button
          onClick={() => setShowAssetModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন সম্পদ (Asset) নিবন্ধন</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2">
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'assets'
              ? 'bg-[var(--ink)] text-[var(--bg)]'
              : 'text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--paper)]'
          }`}
        >
          ভৌত সম্পদ রেজিস্ট্রি ({toBanglaNumber(assets.length)})
        </button>
        <button
          onClick={() => setActiveTab('wards')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'wards'
              ? 'bg-[var(--ink)] text-[var(--bg)]'
              : 'text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--paper)]'
          }`}
        >
          ওয়ার্ড জিওগ্রাফি ({toBanglaNumber(wards.length)})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="নাম, কোড বা অবস্থান দিয়ে খুঁজুন..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
        />
      </div>

      {/* Content */}
      {activeTab === 'assets' ? (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-bold">
                  <th className="p-3.5">সম্পদ কোড</th>
                  <th className="p-3.5">সম্পদের নাম ও ধরন</th>
                  <th className="p-3.5">ওয়ার্ড নম্বর</th>
                  <th className="p-3.5">মালিকানাপ্রাপ্ত বিভাগ</th>
                  <th className="p-3.5 font-mono">GPS স্থানাঙ্ক</th>
                  <th className="p-3.5 text-center">স্বাস্থ্য স্থিতি</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[var(--muted)]">সম্পদ রেজিস্ট্রি লোড হচ্ছে...</td>
                  </tr>
                ) : filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[var(--muted)]">কোনো সম্পদ পাওয়া যায়নি</td>
                  </tr>
                ) : (
                  filteredAssets.map(a => (
                    <tr key={a.id} className="hover:bg-[var(--bg)] transition">
                      <td className="p-3.5 font-mono font-bold text-[var(--ink)]">{a.asset_code}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-[var(--ink)]">{a.name_bn}</div>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)]">
                          {a.asset_type}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-[var(--ink)]">
                        ওয়ার্ড {toBanglaNumber(a.ward_number || 0)}
                      </td>
                      <td className="p-3.5 text-[var(--muted)] font-medium">{a.department_name_bn || '—'}</td>
                      <td className="p-3.5 font-mono text-[11px] text-[var(--muted)]">
                        {a.latitude.toFixed(4)}, {a.longitude.toFixed(4)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          সক্রিয় (Operational)
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-bold">
                  <th className="p-3.5">ওয়ার্ড নম্বর</th>
                  <th className="p-3.5">ওয়ার্ডের নাম</th>
                  <th className="p-3.5">জোন কোড</th>
                  <th className="p-3.5">কাউন্সিলর</th>
                  <th className="p-3.5">ওয়ার্ড কার্যালয় ও ফোন</th>
                  <th className="p-3.5 font-mono">কেন্দ্রীয় স্থানাঙ্ক</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredWards.map(w => (
                  <tr key={w.id} className="hover:bg-[var(--bg)] transition">
                    <td className="p-3.5 font-bold font-mono text-[var(--ink)]">ওয়ার্ড {toBanglaNumber(w.ward_number)}</td>
                    <td className="p-3.5 font-bold text-[var(--ink)]">{w.ward_name_bn}</td>
                    <td className="p-3.5 font-mono text-[var(--muted)]">{w.zone_code}</td>
                    <td className="p-3.5 font-medium text-[var(--ink)]">{w.councillor_name}</td>
                    <td className="p-3.5 text-[var(--muted)]">
                      <div>{w.ward_office_address}</div>
                      <div className="text-[10px] font-mono">{w.contact_phone}</div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[var(--muted)]">
                      {w.center_latitude.toFixed(4)}, {w.center_longitude.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-bold text-base text-[var(--ink)]">নতুন নাগরিক সম্পদ নিবন্ধন (Asset Registration)</h3>
              <button onClick={() => setShowAssetModal(false)} className="text-[var(--muted)] hover:text-[var(--ink)] text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">সম্পদ কোড (Asset Code) *</label>
                  <input
                    type="text"
                    required
                    value={assetForm.asset_code}
                    onChange={e => setAssetForm({ ...assetForm, asset_code: e.target.value })}
                    placeholder="যেমন: D-105"
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">সম্পদের ধরন *</label>
                  <select
                    value={assetForm.asset_type}
                    onChange={e => setAssetForm({ ...assetForm, asset_type: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                  >
                    <option value="drain">ড্রেন / নর্দমা (Drain)</option>
                    <option value="road">সড়ক / ফুটপাত (Road)</option>
                    <option value="waste_bin">সেকেন্ডারি ট্রান্সফার স্টেশন (STS)</option>
                    <option value="street_light">সড়কবাতি পোস্ট (Street Light)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--ink)] mb-1">সম্পদের নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={assetForm.name_bn}
                  onChange={e => setAssetForm({ ...assetForm, name_bn: e.target.value })}
                  placeholder="যেমন: পাঁচলাইশ প্রধান নর্দমা সেকশন"
                  className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">নির্ধারিত ওয়ার্ড *</label>
                  <select
                    value={assetForm.ward_id}
                    onChange={e => setAssetForm({ ...assetForm, ward_id: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                  >
                    {wards.map(w => (
                      <option key={w.id} value={w.id}>{w.ward_name_bn}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">দায়িত্বপ্রাপ্ত বিভাগ *</label>
                  <select
                    value={assetForm.department_id}
                    onChange={e => setAssetForm({ ...assetForm, department_id: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name_bn}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">অক্ষাংশ (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    value={assetForm.latitude}
                    onChange={e => setAssetForm({ ...assetForm, latitude: parseFloat(e.target.value) || 22.3655 })}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink)] mb-1">দ্রাঘিমাংশ (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    value={assetForm.longitude}
                    onChange={e => setAssetForm({ ...assetForm, longitude: parseFloat(e.target.value) || 91.8210 })}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--line)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssetModal(false)}
                  className="px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)] cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[var(--ink)] text-[var(--bg)] font-bold hover:opacity-90 cursor-pointer"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সম্পদ নিবন্ধন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
