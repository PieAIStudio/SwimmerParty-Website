import type { ReactNode } from "react";

/** Shared document hierarchy, with no client animation or visual ornament. */
export function PageIntro({
  eyebrow,
  lines,
  children,
}: {
  eyebrow: string;
  lines: string[];
  children?: ReactNode;
}) {
  return (
    <header className="pt-16 lg:pt-24">
      <p className="sp-label text-muted-foreground">{eyebrow}</p>
      <h1 className="sp-display-lg mt-4">
        {lines.map((line, index) => (
          <span className="block" key={line}>
            {index ? " " : ""}
            {line}
          </span>
        ))}
      </h1>
      {children ? (
        <div className="sp-lead mt-6 max-w-[36rem] text-muted-foreground">{children}</div>
      ) : null}
    </header>
  );
}
