import { create } from 'zustand';
import { subscriptionService } from '../../../services/apiServices';

export const useSubscriptionStore = create((set) => ({
  plans: [],
  isLoading: false,
  error: null,
  currentStatus: null,
  selectedPlan: null,

  setSelectedPlan: (plan) => set({ selectedPlan: plan }),

  fetchPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await subscriptionService.getPlans();
      let plans = response.data?.plans || response.plans || [];
      
      // Parse features if they are stringified JSON
      plans = plans.map(plan => {
        if (typeof plan.features === 'string') {
          try {
            return { ...plan, features: JSON.parse(plan.features) };
          } catch (e) {
            console.error('Error parsing features for plan:', plan.name, e);
            return plan;
          }
        }
        return plan;
      });

      // ENRICHMENT: If currentStatus exists and lacks status.plan, enrich it now!
      const currentStatus = useSubscriptionStore.getState().currentStatus;
      if (currentStatus && !currentStatus.plan && currentStatus.planName) {
        const matchingPlan = plans.find(p => p.name?.toLowerCase() === currentStatus.planName.toLowerCase());
        if (matchingPlan) {
          currentStatus.plan = matchingPlan;
          set({ currentStatus: { ...currentStatus } });
        }
      }

      set({ plans, isLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch plans', isLoading: false });
    }
  },

  fetchStatus: async () => {
    try {
      const response = await subscriptionService.getStatus();
      let status = response.data || response;
      
      // Parse plan features if present
      if (status?.plan && typeof status.plan.features === 'string') {
        try {
          status.plan.features = JSON.parse(status.plan.features);
        } catch (e) {
          console.error('Error parsing features in status:', e);
        }
      }
      
      // ENRICHMENT: If status has planName but no plan object, populate it from the loaded plans array
      if (status && !status.plan && status.planName) {
        const plansList = useSubscriptionStore.getState().plans;
        if (plansList && plansList.length > 0) {
          const matchingPlan = plansList.find(p => p.name?.toLowerCase() === status.planName.toLowerCase());
          if (matchingPlan) {
            status.plan = matchingPlan;
          }
        }
      }
      
      set({ currentStatus: status });
    } catch (error) {
      console.error('Fetch status error:', error);
    }
  },

  subscribe: async (subscriptionPayload, autoRenew = true) => {
    set({ isLoading: true, error: null });
    try {
      const payload =
        typeof subscriptionPayload === 'object' && subscriptionPayload !== null
          ? subscriptionPayload
          : { planId: subscriptionPayload, autoRenew };

      const response = await subscriptionService.subscribe(payload);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to subscribe', isLoading: false });
      throw error;
    }
  },

  cancelSubscription: async (subscriptionId, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await subscriptionService.cancelSubscription(subscriptionId, reason);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to cancel subscription', isLoading: false });
      throw error;
    }
  },
}));
