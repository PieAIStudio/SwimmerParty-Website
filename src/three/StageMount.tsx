"use client";

import dynamic from "next/dynamic";

/* WebGL cannot render on the server, so the stage is loaded client-side
 * only. This wrapper exists because `ssr: false` is not allowed inside a
 * Server Component in the Next app router. */
const Stage = dynamic(() => import("./Stage"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <p className="sp-label text-[0.6rem] text-ash">
        <span className="sp-blink">▊</span> INITIALISING STAGE
      </p>
    </div>
  ),
});

export function StageMount({ accent }: { accent?: string }) {
  return <Stage accent={accent} />;
}
