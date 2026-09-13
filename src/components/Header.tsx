import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Bell, User, Trophy, DownloadCloud, Headphones, Moon, Power } from 'lucide-react';
import { NavigationDrawer } from './NavigationDrawer';

interface HeaderProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentRoute }) => {
  const { user, logout, isDarkMode, toggleDarkMode } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownNav = (route: string) => {
    setProfileDropdownOpen(false);
    onNavigate(route);
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md text-white shadow-lg shadow-black/40 border-b border-slate-800/80">
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between relative">
          {/* Left: Hamburger Menu */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-900 text-sky-400 transition-colors focus:outline-none"
            aria-label="মেনু খুলুন"
          >
            <Menu className="w-6 h-6 stroke-[2.2]" />
          </button>

          {/* Center: Brand Title */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="focus:outline-none flex items-center justify-center"
          >
            <h1 className="text-base sm:text-lg font-black tracking-widest uppercase bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-400 bg-clip-text text-transparent font-sans">
              EARNORA
            </h1>
          </button>

          {/* Right: Notifications & Profile Avatar */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              onClick={() => onNavigate('pending-status')}
              className="relative p-2 rounded-full bg-slate-900 text-sky-400 hover:bg-slate-800 transition-colors border border-slate-800 shadow-inner"
              title="নোটিফিকেশন ও কাজের স্ট্যাটাস"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-sky-400 rounded-full animate-pulse shadow-sm shadow-sky-400" />
            </button>

            {/* Profile Avatar with Emerald Ring */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="relative p-0.5 rounded-full border-2 border-emerald-400/90 overflow-hidden hover:scale-105 transition-transform bg-slate-900 shadow-md shadow-emerald-500/20 flex items-center justify-center w-8 h-8 focus:outline-none"
                title="প্রোফাইল মেনু"
              >
                <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center text-xs font-bold border border-slate-700">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <button
                    onClick={() => handleDropdownNav('account')}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-3 text-sm text-slate-200 transition-colors"
                  >
                    <User className="w-4 h-4 text-sky-400" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => handleDropdownNav('leadership')}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-3 text-sm text-slate-200 transition-colors"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Top (100) Referred</span>
                  </button>
                  <button
                    onClick={() => {}}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-3 text-sm text-slate-200 transition-colors"
                  >
                    <DownloadCloud className="w-4 h-4 text-emerald-400" />
                    <span>App Download</span>
                  </button>
                  <button
                    onClick={() => handleDropdownNav('support')}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-3 text-sm text-slate-200 transition-colors"
                  >
                    <Headphones className="w-4 h-4 text-blue-400" />
                    <span>Support Chat</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDarkMode();
                    }}
                    className="w-full px-4 py-2.5 hover:bg-slate-800 flex items-center justify-between text-sm text-slate-200 border-b border-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Moon className="w-4 h-4 text-slate-400" />
                      <span>Dark Mode</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative shadow-inner transition-colors duration-300 ${isDarkMode ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${isDarkMode ? 'right-0.5' : 'left-0.5'}`}></div>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-3 text-sm text-rose-400 font-medium transition-colors"
                  >
                    <Power className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer */}
      <NavigationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={onNavigate}
        currentRoute={currentRoute}
      />
    </>
  );
};
