import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SleeveDossierClient from "@/components/inside/dossier/SleeveDossierClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";
import { getSleeveMeta, SLEEVES } from "@/data/sleeves";
import { FUNDS } from "@/data/funds";

/** The four dossiers are a closed set — pre-render them all. */
export function generateStaticParams() {
  return SLEEVES.map((s) => ({ sleeve: s.ticker.toLowerCase() }));
}

export const dynamicParams = false;

const SLEEVE_NAME: Record<string, string> = Object.fromEntries(
  (FUNDS["VEQT.TO"]?.underlyingETFs ?? []).map((e) => [e.ticker, e.name])
);

/** Readable-case sleeve labels for titles (roomLabel is caps by design). */
const TITLE_LABEL: Record<string, string> = {
  VUN: "US Total Market",
  VCN: "Canada",
  VIU: "International Developed",
  VEE: "Emerging Markets",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sleeve: string }>;
}): Promise<Metadata> {
  const { sleeve } = await params;
  const meta = getSleeveMeta(sleeve);
  if (!meta) return {};

  const ticker = meta.ticker;
  const name = SLEEVE_NAME[ticker] ?? meta.roomLabel;
  const title = `${ticker} inside VEQT — the ${TITLE_LABEL[ticker] ?? meta.roomLabel} sleeve`;
  const description = `${name}: ${meta.roleDek} Year-by-year returns, the full book, and every session since 2019.`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(`/inside-veqt/${sleeve}`) },
    openGraph: {
      title,
      description,
      url: canonicalUrl(`/inside-veqt/${sleeve}`),
    },
  };
}

export default async function SleevePage({
  params,
}: {
  params: Promise<{ sleeve: string }>;
}) {
  const { sleeve } = await params;
  const meta = getSleeveMeta(sleeve);
  if (!meta) notFound();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Inside VEQT", path: "/inside-veqt" },
          { name: meta.ticker, path: `/inside-veqt/${sleeve}` },
        ])}
      />
      <SleeveDossierClient ticker={meta.ticker} />
    </>
  );
}
