import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BookingProvider } from "@/lib/store";
import ClientShell from "@/components/client-shell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://caseoutstudio.pl";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#080C12",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Caseout Studio — Studio Nagraniowe Warszawa", template: "%s | Caseout Studio" },
  description: "Profesjonalne studio nagraniowe w centrum Warszawy. Nagrania, mix, master, produkcja muzyczna. Rap, hip-hop, trap, drill. ul. Kopernika 30.",
  keywords: ["studio nagraniowe warszawa", "studio nagrań", "nagrywanie muzyki warszawa", "mix master", "rap studio", "hip hop studio", "produkcja muzyczna", "caseout studio", "kopernika 30", "trap", "drill"],
  authors: [{ name: "Caseout Studio" }],
  creator: "Caseout Studio",
  publisher: "Caseout Studio",
  manifest: "/manifest.json",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  alternates: { canonical: SITE_URL },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Caseout Studio" },
  openGraph: {
    title: "Caseout Studio — Studio Nagraniowe Warszawa",
    description: "Underground z klasą. Profesjonalne nagrania, mix, master i produkcja muzyczna w sercu Warszawy.",
    url: SITE_URL,
    siteName: "Caseout Studio",
    locale: "pl_PL",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Caseout Studio Logo" }],
  },
  twitter: { card: "summary", title: "Caseout Studio — Studio Nagraniowe Warszawa", description: "Nagrania, mix, master, produkcja muzyczna. Warszawa, ul. Kopernika 30." },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: "Caseout Studio",
  description: "Profesjonalne studio nagraniowe w Warszawie. Nagrania, mix, master, produkcja muzyczna.",
  url: SITE_URL,
  address: { "@type": "PostalAddress", streetAddress: "ul. Mikołaja Kopernika 30", addressLocality: "Warszawa", postalCode: "00-336", addressCountry: "PL" },
  geo: { "@type": "GeoCoordinates", latitude: "52.2297", longitude: "21.0122" },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "10:00", closes: "22:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "12:00", closes: "20:00" },
  ],
  priceRange: "100-2240 PLN",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="overflow-x-hidden">
        <BookingProvider>
          <ClientShell>{children}</ClientShell>
        </BookingProvider>
      </body>
    </html>
  );
}
