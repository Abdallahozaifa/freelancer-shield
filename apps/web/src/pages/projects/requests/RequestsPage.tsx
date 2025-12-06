import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Briefcase
} from 'lucide-react';
import { Button, Card, Badge } from '../../../components/ui';
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
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200 mb-6 text-white transform hover:scale-105 transition-transform duration-300">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Request Hub
        </h1>
        <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
          Manage incoming client requests. Review pending items and detect scope creep before it impacts your timeline.
        </p>
      </div>

      {/* Main Content Card */}
      <Card className="border-slate-200 shadow-sm overflow-hidden bg-slate-50/50">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-slate-100 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Projects</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Requests are tied to projects. Create a project to start tracking client communications.
            </p>
            <Link to="/projects/new">
              <Button className="shadow-lg shadow-indigo-500/20">
                Create New Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            <div className="px-4 py-2 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Active Projects ({sortedProjects.length})</span>
              <span>Status</span>
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
                    bg-white p-4 rounded-xl border transition-all duration-200 relative overflow-hidden flex items-center justify-between gap-4
                    ${hasAlerts 
                      ? 'border-red-100 hover:border-red-300 hover:shadow-md' 
                      : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                    }
                  `}>
                    {/* Left: Indicator Bar */}
                    {hasAlerts && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                    )}

                    {/* Project Info */}
                    <div className="flex items-start gap-4 pl-2">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors
                        ${hasAlerts 
                          ? 'bg-red-50 text-red-600' 
                          : 'bg-indigo-50 text-indigo-600'
                        }
                      `}>
                        {hasAlerts ? (
                          <AlertTriangle className="w-5 h-5" />
                        ) : (
                          <MessageSquare className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">
                          {project.client_name}
                        </p>
                      </div>
                    </div>

                    {/* Right: Status Badges & Action */}
                    <div className="flex items-center gap-4">
                      {hasAlerts ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full border border-red-100">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold whitespace-nowrap">
                            {project.out_of_scope_request_count} Out of Scope
                          </span>
                        </div>
                      ) : (
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-full border border-slate-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs font-medium">All Clear</span>
                        </div>
                      )}

                      <div className="pl-2">
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {sortedProjects.length > 5 && (
          <div className="bg-white border-t border-slate-100 p-4 text-center">
            <Link 
              to="/projects" 
              className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
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