# 12 — Bet 03: A new section, `/history`

**Milestone:** M4
**Effort:** High (~3 days focused build)
**Impact:** Defining
**Goal:** Add a new top-level route, `/history`, that reads as a single scroll-locked horizontal timeline of seven years of one ticker. The site's most ambitious single deliverable.

---

## The argument

VEQT was launched **January 29, 2019**. The site has zero coverage of the seven years since. The 90-day heatmap is a microscope. This is the telescope.

The page answers a question the inception calculator only nibbles at: **"what would I have *lived through*?"**

Read `design-refs/Round2-Review-v2.html` "Bet 03" for the SVG mock.

---

## Where it goes

**Route:** `app/history/page.tsx` (new)

**Components:**
- `components/history/HistoryHero.tsx` — the scroll-locked timeline shell
- `components/history/HistoryAnchor.tsx` — one event marker (price, drawdown, paragraph)
- `components/history/HistoryAxis.tsx` — bottom axis with year labels
- `components/history/InvestmentJourney.tsx` — the `$10K became $X` strip at the bottom

**Nav:** Add `/history` to the masthead nav rail. Position: between `Inside VEQT` and `Community`. Plain noun: **"History"**.

**Data:** `lib/data/veqt-history.json` — daily closes from 2019-01-29 to today. ~1750 rows. Approx 120kb gzipped.

---

## The interaction

This is the heart of the bet. **Sticky scroll-locked horizontal timeline.**

When the user scrolls **down** the page, the page **doesn't actually scroll vertically** through this section. Instead, the section is `position: sticky; top: 0; height: 100vh;`, and inside it a horizontal timeline scrolls **left-to-right** in proportion to the user's vertical scroll progress.

Five anchors are spaced along the timeline:
1. **2019-01-29** — Launch ($25.00)
2. **2020-03-23** — Covid trough ($16.50, -34%)
3. **2022-10-13** — Rate-hike trough ($28.10, -21%)
4. **2024-08-05** — Yen carry wobble ($36.80, -7.4%)
5. **Today** — current price

As the timeline scrolls past each anchor, the anchor's annotation **fades in and pins** to the visible viewport. As the next anchor approaches, the previous fades out.

### Pseudocode

```tsx
function HistoryHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0 to 1

  useEffect(() => {
    function onScroll() {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      // progress = how far into the section we've scrolled, normalized
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.min(1, Math.max(0, scrolled / total)));
    }
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={ref}
      style={{ height: "300vh" }}              /* 3 viewport heights of scroll = full sweep */
    >
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        <Timeline progress={progress} />
      </div>
    </section>
  );
}
```

**Section height:** 300vh — 3 viewport heights of scroll buys you a comfortable sweep through 7 years. Tune by feel.

**No external library required.** Plain `getBoundingClientRect` + scroll listener is enough. If `framer-motion` is already in the repo, fine; do not add it just for this.

---

## The visual

The full SVG composition, simplified:

```
┌────────────────────────────────────────────────────────────────────────┐
│  EYEBROW (sans, vermilion, 10px) — /HISTORY                            │
│  Seven years of one ticker.                              ← lead h1     │
│                                                                         │
│   2019    Mar 2020    Oct 2022    Aug 2024    Today                    │
│    │         │           │           │          │                       │
│    ●─────────●───────────●───────────●──────────●         ← price line │
│   $25.00   $16.50      $28.10     $36.80     $42.61                    │
│   launch   −34% in 32d  −21% trough  yen wobble  today                 │
│                                                                         │
│  ─────────────────────────────────────────────────────────────         │
│  $10K AT LAUNCH    →    $17,044      ← computed live                   │
│  …that bought you a covid crash, two corrections, and seven years      │
│   of paychecks.                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Layers

1. **Background:** `var(--paper)`. No gradient.
2. **Price line:** Single SVG path. `var(--stamp)` stroke, 2px. Filled below at `opacity: 0.06`.
3. **Year axis:** Bottom strip, 5 vertical hairlines `var(--rule)` at the anchor positions, year labels in mono below.
4. **Anchor dots:** `<circle>` at each anchor, radius 4 (5 for "today" with a 1.5px ink ring).
5. **Anchor annotations:** Above each dot — price (serif, weight 600, ink) and italic note (serif italic, 9px, mute or vermilion if it's a drawdown).
6. **Investment journey strip:** Bottom of the viewport, separate from the chart. Shows `$10K → $17,044` updating live as the user scrolls (interpolated to the current anchor's price).

### Sizing

The chart sits in an SVG that's the **full viewport width**, with internal coords `viewBox="0 0 1920 600"` or similar. The price-line path is precomputed from the data file — convert each `(date, price)` to `(x, y)` with `x = (date - launchDate) / (today - launchDate) * 1920` and `y = priceToY(price, minPrice, maxPrice)`.

The path is **static**. The illusion of scrolling is achieved by translating a viewport mask, not by re-rendering the path.

```tsx
<svg viewBox="0 0 1920 600">
  <g transform={`translate(${-progress * (1920 - viewportWidth)} 0)`}>
    {/* the full 7-year price path */}
  </g>
</svg>
```

This is the cheapest way to do it and it's GPU-accelerated.

---

## Investment journey strip

A small horizontal block, fixed at the bottom of the sticky viewport (not part of the SVG):

```tsx
<div className="absolute bottom-8 left-0 right-0 px-12">
  <div className="border-t-2 border-[color:var(--ink)] pt-3 flex items-baseline gap-3">
    <span className="bs-label">$10K at launch</span>
    <span className="text-[color:var(--ink-mute)] italic">→</span>
    <span className="text-[2rem] font-semibold text-[color:var(--stamp)] tabular-nums">
      ${currentValue.toLocaleString()}
    </span>
  </div>
  <p className="font-serif italic text-sm text-[color:var(--ink-mute)] mt-1">
    {captionForCurrentAnchor}
  </p>
</div>
```

`currentValue = 10000 * (priceAtCurrentScroll / launchPrice)`.

The caption changes per anchor:
- **At launch:** *"…that's where it begins."*
- **At Covid trough:** *"…that $10K is now worth $6,600. Hold or sell?"*
- **At Oct 2022:** *"…you stayed. It paid back, slowly."*
- **At Aug 2024:** *"…the wobble was three days. The recovery was two weeks."*
- **At today:** *"…that bought you a covid crash, two corrections, and seven years of paychecks."*

---

## Below the sticky section

After the user scrolls past the timeline (i.e., after 300vh of scroll), the page resumes normal flow. Below the timeline, on `/history`:

1. **A simple chronology** — five `<HistoryAnchor>` cards, vertically stacked, each with a 2-3 paragraph longform on what was happening (Covid, rate hikes, yen carry, etc.). This is the page's *takedown reading*, after the *show*.
2. **A reflection block** — one quote: *"Seven years. Two crashes. Forty-two thousand dollars per ten thousand invested. The hardest thing was not selling."* (Or similar — refine.)
3. **CTA:** A single underlined link: *"See today's volatility →"* pointing to `/inside-veqt#heatmap`.

---

## Data file

`lib/data/veqt-history.json`:

```json
{
  "ticker": "VEQT.TO",
  "launchDate": "2019-01-29",
  "asOf": "2026-04-28",
  "anchors": [
    { "id": "launch",      "date": "2019-01-29", "price": 25.00, "label": "launch",        "drawdown": null,  "note": "Vanguard launches the all-equity ETF." },
    { "id": "covid",       "date": "2020-03-23", "price": 16.50, "label": "covid trough",   "drawdown": -0.34, "note": "Down 34% in 32 days." },
    { "id": "rate-hikes",  "date": "2022-10-13", "price": 28.10, "label": "rate-hike trough","drawdown": -0.21, "note": "Twelve months of cuts and rises." },
    { "id": "yen",         "date": "2024-08-05", "price": 36.80, "label": "yen wobble",     "drawdown": -0.074,"note": "Three sessions, then snap-back." },
    { "id": "today",       "date": "2026-04-28", "price": 42.61, "label": "today",          "drawdown": null,  "note": "" }
  ],
  "series": [
    { "d": "2019-01-29", "p": 25.00 },
    { "d": "2019-01-30", "p": 25.06 },
    ...
  ]
}
```

`series` is daily closes, ~1750 rows. Strip to weekly closes (~365 rows) if file size matters; the path will look identical at this zoom level.

---

## Acceptance criteria

- [ ] `/history` renders as a top-level route, navigable from the masthead
- [ ] Sticky horizontal timeline works on desktop (≥1024px) — vertical scroll drives horizontal sweep
- [ ] Five anchor annotations fade in/out with scroll progress
- [ ] Investment journey strip updates live as the user scrolls
- [ ] Below the sticky section, five longform anchor cards render normally
- [ ] On mobile (<1024px) — **fall back to a vertical timeline** (sticky scroll on small screens is a usability disaster). Same data, stacked vertically with the sparkline truncated.
- [ ] Path uses real daily-close data; no synthetic curves
- [ ] No new dependencies (no Framer Motion *just* for this if it's not already in the project)
- [ ] No new design tokens
- [ ] Builds and lints clean

---

## Mobile fallback (explicit)

The sticky scroll-locked horizontal scroll **does not work** on mobile. iOS Safari's address-bar resize triggers the scroll listener at the wrong moments, and the gesture is unfamiliar.

**Mobile renders the same data as a vertical sequence:**
1. Hero: the full price chart as a single static SVG, ~280px tall
2. Below: the five anchor cards, stacked vertically, each ~200px
3. The investment-journey strip is inline at the bottom

Use `useMediaQuery('(min-width: 1024px)')` (or whatever the project's pattern is) to gate the sticky behavior.

---

## Out of scope

- No date scrubber. The scroll is the scrubber.
- No comparison with XEQT/ZEQT on this page. This is **VEQT alone**, a portrait.
- No projections forward. This is history.
- No interactive "what if I started here instead" — that's `/invest`.
