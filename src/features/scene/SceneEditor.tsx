"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  GameButton,
  GameCheckbox,
  GameField,
  GameInput,
  GameSelect,
  GameSlider,
  GameTextArea,
} from "@pieai/swimmer-ui-kit";
import { SITE } from "@/content/site";
import { CopyButton } from "@/site/CopyButton";
import { useSiteI18n, useSiteLocale } from "@/i18n/client";
import { Link } from "@/i18n/navigation";
import { saveBlob } from "@/lib/browser-files";
import { SettingCards } from "@/features/settings";
import {
  BUILDS,
  DRAFT_KEY,
  FRAMES,
  FIGURE_BANDS,
  MAX_FIGURES,
  POSES,
  VIEWS,
  arrange,
  fitCamera,
  initialScene,
  makeFigure,
  readDraft,
  type CameraState,
  type FigureState,
  type Frame,
  type SceneActor,
  type SceneState,
} from "./model";
import type { ExportPicture } from "./canvas-contract";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });
class CanvasBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
type History = { value: SceneState; past: SceneState[]; future: SceneState[] };

export function SceneEditor({ actors }: { actors: SceneActor[] }) {
  const { t } = useSiteI18n();
  const locale = useSiteLocale();
  const [history, setHistory] = useState<History | null>(null);
  const [choose, setChoose] = useState<SceneActor[] | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [castKey, setCastKey] = useState("");
  const [selected, setSelected] = useState("");
  const [storage, setStorage] = useState<"saved" | "storageUnavailable" | null>(null);
  const [exporter, setExporter] = useState<ExportPicture | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<"exported" | "failed" | null>(null);
  const start = useCallback((value: SceneState) => {
    setHistory({ value, past: [], future: [] });
    setSelected(value.figures[0].id);
    setChoose(null);
  }, []);
  useEffect(() => {
    const requested = new URLSearchParams(location.search).get("a") ?? "";
    let saved: SceneState | null = null;
    try {
      saved = readDraft(localStorage.getItem(DRAFT_KEY));
    } catch {
      queueMicrotask(() => setStorage("storageUnavailable"));
    }
    const cast = actors.filter((actor) => requested.split(",").includes(actor.slug));
    queueMicrotask(() => {
      setCastKey(requested);
      if (saved && (!requested || saved.castKey === requested)) start(saved);
      else if (cast.length > MAX_FIGURES) setChoose(cast);
      else start(initialScene(cast, requested));
    });
  }, [actors, start]);
  useEffect(() => {
    if (!history) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(history.value));
      queueMicrotask(() => setStorage("saved"));
    } catch {
      queueMicrotask(() => setStorage("storageUnavailable"));
    }
  }, [history]);
  const change = useCallback((update: (value: SceneState) => SceneState) => {
    setHistory((current) => {
      if (!current) return current;
      const next = update(current.value);
      if (JSON.stringify(next) === JSON.stringify(current.value)) return current;
      return { value: next, past: [...current.past.slice(-29), current.value], future: [] };
    });
  }, []);
  const ready = useCallback((next: ExportPicture | null) => setExporter(() => next), []);
  const move = useCallback(
    (id: string, x: number, z: number) => {
      change((value) => ({
        ...value,
        figures: value.figures.map((figure) => (figure.id === id ? { ...figure, x, z } : figure)),
      }));
    },
    [change],
  );
  const cameraChange = useCallback(
    (camera: CameraState) => change((value) => ({ ...value, camera })),
    [change],
  );
  function undo(redo = false) {
    setHistory((current) => {
      if (!current) return current;
      const source = redo ? current.future : current.past;
      if (!source.length) return current;
      return redo
        ? { value: source[0], past: [...current.past, current.value], future: source.slice(1) }
        : {
            value: source[source.length - 1],
            past: source.slice(0, -1),
            future: [current.value, ...current.future],
          };
    });
  }
  async function exportPicture() {
    if (!exporter || !history || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const [width, height] = FRAMES[history.value.frame];
      saveBlob(await exporter(width, height), `swimmer-party-scene-${width}x${height}.png`);
      setNotice("exported");
    } catch {
      setNotice("failed");
    } finally {
      setBusy(false);
    }
  }
  const figures = history?.value.figures;
  const identities = useMemo(
    () =>
      (figures ?? []).map((item, index) => {
        const name =
          actors.find((actor) => actor.slug === item.actorSlug)?.name ??
          item.name ??
          t("scene.figure", { count: index + 1 });
        return { label: `${index + 1} · ${name}`, colour: FIGURE_BANDS[index].hex };
      }),
    [figures, actors, t],
  );
  if (choose)
    return (
      <section className="sp-card my-8 bg-card" data-scene-choose>
        <h2 className="sp-title">{t("scene.chooseFive")}</h2>
        <p className="mt-3">{t("scene.castUnchanged")}</p>
        <div className="my-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {choose.map((actor) => (
            <GameCheckbox
              key={actor.slug}
              label={actor.name}
              checked={chosen.includes(actor.slug)}
              disabled={chosen.length === MAX_FIGURES && !chosen.includes(actor.slug)}
              onChange={(checked) =>
                setChosen((previous) =>
                  checked
                    ? [...previous, actor.slug]
                    : previous.filter((slug) => slug !== actor.slug),
                )
              }
            />
          ))}
        </div>
        <GameButton
          disabled={!chosen.length}
          onClick={() =>
            start(
              initialScene(
                choose.filter((actor) => chosen.includes(actor.slug)),
                castKey,
              ),
            )
          }
        >
          {t("scene.start")}
        </GameButton>
      </section>
    );
  if (!history) return <output className="block py-12">{t("scene.loading")}</output>;
  const scene = history.value;
  const figure = scene.figures.find((item) => item.id === selected) ?? scene.figures[0];
  function patch(values: Partial<FigureState>) {
    change((value) => ({
      ...value,
      figures: value.figures.map((item) => (item.id === figure.id ? { ...item, ...values } : item)),
    }));
  }
  function fit(view = scene.camera.view, frame = scene.frame) {
    change((value) => ({ ...value, frame, camera: fitCamera(value.figures, frame, view) }));
  }
  function layout(arrangement: "line" | "faceOff") {
    change((value) => {
      const figures = arrange(value.figures, arrangement);
      return { ...value, figures, camera: fitCamera(figures, value.frame, value.camera.view) };
    });
  }
  const prompt = [
    t("scene.promptIntro"),
    ...scene.figures.map((item, index) => {
      const identity = {
        label: identities[index].label,
        colour: t(`scene.colour.${FIGURE_BANDS[index].colour}`),
      };
      return item.actorSlug
        ? t("scene.promptActor", {
            ...identity,
            url: `${SITE.url}/${locale}/actors/${item.actorSlug}/sheet`,
          })
        : t("scene.promptUnassigned", identity);
    }),
  ].join("\n");
  return (
    <div className="pb-16" data-scene-editor>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <GameButton
          variant="primary"
          disabled={!exporter}
          pending={busy}
          onClick={() => void exportPicture()}
        >
          {t("scene.savePng")}
        </GameButton>
        <GameButton disabled={!history.past.length} onClick={() => undo()}>
          {t("scene.undo")}
        </GameButton>
        <GameButton disabled={!history.future.length} onClick={() => undo(true)}>
          {t("scene.redo")}
        </GameButton>
        <GameButton
          onClick={() =>
            start(
              initialScene(
                scene.figures.flatMap((item) => {
                  const actor = actors.find((candidate) => candidate.slug === item.actorSlug);
                  return actor ? [actor] : [];
                }),
                scene.castKey,
              ),
            )
          }
        >
          {t("scene.reset")}
        </GameButton>
      </div>
      <output className="sp-small mb-4 block text-muted-foreground">
        {notice ? t(`scene.${notice}`) : storage ? t(`scene.${storage}`) : t("scene.loading")}
      </output>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 lg:sticky lg:top-20">
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <GameField label={t("scene.frame")}>
              <GameSelect
                aria-label={t("scene.frame")}
                value={scene.frame}
                onChange={(event) => fit(scene.camera.view, event.target.value as Frame)}
              >
                <option value="landscape">16:9</option>
                <option value="portrait">9:16</option>
                <option value="square">1:1</option>
              </GameSelect>
            </GameField>
            <GameField label={t("scene.camera")}>
              <GameSelect
                aria-label={t("scene.camera")}
                value={scene.camera.view}
                onChange={(event) => fit(event.target.value as CameraState["view"])}
              >
                {VIEWS.map((view) => (
                  <option key={view} value={view}>
                    {t(`scene.view.${view}`)}
                  </option>
                ))}
              </GameSelect>
            </GameField>
          </div>
          <div
            className="sp-scene-frame"
            data-scene-frame={scene.frame}
            style={{ aspectRatio: `${FRAMES[scene.frame][0]} / ${FRAMES[scene.frame][1]}` }}
          >
            <CanvasBoundary
              fallback={
                <p className="p-6" role="alert">
                  {t("scene.unavailable")}
                </p>
              }
            >
              <SceneCanvas
                scene={scene}
                identities={identities}
                selected={figure.id}
                onSelect={setSelected}
                onMove={move}
                onCameraChange={cameraChange}
                onReady={ready}
              />
            </CanvasBoundary>
          </div>
          <p className="sp-small mt-3 flex flex-wrap gap-x-4 gap-y-1" data-scene-key>
            {identities.map((identity, index) => (
              <span key={identity.label}>
                {identity.label} ({t(`scene.colour.${FIGURE_BANDS[index].colour}`)})
              </span>
            ))}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <GameButton onClick={() => fit()}>{t("scene.fit")}</GameButton>
            <GameButton onClick={() => layout("line")}>{t("scene.line")}</GameButton>
            <GameButton onClick={() => layout("faceOff")}>{t("scene.faceOff")}</GameButton>
          </div>
          <p className="sp-small mt-4 text-muted-foreground">{t("scene.gestures")}</p>
        </div>
        <aside className="sp-card min-w-0 bg-card" aria-label={t("scene.figures")}>
          <h2 className="sp-subtitle">
            {t("scene.figures")} · {scene.figures.length}/{MAX_FIGURES}
          </h2>
          <div className="my-4 flex flex-wrap gap-2" data-scene-figures>
            {scene.figures.map((item, index) => (
              <GameButton
                key={item.id}
                size="sm"
                aria-pressed={item.id === figure.id}
                variant={item.id === figure.id ? "secondary" : "ghost"}
                onClick={() => setSelected(item.id)}
              >
                {identities[index].label}
              </GameButton>
            ))}
          </div>
          <div className="mb-5 flex flex-wrap gap-2">
            <GameButton
              size="sm"
              disabled={scene.figures.length >= MAX_FIGURES}
              onClick={() => {
                const next = makeFigure(crypto.randomUUID());
                next.x = Math.min(5, Math.max(...scene.figures.map((item) => item.x)) + 1);
                change((value) => ({ ...value, figures: [...value.figures, next] }));
                setSelected(next.id);
              }}
            >
              {t("scene.add")}
            </GameButton>
            <GameButton
              size="sm"
              disabled={scene.figures.length <= 1}
              onClick={() => {
                change((value) => ({
                  ...value,
                  figures: value.figures.filter((item) => item.id !== figure.id),
                }));
                setSelected(scene.figures.find((item) => item.id !== figure.id)!.id);
              }}
            >
              {t("scene.remove")}
            </GameButton>
          </div>
          <div className="space-y-5">
            <GameField label={t("scene.pose")}>
              <GameSelect
                aria-label={t("scene.pose")}
                value={figure.pose}
                onChange={(event) => patch({ pose: event.target.value as FigureState["pose"] })}
              >
                {POSES.map((pose) => (
                  <option key={pose} value={pose}>
                    {t(`scene.pose.${pose}`)}
                  </option>
                ))}
              </GameSelect>
            </GameField>
            <GameField label={t("scene.build")}>
              <GameSelect
                aria-label={t("scene.build")}
                value={figure.build}
                onChange={(event) => patch({ build: event.target.value as FigureState["build"] })}
              >
                {BUILDS.map((build) => (
                  <option key={build} value={build}>
                    {t(`scene.build.${build}`)}
                  </option>
                ))}
              </GameSelect>
            </GameField>
            <GameSlider
              label={`${t("scene.height")} · ${figure.heightCm} cm`}
              min={80}
              max={240}
              step={1}
              value={figure.heightCm}
              onChange={(heightCm) => patch({ heightCm })}
            />
            <GameSlider
              label={`${t("scene.turn")} · ${figure.turn}°`}
              min={-180}
              max={180}
              step={5}
              value={figure.turn}
              onChange={(turn) => patch({ turn })}
            />
            <div className="grid grid-cols-2 gap-3">
              {(["x", "z"] as const).map((axis) => (
                <GameField key={axis} label={t(`scene.axis.${axis}`)}>
                  <GameInput
                    type="number"
                    aria-label={t(`scene.axis.${axis}`)}
                    min={-5}
                    max={5}
                    step={0.1}
                    value={Number(figure[axis].toFixed(2))}
                    onChange={(event) => {
                      const number = event.target.valueAsNumber;
                      if (Number.isFinite(number))
                        patch({ [axis]: Math.max(-5, Math.min(5, number)) });
                    }}
                  />
                </GameField>
              ))}
            </div>
          </div>
          {figure.actorSlug ? (
            <Link href={`/actors/${figure.actorSlug}/sheet`} className="sp-link mt-5">
              {t("scene.actorReferences")}
            </Link>
          ) : null}
          <p className="sp-small mt-5 text-muted-foreground">{t("scene.approximate")}</p>
        </aside>
      </div>
      <section className="sp-card mt-6 bg-card" data-scene-prompt>
        <GameField label={t("scene.prompt")}>
          <GameTextArea aria-label={t("scene.prompt")} rows={5} readOnly value={prompt} />
        </GameField>
        <div className="mt-4">
          <CopyButton
            key={prompt}
            text={prompt}
            label={t("scene.copyPrompt")}
            copiedLabel={t("scene.promptCopied")}
          />
        </div>
      </section>
      <SettingCards
        draft={scene.setting}
        onChange={(setting) => change((value) => ({ ...value, setting }))}
      />
    </div>
  );
}
