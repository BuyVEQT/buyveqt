import { permanentRedirect } from "next/navigation";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Legacy URL — the page lives at /calculators now. Preserve query strings
// so existing shared calculator links (?tab=historical&amount=...) still
// land on the same result.
export default async function InvestRedirect({ searchParams }: Props) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") qs.set(k, v);
    else if (Array.isArray(v)) for (const vv of v) qs.append(k, vv);
  }
  const q = qs.toString();
  permanentRedirect(q ? `/calculators?${q}` : "/calculators");
}
