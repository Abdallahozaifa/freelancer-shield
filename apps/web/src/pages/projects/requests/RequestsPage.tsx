import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Briefcase
} from 'lucide-react';
import { Button, Card } from '../../../components/ui';
import { useProjects } from '../../../hooks/useProjects';

export const RequestsPage: React.FC = () => {
  const { data: projectsData, isLoading } = useProjects({ status: 'active' });

  const projects = projectsData?.items ?? [];

  // Sort projects: Put ones with out-of-scope requests first
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => 
      b.out_of_scope_request_count - a.out_of_scope_request_count
    );
  }, [projects]);

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center mb-6 sm:mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-200 mb-4 sm:mb-6 text-white transform hover:scale-105 transition-transform duration-300">
          <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 sm:mb-3 tracking-tight">
          Request Hub
        </h1>
        <p className="text-sm sm:text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
          Manage incoming client requests. Review pending items and detect scope creep.
        </p>
      </div>

      {/* Main Content Card */}
      <Card className="border-slate-200 shadow-sm overflow-hidden bg-slate-50/50">
        {isLoading ? (
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-100 flex items-center gap-3 sm:gap-4 animate-pulse">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4 sm:px-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">No Active Projects</h3>
            <p className="text-sm text-slate-500 mb-4 sm:mb-6 max-w-sm mx-auto">
              Requests are tied to projects. Create a project to start tracking.
            </p>
            <Link to="/projects/new">
              <Button size="sm" className="sm:text-base shadow-lg shadow-indigo-500/20">
                Create New Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {/* Header - Simpler on mobile */}
            <div className="px-3 sm:px-4 py-2 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Projects ({sortedProjects.length})</span>
              <span className="hidden sm:inline">Status</span>
            </div>
            
            {sortedProjects.map((project) => {
              const hasAlerts = project.out_of_scope_request_count > 0;

              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}?tab=requests`}
                  className="block group"
                >
                  <div className={`
                    bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200 relative overflow-hidden
                    ${hasAlerts 
                      ? 'border-red-100 hover:border-red-300 active:bg-red-50' 
                      : 'border-slate-200 hover:border-indigo-300 active:bg-slate-50'
                    }
                  `}>
                    {/* Left: Indicator Bar */}
                    {hasAlerts && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                    )}

                    <div className="flex items-center justify-between gap-3">
                      {/* Project Info */}
                      <div className="flex items-center gap-3 pl-1 sm:pl-2 flex-1 min-w-0">
                        <div className={`
                          w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0
                          ${hasAlerts 
                            ? 'bg-red-50 text-red-600' 
                            : 'bg-indigo-50 text-indigo-600'
                          }
                        `}>
                          {hasAlerts ? (
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm sm:text-base truncate">
                            {project.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                            {project.client_name}
                          </p>
                        </div>
                      </div>

                      {/* Right: Status & Arrow */}
                      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        {hasAlerts ? (
                          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-50 text-red-700 rounded-full border border-red-100">
                            <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">
                              {project.out_of_scope_request_count}
                              <span className="hidden sm:inline"> Out of Scope</span>
                            </span>
                          </div>
                        ) : (
                          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-full border border-slate-100">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-medium">All Clear</span>
                          </div>
                        )}
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover:text-indigo-500 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {sortedProjects.length > 5 && (
          <div className="bg-white border-t border-slate-100 p-3 sm:p-4 text-center">
            <Link 
              to="/projects" 
              className="inline-flex items-center text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all projects <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RequestsPage;