"use client";

import { useState } from "react";

interface TableOfContentsProps {
  items: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function TableOfContents({ items: itemsStr }: TableOfContentsProps) {
  const [open, setOpen] = useState(false);
  const items = itemsStr.split("|").map((s) => s.trim());

  const handleClick = (item: string) => {
    const id = slugify(item);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(false);
    }
  };

  const list = (
    <ul className="space-y-1.5 list-none pl-0">
      {items.map((item) => (
        <li key={item}>
          <button
            onClick={() => handleClick(item)}
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors text-left w-full"
          >
            {item}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <nav className="my-6">
      {/* Mobile: collapsible */}
      <details
        className="sm:hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]"
        open={open}
        onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] cursor-pointer select-none">
          In this article
        </summary>
        <div className="px-4 pb-3">{list}</div>
      </details>

      {/* Desktop: always visible */}
      <div className="hidden sm:block rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
          In this article
        </p>
        {list}
      </div>
    </nav>
  );
}
