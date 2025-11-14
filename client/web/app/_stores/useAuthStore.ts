import { create } from "zustand";

interface UserProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  roles?: string[];
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, token: null }),
}));
