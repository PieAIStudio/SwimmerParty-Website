import { Link } from "@/i18n/navigation";
export type BreadcrumbItem = { label: string; href?: string };
export function Breadcrumbs({
  items,
  ariaLabel = "当前位置",
}: {
  items: BreadcrumbItem[];
  ariaLabel?: string;
}) {
  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: item.href } : {}),
    })),
  };
  return (
    <>
      <nav aria-label={ariaLabel} className="py-8">
        <ol className="flex min-h-11 flex-wrap items-center gap-2 sp-small">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              <span aria-hidden="true" className="text-muted-foreground">
                {index ? "/" : null}
              </span>
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:underline underline-offset-4"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-medium">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
      />
    </>
  );
}
