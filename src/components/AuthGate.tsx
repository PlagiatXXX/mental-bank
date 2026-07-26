"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  const isWelcome = pathname === "/welcome";

  useEffect(() => {
    if (isWelcome) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.user) {
          // user logged in — AppHeader подхватит сам
        } else {
          router.replace("/welcome");
        }
      })
      .catch(() => {
        if (!cancelled) router.replace("/welcome");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isWelcome, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-sm text-slate-500">Загрузка…</div>
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
}
