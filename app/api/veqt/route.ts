import { NextResponse } from "next/server";
import { buildVeqtPayload } from "@/lib/data/payloads";

export const revalidate = 300; // 5 minutes — Yahoo is free, refresh frequently

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "1Y";

  const response = await buildVeqtPayload(period);

  return NextResponse.json(response, {
    headers: {
      // Dynamic route (reads ?period); s-maxage gives the CDN a per-period
      // cache so repeat hits don't re-run the Yahoo/AV fetch path.
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
