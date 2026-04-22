import { create } from 'zustand';

// Read stored user once at startup
const storedUser = JSON.parse(localStorage.getItem('docsaathi_user') || 'null');

const useStore = create((set) => ({
  user:    storedUser,
  // ── FIX: initialize credits from stored user, NOT hardcoded 0 ──────────
  credits: storedUser?.credits ?? 0,

  setUser: (userData) => {
    localStorage.setItem('docsaathi_user', JSON.stringify(userData));
    set({
      user:    userData,
      credits: userData.credits ?? 0,  // sync credits at login/signup
    });
  },

  updateCredits: (newCredits) => {
    set((state) => {
      // Update both the credits field AND the credits inside the user object
      // so localStorage always reflects the real value after refresh
      const updatedUser = { ...state.user, credits: newCredits };
      localStorage.setItem('docsaathi_user', JSON.stringify(updatedUser));
      return { user: updatedUser, credits: newCredits };
    });
  },

  logout: () => {
    localStorage.removeItem('docsaathi_user');
    set({ user: null, credits: 0 });
  },
}));

export default useStore;