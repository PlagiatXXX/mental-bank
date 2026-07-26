"use client";

import { usePathname } from "next/navigation";

/**
 * Единственное место, где задаётся отступ контента от боковой панели (14rem).
 * Любые компоненты внутри него (MainContent, Footer и т.д.) автоматически
 * получают правильный отступ — не нужно дублировать класс на каждом.
 */
export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // На странице приветствия нет sidebar'а — отступ не нужен
  if (pathname === "/welcome") return <>{children}</>;

  return <div className="sidebar-offset">{children}</div>;
}
