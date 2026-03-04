"use client";

import { useState, useRef, useEffect } from "react";
import { Category } from "../lib/storage";

type Props = {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
};

export default function CategoryDropdown({ categories, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = categories.find((c) => c.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 min-w-36"
      >
        {selected ? (
          <>
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: selected.color }}
            />
            <span className="text-zinc-700">{selected.name}</span>
          </>
        ) : (
          <span className="text-zinc-400">カテゴリ選択</span>
        )}
        <span className="ml-auto text-zinc-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-zinc-200 rounded-xl shadow-lg z-20 min-w-36 overflow-hidden">
          <div
            onClick={() => { onChange(""); setOpen(false); }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-50 cursor-pointer"
          >
            選択解除
          </div>
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => { onChange(cat.id); setOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-zinc-50 ${
                value === cat.id ? "bg-zinc-100 font-medium" : ""
              }`}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-zinc-700">{cat.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}