import { create } from "zustand";

type ModalEntry = { id: string; component: React.ReactNode };

interface UIState {
  theme: "dark" | "light" | "system";
  modals: ModalEntry[];
  toasts: { id: string; message: string; type?: "info" | "success" | "error" }[];
  setTheme: (theme: UIState["theme"]) => void;
  pushModal: (entry: ModalEntry) => void;
  popModal: () => void;
  addToast: (toast: UIState["toasts"][number]) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: "system",
  modals: [],
  toasts: [],
  setTheme: (theme) => set({ theme }),
  pushModal: (entry) => set((s) => ({ modals: [...s.modals, entry] })),
  popModal: () => set((s) => ({ modals: s.modals.slice(0, -1) })),
  addToast: (toast) => set((s) => ({ toasts: [...s.toasts, toast] })),
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clearToasts: () => set({ toasts: [] }),
}));
