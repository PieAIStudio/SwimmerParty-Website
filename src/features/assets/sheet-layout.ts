export const SHEET_WIDTH = 3840;
export const SHEET_HEIGHT = 2160;
export const SHEET_MARGIN = 80;
export const SHEET_GAP = 40;
export type SheetBox = {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  labelY: number;
  fullBody: boolean;
};
type Region = { x: number; y: number; width: number; height: number };

function grid(
  indices: number[],
  region: Region,
  fullBody: boolean,
  labels: boolean,
  columns?: number,
  rows?: number,
): SheetBox[] {
  if (!indices.length) return [];
  const ratio = fullBody ? 2 / 3 : 1;
  const labelHeight = labels ? 56 : 0;
  let bestColumns = columns ?? 1;
  if (!columns) {
    let best = -1;
    for (let count = 1; count <= indices.length; count++) {
      const lines = Math.ceil(indices.length / count);
      const w = (region.width - (count - 1) * SHEET_GAP) / count;
      const h = (region.height - (lines - 1) * SHEET_GAP) / lines - labelHeight;
      const size = Math.min(w / ratio, h);
      if (size > best) {
        best = size;
        bestColumns = count;
      }
    }
  }
  const lines = rows ?? Math.ceil(indices.length / bestColumns);
  const width = (region.width - (bestColumns - 1) * SHEET_GAP) / bestColumns;
  const height = (region.height - (lines - 1) * SHEET_GAP) / lines;
  return indices.map((index, position) => ({
    index,
    x: region.x + (position % bestColumns) * (width + SHEET_GAP),
    y: region.y + Math.floor(position / bestColumns) * (height + SHEET_GAP),
    width,
    height: Math.max(1, height - labelHeight),
    labelY: region.y + Math.floor(position / bestColumns) * (height + SHEET_GAP) + height - 8,
    fullBody,
  }));
}
export function sheetLayout(
  fullBody: readonly boolean[],
  labels: boolean,
  expressionGrid = false,
): SheetBox[] {
  const region = {
    x: SHEET_MARGIN,
    y: SHEET_MARGIN,
    width: SHEET_WIDTH - 2 * SHEET_MARGIN,
    height: SHEET_HEIGHT - 2 * SHEET_MARGIN,
  };
  const all = fullBody.map((_, index) => index);
  if (expressionGrid) return grid(all, region, false, false, 4, 3);
  const full = all.filter((index) => fullBody[index]);
  const heads = all.filter((index) => !fullBody[index]);
  if (!full.length || !heads.length) return grid(all, region, full.length > 0, labels);
  const usable = region.height - SHEET_GAP;
  const fullHeight = usable * 0.6;
  return [
    ...grid(full, { ...region, height: fullHeight }, true, labels, full.length, 1),
    ...grid(
      heads,
      { ...region, y: region.y + fullHeight + SHEET_GAP, height: usable * 0.4 },
      false,
      labels,
    ),
  ];
}
