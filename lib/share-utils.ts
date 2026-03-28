const SITE_URL = "https://www.buyveqt.com";

/** Format a number as $XX,XXX (commas, no cents) */
export function formatShareDollars(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/** Convert "2019-01-29" or "2019-01" → "Jan 2019" */
export function formatShareDate(dateStr: string): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const parts = dateStr.split("-");
  const monthIdx = parseInt(parts[1], 10) - 1;
  return `${months[monthIdx] ?? "Jan"} ${parts[0]}`;
}

export interface ShareParams {
  tab: string;
  [key: string]: string;
}

/** Build a full share URL with input + result params */
export function buildShareUrl(params: ShareParams): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, v);
  }
  return `${SITE_URL}/invest?${sp.toString()}`;
}

/** Build the OG image URL (relative, for meta tags) */
export function buildOgImageUrl(params: ShareParams): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, v);
  }
  return `/api/og/invest?${sp.toString()}`;
}

/** Generate personalized OG title based on tab and params */
export function buildShareTitle(params: ShareParams): string {
  const tab = params.tab;

  if (tab === "historical") {
    const amount = formatShareDollars(Number(params.amount) || 0);
    const date = formatShareDate(params.start || "2019-01");
    const result = formatShareDollars(Number(params.r_value) || 0);
    if (params.mode === "dca") {
      return `${amount}/mo into VEQT since ${date} → ${result} today`;
    }
    return `${amount} in VEQT since ${date} → ${result} today`;
  }

  if (tab === "dca") {
    const monthly = formatShareDollars(Number(params.monthly) || 0);
    const years = params.years || "20";
    const result = formatShareDollars(Number(params.r_value) || 0);
    return `${monthly}/mo into VEQT for ${years} years → ${result}`;
  }

  if (tab === "dividends") {
    const portfolio = formatShareDollars(Number(params.portfolio) || 0);
    const annual = formatShareDollars(Number(params.r_annual) || 0);
    return `${portfolio} VEQT portfolio → ${annual}/year in dividends`;
  }

  if (tab === "tfsa-rrsp") {
    const account = params.account === "RRSP" ? "RRSP" : "TFSA";
    const result = formatShareDollars(Number(params.r_value) || 0);
    const years = params.horizon || "25";
    return `My ${account} with VEQT → ${result} in ${years} years`;
  }

  return "VEQT Investment Calculators";
}

/** Generate personalized OG description based on tab and params */
export function buildShareDescription(params: ShareParams): string {
  const tab = params.tab;

  if (tab === "historical") {
    const contributed = formatShareDollars(Number(params.r_contributed) || 0);
    const pct = params.r_pct || "0";
    return `${contributed} contributed · ${Number(pct) >= 0 ? "+" : ""}${pct}% total return`;
  }

  if (tab === "dca") {
    const contributed = formatShareDollars(Number(params.r_contributed) || 0);
    const growth = formatShareDollars(Number(params.r_growth) || 0);
    const rate = params.rate || "8";
    return `${contributed} contributions · ${growth} growth · ${rate}% return assumed`;
  }

  if (tab === "dividends") {
    const quarterly = formatShareDollars(Number(params.r_quarterly) || 0);
    const yld = params.yield || "1.8";
    const growth = params.growth || "8";
    return `${quarterly}/quarter · ${yld}% yield · ${growth}% annual growth assumed`;
  }

  if (tab === "tfsa-rrsp") {
    const starting = formatShareDollars(Number(params.starting) || 0);
    const annual = formatShareDollars(Number(params.annual) || 0);
    const years = params.horizon || "25";
    const rate = params.return || "8";
    return `${starting} starting · ${annual}/year · ${years} years · ${rate}% return assumed`;
  }

  return "Free VEQT calculators: historical returns, DCA, dividends, and TFSA/RRSP growth.";
}
