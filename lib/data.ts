export interface Booking {
  id: number; date: string; hour: number; duration: number; type: string;
  name: string; email: string; phone: string; notes: string;
  status: "confirmed" | "cancelled" | "pending";
}
export interface SessionType { id: string; name: string; icon: string; color: string; }
export interface Service { title: string; desc: string; icon: string; price: string; tag: string; }
export interface PortfolioItem { artist: string; title: string; type: string; year: string; hue: number; }
export interface PricingPlan { name: string; price: string; unit: string; features: string[]; highlight: boolean; }
export interface Package { name: string; hours: string; price: string; desc: string; }

export const SESSION_TYPES: SessionType[] = [
  { id: "recording", name: "Recording", icon: "🎙️", color: "#C49767" },
  { id: "mix", name: "Mix", icon: "🎛️", color: "#AC865C" },
  { id: "master", name: "Master", icon: "💿", color: "#90714F" },
  { id: "consult", name: "Konsultacja", icon: "💬", color: "#6B5A42" },
];
export const DURATIONS = [
  { hours: 2, label: "2h" }, { hours: 4, label: "4h" }, { hours: 8, label: "8h — Full Day" },
];
export const SERVICES: Service[] = [
  { title: "Nagrania", desc: "Sesje nagraniowe w akustycznie wyciszonym studiu. Neumann U87, SSL Channel Strip, Avalon VT-737.", icon: "🎙", price: "100 zł/h", tag: "CORE" },
  { title: "Mix", desc: "Analogowy summing, outboard EQ/comp, przestrzenny miks który oddycha.", icon: "🎛", price: "od 300 zł/track", tag: "CORE" },
  { title: "Master", desc: "Finalizacja dźwięku pod streaming i vinyl. Loudness matching, true peak limiting.", icon: "💿", price: "od 200 zł/track", tag: "CORE" },
  { title: "Beat Production", desc: "Custom beaty: trap, boom-bap, drill, phonk, jersey club. Od zera pod Twój flow.", icon: "🥁", price: "od 500 zł", tag: "CREATIVE" },
  { title: "Vocal Production", desc: "Tuning, comping, ad-libs, layering, efekty. Pełna obróbka wokalu.", icon: "🎤", price: "od 200 zł/track", tag: "CREATIVE" },
  { title: "Konsultacja", desc: "Omówimy Twój projekt, dobierzemy strategię nagrań i release plan.", icon: "💬", price: "Free", tag: "FREE" },
];
export const PORTFOLIO: PortfolioItem[] = [
  { artist: "MŁODY KAEF", title: "Nocne Ulice EP", type: "Mix & Master", year: "2024", hue: 30 },
  { artist: "SONIA", title: "Szklane Oczy", type: "Recording + Mix", year: "2024", hue: 25 },
  { artist: "DRILLAZ", title: "WARSZAWA DRILL Vol.2", type: "Full Production", year: "2023", hue: 35 },
  { artist: "ECHO", title: "Pogłos", type: "Recording", year: "2024", hue: 20 },
  { artist: "NOCNY PATROL", title: "3 AM Freestyle", type: "Recording + Mix", year: "2023", hue: 28 },
  { artist: "KINGA B", title: "Nie Pytaj", type: "Mix & Master", year: "2024", hue: 32 },
];
export const PRICING: PricingPlan[] = [
  { name: "STANDARD", price: "100", unit: "zl/h", features: ["Nagranie wokalu", "Dostep do sprzetu", "Inzynier dzwieku", "WAV + MP3"], highlight: false },
  { name: "WEEKEND", price: "115", unit: "zl/h", features: ["Nagranie wokalu", "Dostep do sprzetu", "Inzynier dzwieku", "WAV + MP3", "Sobota 12:00-20:00"], highlight: false },
];
export const PACKAGES: Package[] = [
  { name: "Singiel", hours: "4h", price: "360", desc: "1 sesja nagraniowa · 10% taniej" },
  { name: "EP", hours: "12h", price: "960", desc: "3 sesje · 5 trackow · 20% taniej" },
  { name: "Album", hours: "32h", price: "2240", desc: "8 sesji · 10+ trackow · 30% taniej" },
];
export const HOURLY_RATE = 100;
export const WEEKEND_SURCHARGE = 15;
export const MARQUEE_GEAR = ["Neumann U87","SSL","Avalon VT-737","Pro Tools","Ableton","UAD","Analog Summing","Tape Saturation"];
export const MARQUEE_SERVICES = ["Nagrania","Mix","Master","Produkcja","Vocal Tuning","Beat Making","Warszawa","Underground","Premium Sound"];
