import { VEQT_DISTRIBUTIONS } from "@/data/distributions";

export interface NextDistributionEstimate {
  estimatedMonth: string;
  estimatedWindow: string;
  confidence: "high" | "medium";
  lastConfirmed: {
    date: string;
    amount: number;
  };
  trailingAnnualAmount: number;
  trailingAnnualYield: number | null; // null if no price available
  averageAmount: number;
  growthTrend: number | null; // YoY growth percentage
}

export function getNextDistributionEstimate(
  currentPrice?: number
): NextDistributionEstimate {
  const confirmed = VEQT_DISTRIBUTIONS.distributions.filter(
    (d) => !d.estimated
  );

  const latest = confirmed[0];
  const latestDate = new Date(latest.exDate);
  const latestYear = latestDate.getFullYear();

  // VEQT pays annually in late December — next is ~Dec of next year
  const nextYear = latestYear + 1;
  const now = new Date();
  const estimatedMonth = `December ${nextYear}`;
  const estimatedWindow = `Late December ${nextYear}`;

  // If we're past the estimated date already, it should be next year
  const confidence: "high" | "medium" =
    now.getFullYear() === nextYear ? "high" : "medium";

  // Trailing annual amount = most recent confirmed distribution
  const trailingAnnualAmount = latest.amount;

  // Calculate yield
  const trailingAnnualYield =
    currentPrice && currentPrice > 0
      ? (trailingAnnualAmount / currentPrice) * 100
      : null;

  // Average of last 3 confirmed distributions
  const recentThree = confirmed.slice(0, 3);
  const averageAmount =
    recentThree.reduce((sum, d) => sum + d.amount, 0) / recentThree.length;

  // YoY growth trend
  let growthTrend: number | null = null;
  if (confirmed.length >= 2) {
    const prev = confirmed[1].amount;
    if (prev > 0) {
      growthTrend = ((latest.amount - prev) / prev) * 100;
    }
  }

  return {
    estimatedMonth,
    estimatedWindow,
    confidence,
    lastConfirmed: {
      date: latest.exDate,
      amount: latest.amount,
    },
    trailingAnnualAmount,
    trailingAnnualYield,
    averageAmount,
    growthTrend,
  };
}
