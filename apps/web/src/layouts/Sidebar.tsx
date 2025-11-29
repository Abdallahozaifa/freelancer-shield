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
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-gray-900 whitespace-nowrap">
              Project Shield
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col h-[calc(100%-4rem)] py-4">
        <ul className="flex-1 space-y-1 px-3" role="list">
          {navItems.map((item, index) => {
            if (item.divider) {
              return (
                <li key={`divider-${index}`} className="my-4">
                  <hr className="border-gray-200" />
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
                    className="group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 cursor-not-allowed"
                  >
                    <Icon className="w-5 h-5 flex-shrink-0 text-gray-300" />
                    {!collapsed && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          Soon
                        </span>
                      </div>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
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
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      active ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'
                    }`}
                  />
                  {!collapsed && (
                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}

                  {/* Active indicator */}
                  {active && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-l" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Collapse Toggle */}
        <div className="px-3 mt-auto">
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-full gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
