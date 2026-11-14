import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Plus, FileText, MapPin, Layers, Wrench, Shield } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeRole } = useAuth();
  const location = useLocation();

  if (activeRole === 'admin') {
    return null; // Admin uses desktop sidebar primarily
  }

  const getMobileTabs = () => {
    switch (activeRole) {
      case 'ward_desk':
        return [
          { label: 'ড্যাশবোর্ড', path: '/ward', icon: <Layers className="w-4 h-4" aria-hidden="true" /> },
          { label: 'যাচাই কিউ', path: '/ward/verification', icon: <Shield className="w-4 h-4" aria-hidden="true" /> },
          { label: 'ম্যাপ', path: '/map', icon: <MapPin className="w-4 h-4" aria-hidden="true" /> },
          { label: 'ডুপ্লিকেট', path: '/ward/duplicates', icon: <FileText className="w-4 h-4" aria-hidden="true" /> }
        ];
      case 'field_officer':
        return [
          { label: 'আমার কাজ', path: '/officer', icon: <Wrench className="w-4 h-4" aria-hidden="true" /> },
          { label: 'ম্যাপ', path: '/map', icon: <MapPin className="w-4 h-4" aria-hidden="true" /> },
          { label: 'বিজ্ঞপ্তি', path: '/notifications', icon: <FileText className="w-4 h-4" aria-hidden="true" /> }
        ];
      case 'coordinator':
        return [
          { label: 'কমান্ড', path: '/coordinator', icon: <Layers className="w-4 h-4" aria-hidden="true" /> },
          { label: 'হটস্পট', path: '/coordinator/hotspots', icon: <MapPin className="w-4 h-4" aria-hidden="true" /> },
          { label: 'এসএলএ', path: '/coordinator/escalations', icon: <Shield className="w-4 h-4" aria-hidden="true" /> }
        ];
      default: // citizen
        return [
          { label: 'হোম', path: '/', icon: <Home className="w-4 h-4" aria-hidden="true" /> },
          { label: 'অভিযোগ', path: '/cases', icon: <FileText className="w-4 h-4" aria-hidden="true" /> },
          { label: 'সমস্যা জানান', path: '/report', icon: <Plus className="w-5 h-5" aria-hidden="true" />, isFab: true },
          { label: 'ম্যাপ', path: '/map', icon: <MapPin className="w-4 h-4" aria-hidden="true" /> },
          { label: 'সেবাসমূহ', path: '/services', icon: <Layers className="w-4 h-4" aria-hidden="true" /> }
        ];
    }
  };

  const tabs = getMobileTabs();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--paper)]/95 backdrop-blur-md border-t border-[var(--line)] px-2 py-1 shadow-md" aria-label="Mobile Navigation">
      <div className="flex items-center justify-around">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path;
          if (tab.isFab) {
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center justify-center -mt-4 group"
                aria-label={tab.label}
              >
                <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center shadow-md border-2 border-[var(--paper)] transition transform active:scale-95 group-hover:opacity-90">
                  {tab.icon}
                </div>
                <span className="text-[10px] font-bold text-[var(--ink)] mt-0.5">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center py-1 px-2 rounded-md transition ${
                isActive ? 'text-[var(--ink)] font-bold' : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.icon}
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
