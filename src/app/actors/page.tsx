import type { Metadata } from "next";
import { ActorCard } from "@/components/ActorCard";
import { SectionHead } from "@/components/SectionHead";
import { ACTORS } from "@/content/actors";

export const metadata: Metadata = {
  title: "演员名册 / Roster",
  description: "SWIMMER PARTY 全部原创 AI 演员名册，含编号、版本、规格与可出演状态。",
};

export default function ActorsPage() {
  const castable = ACTORS.filter((a) => a.status === "active");
  const building = ACTORS.filter((a) => a.status !== "active");

  return (
    <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] pt-32 pb-[var(--sp-section)]">
      <p className="sp-label text-[0.625rem]">ROSTER — 演员名册</p>
      <h1 className="sp-mega mt-6 text-[clamp(2.75rem,11vw,10rem)] text-bone">
        THE
        <br />
        <span className="text-acid">ROSTER.</span>
      </h1>
      <p className="sp-cjk mt-8 max-w-2xl text-sm leading-[1.95] text-smoke">
        编号是身份，版本号是履历。
        <br />
        {castable.length} 位可直接出演，{building.length} 位还在产线上——我们不把在建的说成建好的。
      </p>

      <div className="mt-20">
        <SectionHead index="A" label="CASTABLE" labelCn="可出演" title="READY TO WORK" />
        <div className="mt-10 grid gap-px bg-[var(--sp-hairline)] sm:grid-cols-2 lg:grid-cols-4">
          {castable.map((actor, i) => (
            <ActorCard key={actor.slug} actor={actor} index={i} />
          ))}
        </div>
      </div>

      <div className="mt-24">
        <SectionHead
          index="B"
          label="IN DEVELOPMENT"
          labelCn="研发中"
          title="ON THE LINE"
          note="人设已定，白膜阶段。定妆板交付后自动转入可出演。"
        />
        <div className="mt-10 grid gap-px bg-[var(--sp-hairline)] sm:grid-cols-2 lg:grid-cols-4">
          {building.map((actor, i) => (
            <ActorCard key={actor.slug} actor={actor} index={castable.length + i} />
          ))}
        </div>
      </div>
    </div>
  );
}
