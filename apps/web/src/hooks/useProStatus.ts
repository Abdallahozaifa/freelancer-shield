import { useSubscription } from './useBilling';

export const useProStatus = () => {
  const { data: subscription, isLoading } = useSubscription();
  
  const isPro = subscription?.is_pro ?? false;
  const isCanceled = subscription?.cancel_at_period_end ?? false;
  const currentProjects = subscription?.current_projects ?? 0;
  const maxProjects = subscription?.max_projects ?? 3;
  const currentClients = subscription?.current_clients ?? 0;
  const maxClients = subscription?.max_clients ?? 2;

  return {
    isPro,
    isCanceled,
    isLoading,
    subscription,
    // Convenience getters
    canCreateProject: isPro || currentProjects < maxProjects,
    canCreateClient: isPro || currentClients < maxClients,
    projectsRemaining: isPro ? Infinity : Math.max(0, maxProjects - currentProjects),
    clientsRemaining: isPro ? Infinity : Math.max(0, maxClients - currentClients),
    currentProjects,
    maxProjects,
    currentClients,
    maxClients,
  };
};

