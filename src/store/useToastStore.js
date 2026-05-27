import { create } from 'zustand';

let toastTimeout = null;

export const useToastStore = create((set) => ({
  visible: false,
  message: '',
  type: 'info', // 'success' | 'error' | 'info'

  showToast: (message, type = 'info', duration = 3000) => {
    // Clear any existing timeout
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    set({ visible: true, message, type });

    toastTimeout = setTimeout(() => {
      set({ visible: false, message: '', type: 'info' });
      toastTimeout = null;
    }, duration);
  },

  hideToast: () => {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      toastTimeout = null;
    }
    set({ visible: false, message: '', type: 'info' });
  },
}));
