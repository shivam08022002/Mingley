import { create } from 'zustand';
import { discoverService } from '../../../services/apiServices';

export const useDiscoverStore = create((set, get) => ({
  profiles: [],
  isLoading: false,
  error: null,
  page: 1,
  hasMore: true,

  fetchProfiles: async (filters = {}) => {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const params = {
        page: get().page,
        limit: 20,
        interestedIn: filters.interestedIn || 'both',
        distance: filters.distance || 50,
        ageRange: filters.ageRange || [18, 40],
        onlineStatus: filters.onlineStatus || false,
        verifiedOnly: filters.verifiedOnly || false,
        ...filters,
      };

      // Fetch from both endpoints concurrently
      const [feedResponse, likesResponse] = await Promise.all([
        discoverService.getFeed(params),
        discoverService.getLikesFeed(params)
      ]);

      const feedProfiles = feedResponse.data?.users || [];
      const likesProfiles = likesResponse.data?.users || [];

      // Merge and deduplicate
      const mergedProfiles = [...likesProfiles, ...feedProfiles];
      const uniqueProfilesMap = new Map();
      
      mergedProfiles.forEach(p => {
        const id = p.id || p._id;
        if (id && !uniqueProfilesMap.has(id)) {
          uniqueProfilesMap.set(id, p);
        }
      });

      const newProfiles = Array.from(uniqueProfilesMap.values());
      const hasNext = (feedResponse.data?.pagination?.hasNext || likesResponse.data?.pagination?.hasNext) ?? false;
      
      set((state) => ({
        profiles: state.page === 1 ? newProfiles : [...state.profiles, ...newProfiles],
        hasMore: hasNext,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error.message || 'Failed to fetch profiles', isLoading: false });
    }
  },

  swipe: async (targetId, action) => {
    try {
      const response = await discoverService.swipe({ targetId, action });
      
      set((state) => ({
        profiles: state.profiles.filter((p) => (p.id || p._id) !== targetId),
      }));

      // Return the data to the component so it can show the match screen if needed
      return response.data || response;
    } catch (error) {
      console.error('Swipe error:', error);
      return null;
    }
  },

  resetPage: () => set({ page: 1, profiles: [], hasMore: true }),
  
  incrementPage: () => set((state) => ({ page: state.page + 1 })),
}));
