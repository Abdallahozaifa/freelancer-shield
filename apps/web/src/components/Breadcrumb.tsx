import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, showHome = true }) => {
  if (items.length === 0) return null;

  const allItems = showHome
    ? [{ label: 'Home', path: '/' }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isHome = index === 0 && showHome;

          return (
            <li key={item.label} className="flex items-center">
              {index > 0 && (
                <ChevronRight
                  className="w-4 h-4 text-gray-400 mx-1 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              
              {isLast ? (
                <span
                  className="text-gray-500 font-medium truncate max-w-[200px]"
                  aria-current="page"
                >
                  {isHome ? <Home className="w-4 h-4" /> : item.label}
                </span>
              ) : item.path ? (
                <Link
                  to={item.path}
                  className="text-gray-600 hover:text-indigo-600 transition-colors truncate max-w-[200px]"
                >
                  {isHome ? (
                    <Home className="w-4 h-4" aria-label="Home" />
                  ) : (
                    item.label
                  )}
                </Link>
              ) : (
                <span className="text-gray-600 truncate max-w-[200px]">
                  {isHome ? <Home className="w-4 h-4" /> : item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
