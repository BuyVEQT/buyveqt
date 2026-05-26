import { NextResponse } from 'next/server';

/**
 * TEMP DIAGNOSTIC (Edge runtime) — pair to `/api/reddit-diag`.
 * Probes the same endpoints from the Edge runtime so we can compare
 * what Edge sees vs. what Node serverless sees.
 *
 * Hit: https://buyveqt.ca/api/reddit-diag-edge
 */

export const runtime = 'edge';
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
  const results = await Promise.all([
    probe(`${PROXY_BASE}/about`),
    probe(`${PROXY_BASE}/hot?limit=5`),
    probe(`${PROXY_BASE}/top?limit=5&t=all`),
    probe(`https://www.reddit.com/r/JustBuyVEQT/about.json`),
    probe(`https://old.reddit.com/r/JustBuyVEQT/about.json`),
  ]);

  return NextResponse.json({
    runtime: 'edge',
    timestamp: new Date().toISOString(),
    probes: results,
  });
}
