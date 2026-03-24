import { NextResponse } from 'next/server';
import { getMonthlyHistory } from '@/lib/data';

export const revalidate = 604800; // 7 days

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'VEQT';

  try {
    const history = await getMonthlyHistory(symbol);
    return NextResponse.json(history);
  } catch {
    return NextResponse.json(
      { error: 'Monthly data temporarily unavailable' },
      { status: 503 }
    );
  }
}
