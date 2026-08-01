import type { ArticleFrontmatter } from "@/lib/articles";

const css = `
.ahdr {
  border-top: 3px solid var(--ins-rule-strong);
  padding-top: 14px;
  font-family: var(--ins-font);
  color: var(--ins-ink);
}
.ahdr__title {
  margin: 0;
  max-width: 22ch;
  font-size: clamp(30px, 5.4vw, 56px);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1.02;
  text-wrap: pretty;
}
.ahdr__byline {
  margin: 16px 0 0;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.ahdr__take {
  color: var(--ins-signal);
  font-weight: 700;
}
.ahdr__standfirst {
  margin: 18px 0 0;
  max-width: 62ch;
  font-size: 17px;
  font-weight: 500;
  line-height: 1.55;
  color: var(--ins-gray-700);
  text-wrap: pretty;
}

@media (max-width: 640px) {
  .ahdr {
    padding-top: 12px;
  }
  .ahdr__title {
    max-width: none;
    letter-spacing: -0.03em;
  }
  .ahdr__byline {
    margin-top: 12px;
    font-size: 10px;
    letter-spacing: 0.12em;
  }
  .ahdr__standfirst {
    margin-top: 14px;
    font-size: 15px;
  }
}
`;

interface ArticleHeaderProps {
  frontmatter: ArticleFrontmatter;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * The standard dispatch head — every article except the flagship, which
 * swaps in <TaleOfTheTape>.
 *
 * Deliberately spare: the 3px ink rule that opens every Instrument section,
 * the display title, a byline micro-row, and the standfirst. Category,
 * dispatch number and reading progress all live in the <ArticleMeta> strip
 * directly under the masthead, so nothing is stated twice.
 */
export default function ArticleHeader({ frontmatter }: ArticleHeaderProps) {
  const updated = formatDate(
    frontmatter.updatedDate ?? frontmatter.lastUpdated
  );
  const standfirst = frontmatter.excerpt || frontmatter.description;

  return (
    <header className="ahdr">
      <h1 className="ahdr__title">{frontmatter.title}</h1>
      <p className="ahdr__byline">
        By BuyVEQT · Updated {updated}
        {frontmatter.isEditorial && (
          <>
            {" · "}
            <span className="ahdr__take">Our take</span>
          </>
        )}
        {frontmatter.difficulty && frontmatter.difficulty !== "beginner" && (
          <> · {frontmatter.difficulty}</>
        )}{" "}
        · {frontmatter.readingTime}
      </p>
      {standfirst && <p className="ahdr__standfirst">{standfirst}</p>}
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </header>
  );
}
