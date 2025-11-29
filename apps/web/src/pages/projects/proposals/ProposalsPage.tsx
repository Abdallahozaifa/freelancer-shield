import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, DollarSign } from 'lucide-react';
import { Button } from '../../../components/ui';
import { useProjects } from '../../../hooks/useProjects';

export const ProposalsPage: React.FC = () => {
  const { data: projectsData, isLoading } = useProjects();
  const projects = projectsData?.items ?? [];

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
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
  );
};

export default ProposalsPage;
