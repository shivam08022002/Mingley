import { create } from 'zustand';

const INITIAL_PROFILE = {
  name: 'Jessica Parker',
  age: 23,
  occupation: 'Professional model',
  location: 'Mumbai, India',
  about: "My name is Jessica Parker and I enjoy meeting new people and finding ways to help them have an uplifting experience. I enjoy reading about fashion, exploring different cuisines, and going on spontaneous adventures.",
  coverImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  photos: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  ],
  interests: ['Travelling', 'Books', 'Music', 'Dancing', 'Modeling'],
  completionPct: 78,
  plan: 'free',          // 'free' | 'premium' | 'pro'
  verified: true,
  online: true,
};

export const useProfileStore = create((set, get) => ({
  ...INITIAL_PROFILE,

  updateField: (key, value) => set({ [key]: value }),
  setInterests: (interests) => set({ interests }),
  addPhoto: (uri) => set((s) => ({ photos: [...s.photos, uri] })),
  removePhoto: (uri) => set((s) => ({ photos: s.photos.filter((p) => p !== uri) })),
  upgradePlan: (plan) => set({ plan }),
}));
