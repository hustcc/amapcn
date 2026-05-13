import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Footer } from "@/components/footer";

const geist = GeistSans;
const geistMono = GeistMono;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://map.ling.pub";
const siteName = "amapcn";
const creator = "https://github.com/hustcc";
const siteDescription =
  "A collection of beautifully designed, accessible, and customizable map components for 高德地图 (AMap/Gaode). Built on AMap JS API. Styled with Tailwind CSS. Works with shadcn/ui.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "amapcn - Beautiful AMap components made simple",
    template: "%s - amapcn",
  },
  description: siteDescription,
  keywords: [
    "react map",
    "next.js map",
    "amap",
    "gaode map",
    "高德地图",
    "map components",
    "shadcn map",
    "tailwind map",
    "react map library",
    "typescript map",
    "interactive maps",
    "map markers",
    "map controls",
    "china map",
  ],
  authors: [
    { name: "hustcc", url: "https://github.com/hustcc" },
  ],
  creator: "hustcc",
  publisher: "amapcn",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteName,
    title: "amapcn - Beautiful AMap components made simple",
    description: siteDescription,
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "amapcn - Beautiful maps, made simple",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "amapcn - Beautiful AMap components made simple",
    description: siteDescription,
    creator: creator,
    images: ["/banner.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <ThemeProvider>
          <div className="flex-1">{children}</div>
          <Footer />
                  </ThemeProvider>
      </body>
    </html>
  );
}
