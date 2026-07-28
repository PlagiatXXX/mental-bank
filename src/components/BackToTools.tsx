import Link from "next/link";

export default function BackToTools() {
  return (
    <Link
      href="/tools"
      className="-mt-2 mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-amber-400"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
      Назад к инструментам
    </Link>
  );
}
