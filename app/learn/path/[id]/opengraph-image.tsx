import { renderBroadsheetOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/broadsheet";
import { LEARN_PATHS } from "@/lib/learn-paths-data";

// Edge-safe: LEARN_PATHS is a pure static array with no fs imports.
export const runtime = "edge";
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
    return renderBroadsheetOG({
      eyebrow: "Learn Path",
      title: "Curated reading paths.",
      italic: true,
      dek: "Five-step itineraries through the BuyVEQT archive — pick the one that matches where you are.",
      alt,
    });
  }

  return renderBroadsheetOG({
    eyebrow: "Learn Path",
    title: path.title.replace(/^I'm /, "I'm "),
    italic: true,
    dek: path.description,
    footerNote: `${path.slugs.length} dispatches`,
    alt: `${path.title} — Learn Path · BuyVEQT`,
  });
}
