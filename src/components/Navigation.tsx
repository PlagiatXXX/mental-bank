"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Счёт", icon: "🏦" },
  { href: "/top-10", label: "Топ-10", icon: "🏆" },
  { href: "/esp-journal", label: "E-S-P", icon: "📝" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700/80 bg-slate-900/95 backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-lg justify-around py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 px-4 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-amber-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <span className="text-lg" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <nav className="fixed bottom-0 left-0 top-0 z-50 hidden w-20 flex-col items-center border-r border-slate-700/80 bg-slate-900/95 backdrop-blur-lg lg:flex">
        <div className="flex flex-col items-center gap-6 py-6">
          <span className="text-2xl" title="Ментальный банк" aria-hidden="true">🪙</span>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 px-2 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-amber-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
                title={item.label}
              >
                <span className="text-xl" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
