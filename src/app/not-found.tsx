import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[70svh] max-w-[var(--sp-max)] place-items-center px-[var(--sp-gutter)] pt-32 text-center">
      <div>
        <p className="sp-label text-[0.625rem]">404 — NO SUCH TALENT</p>
        <h1 className="sp-mega mt-6 text-[clamp(3rem,14vw,12rem)] text-bone">
          NOT ON
          <br />
          <span className="text-acid">THE ROSTER.</span>
        </h1>
        <p className="sp-cjk mt-8 text-sm text-smoke">这个人不在名册上。也许还没造出来。</p>
        <Link
          href="/actors"
          className="sp-label mt-10 inline-block border border-acid px-8 py-4 text-[0.6875rem] text-acid transition-colors hover:bg-acid hover:text-black"
        >
          BACK TO ROSTER 回名册
        </Link>
      </div>
    </div>
  );
}
