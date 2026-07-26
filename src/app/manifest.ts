import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ментальный банк",
    short_name: "Mental Bank",
    description:
      "Тренажёр уверенности по методологии Нэйта Занссера. Только депозиты. Никаких списаний.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#f59e0b",
    icons: [
      { src: "/logo/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/logo/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
