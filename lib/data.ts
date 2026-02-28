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
  { title: "Nagrania", desc: "Sesje nagraniowe w akustycznie wyciszonym studiu. Neumann U87, SSL Channel Strip, Avalon VT-737.", icon: "🎙", price: "od 150 zł/h", tag: "CORE" },
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
  { name: "STARTER", price: "150", unit: "zł/h", features: ["Nagranie wokalu", "Podstawowy mix", "1 rewizja", "WAV + MP3"], highlight: false },
  { name: "PRO", price: "250", unit: "zł/h", features: ["Nagranie wokalu", "Pełny mix + master", "3 rewizje", "Stem export", "Vocal tuning"], highlight: true },
  { name: "PREMIUM", price: "400", unit: "zł/h", features: ["Nagranie + mix + master", "Unlimited rewizji", "Stems", "Vocal tuning", "Beat production", "Dedykowany inżynier"], highlight: false },
];
export const PACKAGES: Package[] = [
  { name: "Singiel", hours: "4h", price: "800 zł", desc: "1 sesja" },
  { name: "EP", hours: "12h", price: "2 100 zł", desc: "3 sesje · 3-5 tracków" },
  { name: "Album", hours: "32h", price: "5 500 zł", desc: "8 sesji · 10+ tracków" },
];
export const MARQUEE_GEAR = ["Neumann U87","SSL","Avalon VT-737","Pro Tools","Ableton","UAD","Analog Summing","Tape Saturation"];
export const MARQUEE_SERVICES = ["Nagrania","Mix","Master","Produkcja","Vocal Tuning","Beat Making","Warszawa","Underground","Premium Sound"];
