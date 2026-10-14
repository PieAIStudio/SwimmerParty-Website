"use client";
import { AudioPreview } from "./AudioPreview";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  GameBadge,
  GameButton,
  GameCheckbox,
  GameField,
  GameInput,
  GameProgress,
  GameSegmentedControl,
  GameTextArea,
  GameToast,
} from "@pieai/swimmer-ui-kit";
import { useAccount } from "@/features/account";
import { useSiteI18n } from "@/i18n/client";
import { Link } from "@/i18n/navigation";
import { LICENSE } from "@/content/license";
import { TOOLS } from "@/content/tools";
import {
  authorPostSchema,
  type AuthorPost,
  type CommunityLimits,
  type DraftContent,
} from "@/contracts/community";
import { callCommunity, COMPOSER_WRITE_SCOPE, type WriteSession } from "./api";
import { CommunityError } from "./errors";
import { useCommunityAction, useCommunityQuery } from "./hooks";
import { CommunityNotice } from "./CommunityNotice";
import { ActorPicker } from "./ActorPicker";
import { PostMedia, VideoPreview } from "./PostMedia";
import { parseCommunityVideo } from "./video";
import { prepareCommunityFile } from "./prepare-media";
import { uploadCommunityFile, type UploadProgress } from "./upload";
import { stateMessages } from "./presentation";

type Prepared = { file: File; durationMs?: number; url: string };
const fromPost = (post?: AuthorPost): DraftContent => ({
  kind: post?.kind ?? "image",
  title: post?.title ?? "",
  description: post?.description ?? "",
  recipe: post?.recipe ?? "",
  tool: post?.tool ?? "",
  actors: post?.actors ?? [],
  ...(post?.video ? { videoUrl: post.video.canonicalUrl } : {}),
});
export function Composer({ locale, postId }: { locale: "en" | "zh"; postId?: string }) {
  const { t } = useSiteI18n();
  const account = useAccount();
  const limits = useCommunityQuery("get_limits", {}, Boolean(account.user));
  const draft = useCommunityQuery(
    "get_my_post",
    { postId: postId ?? "" },
    Boolean(account.user && postId),
  );
  if (account.loading) return <output>{t("c.loading")}</output>;
  if (!account.user) return <CommunityNotice error={new CommunityError("AUTH_REQUIRED")} />;
  const error = limits.error ?? draft.error;
  if (error)
    return (
      <>
        <CommunityNotice error={error} />
        <GameButton
          onClick={() => {
            limits.refresh();
            draft.refresh();
          }}
        >
          {t("c.retry")}
        </GameButton>
      </>
    );
  if (!limits.data || (postId && !draft.data)) return <output>{t("c.loading")}</output>;
  return (
    <Editor
      key={`${account.user.id}:${postId ?? "new"}`}
      locale={locale}
      limits={limits.data}
      initial={draft.data?.post}
    />
  );
}
function Editor({
  locale,
  limits,
  initial,
}: {
  locale: "en" | "zh";
  limits: CommunityLimits;
  initial?: AuthorPost;
}) {
  const { t } = useSiteI18n();
  const action = useCommunityAction(COMPOSER_WRITE_SCOPE);
  const [step, setStep] = useState(initial ? 1 : 0),
    [post, setPost] = useState(initial);
  const [content, setContent] = useState<DraftContent>(() => fromPost(initial));
  const [files, setFiles] = useState<Prepared[]>([]),
    [progress, setProgress] = useState<UploadProgress | null>(null);
  const [credit, setCredit] = useState(false),
    [rights, setRights] = useState(false);
  const [notice, setNotice] = useState<"saved" | "submitted" | null>(null);
  const [uploadStarted, setUploadStarted] = useState(Boolean(initial?.media.length));
  const intents = useRef(new Map<number, string>());
  const activeFile = useRef(0);
  useEffect(() => () => files.forEach((item) => URL.revokeObjectURL(item.url)), [files]);
  const kindLabels = {
    image: t("community.kind.image"),
    audio: t("community.kind.audio"),
    video: t("community.kind.video"),
  };
  const stepLabels = [t("c.type"), t("c.media"), t("c.preview")];
  const frozen = action.busy || Boolean(action.journal.snapshot());
  const complete = Boolean(content.title?.trim() && content.actors?.length);
  let video;
  try {
    if (content.kind === "video" && content.videoUrl) video = parseCommunityVideo(content.videoUrl);
  } catch {
    /* Show the validated error when continuing or saving, without rendering arbitrary embeds. */
  }
  const ready =
    content.kind === "video"
      ? Boolean(video && limits.videoPlatforms.includes(video.platform))
      : Boolean(
          post?.media.length && post.media.every((media) => media.processingStatus === "ready"),
        );
  const canEdit = !post || ["draft", "returned", "published"].includes(post.status);
  function keep(next: AuthorPost) {
    setPost(next);
    const url = new URL(window.location.href);
    url.searchParams.set("id", next.id);
    window.history.replaceState(null, "", url);
  }
  async function save(journal: WriteSession, signal: AbortSignal) {
    if (!limits.kinds.includes(content.kind)) throw new CommunityError("SCOPE_NOT_ALLOWED");
    if (
      content.kind === "video" &&
      content.videoUrl &&
      !limits.videoPlatforms.includes(parseCommunityVideo(content.videoUrl).platform)
    )
      throw new CommunityError("VIDEO_URL_UNSUPPORTED");
    const current = post;
    const response = current
      ? await journal.execute(
          "update_draft",
          { postId: current.id, expectedRevision: current.revision, content },
          callCommunity,
          signal,
        )
      : await journal.execute("create_draft", { content }, callCommunity, signal);
    keep(response.post);
    return response.post;
  }
  async function readLatest(signal: AbortSignal) {
    if (!post) return;
    const result = await callCommunity("get_my_post", { postId: post.id }, signal);
    keep(result.post);
    if (
      result.post.media.length &&
      result.post.media.every((media) => media.processingStatus === "ready")
    )
      setProgress((old) => (old ? { ...old, stage: "ready" } : null));
  }
  async function choose(selected: FileList | null) {
    if (!selected || content.kind === "video") return;
    const incoming = [...selected];
    const kind = content.kind;
    await action.perform(async (_journal, signal) => {
      if (
        incoming.length > (kind === "image" ? limits.limits.imageCount : limits.limits.audioCount)
      )
        throw new CommunityError("POST_MEDIA_LIMIT");
      const next: Prepared[] = [];
      try {
        for (const file of incoming) {
          const clean = await prepareCommunityFile(file, kind, limits, signal);
          next.push({ ...clean, url: URL.createObjectURL(clean.file) });
        }
        setFiles(next);
        setProgress(null);
      } catch (error) {
        next.forEach((item) => URL.revokeObjectURL(item.url));
        throw error;
      }
    });
  }
  async function transfer(
    journal: WriteSession,
    signal: AbortSignal,
    saved: AuthorPost,
    renewExpired = false,
  ) {
    setUploadStarted(true);
    for (const [sortOrder, item] of files.entries()) {
      activeFile.current = sortOrder;
      await uploadCommunityFile({
        postId: saved.id,
        revision: saved.revision,
        ...item,
        sortOrder,
        existingUploadId: intents.current.get(sortOrder),
        renewExpired,
        journal,
        signal,
        progress: (value) => {
          if (value.uploadId) intents.current.set(sortOrder, value.uploadId);
          setProgress(value);
        },
      });
    }
    keep((await callCommunity("get_my_post", { postId: saved.id }, signal)).post);
  }
  const change = (
    field: "title" | "description" | "tool" | "recipe" | "videoUrl",
    value: string,
  ) => {
    setContent((old) => ({ ...old, [field]: value }));
    setNotice(null);
  };
  const pendingPost = action.journal.snapshot()?.resourceId;
  if (pendingPost && pendingPost !== post?.id)
    return (
      <section className="sp-section mx-auto max-w-3xl" data-community-composer>
        <h1 className="sp-title">{t("c.new")}</h1>
        <p className="my-5">{t("c.pendingDraftHint")}</p>
        <Link className="underline" href={`/community/new?id=${pendingPost}`}>
          {t("c.resumePendingDraft")}
        </Link>
      </section>
    );
  return (
    <section className="sp-section mx-auto max-w-3xl" data-community-composer data-step={step}>
      <h1 className="sp-title">{t("c.new")}</h1>
      <nav className="my-5 flex flex-wrap gap-4" aria-label={t("c.mine")}>
        <Link className="underline" href="/community/mine">
          {t("c.mine")}
        </Link>
        <Link className="underline" href="/works#community">
          {t("c.title")}
        </Link>
      </nav>
      <ol className="my-6 flex flex-wrap gap-3">
        {stepLabels.map((label, index) => (
          <li key={label} aria-current={index === step ? "step" : undefined}>
            <GameBadge tone={index === step ? "ai" : "neutral"}>{label}</GameBadge>
          </li>
        ))}
      </ol>
      <p className="sp-small mb-4">
        {t("c.dailyLimits", {
          posts: limits.limits.dailyPosts,
          mib: limits.limits.dailyUploadBytes / 1048576,
        })}
      </p>
      {!limits.submissionsOpen ? (
        <CommunityNotice error={new CommunityError("SUBMISSIONS_PAUSED")} />
      ) : null}
      {action.error ? <CommunityNotice error={action.error} /> : null}
      {action.journal.snapshot() ? (
        <GameButton
          pending={action.busy}
          onClick={() =>
            void action.perform(async (journal, signal) => {
              const result = await journal.retry(callCommunity, signal);
              if ("post" in result) {
                const restored = authorPostSchema.safeParse(result.post);
                if (restored.success) {
                  keep(restored.data);
                  setContent(fromPost(restored.data));
                }
              } else {
                if ("uploadId" in result && typeof result.uploadId === "string") {
                  intents.current.set(activeFile.current, result.uploadId);
                  if ("processingStatus" in result && result.processingStatus === "ready")
                    setProgress((old) =>
                      old ? { ...old, stage: "ready", uploadId: result.uploadId as string } : null,
                    );
                }
                await readLatest(signal);
              }
            })
          }
        >
          {t("c.retryWrite")}
        </GameButton>
      ) : null}
      {notice ? (
        <GameToast tone="success">{t(notice === "saved" ? "c.saved" : "c.submitted")}</GameToast>
      ) : null}
      {post ? (
        <div className="my-4" data-my-status={post.status}>
          <GameBadge>{t(stateMessages[post.status])}</GameBadge>
          {post.returnedReason ? (
            <p className="mt-3 break-words">
              {t("c.returnReason")}: {post.returnedReason}
            </p>
          ) : null}
        </div>
      ) : null}
      {!canEdit ? (
        <>
          <PostMedia post={post!} />
          <GameButton onClick={() => void action.perform((_journal, signal) => readLatest(signal))}>
            {t("c.checkStatus")}
          </GameButton>
        </>
      ) : (
        <>
          {step === 0 ? (
            <GameSegmentedControl
              activeId={content.kind}
              label={t("c.type")}
              disabled={frozen || uploadStarted}
              options={limits.kinds.map((id) => ({
                id,
                label: kindLabels[id],
              }))}
              onSelect={(id) => {
                if (id === "image" || id === "audio" || id === "video") {
                  setContent((old) => ({ ...old, kind: id, videoUrl: undefined }));
                  setFiles([]);
                }
              }}
            />
          ) : null}
          {step === 1 ? (
            <fieldset disabled={frozen} className="grid min-w-0 gap-5">
              <GameField label={t("community.titleLabel")} required>
                <GameInput
                  value={content.title ?? ""}
                  maxLength={200}
                  onChange={(event) => change("title", event.target.value)}
                />
              </GameField>
              <ActorPicker
                locale={locale}
                value={content.actors ?? []}
                onChange={(actors) => setContent((old) => ({ ...old, actors }))}
              />
              <GameField
                label={t(
                  content.kind === "audio" ? "c.transcript" : "community.descriptionPlaceholder",
                )}
              >
                <GameTextArea
                  value={content.description ?? ""}
                  maxLength={50000}
                  onChange={(event) => change("description", event.target.value)}
                />
              </GameField>
              <GameField label={t("community.toolPlaceholder")}>
                <GameInput
                  list="community-tool-suggestions"
                  value={content.tool ?? ""}
                  maxLength={200}
                  onChange={(event) => change("tool", event.target.value)}
                />
              </GameField>
              <datalist id="community-tool-suggestions">
                {TOOLS.map((tool) => (
                  <option key={tool} value={tool}>
                    {tool}
                  </option>
                ))}
              </datalist>
              <GameField label={t("community.recipePlaceholder")}>
                <GameTextArea
                  value={content.recipe ?? ""}
                  maxLength={50000}
                  onChange={(event) => change("recipe", event.target.value)}
                />
              </GameField>
              {content.kind === "video" ? (
                <GameField
                  label={t("c.videoLink")}
                  hint={`${t("c.videoHelp")} ${limits.videoPlatforms.join(" · ")}`}
                >
                  <GameInput
                    type="url"
                    value={content.videoUrl ?? ""}
                    maxLength={2048}
                    onChange={(event) => change("videoUrl", event.target.value)}
                  />
                </GameField>
              ) : (
                <>
                  <GameField
                    label={t("c.files")}
                    hint={t("c.fileLimits", {
                      count:
                        content.kind === "image"
                          ? limits.limits.imageCount
                          : limits.limits.audioCount,
                      mib:
                        (content.kind === "image"
                          ? limits.limits.imageBytes
                          : limits.limits.audioBytes) / 1048576,
                    })}
                  >
                    <GameInput
                      type="file"
                      multiple={content.kind === "image"}
                      accept={
                        content.kind === "image"
                          ? "image/png,image/jpeg,image/webp"
                          : "audio/mpeg,audio/wav,audio/mp4"
                      }
                      disabled={uploadStarted}
                      onChange={(event) => void choose(event.target.files)}
                    />
                  </GameField>
                  <p className="sp-small">
                    {content.kind === "image"
                      ? t("c.metadata")
                      : t("c.audioLimit", { seconds: limits.limits.audioDurationMs / 1000 })}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {files.map((item, index) => (
                      <figure key={item.url}>
                        {content.kind === "image" ? (
                          <Image
                            unoptimized
                            width={800}
                            height={600}
                            src={item.url}
                            alt={`${index + 1}`}
                            className="max-h-64 w-full object-contain"
                          />
                        ) : (
                          <AudioPreview src={item.url} transcript={content.description} />
                        )}
                        <figcaption className="sp-small">
                          {item.file.name} · {item.file.size}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                  {!uploadStarted ? (
                    <GameButton
                      disabled={!files.length || !complete || !limits.submissionsOpen}
                      onClick={() =>
                        void action.perform(async (journal, signal) => {
                          const saved = await save(journal, signal);
                          await transfer(journal, signal, saved);
                        })
                      }
                    >
                      {t("c.upload")}
                    </GameButton>
                  ) : (
                    <p>{t("c.mediaLocked")}</p>
                  )}
                </>
              )}
            </fieldset>
          ) : null}
          {progress ? (
            <div className="my-4 grid gap-3" data-community-upload={progress.stage}>
              <GameProgress
                value={progress.loaded}
                max={Math.max(1, progress.total)}
                label={t("c.uploading")}
                valueLabel={t("c.transfer", { loaded: progress.loaded, total: progress.total })}
              />
              <output>
                {t(
                  progress.stage === "reserving"
                    ? "c.reserving"
                    : progress.stage === "uploading"
                      ? "c.uploading"
                      : progress.stage === "ready"
                        ? "c.ready"
                        : "c.validating",
                )}
              </output>
            </div>
          ) : null}
          {action.busy ? (
            <div className="my-4">
              <output>{t("c.preparing")}</output>
              <GameButton onClick={action.cancel}>{t("c.cancel")}</GameButton>
            </div>
          ) : null}
          {uploadStarted && post && files.length && !action.journal.snapshot() ? (
            <GameButton
              disabled={action.busy}
              onClick={() =>
                void action.perform((journal, signal) =>
                  transfer(journal, signal, post, action.error?.code === "UPLOAD_EXPIRED"),
                )
              }
            >
              {t(action.error?.code === "UPLOAD_EXPIRED" ? "c3.restartUpload" : "c.resumeUpload")}
            </GameButton>
          ) : null}
          {post ? (
            <GameButton
              disabled={action.busy}
              onClick={() =>
                void action.perform(async (_journal, signal) => {
                  await readLatest(signal);
                  if (action.error?.code === "REVISION_CONFLICT") {
                    const fresh = await callCommunity("get_my_post", { postId: post.id }, signal);
                    setContent(fromPost(fresh.post));
                  }
                })
              }
            >
              {t("c.checkStatus")}
            </GameButton>
          ) : null}
          {step === 2 ? (
            <div className="sp-panel my-5 grid gap-4 p-5" data-submission-preview>
              <h2 className="sp-subtitle">{content.title}</h2>
              <p className="whitespace-pre-wrap break-words">{content.description}</p>
              <p className="break-words">
                {content.actors?.map((actor) => `${actor.slug} · ${actor.assetVersion}`).join(", ")}
              </p>
              {video ? (
                <VideoPreview video={video} title={content.title ?? ""} />
              ) : post ? (
                <PostMedia post={post} />
              ) : null}
              <p>{t("c.submitHelp")}</p>
              <Link href="/license" className="underline">
                {t("license.badge")}
              </Link>
              <GameCheckbox
                label={t("community.creditConfirmation")}
                checked={credit}
                disabled={frozen}
                onChange={(event) => setCredit(event.target.checked)}
              />
              <GameCheckbox
                label={t("community.rightsConfirmation")}
                checked={rights}
                disabled={frozen}
                onChange={(event) => setRights(event.target.checked)}
              />
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {step > 0 ? (
              <GameButton disabled={frozen} onClick={() => setStep((value) => value - 1)}>
                {t("c.back")}
              </GameButton>
            ) : null}
            {step > 0 ? (
              <GameButton
                disabled={frozen || !limits.submissionsOpen}
                onClick={() =>
                  void action.perform(async (journal, signal) => {
                    await save(journal, signal);
                    setNotice("saved");
                  })
                }
              >
                {t("c.save")}
              </GameButton>
            ) : null}
            {step < 2 ? (
              <GameButton
                variant="primary"
                disabled={
                  frozen ||
                  !limits.kinds.includes(content.kind) ||
                  (step === 1 && (!complete || !ready))
                }
                onClick={() => setStep((value) => value + 1)}
              >
                {t("c.next")}
              </GameButton>
            ) : (
              <GameButton
                variant="primary"
                pending={action.busy}
                disabled={
                  frozen || !limits.submissionsOpen || !credit || !rights || !ready || !complete
                }
                onClick={() =>
                  void action.perform(async (journal, signal) => {
                    const saved = await save(journal, signal);
                    const submitted = await journal.execute(
                      "submit_post",
                      {
                        postId: saved.id,
                        expectedRevision: saved.revision,
                        confirmation: {
                          creditConfirmed: true,
                          rightsConfirmed: true,
                          termsVersion: LICENSE.version,
                        },
                      },
                      callCommunity,
                      signal,
                    );
                    keep(submitted.post);
                    setNotice("submitted");
                  })
                }
              >
                {t("c.publish")}
              </GameButton>
            )}
          </div>
        </>
      )}
    </section>
  );
}
