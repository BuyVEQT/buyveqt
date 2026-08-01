"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";

const css = `
.anews {
  margin-top: 26px;
  border: 1px solid var(--ins-ink);
  padding: 20px 22px 22px;
  font-family: var(--ins-font);
  color: var(--ins-ink);
}
.anews--compact {
  margin-top: 18px;
  padding: 16px 18px 18px;
}
.anews__top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.anews__edition {
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.anews__pitch {
  margin: 10px 0 0;
  max-width: 60ch;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.55;
  color: var(--ins-gray-700);
}
.anews__form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0;
  margin-top: 14px;
  border: 1px solid var(--ins-ink);
}
.anews__sr {
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
.anews__input {
  appearance: none;
  width: 100%;
  min-width: 0;
  border: 0;
  background: var(--ins-paper);
  color: var(--ins-ink);
  padding: 12px 14px;
  font-family: var(--ins-font);
  /* iOS Safari zooms anything under 16px on focus. */
  font-size: max(16px, 14px);
  font-weight: 500;
  outline: none;
}
.anews__input::placeholder {
  color: var(--ins-gray-600);
}
.anews__input:focus-visible {
  outline: 2px solid var(--ins-signal);
  outline-offset: -2px;
}
.anews__submit {
  appearance: none;
  border: 0;
  border-left: 1px solid var(--ins-ink);
  background: var(--ins-signal);
  color: #ffffff;
  padding: 12px 22px;
  font-family: var(--ins-font);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.18s ease;
}
.anews__submit:hover {
  background: #c8331f;
}
.anews__submit:disabled {
  opacity: 0.62;
  cursor: default;
}
.anews__submit:disabled:hover {
  background: var(--ins-signal);
}
/* Confirmation strip — echoes the form's 1px ink box. */
.anews__done {
  margin-top: 14px;
  border: 1px solid var(--ins-ink);
  padding: 13px 14px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-ink);
}
/* Error copy is a SENTENCE straight from the API - caption grammar. Red
   carries the alarm; caps never did. .anews__done above stays caps: it is
   a boxed receipt stamp rather than running copy, and it already sits at
   the 10px floor. */
.anews__msg {
  margin: 9px 0 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--ins-signal);
}
/* Standing footnote - sentence case at the caption size. */
.anews__legal {
  margin: 10px 0 0;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--ins-gray-600);
}

@media (max-width: 560px) {
  .anews__form {
    grid-template-columns: minmax(0, 1fr);
  }
  .anews__submit {
    border-left: 0;
    border-top: 1px solid var(--ins-ink);
    min-height: 46px;
  }
  .anews__top {
    font-size: 10px;
    letter-spacing: 0.14em;
  }
  .anews__pitch {
    font-size: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .anews__submit {
    transition: none;
  }
}
`;

interface NewsletterCardProps {
  /** Tightens the chrome for inline use below an article body. */
  compact?: boolean;
}

/**
 * The weekly-dispatch signup, reduced to Instrument grammar: one 1px ink
 * box, a two-line pitch, and a single ruled field with a solid red submit.
 *
 * The previous card — cream slab, pull-quote, pill buttons, bullet list —
 * fought the article's closer chain for attention right where the reader is
 * supposed to move on to the next dispatch. The capture is kept; the
 * furniture is not.
 *
 * Posts to /api/subscribe (Buttondown) — the same endpoint and request
 * shape as components/NewsletterSignup, so both capture points land in one
 * list.
 */
export default function NewsletterCard({
  compact = false,
}: NewsletterCardProps = {}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        track("newsletter_signup", { source: "article_card" });
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Could not connect. Please try again.");
    }
  }

  return (
    <section
      className={`anews${compact ? " anews--compact" : ""}`}
      aria-labelledby="anews-title"
    >
      <div className="anews__top">
        <span id="anews-title">The weekly dispatch</span>
        {/* No fabricated edition numbers — the weekly hasn't shipped its
            first issue yet; say the honest thing. */}
        <span className="anews__edition">Ships Sundays</span>
      </div>
      <p className="anews__pitch">
        One letter every Sunday — about 600 words for the VEQT holder who
        hasn&rsquo;t given up on understanding what they own. Independent, no
        affiliate links, unsubscribe in one click.
      </p>
      {status === "success" ? (
        <p className="anews__done" role="status">
          You&rsquo;re on the list &mdash; first letter lands Sunday
        </p>
      ) : (
        <form
          className="anews__form"
          onSubmit={handleSubmit}
          aria-label="Subscribe to the weekly dispatch"
        >
          <label>
            <span className="anews__sr">Email address</span>
            <input
              className="anews__input"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            className="anews__submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Sending…" : "Join the list"}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="anews__msg" role="alert">
          {errorMessage}
        </p>
      )}
      <p className="anews__legal">
        Independent · We don&rsquo;t share your email
      </p>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
