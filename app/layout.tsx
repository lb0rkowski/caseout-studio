import type { Metadata } from "next";
import "./globals.css";
import { BookingProvider } from "@/lib/store";
import ClientShell from "@/components/client-shell";

export const metadata: Metadata = {
  title: "Caseout Studio — Nagrania · Mix · Master · Warszawa",
  description: "Warszawskie studio nagraniowe. Profesjonalne nagrania, mix, master i produkcja muzyczna. Kopernika 30.",
  keywords: ["studio nagrań", "warszawa", "mix", "master", "nagrania", "rap", "hip-hop", "produkcja muzyczna"],
  openGraph: {
    title: "Caseout Studio — Nagrania · Mix · Master",
    description: "Underground z klasą. Studio nagraniowe w sercu Warszawy.",
    locale: "pl_PL",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <BookingProvider>
          <ClientShell>{children}</ClientShell>
        </BookingProvider>
      </body>
    </html>
  );
}
