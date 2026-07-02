import { create } from 'zustand';
import { safeStorage } from '../services/api';
import { userService } from '../services/apiServices';

export const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  user: null,
  isRestoring: true, // true while checking for a saved session on app start

  login: (userData) => set({ isAuthenticated: true, user: userData }),

  logout: async () => {
    await safeStorage.removeItem('accessToken');
    await safeStorage.removeItem('refreshToken');
    set({ isAuthenticated: false, user: null });
  },

  // Called ONCE when the app starts. Checks for saved tokens and restores
  // the session if they're still valid — this is what makes login persist
  // across app restarts instead of forcing a fresh login every time.
  restoreSession: async () => {
    set({ isRestoring: true });
    try {
      const token = await safeStorage.getItem('accessToken');
      if (!token) {
        set({ isAuthenticated: false, isRestoring: false });
        return;
      }

      // This call automatically triggers the refresh-token interceptor in
      // api.js if the access token has expired — so as long as the 30-day
      // refresh token is still valid, this succeeds even after weeks away.
      const res = await userService.getMe();
      const userData = res?.data?.data || res?.data || res;

      set({ isAuthenticated: true, user: userData, isRestoring: false });
    } catch (err) {
      // Only clear the session on a genuine auth failure (401/403 — token
      // rejected even after the refresh interceptor already tried). A
      // network error, timeout, or the server waking up must NOT log the
      // user out — that would defeat the whole point of persisting login.
      const status = err?.response?.status || err?.statusCode;
      if (status === 401 || status === 403) {
        await safeStorage.removeItem('accessToken');
        await safeStorage.removeItem('refreshToken');
        set({ isAuthenticated: false, user: null, isRestoring: false });
      } else {
        // Keep whatever we have — treat as still logged in locally so the
        // UI doesn't bounce to the login screen over a transient failure.
        const stillHasToken = await safeStorage.getItem('accessToken');
        set({ isAuthenticated: !!stillHasToken, isRestoring: false });
      }
    }
  },
}));