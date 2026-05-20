// Current-location store. Wraps expo-location plus a postcode/region
// resolved from postcodes.io reverse-lookup, with optional manual override
// (user picks a different place from the "Check another place" sheet).

import { create } from "zustand";

interface LocationState {
  lat: number | null;
  lng: number | null;
  postcode: string | null;
  city: string | null;
  region: string | null;
  // True when the user has overridden their device location.
  isOverride: boolean;
  setCurrent: (loc: {
    lat: number;
    lng: number;
    postcode: string;
    city: string;
    region: string;
  }) => void;
  setOverride: (loc: {
    lat: number;
    lng: number;
    postcode: string;
    city: string;
    region: string;
  }) => void;
  clearOverride: () => void;
}

export const useLocation = create<LocationState>((set) => ({
  lat: null,
  lng: null,
  postcode: null,
  city: null,
  region: null,
  isOverride: false,
  setCurrent: (loc) => set({ ...loc, isOverride: false }),
  setOverride: (loc) => set({ ...loc, isOverride: true }),
  clearOverride: () => set({ isOverride: false }),
}));
