import type { Metadata, Viewport } from "next";
import { Baloo_2, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";

const display = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Makan Apa Hari Ini?",
  description:
    "Berhenti bingung tiap jam makan. Pilih budget & mood, kami racik menunya — buat anak kos, anak kantor, dan semua yang tiap hari nanya 'makan apa ya?'.",
  applicationName: "Makan Apa Hari Ini?",
  keywords: ["makan apa", "rekomendasi makanan", "kuliner indonesia", "budget makan"],
  openGraph: {
    title: "Makan Apa Hari Ini?",
    description: "Pilih budget & mood, kami racik menunya.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF6EC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${display.variable} ${sans.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
