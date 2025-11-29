import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  Users,
  FolderKanban,
  Settings,
  Shield,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  comingSoon?: boolean;
  divider?: never;
}

interface NavDivider {
  divider: true;
  icon?: never;
  label?: never;
  path?: never;
  comingSoon?: never;
}

type NavItemOrDivider = NavItem | NavDivider;

const navItems: NavItemOrDivider[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Clients', path: '/clients' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: BarChart3, label: 'Reports', path: '/reports', comingSoon: true },
  { divider: true },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const navRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Focus management
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Trap focus within mobile nav
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !navRef.current) return;

      const focusableElements = navRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={navRef}
        className={`fixed left-0 top-0 h-full w-72 z-50 transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-lg leading-tight">Project Shield</span>
              <span className="text-[10px] text-indigo-300 font-medium uppercase tracking-wider">Freelancer</span>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              {getInitials(user?.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-sm text-slate-400 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3" role="list">
            {navItems.map((item, index) => {
              if (item.divider) {
                return (
                  <li key={`divider-${index}`} className="my-4 mx-2">
                    <hr className="border-white/10" />
                  </li>
                );
              }

              const Icon = item.icon;
              const active = isActive(item.path);

              if (item.comingSoon) {
                return (
                  <li key={item.path}>
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 cursor-not-allowed">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      <span className="ml-auto text-[10px] bg-white/10 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                        Soon
                      </span>
                    </div>
                  </li>
                );
              }

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 ${
                      active
                        ? 'bg-white/15 text-white shadow-lg shadow-black/10'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        active ? 'text-indigo-400' : ''
                      }`}
                    />
                    <span className="font-medium">{item.label}</span>
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-400 rounded-r-full" />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
