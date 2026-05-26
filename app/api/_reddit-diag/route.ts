import { NextResponse } from 'next/server';

/**
 * TEMP DIAGNOSTIC — remove once we have a clean signal.
 *
 * Reproduces, in the same Node serverless runtime the page uses,
 * three fetches against the Cloudflare Worker proxy at
 * `reddit-api.buyveqt.ca`. Returns per-endpoint status, headers,
 * body length, durations, and any caught error so we can see what
 * Vercel's serverless environment actually sees — vs. the Edge
 * runtime at `/api/reddit`, which has always worked.
 *
 * Hit: https://buyveqt.ca/api/_reddit-diag
 */

// Force Node runtime to mirror the page's data-fetch environment.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PROXY_BASE = 'https://reddit-api.buyveqt.ca';
const TIMEOUT = 8000;
const HEADERS = {
  'User-Agent': 'buyveqt-web/1.0 (+https://buyveqt.ca)',
  Accept: 'application/json',
};

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
}

async function probe(url: string): Promise<Probe> {
  const start = Date.now();
  const result: Probe = { url, ok: false };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: HEADERS,
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
  const results = await Promise.all([
    probe(`${PROXY_BASE}/about`),
    probe(`${PROXY_BASE}/hot?limit=12`),
    probe(`${PROXY_BASE}/top?limit=12&t=all`),
  ]);

  return NextResponse.json({
    runtime: 'nodejs',
    region: process.env.VERCEL_REGION ?? 'unknown',
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    probes: results,
  });
}
