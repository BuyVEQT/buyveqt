import HomeClient from "@/components/home/HomeClient";
import Letters, { type RedditPayload } from "@/components/broadsheet/Letters";
import { headers } from "next/headers";

export const revalidate = 300; // 5 minutes — keep first paint fresh-ish

/**
 * Pre-fetch the subreddit feed at request time so the headlines are baked
 * into the HTML response. The Letters component still runs its own
 * background refresh on hydration, so live edits show up without a reload.
 *
 * If the Reddit fetch fails (rate-limit, edge cold start, etc.) we hand
 * Letters a `null` initial payload and it falls back to its own client
 * fetch + skeleton — no harder than the old behaviour.
 */
async function fetchInitialReddit(): Promise<RedditPayload | null> {
  try {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host =
      h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const res = await fetch(`${proto}://${host}/api/reddit`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as RedditPayload;
  } catch {
    return null;
  }
}

export default async function Home() {
  const initialReddit = await fetchInitialReddit();
  return (
    <HomeClient
      lettersSlot={<Letters initialPayload={initialReddit} />}
    />
  );
}
