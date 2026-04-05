import { NextResponse } from 'next/server';
import { getDailyHistory } from '@/lib/data';

export const revalidate = 86400; // 24 hours — historical data doesn't change retroactively

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'VEQT';
  const outputsize = searchParams.get('outputsize') === 'full' ? 'full' : 'compact';

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
