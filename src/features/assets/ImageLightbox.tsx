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
export function ImageLightbox({
  item,
  name,
  displayLarge = false,
}: {
  item: AssetItem;
  name: string;
  displayLarge?: boolean;
}) {
  const { t } = useSiteI18n();
  const [open, setOpen] = useState(false);
  const [lightboxSlides, setLightboxSlides] = useState([{ src: item.large ?? item.preview, alt: name }]);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) trigger.current?.focus();
  }, [open]);
  function collectSlides() {
    const nodes = [...document.querySelectorAll<HTMLElement>("[data-lightbox-item]")];
    const grouped = nodes
      .map((node) => ({
        src: node.dataset.large ?? node.dataset.preview ?? "",
        alt: node.dataset.alt ?? "",
      }))
      .filter((slide) => slide.src);
    return grouped.length ? grouped : [{ src: item.large ?? item.preview, alt: name }];
  }
  return (
    <>
      <button
        ref={trigger}
        type="button"
        data-lightbox-item
        data-large={item.large ?? item.preview}
        data-preview={item.preview}
        data-alt={name}
        className="block w-full cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        aria-label={t("assets.viewLarger", { name })}
        onClick={() => {
          setLightboxSlides(collectSlides());
          setOpen(true);
        }}
      >
        <Image
          src={displayLarge ? (item.large ?? item.preview) : item.preview}
          alt=""
          width={item.width || 941}
          height={item.height || 1672}
          quality={displayLarge ? 85 : 75}
          sizes={
            displayLarge ? "(min-width: 1024px) 560px, 100vw" : "(min-width: 1024px) 24vw, 50vw"
          }
          className="h-full w-full object-contain"
        />
      </button>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={lightboxSlides}
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
