"use client";

import { usePathname } from "next/navigation";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWelcome = pathname === "/welcome";

  return (
    <main className={isWelcome ? "" : "flex-1"} id="main-content">
      <div
        className={
          isWelcome
            ? "w-full"
            : "content-container mx-auto w-full max-w-lg pb-24 pt-6 transition-all lg:max-w-5xl lg:pb-6 xl:max-w-6xl"
        }
      >
        {children}
      </div>
    </main>
  );
}
