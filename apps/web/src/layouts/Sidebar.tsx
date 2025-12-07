import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Settings,
  ShieldCheck,
  BarChart3,
  CreditCard,
  Crown,
  Zap,
} from 'lucide-react';
import { useProStatus } from '../hooks/useProStatus';

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
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Clients', path: '/clients' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: BarChart3, label: 'Reports', path: '/reports', comingSoon: true },
  { divider: true },
  { icon: CreditCard, label: 'Billing', path: '/settings/billing' },
  { icon: Settings, label: 'Settings', path: '/profile' },
];

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isPro, isLoading: isSubscriptionLoading } = useProStatus();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`sidebar transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-white text-lg leading-tight">
                ScopeGuard
              </span>
              <span className="text-[10px] text-indigo-300 font-medium uppercase tracking-wider">
                Freelancer
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-1" role="list">
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

            // Coming soon items
            if (item.comingSoon) {
              return (
                <li key={item.path}>
                  <div
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 cursor-not-allowed ${
                      collapsed ? 'justify-center' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-medium">{item.label}</span>
                        <span className="ml-auto text-[10px] bg-white/10 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                          Soon
                        </span>
                      </div>
                    )}
                    
                    {/* Tooltip */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
                        {item.label}
                        <span className="text-slate-400 ml-1">(Coming Soon)</span>
                      </div>
                    )}
                  </div>
                </li>
              );
            }

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    active
                      ? 'bg-white/15 text-white shadow-lg shadow-black/10'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      active ? 'text-indigo-400' : 'group-hover:text-indigo-400'
                    }`}
                  />
                  {!collapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  
                  {/* Tooltip */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl font-medium">
                      {item.label}
                    </div>
                  )}

                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-400 rounded-r-full" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section - Pro status or upgrade prompt */}
      {!collapsed && !isSubscriptionLoading && (
        <div className="absolute bottom-6 left-0 right-0 px-6">
          {isPro ? (
            <div className="p-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-200">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-900">Pro Plan</span>
              </div>
              <p className="text-xs text-indigo-600 mt-1">All features unlocked</p>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/settings/billing')}
              className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group text-left"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-900">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Unlock unlimited projects</p>
            </button>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
