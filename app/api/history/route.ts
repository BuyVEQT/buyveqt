import { NextResponse } from 'next/server';
import { getDailyHistory } from '@/lib/data';
import { ALLOWED_SYMBOLS } from '@/lib/data/symbols';

export const revalidate = 86400; // 24 hours — historical data doesn't change retroactively

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get('symbol') || 'VEQT').toUpperCase();
  const outputsize = searchParams.get('outputsize') === 'full' ? 'full' : 'compact';

  if (!ALLOWED_SYMBOLS.includes(symbol)) {
    return NextResponse.json(
      { error: 'Unsupported symbol' },
      { status: 400 }
    );
  }

  try {
    const history = await getDailyHistory(symbol, outputsize);
    if (!history.data.length) {
      return NextResponse.json(
        { error: 'No historical data available' },
        { status: 503 }
      );
    }
    return NextResponse.json(history);
  } catch {
    return NextResponse.json(
      { error: 'Historical data temporarily unavailable' },
      { status: 503 }
    );
  }
}
