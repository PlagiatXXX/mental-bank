import type { Metadata } from "next";
import VictoryPoster from "@/components/VictoryPoster";
import ChapterInfo from "@/components/ChapterInfo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Топ-10 побед",
};

export default function Top10Page() {
  return (
    <div className="space-y-4">
      <ChapterInfo
        chapterNumber={2}
        pageTitle="🏆 Топ-10 побед"
        contextNote="Топ-10 — это ваш наглядный депозит уверенности. Держите его под рукой и перечитывайте перед важными событиями. Каждая победа — доказательство вашей состоятельности."
      />
      <VictoryPoster />
    </div>
  );
}
