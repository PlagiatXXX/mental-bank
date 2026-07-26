"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import UserMenu from "./UserMenu";

interface User {
  id: string;
  nickname: string;
  avatar: string;
}

export default function AppHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (pathname === "/welcome") return;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  if (pathname === "/welcome") return null;

  return (
    <div id="app-header" className="mb-6">
      <div className="flex items-center gap-2">
        <img
          src="/logo/logo-96x96.webp"
          alt=""
          width={40}
          height={40}
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
            Ментальный банк
          </h1>
          <p className="text-[11px] text-slate-500">
            Только депозиты. Никаких списаний.
          </p>
        </div>
        {user && <UserMenu user={user} />}
      </div>
    </div>
  );
}
