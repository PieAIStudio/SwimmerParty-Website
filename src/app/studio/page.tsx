import type { Metadata } from "next";
import Link from "next/link";
import { SectionHead } from "@/components/SectionHead";
import { StageMount } from "@/three/StageMount";

export const metadata: Metadata = {
  title: "工作室 / Studio",
  description: "SWIMMER PARTY 怎么造一个 AI 演员：从人设、白膜、定妆到表演的完整产线。",
};

const BELIEFS = [
  {
    n: "01",
    en: "A FACE IS NOT A CHARACTER",
    cn: "一张脸不是一个角色",
    body: "能生成好看的脸的人很多。能让同一张脸在第十条片子里还是同一个人、还讲同一套话的人很少。差别不在模型，在有没有一份写死的规格书。",
  },
  {
    n: "02",
    en: "VERSION NUMBERS ARE HONEST",
    cn: "版本号是诚实的",
    body: "我们把每个角色被推翻过几次直接印在名册上。VERSION 6 OF 10 的意思是前面五版都不够好。藏起来才叫心虚。",
  },
  {
    n: "03",
    en: "THE WHITE MODEL COMES FIRST",
    cn: "先有白膜",
    body: "比例、体型、动作范围先定死，再谈皮肤和衣服。顺序反了，角色就只是一张会动的海报。",
  },
  {
    n: "04",
    en: "COMEDY IS THE HARDEST TEST",
    cn: "喜剧是最难的验收",
    body: "一个角色能不能站住，看他在喜剧里演不演得住。悲情可以靠音乐糊过去，笑不出来就是笑不出来。",
  },
];

export default function StudioPage() {
  return (
    <div className="pt-14">
      <section className="relative overflow-hidden border-b border-[var(--sp-hairline)]">
        <div className="absolute inset-0 opacity-40 md:left-1/2 md:opacity-90">
          <StageMount accent="#00e5ff" />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, var(--color-black) 6%, color-mix(in srgb, var(--color-black) 55%, transparent) 44%, transparent 68%)",
          }}
        />
        <div className="relative mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-28">
          <p className="sp-label text-[0.625rem]">STUDIO — 工作室</p>
          <h1 className="sp-mega mt-6 max-w-[13ch] text-bone">
            A FACTORY
            <br />
            FOR <span className="text-cyan">PEOPLE.</span>
          </h1>
          <p className="sp-cjk mt-8 max-w-lg text-sm leading-[1.95] text-smoke">
            SWIMMER PARTY 是 PieAI Studio 旗下的合成演员工厂。
            <br />
            我们不接外包渲染，我们只造自己的演员，然后把他们租出去。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
        <SectionHead
          index="01"
          label="BELIEFS"
          labelCn="我们怎么想"
          title="FOUR THINGS WE HOLD"
          note="这四条决定了名册上每一个人长什么样、怎么说话、什么时候被淘汰。"
        />

        <ol className="mt-12 grid gap-px bg-[var(--sp-hairline)] md:grid-cols-2">
          {BELIEFS.map((b) => (
            <li key={b.n} className="sp-crosshair bg-black p-8 md:p-10">
              <span className="sp-display text-6xl leading-none text-ash">{b.n}</span>
              <h3 className="sp-display mt-8 text-xl text-bone">{b.en}</h3>
              <p className="sp-cjk mt-1.5 text-sm text-cyan">{b.cn}</p>
              <p className="sp-cjk mt-5 text-sm leading-[1.95] text-smoke">{b.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-[var(--sp-hairline)] bg-carbon">
        <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
          <SectionHead
            index="02"
            label="STACK"
            labelCn="技术栈"
            title="BUILT ON OUR OWN RAILS"
            note="这个站和名册上的每一个演员，跑在 PieAI 自己的品牌工具链上，不是拼来的。"
          />
          <ul className="mt-12 grid gap-px bg-[var(--sp-hairline)] sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["SWIMMER UI KIT", "品牌 UI 库", "按钮、面板、token 的唯一来源"],
              ["REACT THREE FIBER", "实时 3D", "白膜舞台与角色展台"],
              ["NEXT.JS", "内容与 SEO", "让名册被搜得到"],
              ["PGS", "治理", "版本、边界与交付纪律"],
            ].map(([en, cn, note]) => (
              <li key={en} className="bg-carbon p-6">
                <p className="sp-display text-sm text-bone">{en}</p>
                <p className="sp-cjk mt-1 text-xs text-cyan">{cn}</p>
                <p className="sp-cjk mt-4 text-xs leading-relaxed text-smoke">{note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)] text-center">
        <h2 className="sp-mega text-[clamp(2rem,8vw,7rem)] text-bone">
          WANT ONE <span className="text-cyan">BUILT?</span>
        </h2>
        <p className="sp-cjk mx-auto mt-8 max-w-xl text-sm leading-[1.95] text-smoke">
          我们也接定制——为你的品牌或你的片子造一个只属于你的演员。
        </p>
        <Link
          href="/casting"
          className="sp-label mt-12 inline-block border border-cyan px-10 py-4 text-[0.6875rem] text-cyan transition-colors hover:bg-cyan hover:text-black"
        >
          TALK TO US 聊聊
        </Link>
      </section>
    </div>
  );
}
