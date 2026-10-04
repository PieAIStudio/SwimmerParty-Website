import { SHEET_WIDTH, SHEET_HEIGHT, sheetLayout } from "./sheet-layout.ts";
export type SheetLabels = "none" | "zh" | "en";
export type SheetBackground = "grey" | "white" | "dark";
export type SheetOptions = {
  labels: SheetLabels;
  background: SheetBackground;
  expressionGrid?: boolean;
};
export type SheetImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  fullBody: boolean;
  labels: { en: string; zh: string };
};
// The only non-token palette: the explicitly specified, theme-independent export document.
const palette = { grey: "#EDEDED", white: "#FFFFFF", dark: "#2B2B2B" };

export function createSheetPainter(
  images: readonly Pick<SheetImage, "fullBody" | "labels">[],
  options: SheetOptions,
  canvas = document.createElement("canvas"),
  preview = false,
) {
  canvas.width = preview ? 960 : SHEET_WIDTH;
  canvas.height = preview ? 540 : SHEET_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");
  const scale = canvas.width / SHEET_WIDTH;
  context.scale(scale, scale);
  context.fillStyle = palette[options.background];
  context.fillRect(0, 0, SHEET_WIDTH, SHEET_HEIGHT);
  const boxes = sheetLayout(
    images.map((image) => image.fullBody),
    options.labels !== "none",
    options.expressionGrid,
  );
  const positions = new Map(boxes.map((box) => [box.index, box]));
  return {
    canvas,
    paint(index: number, decoded: Pick<SheetImage, "source" | "width" | "height">) {
      const box = positions.get(index);
      if (!box) throw new Error("Unknown sheet cell");
      const image = { ...images[index], ...decoded };
      const fit = Math.min(box.width / image.width, box.height / image.height);
      const width = image.width * fit,
        height = image.height * fit;
      context.drawImage(
        image.source,
        box.x + (box.width - width) / 2,
        box.y + (box.fullBody ? box.height - height : (box.height - height) / 2),
        width,
        height,
      );
      if (options.labels !== "none") {
        context.font =
          options.labels === "en" ? "36px Geist, sans-serif" : "36px system-ui, sans-serif";
        context.fillStyle = options.background === "dark" ? palette.white : palette.dark;
        context.textAlign = "center";
        context.fillText(
          image.labels[options.labels],
          box.x + box.width / 2,
          box.labelY,
          box.width,
        );
      }
    },
  };
}

export function renderSheet(
  images: readonly SheetImage[],
  options: SheetOptions,
  canvas = document.createElement("canvas"),
  preview = false,
): HTMLCanvasElement {
  const painter = createSheetPainter(images, options, canvas, preview);
  images.forEach((image, index) => painter.paint(index, image));
  return canvas;
}
export function sheetBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG encoding failed"))),
      "image/png",
    ),
  );
}
