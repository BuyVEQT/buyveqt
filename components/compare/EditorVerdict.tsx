"use client";

import { getVerdict } from "@/lib/compare-verdicts";
import { HOUSE_TICKER } from "./bouts";

const css = `
.ins-cmp-editor {
  border-top: 1px solid var(--ins-ink, #111111);
  padding-top: 18px;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 40px;
  font-family: var(--ins-font);
  color: var(--ins-ink, #111111);
}
.ins-cmp-editor__rail {
  border-right: 1px solid var(--ins-hair);
  padding-right: 28px;
}
.ins-cmp-editor__label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-signal);
}
.ins-cmp-editor__meta {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--ins-hair);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.ins-cmp-editor__body {
  margin: 0;
  font-size: 19px;
  font-weight: 600;
  line-height: 1.5;
  max-width: 60ch;
  text-wrap: pretty;
}
.ins-cmp-editor__rec-label {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid var(--ins-hair);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.ins-cmp-editor__rec {
  margin: 8px 0 0;
  font-size: 14.5px;
  font-weight: 500;
  line-height: 1.55;
  color: var(--ins-gray-700);
  max-width: 66ch;
  text-wrap: pretty;
}

@media (max-width: 900px) {
  .ins-cmp-editor {
    grid-template-columns: 1fr;
    gap: 14px;
    padding-top: 14px;
  }
  .ins-cmp-editor__rail {
    border-right: none;
    padding-right: 0;
  }
  .ins-cmp-editor__meta {
    margin-top: 8px;
    padding-top: 8px;
  }
}

@media (max-width: 640px) {
  .ins-cmp-editor__meta { display: none; }
  .ins-cmp-editor__body { font-size: 14px; line-height: 1.55; }
  .ins-cmp-editor__rec { font-size: 12.5px; }
  .ins-cmp-editor__rec-label { margin-top: 14px; padding-top: 10px; }
}
`;

/**
 * From the editor (artboard 6b) — the module's single red label, a left
 * rule column carrying the review cadence, and the curated verdict for
 * the selected bout.
 *
 * Copy is lifted verbatim from `lib/compare-verdicts.ts`: `summary` as
 * the display paragraph, `recommendation` beneath a hairline. Nothing is
 * generated here — an uncurated pair renders nothing rather than an
 * opinion we haven't earned.
 */
export default function EditorVerdict({ contender }: { contender: string }) {
  const verdict = getVerdict(HOUSE_TICKER, contender);
  if (!verdict) return null;

  return (
    <section className="ins-cmp-editor" aria-label="From the editor">
      <div className="ins-cmp-editor__rail">
        <div className="ins-cmp-editor__label">From the editor</div>
        <div className="ins-cmp-editor__meta">
          &mdash; Verdict reviewed quarterly
        </div>
      </div>
      <div>
        <p className="ins-cmp-editor__body">{verdict.summary}</p>
        <div className="ins-cmp-editor__rec-label">
          &mdash; The recommendation
        </div>
        <p className="ins-cmp-editor__rec">{verdict.recommendation}</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
