import Link from "next/link";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import type { Crumb } from "@/lib/seo";

/**
 * The visible breadcrumb trail.
 *
 * It takes the same `Crumb[]` the page already builds for `breadcrumbNode()`,
 * which is the point: `BreadcrumbList` shipped on twenty routes while the
 * visible trail existed on five, and the two were written separately, so a
 * tour page's markup claimed a hub its rendered trail never showed. One array,
 * two renderings, no way for them to disagree.
 *
 * The last crumb is the current page, so it is text rather than a link — a
 * self-link adds nothing for a reader and dilutes the trail for a crawler.
 */
export function Breadcrumbs({
  crumbs,
  lang,
  className,
  /** `onImage` for a trail sitting over a photograph, where ink is unreadable. */
  tone = "default",
}: {
  crumbs: Crumb[];
  lang: Lang;
  className?: string;
  tone?: "default" | "onImage";
}) {
  if (crumbs.length < 2) return null;
  const ui = t(lang);
  const onImage = tone === "onImage";
  const linkClass = onImage ? "hover:text-paper" : "hover:text-accent";
  const currentClass = onImage ? "text-paper" : "text-ink";
  const sepClass = onImage ? "px-1.5 text-paper/50" : "px-1.5 text-faint";

  return (
    <nav
      aria-label={ui.breadcrumb}
      className={className ?? (onImage ? "text-xs text-paper/80" : "text-xs text-muted")}
    >
      {crumbs.map((crumb, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={crumb.path}>
            {i > 0 ? (
              <span aria-hidden className={sepClass}>
                /
              </span>
            ) : null}
            {last ? (
              <span className={currentClass}>{crumb.name}</span>
            ) : (
              <Link
                href={langPath(lang, crumb.path === "/" ? "" : crumb.path)}
                className={linkClass}
              >
                {crumb.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
