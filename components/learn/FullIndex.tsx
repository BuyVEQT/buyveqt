"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  INDEX_PREVIEW_COUNT,
  LEARN_CATEGORIES,
  numberWord,
  type LearnCategory,
  type SyllabusEntry,
} from "./learn-syllabus";

type Filter = "All" | LearnCategory;

const FILTERS: Filter[] = ["All", ...LEARN_CATEGORIES];

/** "?cat=behaviour" → "Behaviour". Anything unrecognised falls back to All. */
function filterFromParam(raw: string | null): Filter {
  if (!raw) return "All";
  const hit = FILTERS.find((f) => f.toLowerCase() === raw.toLowerCase());
  return hit ?? "All";
}

const css = `
.lrn-ix {
  border-top: 3px solid var(--ins-rule-strong);
  padding-top: 16px;
  font-family: var(--ins-font);
  color: var(--ins-ink);
}
.lrn-ix__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}
.lrn-ix__eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.lrn-ix__display {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.lrn-ix__tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.lrn-ix__tab {
  appearance: none;
  background: transparent;
  border: 1px solid var(--ins-hair);
  border-radius: 0;
  padding: 5px 11px;
  font-family: var(--ins-font);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ins-ink);
  cursor: pointer;
}
.lrn-ix__tab:hover {
  border-color: var(--ins-ink);
}
.lrn-ix__tab.is-active {
  background: var(--ins-ink);
  border-color: var(--ins-ink);
  color: var(--ins-paper);
}
.lrn-ix__list {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  border-top: 1px solid var(--ins-ink);
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 56px;
}
.lrn-ix__row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: baseline;
  align-content: start;
  /* Fill the <li> so the two columns' hairlines stay on the same
     baseline when a title in one column wraps and the other doesn't. */
  height: 100%;
  padding: 12px 0;
  border-bottom: 1px solid var(--ins-hair);
  text-decoration: none;
  color: var(--ins-ink);
  transition: padding-left 0.18s ease;
}
.lrn-ix__row:hover {
  padding-left: 8px;
}
.lrn-ix__kicker {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.lrn-ix__title {
  display: block;
  margin-top: 3px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.25;
  text-wrap: pretty;
}
.lrn-ix__arrow {
  font-size: 15px;
  font-weight: 700;
  transition: color 0.18s ease;
}
.lrn-ix__row:hover .lrn-ix__arrow,
.lrn-ix__row:focus-visible .lrn-ix__arrow {
  color: var(--ins-signal);
}
.lrn-ix__more {
  padding: 12px 0 2px;
}
.lrn-ix__more-btn {
  appearance: none;
  background: transparent;
  border: 0;
  border-bottom: 2px solid var(--ins-ink);
  border-radius: 0;
  padding: 0 0 3px;
  font-family: var(--ins-font);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ins-ink);
  cursor: pointer;
  font-variant-numeric: tabular-nums;
}
.lrn-ix__more-btn:hover {
  color: var(--ins-signal);
  border-bottom-color: var(--ins-signal);
}
.lrn-ix__empty {
  margin: 18px 0 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--ins-gray-600);
}
.lrn-ix__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  .lrn-ix__row,
  .lrn-ix__arrow {
    transition: none;
  }
}

@media (max-width: 900px) {
  .lrn-ix__list {
    grid-template-columns: 1fr;
    column-gap: 0;
  }
}
@media (max-width: 640px) {
  .lrn-ix {
    padding-top: 12px;
  }
  .lrn-ix__head {
    display: block;
  }
  .lrn-ix__display {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  .lrn-ix__eyebrow {
    font-size: 10px;
    letter-spacing: 0.16em;
  }
  .lrn-ix__tabs {
    margin-top: 10px;
  }
  .lrn-ix__tab {
    min-height: 44px;
    padding: 0 13px;
    font-size: 10px;
  }
  .lrn-ix__list {
    margin-top: 6px;
    border-top: 0;
  }
  .lrn-ix__kicker {
    font-size: 10px;
    letter-spacing: 0.1em;
  }
  .lrn-ix__title {
    font-size: 13.5px;
  }
  .lrn-ix__arrow {
    font-size: 14px;
  }
  .lrn-ix__more {
    padding: 4px 0 0;
  }
  .lrn-ix__more-btn {
    min-height: 44px;
  }
}
`;

/**
 * The full index — artboard 6c.
 *
 * Every dispatch in the registry, in curated order, behind six filter tabs.
 * Collapsed to the first eight rows with an expander that opens the rest in
 * place (the archive stays on this page — there is no second listing to
 * navigate to). The active tab is mirrored into `?cat=` so a filtered view
 * is shareable; state is local so the tabs respond instantly.
 */
export default function FullIndex({
  entries,
  count,
}: {
  entries: SyllabusEntry[];
  count: number;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [active, setActive] = useState<Filter>(() =>
    filterFromParam(params.get("cat"))
  );
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(
    () =>
      active === "All" ? entries : entries.filter((e) => e.category === active),
    [entries, active]
  );

  const visible = expanded ? filtered : filtered.slice(0, INDEX_PREVIEW_COUNT);
  const remainder = filtered.length - visible.length;

  function choose(next: Filter) {
    setActive(next);
    setExpanded(false);

    const sp = new URLSearchParams(params.toString());
    if (next === "All") sp.delete("cat");
    else sp.set("cat", next.toLowerCase());
    const qs = sp.toString();
    router.replace(qs ? `/learn?${qs}` : "/learn", { scroll: false });
  }

  return (
    <section className="lrn-ix" aria-labelledby="lrn-ix-display">
      <header className="lrn-ix__head">
        <div>
          <div className="lrn-ix__eyebrow">The full index</div>
          <h2 id="lrn-ix-display" className="lrn-ix__display">
            All {numberWord(count)}.
          </h2>
        </div>
        <div className="lrn-ix__tabs" role="group" aria-label="Filter the index">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => choose(f)}
              aria-pressed={active === f}
              className={`lrn-ix__tab${active === f ? " is-active" : ""}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <p className="lrn-ix__sr" role="status">
        {filtered.length} {filtered.length === 1 ? "dispatch" : "dispatches"}
        {active === "All" ? "" : ` in ${active}`}.
      </p>

      {filtered.length === 0 ? (
        <p className="lrn-ix__empty">No dispatches in that bucket yet.</p>
      ) : (
        <ul className="lrn-ix__list">
          {visible.map((e) => (
            <li key={e.slug}>
              <Link href={`/learn/${e.slug}`} className="lrn-ix__row">
                <span>
                  <span className="lrn-ix__kicker">
                    {e.category} · {e.minutes} min
                  </span>
                  <span className="lrn-ix__title">{e.title}</span>
                </span>
                <span className="lrn-ix__arrow" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {(remainder > 0 || expanded) && (
        <div className="lrn-ix__more">
          <button
            type="button"
            className="lrn-ix__more-btn"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <>
                Collapse the index <span aria-hidden>↑</span>
              </>
            ) : (
              <>
                {remainder} more in the archive <span aria-hidden>→</span>
              </>
            )}
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
