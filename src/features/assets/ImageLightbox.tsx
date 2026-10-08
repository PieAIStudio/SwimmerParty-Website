"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
// oxlint-disable-next-line import/no-unassigned-import -- Lightbox package stylesheet.
import "yet-another-react-lightbox/styles.css";
import { useSiteI18n } from "@/i18n/client";
import type { AssetItem } from "./asset-types";
export function ImageLightbox({ item, name }: { item: AssetItem; name: string }) {
  const { t } = useSiteI18n();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) trigger.current?.focus();
  }, [open]);
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="block w-full cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        aria-label={t("assets.viewLarger", { name })}
        onClick={() => setOpen(true)}
      >
        <Image
          src={item.preview}
          alt=""
          width={item.width || 941}
          height={item.height || 1672}
          className="h-full w-full object-contain"
        />
      </button>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src: item.large ?? item.preview, alt: name }]}
        plugins={[Zoom, Counter]}
        counter={{ container: { style: { top: "unset", bottom: 16 } } }}
        zoom={{ maxZoomPixelRatio: 1 }}
        labels={{
          Close: t("assets.close"),
          Next: t("assets.next"),
          Previous: t("assets.previous"),
          "Zoom in": t("assets.zoomIn"),
          "Zoom out": t("assets.zoomOut"),
        }}
      />
    </>
  );
}
