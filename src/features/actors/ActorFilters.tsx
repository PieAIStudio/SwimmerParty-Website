"use client";
import { useMemo, useSyncExternalStore } from "react";
import { useSiteI18n, useSiteLocale } from "@/i18n/client";
import type { Actor } from "@/content/actors";
import { ActorCardClient } from "./ActorCardClient";
import { GameButton, GameCheckbox, GameInput, GameSelect } from "@pieai/swimmer-ui-kit";
import { VoteButton, useCommunityAccess } from "@/features/community/client";
import { CastAddButton } from "@/features/cast/client";
import {
  actorFilterSearch,
  DEFAULT_ACTOR_FILTERS,
  filterActors,
  readActorFilters,
  type ActorFacets,
  type ActorFilterState,
} from "./discovery";

const FILTER_EVENT = "sp-actor-filter-change";
function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(FILTER_EVENT, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(FILTER_EVENT, callback);
  };
}
export function ActorFilters({
  actors,
  facets,
  initialSearch,
}: {
  actors: Actor[];
  facets: Record<string, ActorFacets>;
  initialSearch: string;
}) {
  const { t } = useSiteI18n();
  const locale = useSiteLocale();
  const community = useCommunityAccess();
  const origins = useMemo(
    () =>
      [
        ...new Map(
          Object.values(facets)
            .filter((facet) => facet.origin.en)
            .map((facet) => [facet.origin.en, facet.origin]),
        ).values(),
      ].sort((a, b) => a.en.localeCompare(b.en)),
    [facets],
  );
  const raw = useSyncExternalStore(
    subscribe,
    () => location.search,
    () => initialSearch,
  );
  const filters = useMemo(
    () =>
      readActorFilters(
        raw,
        origins.map((origin) => origin.en),
      ),
    [raw, origins],
  );
  const filtered = useMemo(() => filterActors(actors, facets, filters), [actors, facets, filters]);
  function save(next: ActorFilterState, replace = false) {
    const url = new URL(location.href);
    url.search = actorFilterSearch(next, url.search);
    if (url.href === location.href) return;
    if (replace) history.replaceState(history.state, "", url);
    else history.pushState(history.state, "", url);
    window.dispatchEvent(new Event(FILTER_EVENT));
  }
  function change<K extends keyof ActorFilterState>(key: K, value: ActorFilterState[K]) {
    save(
      {
        ...readActorFilters(
          location.search,
          origins.map((origin) => origin.en),
        ),
        [key]: value,
      },
      key === "q" || key === "look",
    );
  }
  const clear = () => save(DEFAULT_ACTOR_FILTERS);
  const active = Object.keys(DEFAULT_ACTOR_FILTERS).some(
    (key) =>
      filters[key as keyof ActorFilterState] !==
      DEFAULT_ACTOR_FILTERS[key as keyof ActorFilterState],
  );
  const groups = [
    ["active", t("roster.castableTitle"), filtered.filter((a) => a.status === "active")],
    ["new-face", t("roster.newFacesTitle"), filtered.filter((a) => a.status === "new-face")],
    [
      "in-development",
      t("roster.buildingTitle"),
      filtered.filter((a) => a.status !== "active" && a.status !== "new-face"),
    ],
  ] as const;
  return (
    <>
      <section
        data-actor-filters
        className="rounded-[var(--game-ui-radius-card)] bg-card p-4 sm:p-6"
        aria-label={t("roster.filters")}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1" htmlFor="actor-search">
            <span className="sp-label">{t("roster.search")}</span>
            <GameInput
              id="actor-search"
              type="search"
              className="min-w-0 w-full"
              value={filters.q}
              maxLength={120}
              onChange={(e) => change("q", e.target.value)}
            />
          </label>
          <label className="grid gap-1" htmlFor="actor-look">
            <span className="sp-label">{t("roster.appearance")}</span>
            <GameInput
              id="actor-look"
              type="search"
              className="min-w-0 w-full"
              value={filters.look}
              maxLength={120}
              onChange={(e) => change("look", e.target.value)}
            />
          </label>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
          <label className="grid min-w-0 gap-1" htmlFor="actor-gender">
            <span className="sp-label">{t("roster.gender")}</span>
            <GameSelect
              id="actor-gender"
              value={filters.gender}
              onChange={(e) => change("gender", e.target.value)}
            >
              <option value="all">{t("roster.filters.all")}</option>
              <option value="female">{t("roster.filters.women")}</option>
              <option value="male">{t("roster.filters.men")}</option>
            </GameSelect>
          </label>
          <label className="grid min-w-0 gap-1" htmlFor="actor-age">
            <span className="sp-label">{t("roster.age")}</span>
            <GameSelect
              id="actor-age"
              value={filters.age}
              onChange={(e) => change("age", e.target.value)}
            >
              <option value="all">{t("roster.filters.all")}</option>
              <option value="under30">{t("roster.filters.under30")}</option>
              <option value="30to45">30–45</option>
              <option value="over45">{t("roster.filters.over45")}</option>
            </GameSelect>
          </label>
          <label className="grid min-w-0 gap-1" htmlFor="actor-language">
            <span className="sp-label">{t("roster.language")}</span>
            <GameSelect
              id="actor-language"
              value={filters.language}
              onChange={(e) => change("language", e.target.value)}
            >
              <option value="all">{t("roster.filters.all")}</option>
              <option value="en">{t("roster.filters.english")}</option>
              <option value="zh">{t("roster.filters.chinese")}</option>
            </GameSelect>
          </label>
          <label className="grid min-w-0 gap-1" htmlFor="actor-origin">
            <span className="sp-label">{t("roster.origin")}</span>
            <GameSelect
              id="actor-origin"
              value={filters.origin}
              onChange={(e) => change("origin", e.target.value)}
            >
              <option value="all">{t("roster.filters.all")}</option>
              {origins.map((origin) => (
                <option key={origin.en} value={origin.en}>
                  {origin[locale]}
                </option>
              ))}
            </GameSelect>
          </label>
          <label className="grid min-w-0 gap-1" htmlFor="actor-role">
            <span className="sp-label">{t("roster.role")}</span>
            <GameSelect
              id="actor-role"
              value={filters.role}
              onChange={(e) => change("role", e.target.value)}
            >
              <option value="all">{t("roster.filters.all")}</option>
              {(["comedy", "boss", "villain", "crew"] as const).map((role) => (
                <option key={role} value={role}>
                  {t(`roster.role.${role}`)}
                </option>
              ))}
            </GameSelect>
          </label>
          <label className="grid min-w-0 gap-1" htmlFor="actor-height">
            <span className="sp-label">{t("roster.height")}</span>
            <GameSelect
              id="actor-height"
              value={filters.height}
              onChange={(e) => change("height", e.target.value)}
            >
              <option value="all">{t("roster.filters.all")}</option>
              <option value="under160">&lt;160 cm</option>
              <option value="160to179">160–179 cm</option>
              <option value="180plus">≥180 cm</option>
            </GameSelect>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <div id="actor-voice">
            <GameCheckbox
              label={t("roster.hasVoice")}
              checked={filters.voice}
              onChange={(e) => change("voice", e.target.checked)}
            />
          </div>
          <div id="actor-video">
            <GameCheckbox
              label={t("roster.hasVideo")}
              checked={filters.video}
              onChange={(e) => change("video", e.target.checked)}
            />
          </div>{" "}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <output className="sp-small">
            {t("roster.resultCount", { count: filtered.length })}
          </output>
          {active ? <GameButton onClick={clear}>{t("roster.clear")}</GameButton> : null}
        </div>
      </section>
      {filtered.length ? (
        groups.map(([status, title, group]) =>
          group.length ? (
            <section
              className="sp-section"
              data-discovery-group={status}
              id={status === "new-face" ? "new-faces" : undefined}
              key={status}
            >
              <h2 className="sp-title">{title}</h2>
              <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {group.map((actor) => (
                  <div
                    key={actor.slug}
                    data-discovery-card={actor.slug}
                    data-has-voice={facets[actor.slug]?.voice ?? false}
                    data-has-video={facets[actor.slug]?.video ?? false}
                  >
                    <ActorCardClient actor={actor} />
                    {community.visible && actor.status === "new-face" ? (
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
