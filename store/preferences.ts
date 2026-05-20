import { create } from "zustand";

interface PreferencesState {
  units: "metric" | "imperial";
  setUnits: (u: "metric" | "imperial") => void;
}

export const usePreferences = create<PreferencesState>((set) => ({
  units: "imperial", // miles + °C — pragmatic UK default
  setUnits: (units) => set({ units }),
}));
