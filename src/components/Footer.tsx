"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SocialLinks from "./SocialLinks";
import DonateBlock from "./DonateBlock";

const mainLinks = [
  { href: "/", label: "Баланс" },
  { href: "/esp-journal", label: "ESP-дневник" },
  { href: "/top-10", label: "Топ-10 побед" },
  { href: "/account-2", label: "Аффирмации" },
  { href: "/account-3", label: "Визуализация" },
  { href: "/aar", label: "AAR — разбор" },
];

const toolLinks = [
  { href: "/protection", label: "Защита" },
  { href: "/rituals", label: "Ритуалы" },
  { href: "/cba", label: "C-B-A" },
  { href: "/mindset", label: "Установка" },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/welcome") return null;

  return (
    <footer className="border-t border-slate-800 bg-slate-900/50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/logo/logo-96x96.webp"
                alt=""
                width={32}
                height={32}
                className="shrink-0"
              />
              <span className="text-sm font-bold text-slate-100">
                Ментальный банк
              </span>
            </Link>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Тренируйте уверенность по методологии Нэйта Занссера.
              Только депозиты. Никаких списаний.
            </p>
            <div className="mt-4">
              <SocialLinks />
            </div>
            <div className="mt-4">
              <DonateBlock />
            </div>
          </div>

          {/* Pages */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Основное
            </h3>
            <ul className="space-y-1.5">
              {mainLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-500 transition-colors hover:text-amber-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Инструменты
            </h3>
            <ul className="space-y-1.5">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-500 transition-colors hover:text-amber-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-slate-800 pt-6 text-center">
          <p className="text-xs text-slate-600">
            Основано по книге «The Confident Mind» Нэйта Занссера
          </p>
          <p className="mt-1 text-xs text-slate-700">
            © {new Date().getFullYear()} Ментальный банк
          </p>
        </div>
      </div>
    </footer>
  );
}
