import type { Metadata } from "next";
export const metadata: Metadata = { title: "Cennik — Stawki i Pakiety", description: "Stawka od 100 zl/h. Pakiety Singiel, EP, Album z rabatem do 30%. Platnosc Przelewy24." };
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
