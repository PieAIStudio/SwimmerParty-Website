"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  GameButton,
  GameField,
  GameInput,
  GameSelect,
  GameSlider,
  GameTextArea,
  GameToast,
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
  LENSES,
  SHOTS,
  figureBand,
  applyLayout,
  applyBlocking,
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
  const [selected, setSelected] = useState("");
  const [storage, setStorage] = useState<"saved" | "storageUnavailable" | null>(null);
  const [exporter, setExporter] = useState<ExportPicture | null>(null);
  const [busy, setBusy] = useState(false);
  const [limbs, setLimbs] = useState(false);
  const [notice, setNotice] = useState<"exported" | "failed" | null>(null);
  useEffect(() => {
    if (notice !== "exported") return;
    const timer = setTimeout(() => setNotice(null), 2000);
    return () => clearTimeout(timer);
  }, [notice]);
  const start = useCallback((value: SceneState) => {
    setHistory({ value, past: [], future: [] });
    setSelected(
      value.figures.find((item) => item.id === value.camera.subject)?.id ?? value.figures[0].id,
    );
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
      if (saved && (!requested || saved.castKey === requested)) start(saved);
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
    (camera: CameraState, record = true) => {
      if (record) change((value) => ({ ...value, camera }));
      else
        setHistory((current) =>
          current ? { ...current, value: { ...current.value, camera } } : current,
        );
    },
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
  const currentFigures = history?.value.figures;
  const identities = useMemo(
    () =>
      (currentFigures ?? []).map((item, index) => {
        const name =
          actors.find((actor) => actor.slug === item.actorSlug)?.name ??
          item.name ??
          t("scene.figure", { count: index + 1 });
        return { label: `${index + 1} · ${name}`, colour: figureBand(index).hex };
      }),
    [currentFigures, actors, t],
  );
  if (!history) return <output className="block py-12">{t("scene.loading")}</output>;
  const scene = history.value;
  const figure = scene.figures.find((item) => item.id === selected) ?? scene.figures[0];
  function patch(values: Partial<FigureState>) {
    change((value) => ({
      ...value,
      figures: value.figures.map((item) => (item.id === figure.id ? { ...item, ...values } : item)),
      camera: fitCamera(value.camera),
    }));
  }
  function fit(values: Partial<CameraState> = {}, frame = scene.frame) {
    change((value) => ({ ...value, frame, camera: fitCamera({ ...value.camera, ...values }) }));
  }
  function select(id: string) {
    setSelected(id);
    if (limbs) fit({ subject: id, shot: "medium", view: "eye" });
    else if (scene.camera.subject !== "everyone")
      fit({
        subject: id,
        view:
          scene.camera.view === "shoulder" && id !== scene.figures[1]?.id
            ? "eye"
            : scene.camera.view,
      });
  }
  function arrangeCurrent(arrangement: "line" | "faceOff") {
    change((value) => {
      const figures = arrange(value.figures, arrangement);
      return { ...value, figures, camera: fitCamera(value.camera) };
    });
  }
  const prompt = [
    t("scene.promptIntro"),
    ...scene.figures.map((item, index) => {
      const identity = {
        label: identities[index].label,
        colour: t(`scene.colour.${figureBand(index).colour}`),
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
    <div className="pb-8" data-scene-editor>
      <section className="mb-2" aria-label={t("scene.layouts")}>
        <h2 className="sp-small mb-2">{t("scene.layouts")}</h2>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" data-scene-layouts>
          {(["talk", "shoulder", "group", "lineup"] as const).map((layout) => (
            <GameButton
              key={layout}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => {
                change((value) => applyBlocking(value, layout));
                setSelected("");
              }}
            >
              {t(`scene.layout.${layout}`)}
            </GameButton>
          ))}
        </div>
      </section>
      <div className="mb-2 flex flex-wrap items-center gap-2" data-scene-actions>
        <div className="flex items-center gap-2">
          <GameButton
            variant="primary"
            size="sm"
            disabled={!exporter || scene.camera.fit}
            pending={busy}
            onClick={() => void exportPicture()}
          >
            {t("scene.savePng")}
          </GameButton>
          <GameButton
            size="sm"
            disabled={scene.camera.fit}
            onClick={() =>
              saveBlob(
                new Blob([JSON.stringify(scene, null, 2)], { type: "application/json" }),
                "swimmer-party-scene.json",
              )
            }
          >
            {t("scene.saveScene")}
          </GameButton>
        </div>
        <div className="flex items-center gap-2">
          <GameButton size="sm" disabled={!history.past.length} onClick={() => undo()}>
            {t("scene.undo")}
          </GameButton>
          <GameButton size="sm" disabled={!history.future.length} onClick={() => undo(true)}>
            {t("scene.redo")}
          </GameButton>
          <GameButton
            size="sm"
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
      </div>
      <output className="sr-only" aria-live="polite">
        {storage ? t(`scene.${storage}`) : t("scene.loading")}
      </output>
      <div className="sp-scene-workbench grid items-start gap-4">
        <div className="min-w-0" data-scene-workspace>
          <details className="mb-2" data-scene-camera-panel>
            <summary className="sp-small py-1 lg:py-0">
              {t("scene.camera")} · {t(`scene.shot.${scene.camera.shot}`)} · {scene.camera.lens} mm
            </summary>
            <div className="my-2 grid grid-cols-2 gap-3">
              <GameField label={t("scene.frame")}>
                <GameSelect
                  aria-label={t("scene.frame")}
                  value={scene.frame}
                  onChange={(event) => fit({}, event.target.value as Frame)}
                >
                  <option value="landscape">16:9</option>
                  <option value="portrait">9:16</option>
                  <option value="square">1:1</option>
                </GameSelect>
              </GameField>
              <GameField label={t("scene.subject")}>
                <GameSelect
                  aria-label={t("scene.subject")}
                  value={scene.camera.subject === "everyone" ? "everyone" : "selected"}
                  onChange={(event) =>
                    fit({
                      subject: event.target.value === "everyone" ? "everyone" : figure.id,
                      view: scene.camera.view === "shoulder" ? "eye" : scene.camera.view,
                    })
                  }
                >
                  <option value="everyone">{t("scene.everyone")}</option>
                  <option value="selected">{t("scene.selected")}</option>
                </GameSelect>
              </GameField>
            </div>
            <div className="mb-3 space-y-2" data-scene-camera>
              <fieldset className="flex flex-wrap items-center gap-2" aria-label={t("scene.shot")}>
                <span className="sp-small mr-1">{t("scene.shot")}</span>
                {SHOTS.map((shot) => (
                  <GameButton
                    key={shot}
                    size="sm"
                    aria-pressed={scene.camera.shot === shot}
                    variant={scene.camera.shot === shot ? "secondary" : "ghost"}
                    onClick={() => fit({ shot })}
                  >
                    {t(`scene.shot.${shot}`)}
                  </GameButton>
                ))}
              </fieldset>
              <fieldset
                className="flex flex-wrap items-center gap-2"
                aria-label={t("scene.camera")}
              >
                <span className="sp-small mr-1">{t("scene.camera")}</span>
                {VIEWS.map((view) => (
                  <GameButton
                    key={view}
                    size="sm"
                    disabled={view === "shoulder" && scene.figures.length < 2}
                    aria-pressed={scene.camera.view === view}
                    variant={scene.camera.view === view ? "secondary" : "ghost"}
                    onClick={() => {
                      if (view === "shoulder") setSelected(scene.figures[1].id);
                      fit({
                        view,
                        ...(view === "shoulder" ? { subject: scene.figures[1].id } : {}),
                      });
                    }}
                  >
                    {t(`scene.view.${view}`)}
                  </GameButton>
                ))}
              </fieldset>
              <fieldset className="flex flex-wrap items-center gap-2" aria-label={t("scene.lens")}>
                <span className="sp-small mr-1">{t("scene.lens")}</span>
                {LENSES.map((lens) => (
                  <GameButton
                    key={lens}
                    size="sm"
                    aria-pressed={scene.camera.lens === lens}
                    variant={scene.camera.lens === lens ? "secondary" : "ghost"}
                    onClick={() => fit({ lens })}
                  >
                    {lens} mm
                  </GameButton>
                ))}
                <GameButton size="sm" onClick={() => fit()}>
                  {t("scene.fit")}
                </GameButton>
              </fieldset>
            </div>
          </details>
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
                limbs={limbs}
                onPose={(id, joints) =>
                  change((value) => ({
                    ...value,
                    figures: value.figures.map((item) =>
                      item.id === id ? { ...item, joints } : item,
                    ),
                  }))
                }
                onSelect={select}
                onMove={move}
                onCameraChange={cameraChange}
                onReady={ready}
              />
            </CanvasBoundary>
            {notice || storage === "storageUnavailable" ? (
              <div
                className="pointer-events-none absolute bottom-3 left-1/2 z-10 max-w-[calc(100%-1.5rem)] -translate-x-1/2 whitespace-nowrap"
                data-scene-toast
              >
                <GameToast
                  tone={
                    notice === "failed" || storage === "storageUnavailable" ? "danger" : "success"
                  }
                >
                  {t(`scene.${notice ?? "storageUnavailable"}`)}
                </GameToast>
              </div>
            ) : null}
          </div>
          <div className="sp-scene-quick mt-3" data-scene-quick>
            <GameField label={t("scene.figures")}>
              <GameSelect
                aria-label={t("scene.figures")}
                value={figure.id}
                onChange={(event) => select(event.target.value)}
              >
                {scene.figures.map((item, index) => (
                  <option key={item.id} value={item.id}>
                    {identities[index].label}
                  </option>
                ))}
              </GameSelect>
            </GameField>
            <GameField label={t("scene.pose")}>
              <GameSelect
                aria-label={t("scene.pose")}
                value={figure.pose}
                onChange={(event) =>
                  patch({ pose: event.target.value as FigureState["pose"], joints: {} })
                }
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
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2" data-scene-pose-tools>
            <GameButton
              size="sm"
              aria-pressed={limbs}
              onClick={() => {
                if (!limbs) fit({ subject: figure.id, shot: "medium", view: "eye" });
                setLimbs(!limbs);
              }}
            >
              {t("scene.limbs")}
            </GameButton>
            <span className="sp-small text-muted-foreground lg:sr-only">{t("scene.limbHint")}</span>
            <p
              className="sp-small basis-full text-muted-foreground lg:basis-auto"
              data-scene-bottom
            >
              {t("scene.approximate")}
            </p>
          </div>
          <details className="mt-3">
            <summary className="sp-small">{t("scene.gesturesTitle")}</summary>
            <p className="sp-small mt-3 flex flex-wrap gap-x-4 gap-y-1" data-scene-key>
              {identities.map((identity, index) => (
                <span
                  key={identity.label}
                  className={
                    scene.camera.subject === scene.figures[index].id ? "font-bold" : undefined
                  }
                >
                  {identity.label} ({t(`scene.colour.${figureBand(index).colour}`)})
                </span>
              ))}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <GameButton onClick={() => arrangeCurrent("line")}>{t("scene.line")}</GameButton>
              <GameButton onClick={() => arrangeCurrent("faceOff")}>
                {t("scene.faceOff")}
              </GameButton>
            </div>
            <p className="sp-small mt-4 text-muted-foreground">{t("scene.gestures")}</p>
          </details>
        </div>
        <aside className="min-w-0" aria-label={t("scene.figures")}>
          <details className="sp-card bg-card" data-scene-inspector>
            <summary className="sp-small">{t("scene.fineTune")}</summary>
            <h2 className="sp-subtitle">
              {t("scene.figures")} · {scene.figures.length}
            </h2>
            <div className="my-4 flex flex-wrap gap-2" data-scene-figures>
              {scene.figures.map((item, index) => (
                <GameButton
                  key={item.id}
                  size="sm"
                  aria-pressed={item.id === figure.id}
                  variant={item.id === figure.id ? "secondary" : "ghost"}
                  onClick={() => select(item.id)}
                >
                  {identities[index].label}
                </GameButton>
              ))}
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              <GameButton
                size="sm"
                onClick={() => {
                  const next = makeFigure(crypto.randomUUID());
                  next.x = Math.max(...scene.figures.map((item) => item.x)) + 1.1;
                  change((value) => ({
                    ...value,
                    figures: [...value.figures, next],
                    camera: fitCamera({ ...value.camera, subject: "everyone" }),
                  }));
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
                    camera: fitCamera({
                      ...value.camera,
                      subject: "everyone",
                      view: value.camera.view === "shoulder" ? "eye" : value.camera.view,
                    }),
                  }));
                  setSelected(scene.figures.find((item) => item.id !== figure.id)!.id);
                }}
              >
                {t("scene.remove")}
              </GameButton>
            </div>
            {scene.figures.length > 8 ? (
              <p className="sp-small mb-5 text-muted-foreground">{t("scene.performance")}</p>
            ) : null}
            <div className="mb-4">
              <GameButton
                size="sm"
                onClick={() =>
                  change((value) => ({
                    ...value,
                    figures: applyLayout(value.figures, "triangle"),
                    camera: fitCamera(),
                  }))
                }
              >
                {t("scene.layout.triangle")}
              </GameButton>
            </div>
            <div className="space-y-5">
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
                      step={0.1}
                      value={Number(figure[axis].toFixed(2))}
                      onChange={(event) => {
                        const number = event.target.valueAsNumber;
                        if (Number.isFinite(number)) patch({ [axis]: number });
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
          </details>
        </aside>
      </div>
      <details className="mt-4">
        <summary className="sp-small">{t("scene.actorReferences")}</summary>
        <p className="sp-small mt-3 text-muted-foreground">{t("scene.intro")}</p>
        <section className="sp-card mt-3 bg-card" data-scene-prompt>
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
      </details>
      <SettingCards
        draft={scene.setting}
        onChange={(setting) => change((value) => ({ ...value, setting }))}
      />
    </div>
  );
}
