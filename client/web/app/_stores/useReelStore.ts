import { create } from "zustand";

interface ReelItem {
  id: string;
  mediaUrl: string;
  thumbUrl?: string;
  durationMs?: number;
  userId?: string;
  archived?: boolean;
}

interface ReelState {
  activeReelId: string | null;
  queue: ReelItem[];
  isPlaying: boolean;
  preloadIds: string[];
  setQueue: (items: ReelItem[]) => void;
  setActive: (id: string | null) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  setPreload: (ids: string[]) => void;
}

export const useReelStore = create<ReelState>((set, get) => ({
  activeReelId: null,
  queue: [],
  isPlaying: false,
  preloadIds: [],
  setQueue: (items) => set({ queue: items }),
  setActive: (id) => set({ activeReelId: id }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  next: () => {
    const { activeReelId, queue } = get();
    if (!activeReelId) return;
    const idx = queue.findIndex((r) => r.id === activeReelId);
    if (idx >= 0 && idx < queue.length - 1) {
      set({ activeReelId: queue[idx + 1].id });
    }
  },
  previous: () => {
    const { activeReelId, queue } = get();
    if (!activeReelId) return;
    const idx = queue.findIndex((r) => r.id === activeReelId);
    if (idx > 0) {
      set({ activeReelId: queue[idx - 1].id });
    }
  },
  setPreload: (ids) => set({ preloadIds: ids }),
}));
