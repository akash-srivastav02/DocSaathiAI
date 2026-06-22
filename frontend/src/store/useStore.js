import { create } from 'zustand';

const USER_KEY = 'docsaathi_user';
const ACTIVITY_KEY = 'formfixer_last_activity';

function readStoredUser() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

const storedUser = readStoredUser();

const useStore = create((set) => ({
  user: storedUser,
  credits: storedUser?.credits ?? 0,

  setUser: (userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
    set({
      user: userData,
      credits: userData.credits ?? 0,
    });
  },

  updateCredits: (newCredits) => {
    set((state) => {
      const updatedUser = state.user ? { ...state.user, credits: newCredits } : null;
      if (updatedUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
      return { user: updatedUser, credits: newCredits };
    });
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACTIVITY_KEY);
    set({ user: null, credits: 0 });
  },
}));

export default useStore;
