import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

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
    "Стройте уверенность, фиксируя только конструктивные мысли и достижения. Методология First Victory — Dr. Joseph Parent.",
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
        <div className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-6">
          {/* Header */}
          <header className="mb-6 text-center">
            <div className="mb-1 flex items-center justify-center gap-2">
              <span className="text-2xl">🪙</span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                Ментальный банк
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Только депозиты. Никаких списаний.
            </p>
          </header>

          <main>{children}</main>
        </div>

        <Navigation />
      </body>
    </html>
  );
}
