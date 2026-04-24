"use client";

import { useState } from "react";
import type { NewsItem } from "@/lib/content";

const INITIAL_COUNT = 3;

export default function NewsSection({ items }: Readonly<{ items: NewsItem[] }>) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, INITIAL_COUNT);

  return (
    <section>
      <h2 className="mb-4 text-(--text)">News</h2>
      <ul className="space-y-3">
        {visible.map((item) => (
          <li key={item.date + item.text} className="flex gap-2.5 text-sm">
            <span className="shrink-0 leading-relaxed">{item.icon}</span>
            <span className="text-(--muted-text)">
              <span className="font-semibold text-(--text)">{item.date}</span>
              {" — "}
              {item.text}
            </span>
          </li>
        ))}
      </ul>
      {items.length > INITIAL_COUNT && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-xs text-(--link) hover:underline"
        >
          {showAll ? "Show less" : `Show ${items.length - INITIAL_COUNT} more`}
        </button>
      )}
    </section>
  );
}
