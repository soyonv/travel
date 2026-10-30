import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { AiDock } from "@/components/ai/ai-dock";
import { LanguageProvider } from "@/components/providers/language-provider";
import { getLang } from "@/lib/lang-server";
import { getDbOrNull } from "@/lib/db";
import { getAnnouncements } from "@/lib/queries";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { absoluteUrl } from "@/lib/utils";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const hind = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: "Discover Bangladesh AI — Every Journey Tells a Story",
    template: "%s · Discover Bangladesh AI",
  },
  description:
    "An AI-powered travel platform for Bangladesh: destination guides, a 64-district directory, itineraries, budget estimates, maps and a bilingual AI travel agent.",
  keywords: [
    "Bangladesh travel",
    "best places to visit in Bangladesh",
    "Bangladesh tour packages",
    "Cox's Bazar travel guide",
    "Sylhet itinerary",
    "বাংলাদেশের দর্শনীয় স্থান",
    "কম খরচে বাংলাদেশ ভ্রমণ",
  ],
  authors: [{ name: "Discover Bangladesh AI" }],
  openGraph: {
    type: "website",
    siteName: "Discover Bangladesh AI",
    title: "Discover Bangladesh AI — Every Journey Tells a Story",
    description:
      "Destination guides, all 64 districts, itineraries and an AI travel agent that plans in Bangla and English.",
    locale: "en_BD",
    alternateLocale: ["bn_BD"],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/",
    languages: { "en-BD": "/", "bn-BD": "/?lang=bn" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0b2a21",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const db = await getDbOrNull();
  const [announcementRows, user] = await Promise.all([
    db ? getAnnouncements(db).catch(() => []) : Promise.resolve([]),
    getCurrentUser().catch(() => null),
  ]);

  const announcements = announcementRows.map((row) => ({
    id: row.id,
    messageEn: row.messageEn,
    messageBn: row.messageBn,
    link: row.link,
  }));

  return (
    <html lang={lang} className={`${manrope.variable} ${hind.variable} ${instrument.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-forest-900 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <LanguageProvider initial={lang}>
          <AnnouncementBar items={announcements} lang={lang} />
          <Header isAuthed={Boolean(user)} isAdmin={isAdmin(user)} />
          {children}
          <Footer lang={lang} />
          <AiDock />
        </LanguageProvider>
      </body>
    </html>
  );
}
