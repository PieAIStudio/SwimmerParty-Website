import Link from "next/link";
import { NAV, SITE } from "@/lib/site";

/**
 * Not a sticky bar glued to the top of the viewport — that is the single
 * most templated thing a site can do. This is a thin instrument rail:
 * hairline-ruled, mono, with the roster count reading like a gauge.
 */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--sp-hairline)] bg-[color-mix(in_srgb,var(--color-black)_82%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[var(--sp-max)] items-center gap-6 px-[var(--sp-gutter)]">
        <Link
          href="/"
          className="group flex items-baseline gap-2.5"
          aria-label={`${SITE.name} 首页`}
        >
          <span className="sp-display text-[0.95rem] leading-none tracking-[-0.02em] text-bone transition-colors group-hover:text-acid">
            {SITE.name}
          </span>
          <span className="sp-label hidden text-[0.55rem] sm:inline">EST. {SITE.founded}</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1" aria-label="主导航">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="sp-label px-3 py-2 text-[0.625rem] transition-colors hover:text-acid"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/casting"
          className="sp-label hidden border border-acid px-4 py-2 text-[0.625rem] text-acid transition-colors hover:bg-acid hover:text-black md:inline-block"
        >
          BOOK TALENT
        </Link>
      </div>
    </header>
  );
}
