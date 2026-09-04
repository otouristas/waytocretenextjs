import { create } from "zustand";
import { persist } from "zustand/middleware";

type Booking = {
  slug: string;
  date: string;
  guests: number;
  name: string;
  email: string;
  hotel: string;
  message: string;
  total: number;
};

type Store = {
  saved: string[];
  toggleSaved: (slug: string) => void;
  bookings: Booking[];
  addBooking: (b: Booking) => void;
};

export const useWayStore = create<Store>()(
  persist(
    (set, get) => ({
      saved: [],
      toggleSaved: (slug) => {
        const has = get().saved.includes(slug);
        set({ saved: has ? get().saved.filter((s) => s !== slug) : [...get().saved, slug] });
      },
      bookings: [],
      addBooking: (b) => set({ bookings: [...get().bookings, b] }),
    }),
    { name: "waytocrete-store" },
  ),
);
