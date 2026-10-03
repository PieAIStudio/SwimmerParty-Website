import { EXPORT_TARGETS, type ExportTarget } from "../content/export-targets.ts";
import { listSeries } from "../content/asset-series.ts";
import type { AssetItem } from "../content/asset-types.ts";

const priority = [
  "face.front",
  "turnaround.front",
  "face.three-quarter",
  "turnaround.three-quarter",
  "turnaround.side",
  "face.side",
  "turnaround.back",
];
const expressions = listSeries().find((series) => series.id === "expression")!.slots;
export function orderedModelAssets(items: readonly AssetItem[]): AssetItem[] {
  const rank = (item: AssetItem) => {
    const primary = priority.indexOf(item.slot);
    if (primary >= 0) return primary;
    if (item.series === "expression")
      return priority.length + expressions.findIndex((slot) => slot.key === item.key);
    return priority.length + expressions.length;
  };
  return [...items].sort((a, b) => rank(a) - rank(b));
}
export function selectModelAssets(
  items: readonly AssetItem[],
  target: Exclude<ExportTarget, "veo">,
) {
  return orderedModelAssets(items).slice(
    0,
    EXPORT_TARGETS.find((candidate) => candidate.id === target)!.limit,
  );
}
export function veoPlan(selected: readonly AssetItem[], available: readonly AssetItem[]) {
  const identity =
    available.find((item) => item.slot === "face.front") ??
    available.find((item) => item.slot === "turnaround.front");
  const selectedTurns = selected.filter((item) => item.series === "turnaround");
  const turns = selectedTurns.length
    ? selectedTurns
    : available.filter((item) => item.series === "turnaround");
  const selectedExpressions = selected.filter((item) => item.series === "expression");
  const core = new Set(expressions.filter((slot) => slot.tier === "core").map((slot) => slot.key));
  const faces = orderedModelAssets(
    selectedExpressions.length
      ? selectedExpressions
      : available.filter((item) => item.series === "expression" && core.has(item.key)),
  ).slice(0, 12);
  // Missing art is a data prerequisite, never a reason to manufacture a blank third reference.
  if (!identity || !turns.length || !faces.length) return null;
  return {
    identity,
    turns,
    expressions: faces,
    items: [...new Map([identity, ...turns, ...faces].map((item) => [item.slot, item])).values()],
  };
}
