"use client";

import { useState, useEffect, useCallback } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  snippet: string;
  ogImageUrl: string;
  headline: string;
  heroValue: string;
}

function CopyButton({
  label,
  text,
  icon,
}: {
  label: string;
  text: string;
  icon: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex flex-col items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-4 hover:border-[var(--color-brand)]/40 hover:bg-[var(--color-brand)]/[0.03] transition-colors"
    >
      <span className="text-[var(--color-text-secondary)]">{icon}</span>
      <span className="text-sm font-medium text-[var(--color-text-primary)]">
        {copied ? "Copied!" : label}
      </span>
    </button>
  );
}

export default function ShareModal({
  isOpen,
  onClose,
  shareUrl,
  snippet,
  ogImageUrl,
  headline,
  heroValue,
}: ShareModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(snippet)}`;

  return (
    <div
      onClick={handleBackdrop}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-xl bg-white shadow-2xl transition-transform duration-200 ${
          visible ? "scale-100" : "scale-95"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Share Results
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-base)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Preview */}
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">{headline}</p>
          <p className="text-2xl font-extrabold text-[var(--color-positive)]">
            {heroValue}
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 p-5">
          <CopyButton
            label="Copy Link"
            text={shareUrl}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            }
          />

          <CopyButton
            label="Copy Text"
            text={snippet}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            }
          />

          <button
            onClick={() => window.open(tweetUrl, "_blank", "noopener")}
            className="flex flex-col items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-4 hover:border-[var(--color-brand)]/40 hover:bg-[var(--color-brand)]/[0.03] transition-colors"
          >
            <span className="text-[var(--color-text-secondary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </span>
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              Share to X
            </span>
          </button>

          <button
            onClick={() => window.open(ogImageUrl, "_blank")}
            className="flex flex-col items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-4 hover:border-[var(--color-brand)]/40 hover:bg-[var(--color-brand)]/[0.03] transition-colors"
          >
            <span className="text-[var(--color-text-secondary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </span>
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              Download Image
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
