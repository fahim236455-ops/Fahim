import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Bell, User, Trophy, Headphones, Power } from 'lucide-react';
import { NavigationDrawer } from './NavigationDrawer';
import { Logo } from './Logo';

interface HeaderProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentRoute }) => {
  const { user, logout } = useApp();
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

  const userInitial = user?.fullName?.trim()?.charAt(0)?.toUpperCase() || 'F';

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#060b18]/95 backdrop-blur-md border-b border-slate-800/80 shadow-md">
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between relative">
          {/* Left: Hamburger Menu (Cyan/Sky) */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-800/60 text-sky-400 transition-colors focus:outline-none cursor-pointer"
            aria-label="মেনু খুলুন"
          >
            <Menu className="w-6 h-6 stroke-[2.2]" />
          </button>

          {/* Center: Earnora Official Brand Logo & Wordmark */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="focus:outline-none flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Logo variant="full" size={26} theme="dark" />
          </button>

          {/* Right: Notifications & Profile Avatar */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              onClick={() => onNavigate('pending-status')}
              className="relative w-8 h-8 rounded-full bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 text-sky-400 flex items-center justify-center transition-colors cursor-pointer shadow-inner"
              title="নোটিফিকেশন ও কাজের স্ট্যাটাস"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-[#060b18]" />
            </button>

            {/* Profile Avatar with Emerald Ring and Initial */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="relative p-0.5 rounded-full border-2 border-emerald-400 overflow-hidden hover:scale-105 transition-transform bg-[#0a1224] shadow-sm flex items-center justify-center w-8 h-8 focus:outline-none cursor-pointer"
                title="প্রোফাইল মেনু"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center text-xs font-bold">
                    {userInitial}
                  </div>
                )}
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0a1224] border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 text-slate-200">
                  <div className="px-4 py-2 border-b border-slate-800/80">
                    <p className="text-xs font-bold text-white truncate">{user?.fullName || 'User'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.phoneNumber || ''}</p>
                  </div>
                  <button
                    onClick={() => handleDropdownNav('account')}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800/60 flex items-center gap-3 text-xs text-slate-200 font-medium transition-colors"
                  >
                    <User className="w-4 h-4 text-amber-400" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => handleDropdownNav('leadership')}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800/60 flex items-center gap-3 text-xs text-slate-200 font-medium transition-colors"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Top (100) Referred</span>
                  </button>
                  <button
                    onClick={() => handleDropdownNav('support')}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800/60 flex items-center gap-3 text-xs text-slate-200 font-medium transition-colors"
                  >
                    <Headphones className="w-4 h-4 text-sky-400" />
                    <span>Support Chat</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 hover:bg-rose-950/50 flex items-center gap-3 text-xs text-rose-400 font-bold border-t border-slate-800 transition-colors"
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
