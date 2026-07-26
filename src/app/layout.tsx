import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AuthGate from "@/components/AuthGate";
import AppHeader from "@/components/AppHeader";
import MainContent from "@/components/MainContent";
import SidebarLayout from "@/components/SidebarLayout";
import InfoModal from "@/components/InfoModal";
import DonateBlock from "@/components/DonateBlock";

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
    icon: [
      { url: "/logo/logo-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/logo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/logo/apple-touch-icon.png",
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

          <SidebarLayout>
            <MainContent>
              <AppHeader />

              {children}
            </MainContent>

            <Footer />
          </SidebarLayout>

          <InfoModal>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-100">
                Добро пожаловать в Ментальный банк 🪙
              </h2>

              <p className="text-[15px] leading-relaxed text-slate-300">
                Это приложение — ваш личный тренажёр уверенности. Всё, что вы
                здесь делаете, основано на одной идее: уверенность строится не
                на удаче, а на доказательствах. Каждая запись, каждая победа,
                каждый разбор — это вклад на ваш внутренний счёт, с которого
                никто и никогда не сможет сделать списание.
              </p>

              <p className="text-[15px] leading-relaxed text-slate-300">
                Вас ждут шесть инструментов из книги Нэйта Занссера
                «The Confident Mind»: дневник побед, аффирмации, визуализация,
                разбор действий (AAR), защита уверенности и
                когнитивно-поведенческие приёмы. Вы не просто читаете —
                вы строите свою уверенность шаг за шагом.
              </p>

              <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 px-5 py-4">
                <p className="text-[15px] leading-relaxed text-slate-300">
                  <strong className="text-amber-400">Важно:</strong> всё,
                  что вы запишете, остаётся только в вашем браузере.
                  Мы не собираем, не храним и не передаём ваши данные.
                  Проект полностью анонимен, бесплатен и не требует
                  регистрации по e-mail или телефону.
                </p>
              </div>

              <DonateBlock />

              <p className="text-[15px] leading-relaxed text-slate-400">
                Начните с дневника ESP — запишите свою первую победу.
                Остальное придёт само.
              </p>
            </div>
          </InfoModal>
        </AuthGate>
      </body>
    </html>
  );
}
