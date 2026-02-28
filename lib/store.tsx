"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Booking } from "./data";

interface Ctx {
  bookings: Booking[]; loading: boolean;
  addBooking: (b: Omit<Booking, "id">) => Promise<Booking | null>;
  removeBooking: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}
const BookingContext = createContext<Ctx | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Fetch bookings failed:", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addBooking = async (b: Omit<Booking, "id">): Promise<Booking | null> => {
    try {
      const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
      if (!res.ok) return null;
      const nb: Booking = await res.json();
      setBookings(p => [...p, nb]);
      return nb;
    } catch { return null; }
  };

  const removeBooking = async (id: number) => {
    try {
      const res = await fetch("/api/bookings", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (res.ok) setBookings(p => p.filter(b => b.id !== id));
    } catch (e) { console.error("Delete failed:", e); }
  };

  return <BookingContext.Provider value={{ bookings, loading, addBooking, removeBooking, refresh }}>{children}</BookingContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookings must be inside BookingProvider");
  return ctx;
}
