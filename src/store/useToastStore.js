import { create } from 'zustand';
import { navigationRef } from '../navigation';

let toastTimeout = null;

export const useToastStore = create((set) => ({
  visible: false,
  message: '',
  title: '',
  type: 'info', // 'success' | 'error' | 'info'

  showToast: (msgOrObj, type = 'info', duration = 3000) => {
    // Prevent toasts from showing on immersive screens
    if (navigationRef && navigationRef.isReady && navigationRef.isReady()) {
      const currentRoute = navigationRef.getCurrentRoute();
      if (currentRoute?.name === 'Calling' || currentRoute?.name === 'Match') {
        return;
      }
    }

    // Clear any existing timeout
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    if (msgOrObj && typeof msgOrObj === 'object') {
      const toastTitle = msgOrObj.title || '';
      const toastText = msgOrObj.text || msgOrObj.message || '';
      const toastType = msgOrObj.type || type;
      set({ visible: true, message: toastText, title: toastTitle, type: toastType });
    } else {
      set({ visible: true, message: msgOrObj || '', title: '', type });
    }

    toastTimeout = setTimeout(() => {
      set({ visible: false, message: '', title: '', type: 'info' });
      toastTimeout = null;
    }, duration);
  },

  hideToast: () => {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      toastTimeout = null;
    }
    set({ visible: false, message: '', title: '', type: 'info' });
  },
}));

