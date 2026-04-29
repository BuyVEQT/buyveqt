import Link from "next/link";
import type { Course } from "@/lib/learn";

interface CourseCardProps {
  course: Course;
}

/**
 * One column of the three-up courses grid on `/learn`. No box, no
 * shadow — visual structure comes from the parent grid's
 * `divide-x` rules (desktop only).
 */
export default function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="flex flex-col px-0 lg:px-6 first:lg:pl-0 last:lg:pr-0">
      <p
        className="bs-stamp mb-3"
        style={{ color: "var(--stamp)" }}
      >
        Course {course.number}
      </p>
      <h3
        className="bs-display text-[1.5rem] sm:text-[1.625rem] leading-[1.05] mb-3"
        style={{ color: "var(--ink)" }}
      >
        {course.title}
      </h3>
      <p
        className="bs-body italic text-[0.9375rem] leading-[1.5] mb-5"
        style={{ color: "var(--ink-soft)" }}
      >
        {course.blurb}
      </p>
      <hr className="border-t border-[color:var(--ink)] mb-4" />
      <ol className="space-y-4">
        {course.articles.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/learn/${article.slug}`}
              className="group block"
              style={{ color: "var(--ink)" }}
            >
              <p
                className="bs-label mb-1"
                style={{ color: "var(--ink-mute)" }}
              >
                Step {article.step}
              </p>
              <p
                className="bs-body text-[0.9375rem] leading-[1.35] group-hover:underline"
                style={{ textUnderlineOffset: "3px" }}
              >
                {article.title}
                <span
                  aria-hidden
                  className="ml-1 inline-block transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}
