import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, DollarSign, Briefcase, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui';
import { useProjects } from '../../../hooks/useProjects';

export const ProposalsPage: React.FC = () => {
  const { data: projectsData, isLoading } = useProjects();
  const projects = projectsData?.items ?? [];

  return (
    <>
      {/* ============================================ */}
      {/* MOBILE LAYOUT - Only visible below lg */}
      {/* ============================================ */}
      <div className="lg:hidden min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-green-700 px-4 pt-6 pb-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/20 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Proposals</h1>
            </div>
            <p className="text-emerald-100 text-sm">
              Select a project to manage proposals
            </p>
          </div>
        </div>

        {/* Content - overlapping header */}
        <div className="px-4 -mt-6 pb-6 relative z-10">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-white rounded-xl animate-pulse shadow-sm" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-slate-600 mb-4">No projects found</p>
              <Link to="/projects">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Go to Projects
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}?tab=proposals`}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-200 active:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {project.name}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">{project.client_name}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </Link>
              ))}

              {projects.length > 5 && (
                <Link
                  to="/projects"
                  className="block text-center py-4 text-sm font-medium text-emerald-600 active:text-emerald-700"
                >
                  View all {projects.length} projects
                  <ArrowRight className="w-4 h-4 inline ml-1" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* DESKTOP LAYOUT - Only visible at lg and above */}
      {/* ============================================ */}
      <div className="hidden lg:block max-w-2xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Proposals</h1>
          <p className="text-gray-600">
            Proposals are managed within each project. Select a project below to view and manage its proposals.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">No projects found.</p>
            <Link to="/projects">
              <Button>
                Go to Projects
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}?tab=proposals`}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all group"
              >
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-green-600">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500">{project.client_name}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
              </Link>
            ))}

            {projects.length > 5 && (
              <Link to="/projects" className="block text-center py-3 text-sm text-green-600 hover:text-green-800">
                View all {projects.length} projects →
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ProposalsPage;
