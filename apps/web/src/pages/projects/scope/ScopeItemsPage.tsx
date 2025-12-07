import React from 'react';
import { Link } from 'react-router-dom';
import { Target, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui';
import { useProjects } from '../../../hooks/useProjects';

export const ScopeItemsPage: React.FC = () => {
  const { data: projectsData, isLoading } = useProjects({ status: 'active' });

  const projects = projectsData?.items ?? [];

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4">
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full mb-3 sm:mb-4">
          <Target className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Scope Items</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Scope items are managed within each project. Select a project below.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2 sm:space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 sm:h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4 text-sm sm:text-base">No active projects found.</p>
          <Link to="/projects">
            <Button size="sm" className="sm:text-base">
              Go to Projects
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {projects.slice(0, 5).map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}?tab=scope`}
              className="flex items-center justify-between p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <div className="flex-1 min-w-0 mr-3">
                <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 text-sm sm:text-base truncate">
                  {project.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{project.client_name}</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {project.scope_item_count} items
                </span>
                {project.completed_scope_count > 0 && (
                  <span className="hidden sm:inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    {project.completed_scope_count} done
                  </span>
                )}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-indigo-600" />
              </div>
            </Link>
          ))}

          {projects.length > 5 && (
            <Link to="/projects" className="block text-center py-2 sm:py-3 text-xs sm:text-sm text-indigo-600 hover:text-indigo-800">
              View all {projects.length} projects →
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ScopeItemsPage;
