import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Search,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
        setNotificationsOpen(false);
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
    { icon: User, label: 'Profile', onClick: () => navigate('/profile') },
    { icon: Settings, label: 'Settings', onClick: () => navigate('/settings') },
    { icon: HelpCircle, label: 'Help & Support', onClick: () => {} },
    { divider: true },
    { icon: LogOut, label: 'Sign out', onClick: handleLogout, danger: true },
  ];

  // Mock notifications
  const notifications = [
    {
      id: '1',
      title: 'Scope creep detected',
      message: '15 out-of-scope requests on Project 454545',
      time: '5 min ago',
      unread: true,
      type: 'warning',
    },
    {
      id: '2',
      title: 'Proposal accepted',
      message: 'Website Redesign proposal was approved',
      time: '1 hour ago',
      unread: true,
      type: 'success',
    },
    {
      id: '3',
      title: 'New client added',
      message: 'Acme Inc. was added to your clients',
      time: '3 hours ago',
      unread: false,
      type: 'info',
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

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

          {/* Search - Desktop only */}
          <div className="hidden lg:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects, clients..."
                className="w-72 pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden xl:inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-slate-400 bg-white rounded border border-slate-200">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-150"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full px-1">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden z-50 animate-fade-in">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        className={`w-full px-5 py-4 text-left hover:bg-slate-50 transition-colors flex gap-3 ${
                          notification.unread ? 'bg-indigo-50/50' : ''
                        }`}
                        onClick={() => setNotificationsOpen(false)}
                      >
                        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          notification.unread ? 'bg-indigo-500' : 'bg-transparent'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm">
                            {notification.title}
                          </p>
                          <p className="text-slate-600 text-sm mt-0.5 truncate">
                            {notification.message}
                          </p>
                          <p className="text-slate-400 text-xs mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                  <button
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 w-full text-center"
                    onClick={() => {
                      setNotificationsOpen(false);
                    }}
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-200 mx-2" />

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-1.5 hover:bg-slate-100 rounded-xl transition-all duration-150"
              aria-label="User menu"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {getInitials(user?.full_name)}
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
