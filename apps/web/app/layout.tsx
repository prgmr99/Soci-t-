import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  Geist,
  JetBrains_Mono,
  Noto_Serif_KR,
  Noto_Sans_KR,
} from "next/font/google";
import { BRAND } from "@societe/config";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-serif",
  display: "swap",
  preload: true,
});

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

// Korean fonts pair the Latin serif/sans with matching Hangul glyphs.
// preload: false because Korean fonts are large (~hundreds of KB per weight);
// display: "swap" lets the page paint with the system fallback first and
// upgrade in place — the brand stays readable during the swap.
const notoSerifKr = Noto_Serif_KR({
  weight: ["400", "500", "700"],
  variable: "--font-serif-kr",
  display: "swap",
  preload: false,
});

const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "600"],
  variable: "--font-sans-kr",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: BRAND.name,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.statement,
  metadataBase: new URL(BRAND.domain),
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: BRAND.name,
    description: BRAND.statement,
    url: BRAND.domain,
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.name,
    description: BRAND.statement,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${fraunces.variable} ${geist.variable} ${jetbrainsMono.variable} ${notoSerifKr.variable} ${notoSansKr.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
