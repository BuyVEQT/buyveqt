/**
 * Fetch a Google Font as an ArrayBuffer for use with `next/og` (Satori).
 *
 * Strategy:
 *   1. Hit the Google Fonts CSS API with a desktop User-Agent so we receive
 *      TrueType (.ttf) URLs in the CSS — Satori cannot decode woff2, which is
 *      what Google serves to modern browsers by default.
 *   2. Pull the first `src: url(...)` from the returned CSS and download it.
 *   3. Return the raw bytes; the caller passes them into `ImageResponse`'s
 *      `fonts` option.
 *
 * The full font is fetched (no `text=` subsetting) so the same buffer can be
 * reused across edge worker invocations regardless of the page title — Vercel
 * keeps the module-level promise alive between requests on the same worker.
 *
 * @param family — Google Fonts family, e.g. "Fraunces" or "Inter".
 * @param opts   — weight + italic. Defaults to weight 400, upright.
 */
export async function loadGoogleFont(
  family: string,
  opts: { weight?: number; italic?: boolean } = {}
): Promise<ArrayBuffer> {
  const weight = opts.weight ?? 400;
  const italic = opts.italic ?? false;

  const axis = italic ? `ital,wght@1,${weight}` : `wght@${weight}`;
  const cssUrl =
    `https://fonts.googleapis.com/css2` +
    `?family=${encodeURIComponent(family)}:${axis}` +
    `&display=swap`;

  const css = await fetch(cssUrl, {
    // Without a desktop UA, Google returns woff2 URLs that Satori cannot
    // decode. This UA string is the canonical one used by every next/og
    // tutorial in the wild and yields TrueType.
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  }).then((r) => {
    if (!r.ok) throw new Error(`[og] CSS fetch failed for ${family}: ${r.status}`);
    return r.text();
  });

  const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('(truetype|opentype)'\)/);
  if (!match) {
    throw new Error(`[og] No TrueType src found in CSS for ${family} ${weight}${italic ? "i" : ""}`);
  }

  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) {
    throw new Error(`[og] Font binary fetch failed for ${family}: ${fontRes.status}`);
  }
  return fontRes.arrayBuffer();
}

/**
 * Load the full broadsheet font set used by every OG image on the site.
 * Returns the array shape `ImageResponse({ fonts })` expects.
 *
 * Fonts:
 *   - Fraunces 700        → display headlines
 *   - Fraunces 400 italic → display italic accents (e.g. "vs.")
 *   - Inter    500        → eyebrow + small caps + footer
 *   - Inter    600        → wordmark
 */
export async function loadBroadsheetFonts() {
  const [frauncesBold, frauncesItalic, interMedium, interSemibold] = await Promise.all([
    loadGoogleFont("Fraunces", { weight: 700 }),
    loadGoogleFont("Fraunces", { weight: 400, italic: true }),
    loadGoogleFont("Inter", { weight: 500 }),
    loadGoogleFont("Inter", { weight: 600 }),
  ]);

  return [
    { name: "Fraunces", data: frauncesBold, style: "normal" as const, weight: 700 as const },
    { name: "Fraunces", data: frauncesItalic, style: "italic" as const, weight: 400 as const },
    { name: "Inter", data: interMedium, style: "normal" as const, weight: 500 as const },
    { name: "Inter", data: interSemibold, style: "normal" as const, weight: 600 as const },
  ];
}
