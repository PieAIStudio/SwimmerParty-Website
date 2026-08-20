"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { StageMode } from "./Stage";

function StagePlaceholder() {
  const t = useTranslations("common");
  return (
    <div className="absolute inset-0 grid place-items-center">
      <p className="sp-label text-[0.6rem] text-ash">
        <span className="sp-blink">▊</span> {t("loading")}
      </p>
    </div>
  );
}

/* WebGL cannot render on the server, so the stage is loaded client-side
 * only. This wrapper exists because `ssr: false` is not allowed inside a
 * Server Component in the Next app router. */
const Stage = dynamic(() => import("./Stage"), {
  ssr: false,
  loading: () => <StagePlaceholder />,
});

export function StageMount({
  accent,
  mode = "solo",
  assemble = false,
  count,
}: {
  accent?: string;
  mode?: StageMode;
  assemble?: boolean;
  count?: number;
}) {
  return <Stage accent={accent} mode={mode} assemble={assemble} count={count} />;
}
