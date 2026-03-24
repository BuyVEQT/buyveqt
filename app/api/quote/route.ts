import { NextResponse } from 'next/server';
import { getQuote } from '@/lib/data';

export const revalidate = 900; // 15 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'VEQT';

  try {
    const quote = await getQuote(symbol);
    return NextResponse.json(quote);
  } catch {
    return NextResponse.json(
      { error: 'Data temporarily unavailable', message: 'Please try again later' },
      { status: 503 }
    );
  }
}
