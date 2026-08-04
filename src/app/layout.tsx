import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AuthGate from "@/components/AuthGate";
import AppHeader from "@/components/AppHeader";
import MainContent from "@/components/MainContent";
import SidebarLayout from "@/components/SidebarLayout";
import Onboarding from "@/components/Onboarding";
import { RegisterSW } from "@/components/RegisterSW";
import { LocalApiBootstrap } from "@/components/LocalApiBootstrap";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ментальный банк",
    template: "%s — Ментальный банк",
  },
  description:
    "Стройте уверенность, фиксируя только конструктивные мысли и достижения. Методология First Victory — Нэйт Занссер.",
  metadataBase: new URL("https://mentalbank.ru"),
  openGraph: {
    title: "Ментальный банк",
    description:
      "Стройте уверенность, фиксируя только конструктивные мысли и достижения. Методология First Victory — Нэйт Занссер.",
    siteName: "Ментальный банк",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ментальный банк",
    description:
      "Стройте уверенность, фиксируя только конструктивные мысли и достижения. Методология First Victory — Нэйт Занссер.",
  },
  manifest: "/manifest.webmanifest",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "theme-color": "#f59e0b",
  },
  icons: {
    icon: [
      { url: "/logo/logo-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/logo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/logo/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f59e0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AuthGate>
          <Navigation />

          <SidebarLayout>
            <MainContent>
              <AppHeader />

              {children}
            </MainContent>

            <Footer />
          </SidebarLayout>

          <Onboarding />
        </AuthGate>
        <RegisterSW />
        <LocalApiBootstrap />
      </body>
    </html>
  );
}
