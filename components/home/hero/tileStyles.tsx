"use client";

/**
 * Shared global styles for the four companion tiles below the duotone
 * chart. Pulled out into a single global block so the styles don't
 * get duplicated by each tile component.
 *
 * Tile structure:
 *   ┌─────────────────────────────┐
 *   │ ed-label                    │
 *   │ Big stat (display + sub)    │
 *   │ Mini viz (dots/bars/gauges) │
 *   │ Dot-readout strip           │
 *   │ Row (label / value)         │
 *   │ ┄ dashed hairline          │
 *   │ Hover-reveal detail panel   │
 *   └─────────────────────────────┘
 *
 * Each tile uses class names from this block; nothing here renders
 * unless a tile is on the page.
 */
export default function TileStyles() {
  return (
    <style jsx global>{`
      .heroC__tiles {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
      }
      .almTile {
        padding: 14px 16px;
        background: var(--paper-light);
        border: 1px solid var(--rule-soft);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-height: 138px;
        animation: tileIn 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) both;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .almTile:hover {
        border-color: var(--ink-mute);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
      }
      .heroC__tiles > .almTile:nth-child(1) {
        animation-delay: 0s;
      }
      .heroC__tiles > .almTile:nth-child(2) {
        animation-delay: 0.08s;
      }
      .heroC__tiles > .almTile:nth-child(3) {
        animation-delay: 0.16s;
      }
      .heroC__tiles > .almTile:nth-child(4) {
        animation-delay: 0.24s;
      }
      @keyframes tileIn {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Big-stat row at the top of each tile */
      .almTile__big {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: 30px;
        line-height: 1.05;
        letter-spacing: -0.02em;
        margin-top: 2px;
        display: flex;
        align-items: baseline;
        gap: 8px;
        color: var(--ink);
      }
      .almTile__big-sub {
        font-family: var(--font-sans);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.04em;
        color: var(--ink-mute);
      }

      /* Streak — entry "punch" */
      .almTile__streak-n {
        display: inline-block;
        animation: streakPunch 0.6s cubic-bezier(0.2, 0.7, 0.3, 1) both;
        animation-delay: 0.15s;
      }
      @keyframes streakPunch {
        0% {
          opacity: 0;
          transform: scale(0.5);
        }
        70% {
          transform: scale(1.12);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
      .almTile__streak-strip {
        display: grid;
        grid-template-columns: repeat(30, 1fr);
        gap: 2px;
        margin: 6px 0 2px;
        height: 10px;
      }
      .almTile__streak-dot {
        appearance: none;
        padding: 0;
        border: 0;
        background: var(--ink);
        display: block;
        width: 100%;
        height: 100%;
        /* Squircle on mobile so the dot has area to tap;
           perfect circle on desktop where the viz reads finer */
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        transform: scale(0.4);
        animation: streakDotIn 0.28s cubic-bezier(0.2, 0.7, 0.3, 1) both;
        transition: transform 0.12s ease, opacity 0.12s ease;
        /* Expand the touch target without changing the visual via a
           pseudo-element overlay. WCAG asks for ≥24px; we get most of
           the way there at mobile widths and full-way on desktop. */
        position: relative;
      }
      .almTile__streak-dot::before {
        content: "";
        position: absolute;
        inset: -8px -1px;
      }
      .almTile__streak-dot.is-up {
        background: var(--green);
      }
      .almTile__streak-dot.is-down {
        background: var(--stamp);
      }
      .almTile__streak-dot:hover,
      .almTile__streak-dot:focus,
      .almTile__streak-dot.is-hover {
        opacity: 1 !important;
        transform: scale(1.5) !important;
        outline: none;
      }
      @keyframes streakDotIn {
        to {
          opacity: 0.85;
          transform: scale(1);
        }
      }

      /* Readout strip shared by streak / distribution / sleeves */
      .almTile__dot-readout {
        font-family: var(--font-sans);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.02em;
        display: flex;
        gap: 8px;
        align-items: baseline;
        min-height: 16px;
        margin-top: 2px;
      }

      /* Year pills (On this day) */
      .almTile__almanac-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 8px;
      }
      .almTile__yr-pills {
        display: inline-flex;
        gap: 2px;
      }
      .almTile__yr-pill {
        appearance: none;
        border: 0;
        background: transparent;
        /* Inflated touch target — the visible pill stays small but the
           hit area is 26px tall on mobile so it passes WCAG 2.5.5. */
        padding: 6px 8px;
        margin: -4px -2px;
        border-radius: 4px;
        font-family: var(--font-sans);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: var(--ink-mute);
        cursor: pointer;
        text-transform: uppercase;
        transition: background 0.12s, color 0.12s;
        line-height: 1;
      }
      .almTile__yr-pill:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
      .almTile__yr-pill:not(:disabled):hover {
        background: var(--paper-warm);
        color: var(--ink);
      }
      .almTile__yr-pill.is-active {
        background: var(--ink);
        color: var(--paper-light);
      }

      .almTile__row {
        font-family: var(--font-sans);
        font-size: 11px;
        color: var(--ink-soft);
        display: flex;
        justify-content: space-between;
      }
      .almTile__row > span:first-child {
        color: var(--ink-mute);
      }

      /* Distribution histogram */
      .almTile__histo {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 2px;
        height: 40px;
        align-items: end;
        margin: 4px 0;
      }
      .almTile__bar {
        appearance: none;
        border: 0;
        padding: 0;
        border-radius: 1px;
        height: 0;
        background: var(--ink);
        opacity: 0.18;
        cursor: pointer;
        animation: histoIn 0.45s cubic-bezier(0.2, 0.7, 0.3, 1) both;
        transition: opacity 0.12s, transform 0.12s, background 0.12s;
        /* Touch-target overlay — keeps the visible bar slim while the
           hit area stretches to the histogram's full height. */
        position: relative;
      }
      .almTile__bar::before {
        content: "";
        position: absolute;
        left: -1px;
        right: -1px;
        top: -40px;
        bottom: 0;
      }
      .almTile__bar.is-today {
        background: var(--stamp);
        opacity: 1;
      }
      .almTile__bar:hover,
      .almTile__bar:focus,
      .almTile__bar.is-hover {
        opacity: 1;
        background: var(--ink);
        outline: none;
      }
      .almTile__bar.is-today:hover,
      .almTile__bar.is-today.is-hover {
        background: var(--stamp);
      }
      @keyframes histoIn {
        to {
          height: var(--bar-h);
        }
      }

      /* Sleeves 2×2 mini gauges */
      .almTile__sleeves {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px 10px;
        margin-top: 2px;
      }
      .almTile__sleeve {
        appearance: none;
        padding: 4px 6px;
        margin: -4px -6px;
        background: transparent;
        border: 0;
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 6px;
        align-items: center;
        cursor: pointer;
        border-radius: 6px;
        text-align: left;
        transition: background 0.12s;
      }
      .almTile__sleeve:hover,
      .almTile__sleeve:focus,
      .almTile__sleeve.is-hover {
        background: var(--paper-warm);
        outline: none;
      }
      .almTile__sleeve-tick {
        font-family: var(--font-sans);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.04em;
        color: var(--ink);
      }
      .almTile__sleeve-val {
        font-family: var(--font-sans);
        font-size: 11px;
        font-weight: 600;
        text-align: right;
      }
      .almTile__sleeve-val.is-pos {
        color: var(--green);
      }
      .almTile__sleeve-val.is-neg {
        color: var(--stamp);
      }

      /* On this day */
      .almTile__almanac {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .almTile__almanac-y {
        font-family: var(--font-display);
        font-weight: 500;
        letter-spacing: -0.02em;
        font-size: 32px;
        line-height: 1;
        color: var(--ink);
        animation: almanacYear 0.6s cubic-bezier(0.2, 0.7, 0.3, 1) both;
        animation-delay: 0.2s;
      }
      @keyframes almanacYear {
        from {
          opacity: 0;
          transform: translateY(6px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .almTile__almanac p {
        margin: 4px 0 0;
        font-family: var(--font-serif);
        font-size: 13px;
        line-height: 1.4;
        color: var(--ink-soft);
        animation: almanacText 0.6s ease both;
        animation-delay: 0.32s;
      }
      @keyframes almanacText {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Reveal-on-hover detail panel */
      .almTile__detail {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: auto;
        padding-top: 8px;
        border-top: 1px dashed var(--rule-hair);
        opacity: 0;
        max-height: 0;
        overflow: hidden;
        transform: translateY(4px);
        transition: opacity 0.25s ease, transform 0.25s ease,
          max-height 0.25s ease;
      }
      .almTile:hover .almTile__detail,
      .almTile:focus-within .almTile__detail {
        opacity: 1;
        max-height: 200px;
        transform: translateY(0);
      }

      /* Today's drivers strip (inside Sleeves' detail) */
      .almTile__drivers {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
        margin-top: 2px;
      }
      .almTile__driver {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 4px 2px;
        background: var(--paper);
        border-radius: 4px;
      }
      .almTile__driver-tick {
        font-family: var(--font-sans);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.04em;
        color: var(--ink-mute);
      }
      .almTile__driver-val {
        font-family: var(--font-sans);
        font-size: 11px;
        font-weight: 700;
      }
      .almTile__driver-val.is-pos {
        color: var(--green);
      }
      .almTile__driver-val.is-neg {
        color: var(--stamp);
      }

      /* Mobile breakpoints */
      @media (max-width: 880px) {
        .heroC__tiles {
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .almTile {
          padding: 12px 14px;
          min-height: 0;
          gap: 5px;
        }
        .almTile__big {
          font-size: 26px;
        }
        .almTile__almanac-y {
          font-size: 28px;
        }
      }
      @media (max-width: 520px) {
        .heroC__tiles {
          grid-template-columns: 1fr;
          gap: 10px;
        }
        .almTile__big {
          font-size: 30px;
        }
        .almTile__almanac-y {
          font-size: 32px;
        }
      }

      /* No-hover / mobile — always reveal the detail panel */
      @media (hover: none), (max-width: 880px) {
        .almTile__detail {
          opacity: 1;
          max-height: 200px;
          transform: translateY(0);
        }
      }
    `}</style>
  );
}
