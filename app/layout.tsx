import type { Metadata } from "next";
import "./globals.css";
import { BookingProvider } from "@/lib/store";
import ClientShell from "@/components/client-shell";

export const metadata: Metadata = {
  title: "Caseout Studio — Nagrania · Mix · Master · Warszawa",
  description: "Warszawskie studio nagraniowe. Profesjonalne nagrania, mix, master i produkcja muzyczna. Kopernika 30.",
  keywords: ["studio nagrań", "warszawa", "mix", "master", "nagrania", "rap", "hip-hop", "produkcja muzyczna"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Caseout Studio",
  },
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
      <head>
        <meta name="theme-color" content="#080C12" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body>
        <BookingProvider>
          <ClientShell>{children}</ClientShell>
        </BookingProvider>
      </body>
    </html>
  );
}
