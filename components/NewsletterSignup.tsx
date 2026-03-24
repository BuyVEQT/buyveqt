"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";

interface NewsletterSignupProps {
  variant: "inline" | "section";
  className?: string;
}

export default function NewsletterSignup({
  variant,
  className,
}: NewsletterSignupProps) {
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
        track("newsletter_signup", { source: variant });
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Could not connect. Please try again.");
    }
  }

  if (variant === "inline") {
    return (
      <div className={className}>
        {status === "success" ? (
          <p className="text-sm text-[var(--color-positive)] font-medium">
            You&apos;re on the list &check;
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 min-w-0 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:border-[var(--color-brand)]"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="shrink-0 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-brand-dark)] transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "..." : "Notify Me"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="text-xs text-[var(--color-negative)] mt-1">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  // variant === "section"
  return (
    <div
      className={`rounded-xl bg-[var(--color-base)] border border-[var(--color-border)] p-6 sm:p-8 ${className ?? ""}`}
    >
      {status === "success" ? (
        <div className="text-center py-4">
          <p className="text-lg font-semibold text-[var(--color-text-primary)]">
            Thanks! We&apos;ll be in touch when the newsletter launches.
          </p>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
            Stay in the Loop
          </h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)] leading-relaxed max-w-lg">
            We&apos;re building a newsletter for VEQT investors — market
            recaps, new articles, and distribution alerts. No spam, no financial
            advice, just useful updates. Leave your email and we&apos;ll let
            you know when it&apos;s ready.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mt-4 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:border-[var(--color-brand)]"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="shrink-0 rounded-lg bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-dark)] transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "Signing up..." : "Notify Me"}
            </button>
          </form>
          {status === "error" && (
            <p className="text-xs text-[var(--color-negative)] mt-2">
              {errorMessage}
            </p>
          )}
          <p className="text-[11px] text-[var(--color-text-muted)] mt-3">
            No spam. Unsubscribe anytime. Powered by Buttondown.
          </p>
        </>
      )}
    </div>
  );
}
