import type { Metadata, Viewport } from "next";
import { Noto_Sans_SC } from "next/font/google";
import type { ReactNode } from "react";
import { ServiceWorkerCleanup } from "@/components/pwa/PwaManager";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { basePath, withBasePath } from "@/lib/paths";
import "./globals.css";

const notoSansSc = Noto_Sans_SC({
  display: "swap",
  preload: false,
  variable: "--font-noto-sans-sc",
  weight: "variable",
});

const siteTitle = "北歐四國・13 日私人旅程";
const siteDescription =
  "2026 夏末，穿越丹麥、挪威、瑞典與芬蘭的 13 日家庭私人旅行指南。";
const siteOrigin = new URL("https://eric022759.github.io");

export const metadata: Metadata = {
  metadataBase: siteOrigin,
  title: {
    default: siteTitle,
    template: `%s｜${siteTitle}`,
  },
  description: siteDescription,
  applicationName: "北歐四國旅行",
  authors: [{ name: "Nordic Family Trip" }],
  creator: "Nordic Family Trip",
  icons: {
    icon: [
      {
        url: withBasePath("/icons/icon-192.png"),
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: withBasePath("/icons/icon-512.png"),
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: withBasePath("/icons/icon-192.png"),
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "北歐四國旅行",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: withBasePath("/og.png"),
        width: 1200,
        height: 630,
        alt: "北歐四國 13 日私人旅程",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [withBasePath("/og.png")],
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12332c",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={notoSansSc.variable} lang="zh-TW">
      <body>
        <a className="skip-link" href="#main-content">
          跳到主要內容
        </a>
        <ServiceWorkerCleanup basePath={basePath} />
        <SiteHeader />
        <div className="site-main" id="main-content" tabIndex={-1}>
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
