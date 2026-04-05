"use client";

import { useState, useCallback, useEffect } from "react";
import {
  historicalShareSnippet,
  dcaShareSnippet,
  dividendShareSnippet,
  tfsaRrspShareSnippet,
} from "@/lib/social-snippets";
import { buildShareUrl } from "@/lib/share-params";

// ─── Types ────────────────────────────────────────────────────

type Tab = "historical" | "dca" | "dividends" | "tfsa-rrsp";

export interface ShareModalProps {
  tab: Tab;
  params: Record<string, string | number>;
  isOpen: boolean;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function fmtDlr(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function fmtDate(yyyymm: string): string {
  const [y, m] = yyyymm.split("-");
  const mi = parseInt(m, 10);
  if (!y || isNaN(mi) || mi < 1 || mi > 12) return yyyymm;
  return `${MONTHS[mi - 1]} ${y}`;
}

function buildUrl(tab: Tab, params: Record<string, string | number>): string {
  return buildShareUrl(tab, params);
}

function buildOgUrl(tab: Tab, params: Record<string, string | number>): string {
  const sp = new URLSearchParams();
  sp.set("tab", tab);
  for (const [k, v] of Object.entries(params)) {
    sp.set(k, String(v));
  }
  return `/api/og/invest?${sp.toString()}`;
}

function getPreview(tab: Tab, params: Record<string, string | number>) {
  const g = (k: string) => params[k];
  const n = (k: string) => Number(g(k)) || 0;

  switch (tab) {
    case "historical": {
      const mode = String(g("mode") || "lump");
      const headline =
        mode === "dca"
          ? `${fmtDlr(n("amount"))}/mo in VEQT since ${fmtDate(String(g("start") || ""))}`
          : `${fmtDlr(n("amount"))} in VEQT since ${fmtDate(String(g("start") || ""))}`;
      return { headline, hero: fmtDlr(n("result")) };
    }
    case "dca":
      return {
        headline: `${fmtDlr(n("monthly"))}/mo in VEQT for ${g("horizon")} years`,
        hero: fmtDlr(n("result")),
      };
    case "dividends":
      return {
        headline: `${fmtDlr(n("portfolio"))} VEQT portfolio`,
        hero: `${fmtDlr(n("annualIncome"))}/year`,
      };
    case "tfsa-rrsp":
      return {
        headline: `My ${String(g("account") || "TFSA").toUpperCase()} with VEQT`,
        hero: fmtDlr(n("result")),
      };
  }
}

function getSnippet(tab: Tab, params: Record<string, string | number>, url: string): string {
  const n = (k: string) => Number(params[k]) || 0;
  const s = (k: string) => String(params[k] || "");

  switch (tab) {
    case "historical":
      return historicalShareSnippet({
        mode: s("mode") as "lump" | "dca",
        amount: n("amount"),
        start: s("start"),
        result: n("result"),
        returnPct: n("returnPct"),
        contributed: n("contributed"),
        url,
      });
    case "dca":
      return dcaShareSnippet({
        monthly: n("monthly"),
        horizon: n("horizon"),
        rate: n("rate"),
        result: n("result"),
        url,
      });
    case "dividends":
      return dividendShareSnippet({
        portfolio: n("portfolio"),
        annualIncome: n("annualIncome"),
        yieldRate: n("yield"),
        url,
      });
    case "tfsa-rrsp":
      return tfsaRrspShareSnippet({
        account: s("account") as "tfsa" | "rrsp",
        result: n("result"),
        horizon: n("horizon"),
        url,
      });
  }
}

// ─── Icons (inline SVG to avoid dependencies) ────────────────

function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────

export default function ShareModal({ tab, params, isOpen, onClose }: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Reset copied state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCopiedLink(false);
      setCopiedText(false);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const url = buildUrl(tab, params);
  const snippet = getSnippet(tab, params, url);
  const preview = getPreview(tab, params);

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, [url]);

  const copyText = useCallback(async () => {
    await navigator.clipboard.writeText(snippet);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  }, [snippet]);

  const shareToX = useCallback(() => {
    // X needs the URL as a separate param to unfurl the OG card preview
    // Strip the trailing URL from the snippet text since it'll be appended via &url=
    const textWithoutUrl = snippet.replace(/\s*→\s*https?:\/\/\S+$/, "");
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textWithoutUrl)}&url=${encodeURIComponent(url)}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer");
  }, [snippet, url]);

  const downloadImage = useCallback(async () => {
    setDownloading(true);
    try {
      const res = await fetch(buildOgUrl(tab, params));
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `veqt-${tab}-results.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } finally {
      setDownloading(false);
    }
  }, [tab, params]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Modal */}
      <div
        className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-base)] transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="text-lg font-serif font-medium text-[var(--color-text-primary)] mb-4">
          Share Results
        </h2>

        {/* Preview card — matches OG card branding */}
        <div className="rounded-lg bg-[#c8102e] p-4 mb-5 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-[#a50d26]" />
          <p className="text-xs text-white/70 uppercase tracking-wider mb-1">
            {preview.headline}
          </p>
          <p className="text-2xl font-extrabold text-white tabular-nums">
            {preview.hero}
          </p>
          <div className="flex justify-end mt-2 relative">
            <span className="text-sm font-bold text-white">
              BuyVEQT
            </span>
          </div>
        </div>

        {/* Action buttons - 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-base)] transition-colors"
          >
            <LinkIcon />
            {copiedLink ? "Copied!" : "Copy Link"}
          </button>

          <button
            onClick={copyText}
            className="flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-base)] transition-colors"
          >
            <ClipboardIcon />
            {copiedText ? "Copied!" : "Copy Text"}
          </button>

          <button
            onClick={shareToX}
            className="flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-base)] transition-colors"
          >
            <XIcon />
            Share to X
          </button>

          <button
            onClick={downloadImage}
            disabled={downloading}
            className="flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-base)] transition-colors disabled:opacity-50"
          >
            <DownloadIcon />
            {downloading ? "Saving..." : "Download"}
          </button>
        </div>
      </div>
    </div>
  );
}
