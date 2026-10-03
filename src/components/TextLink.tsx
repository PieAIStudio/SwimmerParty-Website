import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/ui/icons";

export function TextLink({
  children,
  className = "",
  back = false,
  ...props
}: ComponentProps<typeof Link> & { back?: boolean }) {
  return (
    <Link {...props} className={`sp-link ${className}`}>
      {back ? <Icon name="arrow-left" /> : null}
      {children}
      {back ? null : <Icon name="arrow-right" />}
    </Link>
  );
}
