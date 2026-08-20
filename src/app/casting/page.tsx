import type { Metadata } from "next";
import { SectionHead } from "@/components/SectionHead";
import { ACTORS } from "@/content/actors";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "合作 / Casting",
  description: "授权 SWIMMER PARTY 的 AI 演员出演你的片子，或定制一个只属于你的原创演员。",
};

const ROUTES = [
  {
    n: "01",
    en: "LICENSE A ROSTER ACTOR",
    cn: "授权出演",
    body: "直接用名册上现有的演员。人设、表情组、表演区间都是现成的，最快的一条路。",
    good: ["品牌短片 / 广告", "系列内容客串", "社媒常驻角色"],
    accent: "var(--color-acid)",
  },
  {
    n: "02",
    en: "COMMISSION AN ACTOR",
    cn: "定制演员",
    body: "为你造一个新的。走完整条产线：人设 → 白膜 → 定妆 → 表演验收，交付时附完整规格书。",
    good: ["品牌专属代言角色", "IP 化的长期形象", "需要独占的项目"],
    accent: "var(--color-cyan)",
  },
  {
    n: "03",
    en: "CO-PRODUCE",
    cn: "联合出品",
    body: "我们出演员和制作，你出题材、渠道或资金。片子归双方，角色留在名册上继续演。",
    good: ["系列剧 / 短剧", "平台定制内容", "长期内容合作"],
    accent: "var(--color-magenta)",
  },
];

export default function CastingPage() {
  const castable = ACTORS.filter((a) => a.status === "active");

  return (
    <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] pt-32 pb-[var(--sp-section)]">
      <p className="sp-label text-[0.625rem]">CASTING — 合作</p>
      <h1 className="sp-mega mt-6 text-[clamp(2.75rem,11vw,10rem)] text-bone">
        BOOK
        <br />
        <span className="text-acid">TALENT.</span>
      </h1>
      <p className="sp-cjk mt-8 max-w-2xl text-sm leading-[1.95] text-smoke">
        三条路。你可以只带一个想法过来，我们帮你判断该走哪条。
      </p>

      <div className="mt-20">
        <SectionHead index="01" label="ROUTES" labelCn="三种合作" title="THREE WAYS IN" />

        <ol className="mt-10 grid gap-px bg-[var(--sp-hairline)] lg:grid-cols-3">
          {ROUTES.map((r) => (
            <li key={r.n} className="sp-crosshair flex flex-col bg-black p-8">
              <span className="sp-display text-6xl leading-none text-ash">{r.n}</span>
              <h2 className="sp-display mt-8 text-xl leading-tight text-bone">{r.en}</h2>
              <p className="sp-cjk mt-1.5 text-sm" style={{ color: r.accent }}>
                {r.cn}
              </p>
              <p className="sp-cjk mt-5 text-sm leading-[1.95] text-smoke">{r.body}</p>

              <p className="sp-label mt-8 text-[0.5rem] text-ash">GOOD FOR 适合</p>
              <ul className="mt-3 space-y-1.5">
                {r.good.map((g) => (
                  <li key={g} className="sp-cjk flex gap-2 text-xs text-smoke">
                    <span style={{ color: r.accent }}>—</span>
                    {g}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-24 border border-[var(--sp-hairline)]">
        <div className="grid gap-px bg-[var(--sp-hairline)] md:grid-cols-2">
          <div className="bg-carbon p-10">
            <p className="sp-label text-[0.5625rem]">CONTACT 联系</p>
            <a
              href={`mailto:${SITE.contact}?subject=${encodeURIComponent("[CASTING] 合作洽谈")}`}
              className="sp-display mt-6 block text-[clamp(1.25rem,3.5vw,2.25rem)] leading-none text-bone transition-colors hover:text-acid"
            >
              {SITE.contact}
            </a>
            <p className="sp-cjk mt-6 text-xs leading-[1.9] text-smoke">
              来信请带上：项目类型、大致时间、想用哪位演员（或想要什么样的演员）。
              <br />
              一句话也行，我们会问清楚。
            </p>
          </div>

          <div className="bg-carbon p-10">
            <p className="sp-label text-[0.5625rem]">AVAILABLE NOW 现在可约</p>
            <ul className="mt-6 divide-y divide-[var(--sp-hairline)]">
              {castable.map((a) => (
                <li key={a.slug} className="flex items-baseline justify-between gap-4 py-3">
                  <span className="sp-display text-lg text-bone">{a.nameEn}</span>
                  <span className="sp-label text-[0.5rem] text-acid">{a.code} · OPEN</span>
                </li>
              ))}
            </ul>
            <p className="sp-cjk mt-6 text-xs leading-[1.9] text-ash">
              研发中的演员也可以先聊，交付后优先给到先约的人。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
