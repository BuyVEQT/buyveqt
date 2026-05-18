"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";

interface NewsletterCardProps {
  /** Compact = small footer-style card. Full = the page-bottom hero. */
  compact?: boolean;
}

/**
 * Dark card with the weekly-dispatch subscribe form. Replaces the
 * legacy NewsletterSignup on /learn (index + article reader).
 * Posts to /api/subscribe; shows a "thanks" state on success.
 */
export default function NewsletterCard({ compact = false }: NewsletterCardProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("That doesn't look like an email address.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Status ${res.status}`);
      }
      setStatus("ok");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (compact) {
    return (
      <Card dark>
        <SectionLabel dark>The dispatch · weekly</SectionLabel>
        <div
          className="ed-display-italic"
          style={{
            fontSize: 20,
            lineHeight: 1.15,
            marginTop: 10,
            color: "#f6efdc",
          }}
        >
          Get next Sunday&apos;s dispatch.
        </div>
        <form onSubmit={onSubmit} style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@inbox.com"
            disabled={status === "loading" || status === "ok"}
            style={{
              flex: 1,
              background: "rgba(246,239,220,0.08)",
              border: "none",
              padding: "10px 14px",
              borderRadius: 10,
              color: "#f6efdc",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading" || status === "ok"}
            style={{
              background: status === "ok" ? "var(--green)" : "var(--stamp)",
              color: "#f6efdc",
              border: "none",
              padding: "10px 16px",
              borderRadius: 10,
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              cursor: status === "loading" ? "wait" : "pointer",
            }}
          >
            {status === "ok" ? "DONE ✓" : status === "loading" ? "…" : "JOIN"}
          </button>
        </form>
        {status === "error" && error && (
          <p style={errorStyle}>{error}</p>
        )}
        {status === "ok" && (
          <p style={successStyle}>You&apos;re on the list. See you Sunday.</p>
        )}
      </Card>
    );
  }

  return (
    <Card dark padding="36px 32px">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 28,
          alignItems: "center",
        }}
        className="newsletter-grid"
      >
        <div>
          <SectionLabel dark>The dispatch · weekly</SectionLabel>
          <div
            className="ed-display-italic"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)",
              lineHeight: 1.1,
              marginTop: 12,
              color: "#f6efdc",
              letterSpacing: "-0.018em",
            }}
          >
            One dispatch a&nbsp;week. Sundays. Free.
          </div>
        </div>
        <div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 15.5,
              lineHeight: 1.6,
              color: "rgba(246,239,220,0.78)",
              margin: 0,
              maxWidth: "46ch",
            }}
          >
            We send the lead, the severity reading, and a single article worth
            your time. That&apos;s it. No upsells, no notifications, no daily
            push to open the app.
          </p>
          <form
            onSubmit={onSubmit}
            style={{
              marginTop: 22,
              display: "flex",
              gap: 10,
              maxWidth: 460,
              flexWrap: "wrap",
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@inbox.com"
              disabled={status === "loading" || status === "ok"}
              style={{
                flex: 1,
                minWidth: 200,
                background: "rgba(246,239,220,0.10)",
                border: "none",
                padding: "12px 16px",
                borderRadius: 10,
                color: "#f6efdc",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={status === "loading" || status === "ok"}
              style={{
                background: status === "ok" ? "var(--green)" : "var(--stamp)",
                color: "#f6efdc",
                border: "none",
                padding: "12px 22px",
                borderRadius: 10,
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.18em",
                cursor: status === "loading" ? "wait" : "pointer",
              }}
            >
              {status === "ok" ? "SUBSCRIBED ✓" : status === "loading" ? "…" : "SUBSCRIBE"}
            </button>
          </form>
          {status === "error" && error && (
            <p style={errorStyle}>{error}</p>
          )}
          {status === "ok" && (
            <p style={successStyle}>You&apos;re on the list. See you Sunday.</p>
          )}
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 12.5,
              color: "rgba(246,239,220,0.55)",
              marginTop: 14,
              marginBottom: 0,
            }}
          >
            Unsubscribe in one click. We don&apos;t share your email.
          </p>
        </div>
      </div>
      <style jsx>{`
        @media (min-width: 1024px) {
          .newsletter-grid {
            grid-template-columns: 5fr 7fr !important;
            gap: 56px !important;
          }
        }
      `}</style>
    </Card>
  );
}

const errorStyle: React.CSSProperties = {
  marginTop: 10,
  color: "#e0665e",
  fontSize: 12,
  fontFamily: "var(--font-sans)",
};

const successStyle: React.CSSProperties = {
  marginTop: 10,
  color: "#7cc095",
  fontSize: 12,
  fontFamily: "var(--font-sans)",
};
