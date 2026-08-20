/**
 * Section marker. The index number is oversized and the title is set
 * against it — the asymmetry is the point, a centred title would read as
 * a template.
 */
export function SectionHead({
  index,
  label,
  labelCn,
  title,
  note,
}: {
  index: string;
  label: string;
  labelCn?: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-6 border-t border-[var(--sp-hairline)] pt-6 md:flex-row md:items-start md:gap-12">
      <div className="flex shrink-0 items-baseline gap-4 md:w-56 md:flex-col md:gap-1">
        <span className="sp-display text-4xl leading-none text-ash">{index}</span>
        <span className="sp-label text-[0.625rem]">
          {label}
          {labelCn ? <span className="sp-cjk ml-2 text-ash">{labelCn}</span> : null}
        </span>
      </div>
      <div className="flex-1">
        <h2 className="sp-display text-[clamp(1.9rem,5.5vw,4.25rem)] text-bone">{title}</h2>
        {note ? (
          <p className="sp-cjk mt-4 max-w-2xl text-sm leading-relaxed text-smoke">{note}</p>
        ) : null}
      </div>
    </div>
  );
}
