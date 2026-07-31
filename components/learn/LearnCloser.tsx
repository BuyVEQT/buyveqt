import Link from "next/link";
import { capitalize, numberWord } from "./learn-syllabus";

const css = `
.lrn-closer {
  border-top: 1px solid var(--ins-ink);
  padding: 40px 0 0;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: end;
  font-family: var(--ins-font);
  color: var(--ins-ink);
}
.lrn-closer__display {
  margin: 0;
  font-size: 44px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.lrn-closer__sub {
  margin: 12px 0 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--ins-gray-600);
}
.lrn-closer__link {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-signal);
  text-decoration: none;
  border-bottom: 2px solid var(--ins-signal);
  padding-bottom: 5px;
  white-space: nowrap;
  justify-self: end;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 900px) {
  .lrn-closer__display {
    font-size: 34px;
  }
}
@media (max-width: 640px) {
  .lrn-closer {
    display: block;
    padding-top: 18px;
  }
  .lrn-closer__display {
    font-size: 24px;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .lrn-closer__sub {
    margin-top: 8px;
    font-size: 12.5px;
    line-height: 1.5;
  }
  .lrn-closer__link {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    margin-top: 8px;
    font-size: 10px;
    letter-spacing: 0.14em;
    padding-bottom: 4px;
  }
}
`;

/**
 * Closer — artboard 6c. Course One's real running time, spelled out, and
 * the count of everything else in the registry. Red is spent once, on the
 * link back to dispatch 01.
 *
 * Server-safe: no client state; plain <style>, not styled-jsx.
 */
export default function LearnCloser({
  minutes,
  commentaryCount,
  firstSlug,
}: {
  minutes: number;
  commentaryCount: number;
  firstSlug: string;
}) {
  return (
    <section className="lrn-closer" aria-label="Where to start">
      <div>
        <p className="lrn-closer__display">
          {capitalize(numberWord(minutes))} minutes to literacy.
        </p>
        <p className="lrn-closer__sub">
          Course One is the whole pitch. The other{" "}
          {numberWord(commentaryCount)} dispatches are commentary.
        </p>
      </div>
      <Link href={`/learn/${firstSlug}`} className="lrn-closer__link">
        Start at 01 <span aria-hidden>→</span>
      </Link>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
