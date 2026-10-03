"use client";

import { useEffect, useRef, useState } from "react";
import { useSiteLocale, useSiteI18n } from "@/i18n/client";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { NAV, SECONDARY_NAV, SITE } from "@/lib/site";
import { GameIconButton } from "@/ui/kit";
import { Icon } from "@/ui/icons";

export function SiteHeader() {
  const pathname = usePathname();
  const locale = useSiteLocale();
  return <HeaderContent key={`${locale}:${pathname}`} />;
}

function HeaderContent() {
  const { t } = useSiteI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = dialog.current;
    const menuButton = trigger.current?.querySelector("button");
    if (!open || !panel) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.showModal();
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      panel.close();
      document.body.style.overflow = overflow;
      desktop.removeEventListener("change", closeOnDesktop);
      menuButton?.focus();
    };
  }, [open]);

  const current = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[var(--sp-header)] backdrop-blur-[12px]">
      <div className="sp-container flex h-16 items-center gap-6">
        <Link
          href="/"
          className="shrink-0 font-display text-xl leading-none font-bold"
          aria-label={SITE.name}
        >
          {SITE.name}
        </Link>
        <nav className="hidden items-center gap-5 lg:flex" aria-label={t("common.mainNav")}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={current(item.href) ? "page" : undefined}
              className={`relative py-3 text-[15px] font-medium whitespace-nowrap hover:underline underline-offset-4 ${current(item.href) ? "text-foreground" : "text-muted-foreground"}`}
            >
              {t(`nav.${item.key}`)}
              {current(item.href) ? (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current"
                />
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden lg:block">
            <LocaleSwitcher />
          </div>
          <div className="lg:hidden" ref={trigger}>
            <GameIconButton
              label={t("common.menu")}
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen(true)}
            >
              <Icon name="menu" />
            </GameIconButton>
          </div>
        </div>
      </div>
      <dialog
        id="site-menu"
        ref={dialog}
        aria-label={t("common.mainNav")}
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto border-0 bg-background p-0 text-foreground"
      >
        <div className="flex min-h-full flex-col px-[var(--sp-gutter)]">
          <div className="flex h-16 shrink-0 items-center justify-between gap-4">
            <Link
              href="/"
              className="font-display text-xl font-bold"
              onClick={() => setOpen(false)}
            >
              {SITE.name}
            </Link>
            <GameIconButton label={t("common.close")} onClick={() => setOpen(false)}>
              <Icon name="close" />
            </GameIconButton>
          </div>
          <nav
            aria-label={t("common.mainNav")}
            className="flex flex-1 flex-col items-start gap-5 py-8"
          >
            {[...NAV, ...SECONDARY_NAV].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={current(item.href) ? "page" : undefined}
                className="font-display text-[32px] leading-tight font-bold hover:underline underline-offset-4"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>
          <div className="pb-8">
            <LocaleSwitcher variant="panel" />
          </div>
        </div>
      </dialog>
    </header>
  );
}
