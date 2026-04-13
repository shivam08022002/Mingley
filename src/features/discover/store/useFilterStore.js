import { create } from 'zustand';

const ALL_INTERESTS = ['Music', 'Travel', 'Gym', 'Movies', 'Reading', 'Cooking', 'Art', 'Dancing', 'Photography', 'Yoga'];

const DEFAULT_FILTERS = {
  interestedIn: 'girls',      // 'girls' | 'boys' | 'both'
  location: 'Mumbai, India',
  distance: 40,               // km
  ageRange: [20, 35],         // [min, max]
  onlineStatus: false,
  verifiedOnly: false,
  interests: [],              // []string — empty = no filter
  relationshipType: 'both',   // 'casual' | 'serious' | 'both'
};

export const useFilterStore = create((set, get) => ({
  ...DEFAULT_FILTERS,

  setInterestedIn: (v) => set({ interestedIn: v }),
  setLocation: (v) => set({ location: v }),
  setDistance: (v) => set({ distance: v }),
  setAgeRange: (v) => set({ ageRange: v }),
  setOnlineStatus: (v) => set({ onlineStatus: v }),
  setVerifiedOnly: (v) => set({ verifiedOnly: v }),
  toggleInterest: (interest) =>
    set((state) => ({
      interests: state.interests.includes(interest)
        ? state.interests.filter((i) => i !== interest)
        : [...state.interests, interest],
    })),
  setRelationshipType: (v) => set({ relationshipType: v }),

  reset: () => set({ ...DEFAULT_FILTERS }),

  // Returns whether any non-default filter is active
  hasActiveFilters: () => {
    const s = get();
    return (
      s.interestedIn !== DEFAULT_FILTERS.interestedIn ||
      s.distance !== DEFAULT_FILTERS.distance ||
      s.ageRange[0] !== DEFAULT_FILTERS.ageRange[0] ||
      s.ageRange[1] !== DEFAULT_FILTERS.ageRange[1] ||
      s.onlineStatus !== DEFAULT_FILTERS.onlineStatus ||
      s.verifiedOnly !== DEFAULT_FILTERS.verifiedOnly ||
      s.interests.length > 0 ||
      s.relationshipType !== DEFAULT_FILTERS.relationshipType
    );
  },

  ALL_INTERESTS,
}));
