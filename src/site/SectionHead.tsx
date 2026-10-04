export function SectionHead({
  label,
  title,
  note,
}: {
  label?: string;
  title: string;
  note?: string;
}) {
  return (
    <header>
      {label ? <p className="sp-label text-muted-foreground">{label}</p> : null}
      <h2 className={`sp-title ${label ? "mt-3" : ""}`}>{title}</h2>
      {note ? <p className="sp-lead mt-4 max-w-[36rem] text-muted-foreground">{note}</p> : null}
    </header>
  );
}
