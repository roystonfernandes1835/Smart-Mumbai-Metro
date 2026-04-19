import { create } from 'zustand';

export const useCrowdStore = create((set, get) => ({
  crowdMap: {}, // stationId -> "low" | "medium" | "high"
  
  updateCrowd: (stationId, level) => set((state) => ({
    crowdMap: { ...state.crowdMap, [stationId]: level },
  })),

  getLevel: (stationId) => get().crowdMap[stationId] || "low",

  countByLevel: () => {
    const map = get().crowdMap;
    const counts = { low: 0, medium: 0, high: 0 };
    Object.values(map).forEach(lvl => {
      if (counts[lvl] !== undefined) counts[lvl]++;
    });
    return counts;
  },
}));
