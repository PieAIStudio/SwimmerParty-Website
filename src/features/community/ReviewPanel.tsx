"use client";
import { useState } from "react";
import {
  GameBadge,
  GameButton,
  GameEmptyState,
  GameField,
  GameSelect,
  GameTextArea,
  GameToast,
} from "@pieai/swimmer-ui-kit";
import { useSiteI18n, useSiteLocale } from "@/i18n/client";
import { useAccount } from "@/features/account";
import type { OwnerPost } from "@/contracts/community";
import { callCommunity } from "./api";
import { CommunityError } from "./errors";
import { useCommunityAction, useCommunityQuery } from "./hooks";
import { CommunityNotice } from "./CommunityNotice";
import { PostMedia } from "./PostMedia";
import { reasonMessages, stateMessages } from "./presentation";
const reviewStatuses = ["pending", "hidden", "returned", "published"] as const;
type ReviewStatus = (typeof reviewStatuses)[number];
const operations = ["approve", "return", "hide", "restore"] as const;
type ReviewAction = (typeof operations)[number];
const actionMessages = {
  approve: "c2.approve",
  return: "c2.return",
  hide: "c2.hide",
  restore: "c2.restore",
} as const;
function allowed(action: ReviewAction, post: OwnerPost) {
  return action === "approve"
    ? post.status === "pending" && post.submittedRevision === post.revision
    : action === "return"
      ? post.status === "pending" || post.status === "hidden"
      : action === "hide"
        ? post.status === "published"
        : post.status === "hidden" && !post.legacyV1;
}
function ReviewDesk() {
  const { t } = useSiteI18n();
  const locale = useSiteLocale();
  const [status, setStatus] = useState<ReviewStatus>("pending");
  const [cursor, setCursor] = useState<string | null>(null),
    [previous, setPrevious] = useState<OwnerPost[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<ReviewAction>("approve");
  const [reason, setReason] = useState(""),
    [trustReason, setTrustReason] = useState(""),
    [pauseReason, setPauseReason] = useState("");
  const [confirmPause, setConfirmPause] = useState<boolean | null>(null),
    [notice, setNotice] = useState(false);
  const queue = useCommunityQuery("list_review_queue", { status, cursor, pageSize: 20 });
  const limits = useCommunityQuery("get_limits", {}, Boolean(queue.data));
  const detail = useCommunityQuery(
    "get_review_detail",
    { postId: selected ?? "" },
    Boolean(selected && queue.data),
  );
  const action = useCommunityAction("owner-review-desk");
  const [mediaDenied, setMediaDenied] = useState(false);
  const fatal = mediaDenied
    ? new CommunityError("MEDIA_UNAVAILABLE")
    : [queue.error, detail.error, action.error].find(
        (error) =>
          error &&
          ["AUTH_REQUIRED", "OWNER_REQUIRED", "SCOPE_NOT_ALLOWED", "POST_UNAVAILABLE"].includes(
            error.code,
          ),
      );
  const frozen = action.busy || Boolean(action.journal.snapshot());
  const posts = queue.data
    ? [...previous, ...queue.data.posts].filter(
        (post, index, all) => all.findIndex((item) => item.id === post.id) === index,
      )
    : [];
  function reload() {
    setMediaDenied(false);
    setPrevious([]);
    setCursor(null);
    queue.refresh();
    detail.refresh();
    limits.refresh();
  }
  function perform(run: Parameters<typeof action.perform>[0]) {
    setNotice(false);
    return action.perform(run);
  }
  function choose(post: OwnerPost) {
    setSelected(post.id);
    setReason("");
    setTrustReason("");
    setReviewAction(
      post.status === "hidden" ? "restore" : post.status === "published" ? "hide" : "approve",
    );
    setNotice(false);
  }
  if (fatal)
    return (
      <section className="sp-container sp-section">
        <CommunityNotice error={fatal} />
        <GameButton
          onClick={() => {
            action.clearError();
            reload();
          }}
        >
          {t("c.retry")}
        </GameButton>
      </section>
    );
  if (queue.error)
    return (
      <section className="sp-container sp-section">
        <CommunityNotice error={queue.error} />
        <GameButton onClick={reload}>{t("c.retry")}</GameButton>
      </section>
    );
  if (!queue.data)
    return (
      <section className="sp-container sp-section">
        <output>{t("c.loading")}</output>
      </section>
    );
  const post = detail.data?.post;
  return (
    <section className="sp-container sp-section" data-review-desk>
      <h1 className="sp-title">{t("community.reviewTitle")}</h1>
      <p className="sp-lead">{t("c2.ownerOnly")}</p>
      {notice ? <GameToast tone="success">{t("c2.saved")}</GameToast> : null}
      {action.error ? <CommunityNotice error={action.error} /> : null}
      {action.error?.code === "REVISION_CONFLICT" ? (
        <GameButton onClick={reload}>{t("c.retry")}</GameButton>
      ) : null}
      {action.journal.snapshot() ? (
        <GameButton
          pending={action.busy}
          onClick={() =>
            void perform(async (journal, signal) => {
              await journal.retry(callCommunity, signal);
              setConfirmPause(null);
              setPauseReason("");
              setReason("");
              setTrustReason("");
              setNotice(true);
              reload();
            })
          }
        >
          {t("c.retryWrite")}
        </GameButton>
      ) : null}
      <section className="sp-panel my-6 grid gap-4 p-5" data-submission-control>
        <h2 className="sp-subtitle">{t("c2.submissionControl")}</h2>
        {limits.error ? (
          <>
            <CommunityNotice error={limits.error} />
            <GameButton onClick={limits.refresh}>{t("c.retry")}</GameButton>
          </>
        ) : limits.data ? (
          <>
            <GameBadge tone={limits.data.submissionsOpen ? "neutral" : "danger"}>
              {t(limits.data.submissionsOpen ? "c2.open" : "c2.paused")}
            </GameBadge>
            <p>{t("c2.pauseScope")}</p>
            <GameField label={t("c2.pauseReason")} required>
              <GameTextArea
                value={pauseReason}
                maxLength={500}
                disabled={frozen}
                onChange={(event) => setPauseReason(event.target.value)}
              />
            </GameField>
            {confirmPause === null ? (
              <GameButton
                disabled={frozen || !pauseReason.trim()}
                onClick={() => setConfirmPause(limits.data!.submissionsOpen)}
              >
                {t(limits.data.submissionsOpen ? "c2.pause" : "c2.resume")}
              </GameButton>
            ) : (
              <div className="grid gap-3" data-confirm-pause>
                <p>{t(confirmPause ? "c2.confirmPause" : "c2.confirmResume")}</p>
                <div className="flex flex-wrap gap-3">
                  <GameButton
                    pending={action.busy}
                    disabled={frozen || !pauseReason.trim()}
                    onClick={() =>
                      void perform(async (journal, signal) => {
                        await journal.execute(
                          "set_submission_paused",
                          { paused: confirmPause, reason: pauseReason },
                          callCommunity,
                          signal,
                        );
                        setConfirmPause(null);
                        setPauseReason("");
                        setNotice(true);
                        limits.refresh();
                      })
                    }
                  >
                    {t("c2.confirm")}
                  </GameButton>
                  <GameButton disabled={frozen} onClick={() => setConfirmPause(null)}>
                    {t("c.cancel")}
                  </GameButton>
                </div>
              </div>
            )}
          </>
        ) : (
          <output>{t("c.loading")}</output>
        )}
      </section>
      <GameField label={t("c2.queueStatus")}>
        <GameSelect
          value={status}
          disabled={frozen}
          onChange={(event) => {
            const value = event.target.value;
            if (reviewStatuses.includes(value as ReviewStatus)) {
              setStatus(value as ReviewStatus);
              setCursor(null);
              setPrevious([]);
              setSelected(null);
            }
          }}
        >
          {reviewStatuses.map((value) => (
            <option key={value} value={value}>
              {t(stateMessages[value])}
            </option>
          ))}
        </GameSelect>
      </GameField>
      {!posts.length ? (
        <GameEmptyState title={t("community.reviewEmpty")} />
      ) : (
        <div className="my-5 grid gap-3 md:grid-cols-2">
          {posts.map((item) => (
            <article key={item.id} className="sp-panel min-w-0 p-5" data-review-item={item.id}>
              <GameBadge>{t(stateMessages[item.status])}</GameBadge>
              <h2 className="sp-subtitle my-3 break-words">{item.title}</h2>
              <p>
                {item.author.displayName} · {t("c2.reportCount", { count: item.reportCount })}
              </p>
              <GameButton disabled={frozen} onClick={() => choose(item)}>
                {t("c2.inspect")}
              </GameButton>
            </article>
          ))}
        </div>
      )}
      {queue.data.hasMore ? (
        <GameButton
          disabled={frozen}
          onClick={() => {
            setPrevious(posts);
            setCursor(queue.data!.nextCursor);
          }}
        >
          {t("c.loadMore")}
        </GameButton>
      ) : null}
      {selected && detail.loading ? <output>{t("c.loading")}</output> : null}
      {detail.error ? (
        <>
          <CommunityNotice error={detail.error} />
          <GameButton onClick={detail.refresh}>{t("c.retry")}</GameButton>
        </>
      ) : null}
      {post ? (
        <section className="sp-panel my-6 grid min-w-0 gap-5 p-5" data-review-detail={post.id}>
          <h2 className="sp-subtitle break-words">{post.title}</h2>
          <p>
            {t("c2.revision", { revision: post.revision })} · {t(stateMessages[post.status])}
          </p>
          <p>{post.author.displayName}</p>
          <p className="whitespace-pre-wrap break-words">{post.description}</p>
          {post.tool ? <p>{post.tool}</p> : null}
          {post.recipe ? <p className="whitespace-pre-wrap break-words">{post.recipe}</p> : null}
          <dl className="grid min-w-0 gap-3" data-review-confirmations>
            <div className="grid min-w-0 gap-2">
              <dt className="sp-small break-words">{t("community.creditConfirmation")}</dt>
              <dd>
                <GameBadge tone={post.creditConfirmed ? "neutral" : "danger"}>
                  {t(post.creditConfirmed ? "c2.confirmed" : "c2.notConfirmed")}
                </GameBadge>
              </dd>
            </div>
            <div className="grid min-w-0 gap-2">
              <dt className="sp-small break-words">{t("community.rightsConfirmation")}</dt>
              <dd>
                <GameBadge tone={post.rightsConfirmed ? "neutral" : "danger"}>
                  {t(post.rightsConfirmed ? "c2.confirmed" : "c2.notConfirmed")}
                </GameBadge>
              </dd>
            </div>
          </dl>
          <PostMedia post={post} review onAccessDenied={() => setMediaDenied(true)} />
          <p className="break-words">
            {post.actors.map((actor) => `${actor.slug} · ${actor.assetVersion}`).join(", ")}
          </p>
          <section>
            <h3 className="sp-label">{t("c2.reports")}</h3>
            {post.reports.length ? (
              <ul>
                {post.reports.map((report, index) => (
                  <li key={`${report.createdAt}:${index}`} className="my-3 break-words">
                    <strong>{t(reasonMessages[report.reasonCode])}</strong> ·{" "}
                    {t("c2.round", { round: report.round })}
                    <p className="whitespace-pre-wrap">{report.note}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t("c2.noReports")}</p>
            )}
          </section>
          <section>
            <h3 className="sp-label">{t("c2.history")}</h3>
            {post.history.length ? (
              <ol>
                {post.history.map((record, index) => (
                  <li key={`${record.createdAt}:${index}`} className="my-3 break-words">
                    <time dateTime={record.createdAt}>
                      {new Date(record.createdAt).toLocaleString(locale)}
                    </time>{" "}
                    · {record.action} · {record.source}
                    <p className="whitespace-pre-wrap">{record.reason}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p>{t("c2.noHistory")}</p>
            )}
          </section>
          <fieldset disabled={frozen} className="grid gap-4">
            <legend className="sp-label mb-3">{t("c2.decision")}</legend>
            <GameField label={t("c2.action")}>
              <GameSelect
                value={reviewAction}
                onChange={(event) => {
                  const value = event.target.value;
                  if (operations.includes(value as ReviewAction))
                    setReviewAction(value as ReviewAction);
                }}
              >
                {operations.map((value) => (
                  <option key={value} value={value} disabled={!allowed(value, post)}>
                    {t(actionMessages[value])}
                  </option>
                ))}
              </GameSelect>
            </GameField>
            <GameField label={t("c2.reason")} required={reviewAction !== "approve"}>
              <GameTextArea
                value={reason}
                maxLength={2000}
                onChange={(event) => setReason(event.target.value)}
              />
            </GameField>
            <p className="sp-small">{t("c2.approvalNotTrust")}</p>
            <GameButton
              disabled={
                !allowed(reviewAction, post) || (reviewAction !== "approve" && !reason.trim())
              }
              onClick={() =>
                void perform(async (journal, signal) => {
                  await journal.execute(
                    "review_post",
                    {
                      postId: post.id,
                      expectedRevision: post.revision,
                      action: reviewAction,
                      reason: reason.trim() || null,
                    },
                    callCommunity,
                    signal,
                  );
                  setNotice(true);
                  setReason("");
                  reload();
                })
              }
            >
              {t("c2.apply")}
            </GameButton>
          </fieldset>
          {post.authorTrusted ? (
            <fieldset disabled={frozen} className="grid gap-4">
              <legend className="sp-label mb-3">{t("c2.trust")}</legend>
              <p>{t("c2.revokeHelp")}</p>
              <GameField label={t("c2.revokeReason")} required>
                <GameTextArea
                  value={trustReason}
                  maxLength={1000}
                  onChange={(event) => setTrustReason(event.target.value)}
                />
              </GameField>
              <GameButton
                disabled={!trustReason.trim()}
                onClick={() =>
                  void perform(async (journal, signal) => {
                    await journal.execute(
                      "set_author_trust",
                      { userId: post.author.id, trusted: false, reason: trustReason },
                      callCommunity,
                      signal,
                    );
                    setTrustReason("");
                    setNotice(true);
                    reload();
                  })
                }
              >
                {t("c2.revoke")}
              </GameButton>
            </fieldset>
          ) : (
            <p>{t("c2.notTrusted")}</p>
          )}
        </section>
      ) : null}
    </section>
  );
}
export function ReviewPanel() {
  const { t } = useSiteI18n();
  const account = useAccount();
  if (account.loading)
    return (
      <section className="sp-container sp-section">
        <output>{t("c.loading")}</output>
      </section>
    );
  if (!account.user)
    return (
      <section className="sp-container sp-section">
        <CommunityNotice error={new CommunityError("AUTH_REQUIRED")} />
      </section>
    );
  return <ReviewDesk key={account.user.id} />;
}
