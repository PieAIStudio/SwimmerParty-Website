import Link from "next/link";
import { NAV, SITE } from "@/lib/site";
import { ACTORS } from "@/content/actors";

export function SiteFooter() {
  const castable = ACTORS.filter((a) => a.status === "active").length;

  return (
    <footer className="border-t border-[var(--sp-hairline)] bg-void">
      <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-16">
        <p className="sp-mega text-[clamp(2.5rem,11vw,9rem)] text-ash select-none">{SITE.name}</p>

        <div className="mt-12 grid gap-10 border-t border-[var(--sp-hairline)] pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="sp-label">ROSTER / 名册</p>
            <ul className="mt-4 space-y-2">
              {ACTORS.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/actors/${a.slug}`}
                    className="text-xs text-smoke transition-colors hover:text-acid"
                  >
                    <span className="text-ash">{a.code}</span> {a.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="sp-label">INDEX / 索引</p>
            <ul className="mt-4 space-y-2">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="text-xs text-smoke transition-colors hover:text-acid"
                  >
                    {n.label} <span className="sp-cjk text-ash">{n.labelCn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="sp-label">CONTACT / 联系</p>
            <a
              href={`mailto:${SITE.contact}`}
              className="mt-4 block text-xs text-smoke transition-colors hover:text-acid"
            >
              {SITE.contact}
            </a>
            <p className="sp-cjk mt-2 text-xs text-ash">选角、授权与定制演员</p>
          </div>

          <div>
            <p className="sp-label">STATUS / 状态</p>
            <p className="mt-4 flex items-center gap-2 text-xs text-smoke">
              <span className="sp-blink inline-block h-1.5 w-1.5 bg-acid" aria-hidden />
              {castable} CASTABLE · {ACTORS.length - castable} IN DEVELOPMENT
            </p>
            <p className="sp-cjk mt-2 text-xs text-ash">名册每有新演员交付即更新</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--sp-hairline)] pt-6">
          <p className="sp-label text-[0.55rem]">
            © {SITE.founded} {SITE.name} — A PIEAI STUDIO PROJECT
          </p>
          <p className="sp-label text-[0.55rem] text-ash">
            ALL TALENT ON THIS SITE IS SYNTHETIC AND ORIGINAL
          </p>
        </div>
      </div>
    </footer>
  );
}
