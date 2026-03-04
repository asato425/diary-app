"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "今日の記録" },
  { href: "/tasks", label: "タスク管理" },
  { href: "/history", label: "履歴" },
  { href: "/analytics", label: "分析" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-zinc-200 z-10">
      <div className="max-w-3xl mx-auto px-8 flex gap-1 h-14 items-center">
        <span className="font-bold text-zinc-800 mr-6">Daily Log</span>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              pathname === item.href
                ? "bg-zinc-800 text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}