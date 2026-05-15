import Link from "next/link";
import type { EditionRecommendation } from "@/lib/edition-recommends";

interface EditionRecommendsProps {
  recommendation: EditionRecommendation;
}

export default function EditionRecommends({
  recommendation,
}: EditionRecommendsProps) {
  return (
    <aside className="bs-rec-board">
      <span className="bs-stamp bs-rec-board__head">
        Editor&rsquo;s take
        <span className="bs-rec-board__zone">{recommendation.zoneLabel}</span>
      </span>
      <h3 className="bs-rec-board__verdict">{recommendation.verdict}</h3>
      <Link href={recommendation.href} className="bs-rec-board__read">
        Read &rarr; {recommendation.linkLabel}
      </Link>
    </aside>
  );
}
