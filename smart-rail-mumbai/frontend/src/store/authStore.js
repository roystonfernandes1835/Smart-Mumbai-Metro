import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: { id: 1, name: "Shiv", email: "shiv@example.com" }, // mock auth
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
