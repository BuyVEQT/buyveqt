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
  frequency: "Quarterly",
  distributions: [
    { exDate: "2025-03-26", payDate: "2025-04-02", amount: 0.271 },
    { exDate: "2024-12-27", payDate: "2025-01-06", amount: 0.5598 },
    { exDate: "2024-09-25", payDate: "2024-10-02", amount: 0.3254 },
    { exDate: "2024-06-26", payDate: "2024-07-03", amount: 0.314 },
    { exDate: "2024-03-22", payDate: "2024-04-02", amount: 0.3214 },
    { exDate: "2023-12-27", payDate: "2024-01-05", amount: 0.5765 },
    { exDate: "2023-09-27", payDate: "2023-10-04", amount: 0.2965 },
    { exDate: "2023-06-28", payDate: "2023-07-06", amount: 0.305 },
    { exDate: "2023-03-29", payDate: "2023-04-05", amount: 0.3043 },
    { exDate: "2022-12-28", payDate: "2023-01-06", amount: 0.6021 },
    { exDate: "2022-09-28", payDate: "2022-10-05", amount: 0.2851 },
    { exDate: "2022-06-28", payDate: "2022-07-06", amount: 0.3102 },
    { exDate: "2022-03-29", payDate: "2022-04-06", amount: 0.2274 },
    { exDate: "2021-12-29", payDate: "2022-01-07", amount: 0.498 },
    { exDate: "2021-09-28", payDate: "2021-10-06", amount: 0.2102 },
    { exDate: "2021-06-28", payDate: "2021-07-06", amount: 0.2523 },
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
