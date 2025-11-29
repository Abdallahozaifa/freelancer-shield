import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  BarChart3,
} from 'lucide-react';

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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-gray-900 transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-indigo-500 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-white whitespace-nowrap">
              Project Shield
            </span>
          )}
        </div>
        
        {/* Collapse button in header */}
        <button
          onClick={onToggle}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="py-4">
        <ul className="space-y-1 px-3" role="list">
          {navItems.map((item, index) => {
            if (item.divider) {
              return (
                <li key={`divider-${index}`} className="my-4">
                  <hr className="border-gray-800" />
                </li>
              );
            }

            const Icon = item.icon;
            const active = isActive(item.path);

            // Coming soon items - not clickable
            if (item.comingSoon) {
              return (
                <li key={item.path}>
                  <div
                    className="group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 cursor-not-allowed"
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                        <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                          Soon
                        </span>
                      </div>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                        {item.label} (Coming Soon)
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
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active
                      ? 'bg-indigo-500/20 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      active ? 'text-indigo-400' : ''
                    }`}
                  />
                  {!collapsed && (
                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}

                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-400 rounded-r" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
