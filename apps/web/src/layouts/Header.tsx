import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  ChevronDown,
  Settings,
  LogOut,
  HelpCircle,
  CreditCard,
  Crown,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useProStatus } from '../hooks/useProStatus';
import { ProBadge } from '../components/ui/ProBadge';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isPro, isLoading: isSubscriptionLoading } = useProStatus();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const userMenuItems = [
    { icon: Settings, label: 'Settings', onClick: () => navigate('/profile') },
    { icon: CreditCard, label: 'Billing', onClick: () => navigate('/settings/billing') },
    { icon: HelpCircle, label: 'Help & Support', onClick: () => {} },
    { divider: true },
    { icon: LogOut, label: 'Sign out', onClick: handleLogout, danger: true },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Menu toggle */}
          <button
            onClick={onMenuClick}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-150"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Pro Badge - only show when loaded and isPro */}
          {!isSubscriptionLoading && isPro && (
            <div className="hidden md:block">
              <ProBadge size="sm" variant="gradient" />
            </div>
          )}
          
          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-1.5 hover:bg-slate-100 rounded-xl transition-all duration-150"
              aria-label="User menu"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {getInitials(user?.full_name)}
                </div>
                {!isSubscriptionLoading && isPro && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <Crown className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-700 leading-tight">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-400">
                  {user?.business_name || 'Freelancer'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden z-50 animate-fade-in">
                {/* User Info */}
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                  <p className="font-semibold text-slate-900">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {user?.email || ''}
                  </p>
                  {!isSubscriptionLoading && isPro && (
                    <div className="mt-2">
                      <ProBadge size="sm" variant="subtle" />
                    </div>
                  )}
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  {userMenuItems.map((item, index) => {
                    if ('divider' in item && item.divider) {
                      return <hr key={`divider-${index}`} className="my-2 border-slate-100" />;
                    }

                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          item.onClick?.();
                          setUserMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 w-full px-5 py-2.5 text-sm transition-colors ${
                          item.danger
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
