"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import UserMenu from "./UserMenu";

interface User {
  id: string;
  nickname: string;
  avatar: string;
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
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
          setUser(data.user);
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
      {/* Mini-profile — только для авторизованных пользователей */}
      {user && (
        <div className="fixed right-4 top-4 z-50">
          <UserMenu user={user} />
        </div>
      )}

      {children}
    </>
  );
}
