"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { id: "nav-balance", href: "/", label: "Баланс", icon: "🏦", mobileLabel: "Баланс" },
  { id: "nav-esp", href: "/esp-journal", label: "ESP-дневник", icon: "📝", mobileLabel: "ESP" },
  { id: "nav-top10", href: "/top-10", label: "Топ-10 побед", icon: "🏆", mobileLabel: "Топ-10" },
  { id: "nav-affirmations", href: "/account-2", label: "Аффирмации", icon: "💬", mobileLabel: "Счёт №2" },
  { id: "nav-visualization", href: "/account-3", label: "Визуализация", icon: "🎬", mobileLabel: "Счёт №3" },
  { id: "nav-aar", href: "/aar", label: "AAR — разбор", icon: "🔄", mobileLabel: "AAR" },
];

export default function Navigation() {
  const pathname = usePathname();

  // Не показываем навигацию на странице приветствия
  if (pathname === "/welcome") return null;

  // Mobile: показываем первые 5, остальное в "ещё"
  const mobileItems = navItems.slice(0, 5);

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700/80 bg-slate-900/95 backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-lg justify-around py-3">
          {mobileItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.id}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-amber-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <span className="text-lg" aria-hidden="true">{item.icon}</span>
                <span className="whitespace-nowrap">{item.mobileLabel}</span>
              </Link>
            );
          })}
          <Link
            href="/tools"
            data-tour="nav-tools"
            aria-current={pathname.startsWith("/tools") || pathname === "/protection" || pathname === "/rituals" ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors ${
              pathname === "/tools" || pathname === "/protection" || pathname === "/rituals"
                ? "text-amber-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <span className="text-lg" aria-hidden="true">⚡</span>
            <span className="whitespace-nowrap">Инструменты</span>
          </Link>
        </div>
      </nav>

      {/* Desktop sidebar */}
      <nav
        className="fixed bottom-0 left-0 top-0 z-50 hidden w-56 flex-col border-r border-slate-700/80 bg-slate-900/95 backdrop-blur-lg lg:flex"
        aria-label="Основная навигация"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-slate-700/50 px-5 py-5">
          <img
            src="/logo/logo-96x96.webp"
            alt=""
            width={48}
            height={48}
            className="shrink-0"
          />
          <div>
            <div className="text-sm font-bold text-slate-100">Ментальный банк</div>
            <div className="text-[10px] text-slate-500">Только депозиты</div>
          </div>
        </div>

        {/* Account sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Основное
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                id={item.id}
                href={item.href}
                data-tour={item.id}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <span className="text-lg" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Инструменты
          </div>

          {[
            { id: "nav-mindset", href: "/mindset", label: "Убеждения", icon: "🧠" },
            { id: "nav-protection", href: "/protection", label: "Защита уверенности", icon: "🛡️" },
            { id: "nav-rituals", href: "/rituals", label: "Ритуалы", icon: "⚡" },
            { id: "nav-cba", href: "/cba", label: "C-B-A / Дыхание", icon: "🌬️" },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                id={item.id}
                href={item.href}
                data-tour={item.id}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <span className="text-lg" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            История
          </div>

          <Link
            id="nav-deposits"
            href="/deposits"
            data-tour="nav-deposits"
            aria-current={pathname === "/deposits" ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              pathname === "/deposits"
                ? "bg-amber-500/15 text-amber-400"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <span className="text-lg" aria-hidden="true">📜</span>
            <span>История депозитов</span>
          </Link>
        </div>

      </nav>
    </>
  );
}
