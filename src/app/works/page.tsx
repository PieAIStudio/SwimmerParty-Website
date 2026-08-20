import type { Metadata } from "next";
import Link from "next/link";
import { SectionHead } from "@/components/SectionHead";

export const metadata: Metadata = {
  title: "作品 / Works",
  description: "SWIMMER PARTY 的片单：正在制作中的原创喜剧短片与系列剧。",
};

/**
 * HONESTY RULE: nothing here is presented as released until it is. No
 * invented view counts, no invented brand partners, no invented awards.
 * A new house that says "slate 01, shooting" is more credible than one
 * claiming fifty campaigns nobody can find.
 */
const SLATE = [
  {
    code: "W-01",
    en: "THE ENGLISH TEACHER",
    cn: "《我是他英语老师》",
    status: "SHOOTING 制作中",
    format: "荒诞江湖喜剧 · 单集 3–5 分钟",
    cast: "SP-03 戴尔",
    logline:
      "一个把「我不骗人」看得很重的人，为了保住一个刚刚还想揍他的男人在母亲面前的最后一点体面，第一次撒了谎——结果这个谎逼着两个烂人真的开始学英语。",
    accent: "var(--color-acid)",
  },
  {
    code: "W-02",
    en: "NIGHT SHIFT",
    cn: "《夜班》",
    status: "WRITING 编剧中",
    format: "冷幽默短片系列 · 单集 2–3 分钟",
    cast: "SP-02 齐满",
    logline: "凌晨三点的便利店是全城最好的观察位。她不评价，只是把找零推过来的时候多看你一眼。",
    accent: "var(--color-cyan)",
  },
  {
    code: "W-03",
    en: "UNTITLED — TWO HANDS",
    cn: "《暂名：两只手》",
    status: "DEVELOPMENT 开发中",
    format: "双主角系列剧",
    cast: "SP-03 戴尔 · SP-04 丁一",
    logline: "一个只看脸就被误会的人，和一个什么都会说却不懂规矩的人。设定尚未定稿。",
    accent: "var(--color-magenta)",
  },
];

export default function WorksPage() {
  return (
    <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] pt-32 pb-[var(--sp-section)]">
      <p className="sp-label text-[0.625rem]">WORKS — 作品</p>
      <h1 className="sp-mega mt-6 text-[clamp(2.75rem,11vw,10rem)] text-bone">
        THE
        <br />
        <span className="text-acid">SLATE.</span>
      </h1>
      <p className="sp-cjk mt-8 max-w-2xl text-sm leading-[1.95] text-smoke">
        我们是 {new Date().getFullYear()} 年才开工的厂牌。片单上没有一条是编出来的——
        <br />
        上线一条，挂一条；在做的就写在做的。
      </p>

      <div className="mt-20">
        <SectionHead index="01" label="SLATE" labelCn="片单" title="WHAT WE ARE MAKING" />

        <ol className="mt-10 divide-y divide-[var(--sp-hairline)] border-y border-[var(--sp-hairline)]">
          {SLATE.map((w) => (
            <li
              key={w.code}
              className="group grid gap-6 py-10 md:grid-cols-[7rem_minmax(0,1fr)_14rem]"
            >
              <div>
                <p className="sp-display text-4xl leading-none text-ash">{w.code}</p>
                <p className="sp-label mt-3 text-[0.5rem]" style={{ color: w.accent }}>
                  {w.status}
                </p>
              </div>

              <div>
                <h2 className="sp-display text-[clamp(1.5rem,4vw,2.75rem)] leading-none text-bone transition-colors group-hover:text-acid">
                  {w.en}
                </h2>
                <p className="sp-cjk mt-2 text-base text-smoke">{w.cn}</p>
                <p className="sp-cjk mt-6 max-w-2xl text-sm leading-[1.95] text-smoke">
                  {w.logline}
                </p>
              </div>

              <dl className="space-y-4 md:text-right">
                <div>
                  <dt className="sp-label text-[0.5rem] text-ash">FORMAT 形式</dt>
                  <dd className="sp-cjk mt-1 text-xs text-smoke">{w.format}</dd>
                </div>
                <div>
                  <dt className="sp-label text-[0.5rem] text-ash">CAST 主演</dt>
                  <dd className="sp-cjk mt-1 text-xs text-smoke">{w.cast}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-20 border border-[var(--sp-hairline)] p-10 text-center">
        <p className="sp-cjk text-sm leading-[1.95] text-smoke">想让我们的演员出现在你的片子里？</p>
        <Link
          href="/casting"
          className="sp-label mt-8 inline-block border border-acid px-8 py-4 text-[0.6875rem] text-acid transition-colors hover:bg-acid hover:text-black"
        >
          CASTING 合作
        </Link>
      </div>
    </div>
  );
}
