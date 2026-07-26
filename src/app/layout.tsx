import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AuthGate from "@/components/AuthGate";
import AppHeader from "@/components/AppHeader";
import MainContent from "@/components/MainContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ментальный банк",
  description:
    "Стройте уверенность, фиксируя только конструктивные мысли и достижения. Методология First Victory — Нэйт Занссер.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🪙</text></svg>",
  },
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

          <MainContent>
            <AppHeader />

            {children}
          </MainContent>

          <Footer />
        </AuthGate>
      </body>
    </html>
  );
}
