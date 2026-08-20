import { Display } from "./Mega";

/**
 * Section marker. The index is oversized and hollow and the title is set
 * against it — the asymmetry is the point; a centred title reads as a
 * template.
 */
export function SectionHead({
  index,
  label,
  title,
  note,
  tone = "dark",
}: {
  index: string;
  label: string;
  title: string;
  note?: string;
  tone?: "dark" | "slab";
}) {
  const rule = tone === "slab" ? "border-black/25" : "border-[var(--sp-hairline)]";
  const ink = tone === "slab" ? "text-black" : "text-bone";
  const dim = tone === "slab" ? "text-black/55" : "text-smoke";
  const ghost = tone === "slab" ? "text-black/25" : "";

  return (
    <div
      className={`flex flex-col gap-6 border-t ${rule} pt-6 md:flex-row md:items-start md:gap-12`}
    >
      <div className="flex shrink-0 items-baseline gap-4 md:w-56 md:flex-col md:gap-2">
        <span
          className={
            tone === "slab" ? `sp-display text-6xl leading-none ${ghost}` : "sp-ghost-num text-6xl"
          }
        >
          {index}
        </span>
        <span
          className={`sp-label sp-cjk text-[0.625rem] ${tone === "slab" ? "text-black/55" : ""}`}
        >
          {label}
        </span>
      </div>
      <div className="flex-1">
        <Display text={title} className={`text-[clamp(1.9rem,5.5vw,4.5rem)] ${ink}`} />
        {note ? (
          <p className={`sp-cjk mt-5 max-w-2xl text-sm leading-[1.9] ${dim}`}>{note}</p>
        ) : null}
      </div>
    </div>
  );
}
