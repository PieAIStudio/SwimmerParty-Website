"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * A block of text with a copy button.
 *
 * This is the one control on the site that has to work first time: the
 * whole open-kit argument is that a visitor can take the seed away in one
 * click. `navigator.clipboard` needs a secure context, so the textarea
 * stays selectable and the raw text stays visible — if the write fails the
 * visitor can still select it by hand, which is why the failure path only
 * has to avoid claiming success.
 */
export function CopyBlock({ text, label }: { text: string; label: string }) {
  const t = useTranslations("common");
  const [done, setDone] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } catch {
      setDone(false);
    }
  };

  return (
    <div className="border border-[var(--sp-hairline)] bg-void">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--sp-hairline)] px-4 py-2.5">
        <span className="sp-label text-[0.5rem]">{label}</span>
        <button
          type="button"
          onClick={copy}
          data-cursor={done ? t("copied") : t("copy")}
          className="sp-label border border-acid px-3 py-1.5 text-[0.5rem] text-acid transition-colors hover:bg-acid hover:text-black"
        >
          {done ? t("copied") : t("copy")}
        </button>
      </div>
      <p className="max-h-64 overflow-y-auto px-4 py-4 font-mono text-[0.6875rem] leading-[1.85] text-smoke selection:bg-acid selection:text-black">
        {text}
      </p>
    </div>
  );
}
