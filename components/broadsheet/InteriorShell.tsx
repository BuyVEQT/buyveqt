import type { ReactNode } from "react";
import Masthead from "@/components/broadsheet/Masthead";
import Colophon from "@/components/broadsheet/Colophon";

interface InteriorShellProps {
  /** Optional max-width override. Defaults to the broadsheet's standard 1200px. */
  maxWidth?: string;
  /** Optional inner padding override. */
  padding?: string;
  children: ReactNode;
}

/**
 * Interior-page shell. Wraps non-home pages in the broadsheet chrome:
 *   - data-broadsheet attribute so typography + palette tokens flip to paper+ink
 *   - compressed Masthead (single layout for home + interior)
 *   - Colophon footer
 */
export default function InteriorShell({
  maxWidth = "max-w-[1200px]",
  padding = "px-5 sm:px-8 lg:px-12",
  children,
}: InteriorShellProps) {
  return (
    <div
      data-broadsheet
      className="min-h-screen relative overflow-x-hidden"
      style={{ backgroundColor: "var(--paper)" }}
    >
      <div className={`mx-auto ${maxWidth} ${padding} relative`}>
        <Masthead />
        <main className="relative">{children}</main>
        <Colophon />
      </div>
    </div>
  );
}
