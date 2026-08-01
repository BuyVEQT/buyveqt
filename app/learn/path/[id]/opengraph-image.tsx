import { renderInstrumentOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/instrument";
import { LEARN_PATHS } from "@/lib/learn-paths-data";

export const alt = "Learn Path — BuyVEQT";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const path = LEARN_PATHS.find((p) => p.id === id);

  if (!path) {
    return renderInstrumentOG({
      eyebrow: "LEARN PATH",
      titleLines: ["Curated", "reading paths."],
      dek: "Five-step itineraries through the BuyVEQT archive — pick the one that matches where you are.",
      chipLabel: `${LEARN_PATHS.length} PATHS`,
      chipMark: false,
      alt,
    });
  }

  return renderInstrumentOG({
    eyebrow: "LEARN PATH",
    title: path.title,
    dek: path.description,
    chipLabel: `${path.slugs.length} DISPATCHES`,
    chipMark: false,
    statLabel: path.question?.toUpperCase(),
    alt: `${path.title} — Learn Path · BuyVEQT`,
  });
}
