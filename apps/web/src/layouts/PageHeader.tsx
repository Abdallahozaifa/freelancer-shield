import React from 'react';
import { Breadcrumb, BreadcrumbItem } from '../components/Breadcrumb';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  breadcrumbs = [],
  showBreadcrumbs = true,
}) => {
  return (
    <div className="mb-6">
      {showBreadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} />
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{title}</h1>
          {description && (
            <p className="mt-1 text-gray-500">{description}</p>
          )}
        </div>
        
        {action && (
          <div className="flex-shrink-0">{action}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
