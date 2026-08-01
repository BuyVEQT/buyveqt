"use client";

import type { RedditPost } from "@/lib/data/reddit";
import { formatAgo } from "./pulse-format";

/**
 * PulseCell — the Instrument's community unit (handoff recipe: "bordered
 * quote cards (1px soft), source + timestamp micro-labels").
 *
 * Deliberately absent: avatars, usernames, scores, upvotes, reply counts.
 * The recipe bans engagement counts outright, and the live data tier
 * (RSS) carries none of them anyway — so the card shows what is actually
 * true: the words, where they came from, when, and a link to the thread.
 *
 * The whole card is the link. Border 1px hairline → ink on hover; the
 * arrow takes the signal red, matching the ArticleStrip row grammar.
 */
export default function PulseCell({ post }: { post: RedditPost }) {
  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="pcell"
    >
      <p className="pcell__quote">
        &ldquo;{post.title}&rdquo;
      </p>

      <div className="pcell__foot">
        {/* Server render and first client render can disagree by a minute
            on a 30-minute-revalidated page; keep the server string. */}
        <span className="pcell__src" suppressHydrationWarning>
          r/JustBuyVEQT · {formatAgo(post.createdAt)}
        </span>
        <span className="pcell__arrow" aria-hidden>
          →
        </span>
      </div>

      <style jsx>{`
        .pcell {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 18px;
          min-height: 150px;
          padding: 16px 18px 14px;
          border: 1px solid var(--ins-hair);
          border-radius: 0;
          background: none;
          text-decoration: none;
          color: var(--ins-ink);
          font-family: var(--ins-font);
          transition: border-color 0.18s ease;
        }
        .pcell:hover {
          border-color: var(--ins-ink);
        }
        .pcell__quote {
          margin: 0;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.4;
          letter-spacing: -0.005em;
          /* Four lines, then ellipsis — the cells stay a grid, not a
             ragged wall of different-length headlines. */
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pcell__foot {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
        }
        /* Source + timestamp is a TRUE LABEL — it names where the words came
           from, it does not explain anything — so it keeps caps + tracking
           and only rises to the 10px floor. Tracking held at 0.16em: the
           longest real string ("R/JUSTBUYVEQT · JUST NOW", 24 chars ≈ 176px
           at 10px/0.16em) still clears the narrowest cell the grid can make
           (300px minus 36px padding, less the arrow and its 12px gap ≈
           237px), so there is nothing to dial back for. */
        .pcell__src {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          font-variant-numeric: tabular-nums;
        }
        .pcell__arrow {
          font-size: 15px;
          font-weight: 700;
          line-height: 1;
          color: var(--ins-ink);
          transition: color 0.18s ease;
        }
        .pcell:hover .pcell__arrow {
          color: var(--ins-signal);
        }

        @media (prefers-reduced-motion: reduce) {
          .pcell,
          .pcell__arrow {
            transition: none;
          }
        }

        @media (max-width: 640px) {
          .pcell {
            min-height: 0;
            gap: 14px;
            padding: 14px 16px 12px;
          }
          .pcell__quote {
            font-size: 14.5px;
            -webkit-line-clamp: 5;
          }
          /* One card per row on phones, so the label has ~291px of run —
             more headroom than desktop, not less. Floor only. */
          .pcell__src {
            font-size: 10px;
            letter-spacing: 0.14em;
          }
        }
      `}</style>
    </a>
  );
}
