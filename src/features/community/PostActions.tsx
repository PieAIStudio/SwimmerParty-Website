"use client";
import { useState } from "react";
import { GameButton, GameField, GameSelect, GameTextArea, GameToast } from "@pieai/swimmer-ui-kit";
import { useSiteI18n } from "@/i18n/client";
import { useAccount } from "@/features/account";
import { reportReasonSchema, type CommunityPost, type ReportReason } from "@/contracts/community";
import { callCommunity } from "./api";
import { useCommunityAction } from "./hooks";
import { CommunityNotice } from "./CommunityNotice";
import { reasonMessages } from "./presentation";
export function PostActions({ post, refresh }: { post: CommunityPost; refresh: () => void }) {
  const { t } = useSiteI18n();
  const account = useAccount();
  const action = useCommunityAction(`post:${post.id}`);
  const [reporting, setReporting] = useState(false),
    [reported, setReported] = useState(false);
  const [reason, setReason] = useState<ReportReason>("not_site_actors"),
    [note, setNote] = useState("");
  async function like() {
    const result = await action.perform((journal, signal) =>
      journal.execute(
        "set_like",
        { postId: post.id, liked: !post.viewerHasLiked },
        callCommunity,
        signal,
      ),
    );
    if (result) refresh();
  }
  return (
    <div className="my-6 grid gap-4">
      {action.error ? <CommunityNotice error={action.error} /> : null}
      {action.journal.snapshot() ? (
        <GameButton
          pending={action.busy}
          onClick={() =>
            void action.perform(async (journal, signal) => {
              await journal.retry(callCommunity, signal);
              refresh();
            })
          }
        >
          {t("c.retryWrite")}
        </GameButton>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <GameButton
          pending={action.busy}
          aria-pressed={post.viewerHasLiked}
          onClick={() => void like()}
        >
          {t("c.likes", { count: post.likeCount })}
        </GameButton>
        {post.author.id !== account.user?.id ? (
          <GameButton variant="ghost" onClick={() => setReporting((value) => !value)}>
            {t("community.report")}
          </GameButton>
        ) : null}
      </div>
      {reported ? <GameToast tone="success">{t("community.reported")}</GameToast> : null}
      {reporting ? (
        <form
          className="sp-panel grid gap-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            void action.perform(async (journal, signal) => {
              await journal.execute(
                "report_post",
                { postId: post.id, reasonCode: reason, note },
                callCommunity,
                signal,
              );
              setReported(true);
              setReporting(false);
            });
          }}
        >
          <GameField label={t("c.reportReason")}>
            <GameSelect
              value={reason}
              onChange={(event) => setReason(reportReasonSchema.parse(event.target.value))}
            >
              {reportReasonSchema.options.map((value) => (
                <option key={value} value={value}>
                  {t(reasonMessages[value])}
                </option>
              ))}
            </GameSelect>
          </GameField>
          <GameField label={t("c.reportNote")}>
            <GameTextArea
              value={note}
              maxLength={2000}
              onChange={(event) => setNote(event.target.value)}
            />
          </GameField>
          <div className="flex gap-3">
            <GameButton type="submit" pending={action.busy}>
              {t("community.report")}
            </GameButton>
            <GameButton onClick={() => setReporting(false)}>{t("c.cancel")}</GameButton>
          </div>
        </form>
      ) : null}
    </div>
  );
}
