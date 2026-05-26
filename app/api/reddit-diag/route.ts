import { NextResponse } from 'next/server';

/**
 * TEMP DIAGNOSTIC (Node runtime) — remove once we have a clean
 * signal. Probes the Cloudflare Worker proxy from Vercel's Node
 * serverless environment so we can see what the page-side data
 * fetcher actually sees. Pair with `/api/reddit-diag-edge` for the
 * Edge-runtime equivalent.
 *
 * Hit: https://buyveqt.ca/api/reddit-diag
 */

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
  bodyPreview?: string;
  childCount?: number;
  firstScore?: number;
  subscribers?: number;
  durationMs?: number;
  error?: string;
  cfRay?: string | null;
  cacheStatus?: string | null;
  server?: string | null;
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
    result.server = res.headers.get('server');
    result.ok = res.ok;

    const text = await res.text();
    result.bodyLength = text.length;
    // First 200 chars so we can see if it's HTML (block page), JSON
    // (success), or empty.
    result.bodyPreview = text.slice(0, 200);

    if (res.ok) {
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
  // Probe our proxy AND direct Reddit URLs to triangulate where the
  // failure is: proxy unreachable, Reddit unreachable, or both?
  const results = await Promise.all([
    probe(`${PROXY_BASE}/about`),
    probe(`${PROXY_BASE}/hot?limit=5`),
    probe(`${PROXY_BASE}/top?limit=5&t=all`),
    probe(`https://www.reddit.com/r/JustBuyVEQT/about.json`),
    probe(`https://old.reddit.com/r/JustBuyVEQT/about.json`),
  ]);

  return NextResponse.json({
    runtime: 'nodejs',
    region: process.env.VERCEL_REGION ?? 'unknown',
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    probes: results,
  });
}
