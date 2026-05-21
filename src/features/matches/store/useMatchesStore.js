import { create } from 'zustand';
import { matchesService } from '../../../services/apiServices';

export const useMatchesStore = create((set, get) => ({
  matches: [],
  isLoading: false,
  error: null,

  fetchMatches: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await matchesService.getMatches();
      const matches = response.data?.matches || [];
      set({ matches, isLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch matches', isLoading: false });
    }
  },

  removeMatch: async (matchId) => {
    try {
      await matchesService.declineMatch(matchId);
      set((state) => ({
        matches: state.matches.filter((m) => (m.matchId || m.id || m._id) !== matchId),
      }));
    } catch (error) {
      console.error('Remove match error:', error);
    }
  },
}));
