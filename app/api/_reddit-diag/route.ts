import { NextResponse } from 'next/server';

/**
 * TEMP DIAGNOSTIC — remove before final merge.
 *
 * Reproduces exactly what `lib/data/reddit.ts` does at page-render
 * time: a Node-runtime fetch against the Cloudflare Worker proxy.
 * Returns per-endpoint status, headers, body length, and any error
 * so we can see what Vercel's serverless environment actually sees
 * for `/about` (which works) vs `/hot` and `/top` (which silently
 * fall back to RSS in production).
 *
 * Hit: https://buyveqt.ca/api/_reddit-diag
 */

// Force Node runtime to mirror the page's data-fetch environment.
// The Edge route at /api/reddit works fine, so the discrepancy
// must be Node-specific.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PROXY_BASE = 'https://reddit-api.buyveqt.ca';
const TIMEOUT = 8000;

interface Probe {
  url: string;
  ok: boolean;
  status?: number;
  contentType?: string | null;
  bodyLength?: number;
  childCount?: number;
  firstScore?: number;
  subscribers?: number;
  durationMs?: number;
  error?: string;
  cfRay?: string | null;
  cacheStatus?: string | null;
  // Vercel-specific signal — server.runtime is a stable string Next sets.
  // We log this once at the top level.
}

async function probe(url: string, redditCacheMode: RequestInit['cache']): Promise<Probe> {
  const start = Date.now();
  const result: Probe = { url, ok: false };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: redditCacheMode,
    });
    clearTimeout(timeout);
    result.status = res.status;
    result.contentType = res.headers.get('content-type');
    result.cfRay = res.headers.get('cf-ray');
    result.cacheStatus = res.headers.get('cf-cache-status');
    result.ok = res.ok;

    if (res.ok) {
      const text = await res.text();
      result.bodyLength = text.length;
      try {
        const json = JSON.parse(text);
        const data = json?.data;
        if (data?.children) {
          result.childCount = data.children.length;
          result.firstScore = data.children[0]?.data?.score;
        }
        if (typeof data?.subscribers === 'number') {
          result.subscribers = data.subscribers;
        }
      } catch (parseErr) {
        result.error = 'JSON parse: ' + (parseErr as Error).message;
      }
    } else {
      result.error = `HTTP ${res.status}`;
    }
  } catch (err) {
    clearTimeout(timeout);
    result.error = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  }

  result.durationMs = Date.now() - start;
  return result;
}

export async function GET() {
  // Run the same three calls the page would, with the same cache modes
  // we'd use server-side. We probe each in three flavours:
  //   - no-store: bypass Next's data cache entirely (request hits CF)
  //   - default: whatever Next decides given the absence of next.revalidate
  // The page itself uses next: { revalidate: 600|1800 }, but we want to
  // see the raw network behaviour first.
  const results = await Promise.all([
    probe(`${PROXY_BASE}/about`, 'no-store'),
    probe(`${PROXY_BASE}/hot?limit=12`, 'no-store'),
    probe(`${PROXY_BASE}/top?limit=12&t=all`, 'no-store'),
  ]);

  return NextResponse.json({
    runtime: 'nodejs',
    region: process.env.VERCEL_REGION ?? 'unknown',
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    probes: results,
  });
}
