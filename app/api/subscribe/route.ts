import { NextResponse } from "next/server";

// Simple in-memory token bucket per IP. Lives within a single warm Vercel
// container; multiple containers can each grant the cap independently, but
// the same IP hitting one container repeatedly is still bounded — which is
// the spam shape we actually care about. For stronger guarantees we'd swap
// this for Upstash/Vercel KV; not warranted while signup volume is low.
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5; // 5 signups per IP per hour
const buckets = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    // Standard format: client, proxy1, proxy2, ... — the first entry is
    // the originating client. Trim whitespace because some proxies pad.
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

/**
 * Returns true if the request is allowed, false if it should be rate-limited.
 * Mutates the bucket map.
 */
function allow(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false;
  bucket.count += 1;
  return true;
}

/** Reap expired buckets occasionally so the map doesn't grow unbounded. */
let lastSweep = 0;
function maybeSweep(): void {
  const now = Date.now();
  if (now - lastSweep < 10 * 60 * 1000) return; // sweep at most every 10 min
  lastSweep = now;
  for (const [k, v] of buckets) {
    if (v.resetAt < now) buckets.delete(k);
  }
}

export async function POST(request: Request) {
  try {
    maybeSweep();

    const ip = clientIp(request);
    if (!allow(ip)) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)),
          },
        }
      );
    }

    const { email } = await request.json();

    if (!email || !email.includes("@") || email.length < 5) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const apiKey = process.env.BUTTONDOWN_API_KEY;
    if (!apiKey) {
      console.error("[Newsletter] BUTTONDOWN_API_KEY not configured");
      return NextResponse.json(
        { error: "Newsletter signup is temporarily unavailable" },
        { status: 503 }
      );
    }

    const response = await fetch(
      "https://api.buttondown.com/v1/subscribers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${apiKey}`,
        },
        body: JSON.stringify({
          email_address: email,
          type: "regular",
          tags: ["website"],
        }),
      }
    );

    if (response.status === 201) {
      return NextResponse.json({ success: true });
    }

    if (response.status === 409) {
      // Already subscribed — treat as success
      return NextResponse.json({ success: true });
    }

    const data = await response.json().catch(() => null);
    console.error("[Newsletter] Buttondown error:", response.status, data);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  } catch (error) {
    console.error("[Newsletter] Subscribe error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
