import { DISCLAIMER } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
          {DISCLAIMER}
        </p>
        <p className="mt-4 text-xs text-[var(--color-text-muted)]">
          &copy; {new Date().getFullYear()} BuyVEQT.com
        </p>
      </div>
    </footer>
  );
}
