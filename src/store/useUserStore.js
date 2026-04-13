import { create } from 'zustand';

// Dummy data for the UI
const dummyUsers = [
  {
    id: '1',
    name: 'Sarah',
    age: 24,
    bio: 'Love hiking and outdoor adventures! 🏔️',
    distance: '2 miles away',
    images: ['https://randomuser.me/api/portraits/women/44.jpg'],
  },
  {
    id: '2',
    name: 'Jessica',
    age: 26,
    bio: 'Coffee addict & dog mom 🐶',
    distance: '5 miles away',
    images: ['https://randomuser.me/api/portraits/women/68.jpg'],
  },
  {
    id: '3',
    name: 'Emily',
    age: 23,
    bio: 'Foodie exploring the city one restaurant at a time 🍜',
    distance: '1 mile away',
    images: ['https://randomuser.me/api/portraits/women/90.jpg'],
  },
];

export const useUserStore = create((set) => ({
  potentialMatches: dummyUsers,
  matches: [],
  likeUser: (userId) => set((state) => {
    const likedUser = state.potentialMatches.find(u => u.id === userId);
    return {
      potentialMatches: state.potentialMatches.filter(u => u.id !== userId),
      matches: likedUser ? [...state.matches, likedUser] : state.matches,
    };
  }),
  passUser: (userId) => set((state) => ({
    potentialMatches: state.potentialMatches.filter(u => u.id !== userId)
  })),
}));
