"use client";
import NextLink from "next/link";
import { usePathname as useNextPathname } from "next/navigation";
import type { ComponentProps } from "react";
import { useSiteLocale } from "./client";
import { localePath, type AppLocale } from "./routing";
export function Link({
  href,
  locale,
  ...props
}: Omit<ComponentProps<typeof NextLink>, "href"> & { href: string; locale?: AppLocale }) {
  const active = useSiteLocale();
  return (
    <NextLink
      {...props}
      prefetch={locale && locale !== active ? false : props.prefetch}
      href={localePath(href, locale ?? active)}
    />
  );
}
export function usePathname() {
  const pathname = useNextPathname();
  const locale = useSiteLocale();
  return pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/";
}
