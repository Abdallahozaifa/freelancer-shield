import { useProStatus } from './useProStatus';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';

export interface FeatureLimits {
  maxProjects: number;
  maxClients: number;
  hasSmartScopeDetection: boolean;
  hasProposalGenerator: boolean;
  hasAdvancedAnalytics: boolean;
  hasPrioritySupport: boolean;
}

export const useFeatureGate = () => {
  const { isPro, subscription, isLoading } = useProStatus();
  const navigate = useNavigate();
  const toast = useToast();

  const limits: FeatureLimits = {
    maxProjects: isPro ? Infinity : 3,
    maxClients: isPro ? Infinity : 2,
    hasSmartScopeDetection: isPro,
    hasProposalGenerator: isPro,
    hasAdvancedAnalytics: isPro,
    hasPrioritySupport: isPro,
  };

  const currentUsage = {
    projects: subscription?.current_projects ?? 0,
    clients: subscription?.current_clients ?? 0,
  };

  const canCreateProject = isPro || currentUsage.projects < limits.maxProjects;
  const canCreateClient = isPro || currentUsage.clients < limits.maxClients;

  const projectsRemaining = isPro ? Infinity : Math.max(0, limits.maxProjects - currentUsage.projects);
  const clientsRemaining = isPro ? Infinity : Math.max(0, limits.maxClients - currentUsage.clients);

  const showUpgradePrompt = (feature: string) => {
    toast.error(`${feature} is a Pro feature. Upgrade to unlock!`);
    navigate('/settings/billing');
  };

  const requirePro = (feature: string, callback: () => void) => {
    if (isPro) {
      callback();
    } else {
      showUpgradePrompt(feature);
    }
  };

  return {
    isPro,
    isLoading,
    limits,
    currentUsage,
    canCreateProject,
    canCreateClient,
    projectsRemaining,
    clientsRemaining,
    showUpgradePrompt,
    requirePro,
  };
};

