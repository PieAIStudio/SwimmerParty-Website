/** Finite UI series labels; IDs come from content/asset-series.json. */
const seriesLabels = {
  turnaround: "assets.series.turnaround",
  face: "assets.series.face",
  expression: "assets.series.expression",
  wardrobe: "assets.series.wardrobe",
  pose: "assets.series.pose",
  detail: "assets.series.detail",
  voice: "assets.series.voice",
  video: "assets.series.video",
} as const;

export function seriesLabelKey(id: string) {
  if (!(id in seriesLabels)) throw new Error(`Unknown asset series: ${id}`);
  return seriesLabels[id as keyof typeof seriesLabels];
}
