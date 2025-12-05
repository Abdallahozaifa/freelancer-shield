import { apiClient } from './client';

export interface Subscription {
  plan: 'free' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | 'unpaid';
  is_pro: boolean;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  max_projects: number;
  max_clients: number;
  current_projects: number;
  current_clients: number;
}

export interface PlanLimits {
  plan: 'free' | 'pro';
  max_projects: number;
  max_clients: number;
  current_projects: number;
  current_clients: number;
  can_create_project: boolean;
  can_create_client: boolean;
}

export interface CheckoutResponse {
  checkout_url: string;
}

export interface PortalResponse {
  portal_url: string;
}

export const billingApi = {
  // Get current subscription
  getSubscription: async (): Promise<Subscription> => {
    const response = await apiClient.get('/billing/subscription');
    return response.data;
  },

  // Get plan limits
  getLimits: async (): Promise<PlanLimits> => {
    const response = await apiClient.get('/billing/limits');
    return response.data;
  },

  // Create checkout session for upgrade
  createCheckoutSession: async (successUrl: string, cancelUrl: string): Promise<CheckoutResponse> => {
    const response = await apiClient.post('/billing/create-checkout-session', {
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return response.data;
  },

  // Create portal session for managing subscription
  createPortalSession: async (returnUrl: string): Promise<PortalResponse> => {
    const response = await apiClient.post('/billing/create-portal-session', {
      return_url: returnUrl,
    });
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (): Promise<void> => {
    await apiClient.post('/billing/cancel');
  },

  // Reactivate subscription
  reactivateSubscription: async (): Promise<void> => {
    await apiClient.post('/billing/reactivate');
  },
};
