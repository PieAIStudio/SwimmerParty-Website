"use client";

import { useSiteI18n } from "@/i18n/client";
import { Link } from "@/i18n/navigation";

/** Visible product copy, not a tooltip. The full license remains the authority. */
export function DownloadTerms({ className = "" }: { className?: string }) {
  const { t } = useSiteI18n();
  return (
    <p data-download-terms className={`sp-small text-muted-foreground ${className}`}>
      <Link href="/license#credit" className="underline underline-offset-4">
        {t("home.licenseBadge")}
      </Link>
    </p>
  );
}
