import { DISCLAIMER } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-6">
      <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-2xl">
          {DISCLAIMER}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] shrink-0">
          &copy; {new Date().getFullYear()} BuyVEQT.com
        </p>
      </div>
    </footer>
  );
}
