import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Mannequin } from "./Mannequin";
import { GameBadge } from "@pieai/swimmer-ui-kit";

/** Image presentation is independent from the manifest's storage contract. */
export function ActorPicture({
  src,
  alt,
  sizes,
  fullBody = false,
  legacy = false,
  legacyLabel,
  className = "",
  style,
  priority = false,
  quality = 65,
  children,
}: {
  src?: string | null;
  alt: string;
  sizes: string;
  fullBody?: boolean;
  legacy?: boolean;
  legacyLabel?: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  quality?: number;
  children?: ReactNode;
}) {
  return (
    <div className={`sp-sweep sp-image-host ${className}`} style={style}>
      {src ? (
        <>
          {fullBody && !legacy ? <span className="sp-contact" aria-hidden="true" /> : null}
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            quality={quality}
            className={`sp-image ${legacy ? "object-cover" : fullBody ? "object-contain object-bottom" : "object-contain"}`}
          />
          {legacy && legacyLabel ? (
            <GameBadge tone="warning" className="sp-legacy-label absolute top-3 left-3">
              {legacyLabel}
            </GameBadge>
          ) : null}
        </>
      ) : (
        <Mannequin className="absolute inset-x-0 bottom-[4%] mx-auto h-[90%] w-full opacity-[0.12]" />
      )}
      {children}
    </div>
  );
}
