import type { Metadata, Viewport } from "next";
import { Bangers, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Bangers: huruf lettering komik untuk judul dan papan. Plus Jakarta Sans (foundry Indonesia, Tokotype) tetap untuk teks panjang supaya mudah dibaca.
const display = Bangers({ variable: "--font-bangers", weight: "400", subsets: ["latin"] });
const sans = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "NusaVerse", template: "%s · NusaVerse" },
  description: "Game museum budaya Indonesia di browser: pilih ruang pamer di peta, jelajahi koleksinya dalam 3D, dan kumpulkan cap paspor budaya.",
};

export const viewport: Viewport = { themeColor: "#17120e" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${display.variable} ${sans.variable} antialiased`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
