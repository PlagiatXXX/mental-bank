"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface CoinFlyProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  onFinish: () => void;
}

export default function CoinFly({ from, to, onFinish }: CoinFlyProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const DURATION = 550;

  useEffect(() => {
    const el = elRef.current;
    if (!el) return () => {};

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    // Парабола: вершина — на 60px выше прямой траектории
    const peak = -Math.min(120, Math.abs(dx) * 0.3 + 40);

    let start: number | null = null;

    function animate(ts: number) {
      const currentEl = elRef.current;
      if (!currentEl) return;

      if (!start) start = ts;
      const t = Math.min((ts - start) / DURATION, 1);

      // easeOutCubic
      const ease = 1 - Math.pow(1 - t, 3);

      const x = from.x + dx * ease;
      // параболическая Y: линейная интерполяция + синусоидная арка
      const parabolaY = peak * Math.sin(Math.PI * ease);
      const y = from.y + dy * ease + parabolaY;

      const scale = 1 - ease * 0.6;

      currentEl.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      currentEl.style.opacity = String(Math.max(0, 1 - ease * 1.2));

      if (t >= 1) {
        onFinish();
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [from, to, onFinish]);

  return createPortal(
    <div
      ref={elRef}
      className="pointer-events-none fixed left-0 top-0 z-[200]"
      style={{ transform: `translate(${from.x}px, ${from.y}px)` }}
    >
      <img
        src="/logo/logo-96x96.webp"
        alt=""
        width={48}
        height={48}
        className="h-12 w-12"
      />
    </div>,
    document.body,
  );
}
