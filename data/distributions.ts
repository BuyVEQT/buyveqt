export interface Distribution {
  exDate: string;
  payDate: string;
  amount: number;
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
    { exDate: "2024-12-27", payDate: "2025-01-06", amount: 1.5206 },
    { exDate: "2023-12-27", payDate: "2024-01-05", amount: 1.4823 },
    { exDate: "2022-12-28", payDate: "2023-01-06", amount: 1.4248 },
    { exDate: "2021-12-29", payDate: "2022-01-07", amount: 0.9605 },
    { exDate: "2020-12-29", payDate: "2021-01-07", amount: 0.5765 },
    { exDate: "2019-12-30", payDate: "2020-01-08", amount: 0.2980 },
  ],
};

/** Get trailing 12-month distribution total */
export function getTrailing12MonthDistributions(): number {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return VEQT_DISTRIBUTIONS.distributions
    .filter((d) => new Date(d.exDate) >= oneYearAgo)
    .reduce((sum, d) => sum + d.amount, 0);
}

/** Get number of years with distributions */
export function getDistributionYears(): number {
  const years = new Set(
    VEQT_DISTRIBUTIONS.distributions.map((d) => new Date(d.exDate).getFullYear())
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
