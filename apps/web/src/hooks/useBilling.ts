import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi, Subscription, PlanLimits } from '../api/billing';

export function useSubscription() {
  return useQuery<Subscription>({
    queryKey: ['subscription'],
    queryFn: async () => {
      const data = await billingApi.getSubscription();
      // Debug logging (commented out for production - uncomment for debugging)
      // console.log('useSubscription - Fetched subscription:', data);
      // console.log('useSubscription - Is Pro:', data?.is_pro);
      return data;
    },
    staleTime: 0, // Always refetch to get latest status
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Refetch when component mounts
  });
}

export function usePlanLimits() {
  return useQuery<PlanLimits>({
    queryKey: ['planLimits'],
    queryFn: billingApi.getLimits,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpgrade() {
  const queryClient = useQueryClient();

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const currentUrl = window.location.origin;
      const response = await billingApi.createCheckoutSession(
        `${currentUrl}/settings/billing?success=true`,
        `${currentUrl}/settings/billing?canceled=true`
      );
      return response;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.checkout_url;
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const currentUrl = window.location.origin;
      const response = await billingApi.createPortalSession(
        `${currentUrl}/settings/billing`
      );
      return response;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Customer Portal
      window.location.href = data.portal_url;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: billingApi.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: billingApi.reactivateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  return {
    upgrade: checkoutMutation.mutate,
    isUpgrading: checkoutMutation.isPending,
    openPortal: portalMutation.mutate,
    isOpeningPortal: portalMutation.isPending,
    cancel: cancelMutation.mutate,
    isCanceling: cancelMutation.isPending,
    reactivate: reactivateMutation.mutate,
    isReactivating: reactivateMutation.isPending,
  };
}

// Hook to check if user can create resource
export function useCanCreate() {
  const { data: limits } = usePlanLimits();

  return {
    canCreateProject: limits?.can_create_project ?? true,
    canCreateClient: limits?.can_create_client ?? true,
    projectsUsed: limits?.current_projects ?? 0,
    projectsMax: limits?.max_projects ?? 3,
    clientsUsed: limits?.current_clients ?? 0,
    clientsMax: limits?.max_clients ?? 2,
    plan: limits?.plan ?? 'free',
  };
}
