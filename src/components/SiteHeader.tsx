"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NAV, SECONDARY_NAV, SITE } from "@/lib/site";
import { ACTORS } from "@/content/actors";
import { STANCE_LINE } from "@/content/doctrine";
import type { AppLocale } from "@/i18n/routing";

/**
 * Not a sticky bar glued to the top of the viewport — that is the single
 * most templated thing a site can do. This is a thin instrument rail:
 * hairline-ruled, mono, with the roster count reading like a gauge.
 *
 * The rail carries five destinations and a language control, which is more
 * than fits on a 390px screen at a legible size. Rather than shrink the
 * type until nobody can read it, small screens get a full-bleed overlay
 * where the same links are set as poster type.
 */
export function SiteHeader() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const th = useTranslations("home");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Route changes must close the overlay; otherwise tapping a link leaves
  // the menu covering the page it just navigated to.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const castable = ACTORS.filter((a) => a.status === "active").length;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-60 border-b border-[var(--sp-hairline)] bg-[color-mix(in_srgb,var(--color-black)_82%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[var(--sp-max)] items-center gap-3 px-[var(--sp-gutter)] sm:gap-6">
          <Link href="/" className="group flex items-baseline gap-2.5" aria-label={SITE.name}>
            <span className="sp-display text-[0.82rem] leading-none whitespace-nowrap tracking-[-0.03em] text-bone transition-colors group-hover:text-acid sm:text-[1rem]">
              {SITE.name}
            </span>
            <span className="sp-label hidden text-[0.5rem] lg:inline">EST. {SITE.founded}</span>
          </Link>

          <nav className="ml-auto hidden items-center md:flex" aria-label={tc("mainNav")}>
            {NAV.map((item) => {
              const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sp-label px-3 py-2 text-[0.5625rem] whitespace-nowrap transition-colors hover:text-acid ${
                    current ? "text-acid" : ""
                  }`}
                  aria-current={current ? "page" : undefined}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <div className="hidden md:block">
              <LocaleSwitcher />
            </div>

            <Link
              href="/casting"
              className="sp-label sp-cjk hidden border border-acid px-4 py-2 text-[0.5625rem] whitespace-nowrap text-acid transition-colors hover:bg-acid hover:text-black lg:inline-block"
            >
              {th("ctaBook")}
            </Link>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="sp-label border border-[var(--sp-hairline)] px-3 py-2 text-[0.5625rem] text-bone transition-colors hover:border-acid hover:text-acid md:hidden"
              aria-expanded={open}
            >
              {tc("menu")}
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- Overlay ---------------- */}
      {open ? (
        <div className="fixed inset-0 z-70 flex flex-col overflow-y-auto bg-void md:hidden">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--sp-hairline)] px-[var(--sp-gutter)]">
            <span className="sp-display text-[0.82rem] tracking-[-0.03em] text-acid">
              {SITE.name}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="sp-label border border-acid px-3 py-2 text-[0.5625rem] text-acid"
            >
              {tc("close")}
            </button>
          </div>

          <nav className="flex-1 px-[var(--sp-gutter)] py-8" aria-label={tc("mainNav")}>
            <ul className="divide-y divide-[var(--sp-hairline)]">
              {[...NAV, ...SECONDARY_NAV].map((item, i) => (
                <li key={item.href}>
                  <Link href={item.href} className="group flex items-baseline gap-4 py-5">
                    <span className="sp-label w-8 shrink-0 text-[0.5rem] text-ash">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={
                        locale === "zh"
                          ? "sp-zh-display text-[2.75rem] text-bone group-hover:text-acid"
                          : "sp-display text-[2.75rem] text-bone group-hover:text-acid"
                      }
                    >
                      {t(item.key)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <LocaleSwitcher variant="panel" />
            </div>

            <p className="sp-label mt-10 text-[0.5rem] text-ash">
              {castable} CASTABLE · {ACTORS.length} ON ROSTER
            </p>
            <p className="sp-cjk mt-2 text-[0.625rem] leading-relaxed text-smoke">
              {STANCE_LINE[locale]}
            </p>
          </nav>
        </div>
      ) : null}
    </>
  );
}
