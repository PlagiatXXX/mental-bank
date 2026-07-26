"use client";

import { usePathname } from "next/navigation";

export default function AppHeader() {
  const pathname = usePathname();
  if (pathname === "/welcome") return null;

  return (
    <header className="mb-6 text-center lg:text-left">
      <div className="mb-1 flex items-center justify-center gap-2 lg:justify-start">
        <img
          src="/logo/logo-96x96.webp"
          alt=""
          width={40}
          height={40}
          className="shrink-0"
        />
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          Ментальный банк
        </h1>
      </div>
      <p className="text-xs text-slate-500">
        Только депозиты. Никаких списаний.
      </p>
    </header>
  );
}
