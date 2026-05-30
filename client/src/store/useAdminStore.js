import { create } from 'zustand';

export const useAdminStore = create((set, get) => ({
  // Auth state
  user: null,
  isAuthLoading: true,
  setUser: (user) => set({ user, isAuthLoading: false }),
  setAuthLoading: (loading) => set({ isAuthLoading: loading }),
  logout: () => {
    localStorage.removeItem('admin_token');
    set({ user: null, isAuthLoading: false });
    window.location.reload();
  },

  // Theme
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  // Toast notifications
  toasts: [],
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    set((state) => ({ toasts: [...state.toasts, { id, message, type, duration }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
