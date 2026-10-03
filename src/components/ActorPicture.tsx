import Image from "next/image";
import type { ReactNode } from "react";
import { Mannequin } from "./Mannequin";

/** Image presentation is independent from the manifest's storage contract. */
export function ActorPicture({
  src,
  alt,
  sizes,
  fullBody = false,
  legacy = false,
  legacyLabel,
  className = "",
  priority = false,
  children,
}: {
  src?: string | null;
  alt: string;
  sizes: string;
  fullBody?: boolean;
  legacy?: boolean;
  legacyLabel?: string;
  className?: string;
  priority?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`sp-sweep sp-image-host ${className}`}>
      {src ? (
        <>
          {fullBody && !legacy ? <span className="sp-contact" aria-hidden="true" /> : null}
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={`sp-image ${legacy ? "object-cover" : fullBody ? "object-contain object-bottom" : "object-contain"}`}
          />
          {legacy && legacyLabel ? (
            <span className="sp-pill sp-legacy-label absolute top-3 left-3">{legacyLabel}</span>
          ) : null}
        </>
      ) : (
        <Mannequin className="absolute inset-x-0 bottom-[4%] mx-auto h-[90%] w-full opacity-[0.12]" />
      )}
      {children}
    </div>
  );
}
