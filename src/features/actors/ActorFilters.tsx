"use client";
import { useMemo, useState } from "react";
import { useSiteI18n, useSiteLocale } from "@/i18n/client";
import type { Actor } from "@/content/actors";
import { ActorCardClient } from "./ActorCardClient";
import { GameButton, GameSegmentedControl, GameSelect } from "@pieai/swimmer-ui-kit";
import { VoteButton } from "@/features/community";
import { CastAddButton } from "@/features/cast";
export function ActorFilters({ actors }: { actors: Actor[] }) {
  const { t } = useSiteI18n();
  const locale = useSiteLocale();
  const [q, setQ] = useState("");
  const [gender, setGender] = useState("all");
  const [age, setAge] = useState("all");
  const [language, setLanguage] = useState("all");
  const filtered = useMemo(
    () =>
      actors.filter((a) => {
        const query = q.trim().toLowerCase();
        const name =
          !query ||
          a.nameCn.toLowerCase().includes(query) ||
          a.nameEn.toLowerCase().includes(query) ||
          a.slug.includes(query);
        const g = gender === "all" || a.gender === gender;
        const ag =
          age === "all" ||
          (age === "under30"
            ? a.age < 30
            : age === "30to45"
              ? a.age >= 30 && a.age <= 45
              : a.age > 45);
        const l = language === "all" || a.voiceLanguage === language;
        return name && g && ag && l;
      }),
    [actors, age, gender, language, q],
  );
  const clear = () => {
    setQ("");
    setGender("all");
    setAge("all");
    setLanguage("all");
  };
  const groups = [
    [t("roster.castableTitle"), filtered.filter((a) => a.status === "active")],
    [t("roster.newFacesTitle"), filtered.filter((a) => a.status === "new-face")],
    [t("roster.buildingTitle"), filtered.filter((a) => a.status === "in-development")],
  ] as const;
  return (
    <>
      <section className="sp-card bg-card" aria-label={t("roster.filters")}>
        <label className="sp-label" htmlFor="actor-search">
          {t("roster.search")}
        </label>
        <input
          id="actor-search"
          className="mt-3 w-full rounded-[var(--game-ui-radius-control)] border border-border bg-background px-4 py-3"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("roster.search")}
        />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <GameSegmentedControl
            label={t("roster.gender")}
            activeId={gender}
            onSelect={setGender}
            options={[
              { id: "all", label: locale === "zh" ? "全部" : "All" },
              { id: "female", label: locale === "zh" ? "女" : "Women" },
              { id: "male", label: locale === "zh" ? "男" : "Men" },
            ]}
          />
          <div>
            <label className="sp-label" htmlFor="actor-age">
              {t("roster.age")}
            </label>
            <GameSelect
              id="actor-age"
              className="mt-2 w-full"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            >
              <option value="all">{locale === "zh" ? "全部" : "All"}</option>
              <option value="under30">{locale === "zh" ? "30 岁以下" : "Under 30"}</option>
              <option value="30to45">30–45</option>
              <option value="over45">{locale === "zh" ? "45 岁以上" : "Over 45"}</option>
            </GameSelect>
          </div>
          <div>
            <label className="sp-label" htmlFor="actor-language">
              {t("roster.language")}
            </label>
            <GameSelect
              id="actor-language"
              className="mt-2 w-full"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="all">{locale === "zh" ? "全部" : "All"}</option>
              <option value="en">{locale === "zh" ? "英语" : "English"}</option>
              <option value="zh">{locale === "zh" ? "中文" : "Chinese"}</option>
            </GameSelect>
          </div>
        </div>
        {q || gender !== "all" || age !== "all" || language !== "all" ? (
          <GameButton className="mt-4" onClick={clear}>
            {t("roster.clear")}
          </GameButton>
        ) : null}
      </section>
      {filtered.length ? (
        groups.map(([title, group]) =>
          group.length ? (
            <section className="sp-section" key={title}>
              <h2 className="sp-title">{title}</h2>
              <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {group.map((actor) => (
                  <div key={actor.slug}>
                    <ActorCardClient actor={actor} />
                    {actor.status === "new-face" ? (
                      <VoteButton
                        slug={actor.slug}
                        name={locale === "zh" ? actor.nameCn : actor.nameEn}
                        locale={locale}
                      />
                    ) : null}
                    <CastAddButton
                      slug={actor.slug}
                      locale={locale}
                      name={locale === "zh" ? actor.nameCn : actor.nameEn}
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null,
        )
      ) : (
        <section className="sp-section">
          <p className="sp-lead">{t("roster.noResults")}</p>
          <GameButton className="mt-5" onClick={clear}>
            {t("roster.clear")}
          </GameButton>
        </section>
      )}
    </>
  );
}
