import Link from "next/link";
import { ActorCard } from "@/components/ActorCard";
import { Marquee } from "@/components/Marquee";
import { SectionHead } from "@/components/SectionHead";
import { StageMount } from "@/three/StageMount";
import { ACTORS } from "@/content/actors";
import { SITE } from "@/lib/site";

const PIPELINE = [
  {
    step: "01",
    en: "CASTING BRIEF",
    cn: "立人设",
    body: "先定这个人怎么想事，再定他长什么样。反过来做出来的角色，第三条片子就演不下去了。",
  },
  {
    step: "02",
    en: "BUILD",
    cn: "造白膜",
    body: "体型、比例、动作范围先在白膜上定死。这一层定不准，后面每一版都得返工。",
  },
  {
    step: "03",
    en: "SURFACE",
    cn: "定妆",
    body: "脸、发、服装、表情组。多参考图锁死同一个人——十条片子里他必须是同一张脸。",
  },
  {
    step: "04",
    en: "PERFORMANCE",
    cn: "开演",
    body: "把他放进戏里。演得住的留在名册上，演不住的回炉。版本号就是他被推翻过几次。",
  },
];

export default function HomePage() {
  const castable = ACTORS.filter((a) => a.status === "active");

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative min-h-[100svh] overflow-hidden pt-14">
        {/* Stage sits behind the type, biased right so the headline gets the
         * left third clean. On mobile it drops behind everything at low
         * opacity — a 3D scene fighting a headline on a 390px screen loses. */}
        <div className="absolute inset-0 opacity-45 md:left-[34%] md:opacity-100">
          <StageMount accent="#ccff00" />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, var(--color-black) 4%, color-mix(in srgb, var(--color-black) 62%, transparent) 34%, transparent 60%)",
          }}
        />

        <div className="relative mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-[var(--sp-max)] flex-col justify-between px-[var(--sp-gutter)] py-10">
          <div className="sp-rise">
            <p className="sp-label text-[0.625rem]">
              {SITE.name} — SYNTHETIC TALENT HOUSE
              <span className="sp-cjk ml-3 text-ash">合成演员工厂</span>
            </p>

            <h1 className="sp-mega mt-7 text-[clamp(2.25rem,7.4vw,7.5rem)] text-bone">
              WE DO NOT
              <br />
              CAST ACTORS.
              <br />
              <span className="text-acid">WE BUILD THEM.</span>
            </h1>

            <p className="sp-cjk mt-7 max-w-lg text-[0.8125rem] leading-[1.85] text-smoke">
              我们不找演员，我们造演员。
              <br />
              每一个都有编号、版本号、表情组和可授权的表演区间——
              <br />
              像一件工业制品，不像一次侥幸。
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/actors"
                className="sp-label border border-acid bg-acid px-6 py-3.5 text-[0.6875rem] text-black transition-colors hover:bg-transparent hover:text-acid"
              >
                VIEW ROSTER 看名册
              </Link>
              <Link
                href="/casting"
                className="sp-label border border-[var(--sp-hairline)] px-6 py-3.5 text-[0.6875rem] text-bone transition-colors hover:border-bone"
              >
                BOOK TALENT 合作
              </Link>
            </div>

            <dl className="flex gap-8">
              <div>
                <dt className="sp-label text-[0.5rem] text-ash">ON ROSTER</dt>
                <dd className="sp-display text-3xl leading-none text-bone">
                  {String(ACTORS.length).padStart(2, "0")}
                </dd>
              </div>
              <div>
                <dt className="sp-label text-[0.5rem] text-ash">CASTABLE</dt>
                <dd className="sp-display text-3xl leading-none text-acid">
                  {String(castable.length).padStart(2, "0")}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <Marquee
        items={[
          "ORIGINAL SYNTHETIC TALENT",
          "原创 AI 演员",
          "FULL CHARACTER SPECIFICATION",
          "完整人设规格",
          "LICENSABLE PERFORMANCE",
          "可授权表演",
          "BUILT IN-HOUSE",
          "自建，不外购",
        ]}
      />

      {/* ============================ ROSTER ============================ */}
      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
        <SectionHead
          index="01"
          label="ROSTER"
          labelCn="名册"
          title="THE PEOPLE WE MADE"
          note="每个人都有编号和版本号。版本号不是装饰——它是这个角色被推翻重做过几次。没有定妆板的，我们就明着说没有。"
        />

        <div className="mt-12 grid gap-px sm:grid-cols-2 lg:grid-cols-4">
          {ACTORS.map((actor, i) => (
            <ActorCard key={actor.slug} actor={actor} index={i} />
          ))}
        </div>
      </section>

      {/* ============================ METHOD ============================ */}
      <section className="border-y border-[var(--sp-hairline)] bg-carbon">
        <div className="sp-blueprint mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
          <SectionHead
            index="02"
            label="METHOD"
            labelCn="方法"
            title="HOW AN ACTOR GETS BUILT"
            note="这不是「用 AI 生成一张图」。这是一条会返工、会推翻、会淘汰的产线。"
          />

          <ol className="relative mt-12 grid gap-px bg-[var(--sp-hairline)] md:grid-cols-4">
            {PIPELINE.map((p) => (
              <li key={p.step} className="sp-crosshair bg-carbon p-6">
                <span className="sp-display text-5xl leading-none text-ash">{p.step}</span>
                <h3 className="sp-display mt-6 text-lg text-bone">{p.en}</h3>
                <p className="sp-cjk mt-1 text-xs text-acid">{p.cn}</p>
                <p className="sp-cjk mt-4 text-xs leading-[1.9] text-smoke">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================ WORKS ============================ */}
      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
        <SectionHead
          index="03"
          label="WORKS"
          labelCn="作品"
          title="IN PRODUCTION"
          note="第一批片子还在做。这里不会摆假数据、假客户和假播放量——上线一条，挂一条。"
        />

        <div className="mt-12 border border-[var(--sp-hairline)] p-8 md:p-14">
          <p className="sp-label text-[0.5625rem] text-acid">
            <span className="sp-blink">▊</span> SLATE 01 — SHOOTING
          </p>
          <h3 className="sp-display mt-6 text-[clamp(1.75rem,5vw,3.5rem)] text-bone">
            THE ENGLISH TEACHER
          </h3>
          <p className="sp-cjk mt-2 text-lg text-smoke">《我是他英语老师》</p>
          <p className="sp-cjk mt-8 max-w-2xl text-sm leading-[1.95] text-smoke">
            一个把「我不骗人」看得很重的人，为了保住一个刚刚还想揍他的男人在母亲面前的最后一点体面，
            第一次撒了谎。结果这个谎逼着两个烂人真的开始学英语。
          </p>
          <p className="sp-cjk mt-6 max-w-2xl text-xs leading-[1.9] text-ash">
            荒诞江湖喜剧 · 单集 3–5 分钟 · 主演 SP-03 戴尔（研发中）
          </p>
          <Link
            href="/works"
            className="sp-label mt-10 inline-block border border-[var(--sp-hairline)] px-6 py-3.5 text-[0.6875rem] text-bone transition-colors hover:border-acid hover:text-acid"
          >
            SEE THE SLATE 看片单
          </Link>
        </div>
      </section>

      {/* ============================ CASTING ============================ */}
      <section className="border-t border-[var(--sp-hairline)] bg-void">
        <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)] text-center">
          <p className="sp-label text-[0.625rem]">CASTING 合作</p>
          <h2 className="sp-mega mt-8 text-[clamp(2.5rem,10vw,10rem)] text-bone">
            USE OUR
            <br />
            <span className="text-acid">ACTORS.</span>
          </h2>
          <p className="sp-cjk mx-auto mt-8 max-w-xl text-sm leading-[1.95] text-smoke">
            授权出演、定制专属演员、联合出品——三条路都开着。
            <br />
            带上你的片子、你的品牌，或者只带一个想法。
          </p>
          <Link
            href="/casting"
            className="sp-label mt-12 inline-block border border-acid bg-acid px-10 py-4 text-[0.6875rem] text-black transition-colors hover:bg-transparent hover:text-acid"
          >
            START A CONVERSATION 谈谈
          </Link>
        </div>
      </section>
    </>
  );
}
