import Link from "next/link";

interface StubPageProps {
  title: string;
  description: string;
}

export default function StubPage({ title, description }: StubPageProps) {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center max-w-md px-4">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          {title}
        </h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          {description}
        </p>
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
