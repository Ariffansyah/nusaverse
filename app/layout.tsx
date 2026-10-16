import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Fraunces: serif bergaya cetak lama, rasa label museum. Plus Jakarta Sans: karya foundry Indonesia (Tokotype).
const display = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const sans = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "NusaVerse", template: "%s · NusaVerse" },
  description: "Game museum budaya Indonesia di browser: pilih ruang pamer di peta, jelajahi koleksinya dalam 3D, dan kumpulkan cap paspor budaya.",
};

export const viewport: Viewport = { themeColor: "#1c120b" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${display.variable} ${sans.variable} antialiased`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
