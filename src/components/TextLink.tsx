import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { GameIcon } from "@pieai/swimmer-ui-kit";

export function TextLink({
  children,
  className = "",
  back = false,
  ...props
}: ComponentProps<typeof Link> & { back?: boolean }) {
  return (
    <Link {...props} className={`sp-link ${className}`}>
      {back ? <GameIcon icon="arrow-left"  /> : null}
      {children}
      {back ? null : <GameIcon icon="arrow-right"  />}
    </Link>
  );
}
