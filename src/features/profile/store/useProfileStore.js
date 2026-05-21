import { create } from 'zustand';
import { userService } from '../../../services/apiServices';

const INITIAL_PROFILE = {
  id: '',
  fullName: '',
  email: '',
  phone: null,
  gender: '',
  age: 0,
  dateOfBirth: '',
  bio: '',
  avatar: '',
  isVerified: false,
  isPremium: false,
  isOnline: false,
  coinBalance: 0,
  totalEarned: 0,
  lastActiveAt: '',
  location: {
    city: '',
    country: '',
    lat: null,
    lng: null,
  },
  preference: {
    interestedIn: '',
    minAge: 18,
    maxAge: 40,
    maxDistance: 50,
    relationshipType: 'both',
    nearbyOnly: false,
    onlineOnly: false,
    verifiedOnly: false,
    location: null,
  },
  interests: [],
  photos: [], // will map from 'images' in API
  completionPct: 0,
  isLoading: false,
  error: null,
};

export const useProfileStore = create((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  calculateCompletion: (user) => {
    if (!user) return 0;
    const fields = [
      'fullName', 'bio', 'avatar', 'gender', 'age', 'interests', 'images', 'location'
    ];
    let completed = 0;
    
    if (user.fullName) completed++;
    if (user.bio) completed++;
    if (user.avatar) completed++;
    if (user.gender) completed++;
    if (user.age || user.dateOfBirth) completed++;
    if (user.interests && user.interests.length > 0) completed++;
    if (user.images && user.images.length > 0) completed++;
    if (user.location && user.location.city) completed++;

    return Math.round((completed / fields.length) * 100);
  },

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const response = await userService.getMe();
      const user = response.data || response;
      
      const completion = get().calculateCompletion(user);
      const profileWithCompletion = {
        ...user,
        completionPct: completion
      };

      set({
        profile: profileWithCompletion,
        loading: false,
      });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch profile', loading: false });
    }
  },

  updateProfile: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await userService.updateMe(userData);
      const updated = response.data || response;
      
      // Re-calculate completion after update
      const currentFullUser = { ...get(), ...updated };
      const completion = get().calculateCompletion(currentFullUser);

      set({
        fullName: updated.fullName,
        bio: updated.bio,
        gender: updated.gender,
        dateOfBirth: updated.dateOfBirth,
        avatar: updated.avatar,
        completionPct: completion,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({ error: error.message || 'Failed to update profile', isLoading: false });
      return { success: false, error: error.message };
    }
  },

  updateField: (key, value) => set({ [key]: value }),
  setInterests: (interests) => set({ interests }),
  addPhoto: (uri) => set((s) => ({ photos: [...s.photos, uri] })),
  removePhoto: (uri) => set((s) => ({ photos: s.photos.filter((p) => p !== uri) })),
  upgradePlan: (plan) => set({ plan }),

  // Coins system
  addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),
  spendCoins: (amount) => set((s) => ({ coins: Math.max(0, s.coins - amount) })),
}));
