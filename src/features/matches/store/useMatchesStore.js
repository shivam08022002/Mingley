import { create } from 'zustand';
import { matchesService } from '../../../services/apiServices';

export const useMatchesStore = create((set, get) => ({
  matches: [],
  isLoading: false,
  error: null,

  fetchMatches: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('useMatchesStore: Fetching matches...');
      const response = await matchesService.getMatches();
      console.log('useMatchesStore: Fetch matches response:', JSON.stringify(response));
      // API returns full body: { success, data: { matches: [...] } }
      // matchesService.getMatches() returns response.data (axios unwrap)
      // so response here = { success, statusCode, data: { matches } }
      const matches =
        response?.data?.matches ||
        response?.matches ||
        (Array.isArray(response?.data) ? response.data : []) ||
        [];
      console.log('useMatchesStore: Parsed matches count:', matches.length);
      set({ matches, isLoading: false });
    } catch (error) {
      console.error('useMatchesStore: Fetch matches failed:', error);
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

  pushNewMatch: (match) => {
    const currentMatches = get().matches || [];
    const matchId = match.matchId || match.id || match._id;
    if (!currentMatches.some((m) => (m.matchId || m.id || m._id) === matchId)) {
      set({ matches: [match, ...currentMatches] });
    }
  },
}));
