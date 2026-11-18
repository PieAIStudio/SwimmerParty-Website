import type { Metadata } from "next";
import { FilmHarness } from "@/features/scene/FilmHarness";

// Test-only render target for tools/film/render-shot.ts; never indexed or linked.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function FilmHarnessPage() {
  return <FilmHarness />;
}
