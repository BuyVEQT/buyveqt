import type { ReactNode } from "react";
import Colophon from "@/components/broadsheet/Colophon";

interface InteriorShellProps {
  /** Optional max-width override. Defaults to the broadsheet's standard 1200px. */
  maxWidth?: string;
  /** Optional inner padding override. */
  padding?: string;
  children: ReactNode;
}

/**
 * Interior-page shell for unmigrated routes. Wraps page content in the
 * broadsheet styling (cream paper, ink typography) plus the editorial
 * Colophon footer. Round 4 retired the per-page Masthead — the global
 * DesktopNav/TopBar in app/layout.tsx now handles nav for every route.
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
      <div className={`mx-auto ${maxWidth} ${padding} relative pt-8`}>
        <main className="relative">{children}</main>
        <Colophon />
      </div>
    </div>
  );
}
