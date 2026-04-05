import { NextResponse } from 'next/server';
import { getMonthlyHistory } from '@/lib/data';
import { ALLOWED_SYMBOLS } from '@/lib/data/symbols';

export const revalidate = 604800; // 7 days

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
    const history = await getMonthlyHistory(symbol);
    if (!history.data.length) {
      return NextResponse.json(
        { error: 'No monthly data available' },
        { status: 503 }
      );
    }
    return NextResponse.json(history);
  } catch {
    return NextResponse.json(
      { error: 'Monthly data temporarily unavailable' },
      { status: 503 }
    );
  }
}
