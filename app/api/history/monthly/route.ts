import { NextResponse } from 'next/server';
import { getMonthlyHistory } from '@/lib/data';

export const revalidate = 604800; // 7 days

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'VEQT';

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
