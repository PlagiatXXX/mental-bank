import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-700/60 bg-slate-800/60 text-5xl">
        📡
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">
          Нет соединения
        </h1>
        <p className="max-w-sm text-[15px] leading-relaxed text-slate-400">
          Ментальный банк работает офлайн: ваши депозиты и ритуалы
          остались на устройстве. Проверьте сеть, чтобы открыть
          новые разделы.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-slate-900 transition hover:bg-amber-400"
      >
        Попробовать снова
      </Link>
    </div>
  );
}
