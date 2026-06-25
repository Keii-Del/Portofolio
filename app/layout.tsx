// Root layout — load fonts, global styles, Sentry, navigation.

import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Pandu — Web Developer & Freelancer",
    template: "%s · Pandu",
  },
  description:
    "Mahasiswa Teknik Informatika UMS. Web development, UI/UX, dan teknologi modern. Tersedia untuk project freelance.",
  keywords: ["web developer", "freelancer", "Indonesia", "Next.js", "Portfolio"],
  authors: [{ name: "Pandu" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Pandu Portfolio",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${dmSans.variable} ${syne.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
