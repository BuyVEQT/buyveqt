export interface Distribution {
  exDate: string;
  payDate: string;
  amount: number;
  estimated?: boolean;
}

export interface DistributionData {
  ticker: string;
  frequency: string;
  distributions: Distribution[];
}

export const VEQT_DISTRIBUTIONS: DistributionData = {
  ticker: "VEQT.TO",
  frequency: "Annually",
  distributions: [
    { exDate: "2026-12-30", payDate: "2027-01-07", amount: 0.81, estimated: true },
    { exDate: "2025-12-30", payDate: "2026-01-07", amount: 0.76018 },
    { exDate: "2024-12-30", payDate: "2025-01-07", amount: 0.712997 },
    { exDate: "2023-12-28", payDate: "2024-01-08", amount: 0.692287 },
    { exDate: "2022-12-29", payDate: "2023-01-09", amount: 0.672491 },
    { exDate: "2021-12-30", payDate: "2022-01-10", amount: 0.514 },
    { exDate: "2020-12-30", payDate: "2021-01-08", amount: 0.4616 },
    { exDate: "2019-12-30", payDate: "2020-01-08", amount: 0.4038 },
  ],
};

/** Get trailing 12-month distribution total */
export function getTrailing12MonthDistributions(): number {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const now = new Date();
  return VEQT_DISTRIBUTIONS.distributions
    .filter((d) => !d.estimated && new Date(d.exDate) >= oneYearAgo && new Date(d.exDate) <= now)
    .reduce((sum, d) => sum + d.amount, 0);
}

/** Get number of years with confirmed distributions */
export function getDistributionYears(): number {
  const years = new Set(
    VEQT_DISTRIBUTIONS.distributions
      .filter((d) => !d.estimated)
      .map((d) => new Date(d.exDate).getFullYear())
  );
  return years.size;
}

/** Group distributions by year */
export function getDistributionsByYear(): Record<number, Distribution[]> {
  const grouped: Record<number, Distribution[]> = {};
  for (const d of VEQT_DISTRIBUTIONS.distributions) {
    const year = new Date(d.exDate).getFullYear();
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(d);
  }
  return grouped;
}
