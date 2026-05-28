import { NextResponse } from 'next/server';
import { getQuote } from '@/lib/data';
import { ALLOWED_SYMBOLS } from '@/lib/data/symbols';

export const revalidate = 300; // 5 minutes — Yahoo is free, refresh frequently

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get('symbol') || 'VEQT').toUpperCase();

  if (!ALLOWED_SYMBOLS.includes(symbol)) {
    return NextResponse.json(
      { error: 'Unsupported symbol' },
      { status: 400 }
    );
  }

  try {
    const quote = await getQuote(symbol);
    return NextResponse.json(quote, {
      headers: {
        // The route is dynamic (reads ?symbol), so route-level revalidate
        // doesn't full-route cache. s-maxage lets the CDN serve repeat hits
        // per-querystring without re-running the handler.
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Data temporarily unavailable', message: 'Please try again later' },
      { status: 503 }
    );
  }
}
