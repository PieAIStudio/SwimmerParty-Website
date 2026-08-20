"use client";

import { useLocale } from "next-intl";
import { SlamText } from "@/motion/SlamText";
import type { AppLocale } from "@/i18n/routing";

/**
 * The poster headline.
 *
 * Latin and Chinese do not take the same treatment and pretending they do
 * is how bilingual sites end up looking machine-set. Archivo has a real
 * width axis and takes -0.058em tracking at Expanded Black; PingFang has
 * no black weight and falls apart below about -0.045em. So the two scripts
 * get two classes and the component picks by locale — the caller never has
 * to think about it.
 */
export function Mega({
  lines,
  className = "",
  /** Which line takes the live accent colour. Defaults to the last. */
  accentLine,
  immediate = false,
  as = "h1",
  size,
}: {
  lines: string[];
  className?: string;
  accentLine?: number;
  immediate?: boolean;
  as?: "h1" | "h2" | "p" | "div";
  size?: string;
}) {
  const locale = useLocale() as AppLocale;
  const Tag = as;
  const base = locale === "zh" ? "sp-zh-mega" : "sp-ultra";
  const accentAt = accentLine ?? lines.length - 1;

  return (
    <Tag className={`${base} ${size ?? ""} ${className}`}>
      {lines.map((line, i) => (
        <span
          key={i}
          className="block"
          style={i === accentAt ? { color: "var(--sp-accent)" } : undefined}
        >
          <SlamText text={line} immediate={immediate} delay={immediate ? i * 0.09 : 0} />
        </span>
      ))}
    </Tag>
  );
}

/** Section-level heading, same script logic, smaller. */
export function Display({
  text,
  className = "",
  as = "h2",
}: {
  text: string;
  className?: string;
  as?: "h2" | "h3" | "p";
}) {
  const locale = useLocale() as AppLocale;
  const base = locale === "zh" ? "sp-zh-display" : "sp-display";
  return <SlamText as={as} text={text} className={`${base} ${className}`} />;
}
