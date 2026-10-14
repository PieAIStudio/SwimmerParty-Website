import { randomUUID } from "node:crypto";
import type { Page, Route } from "@playwright/test";
import sharp from "sharp";
import {
  communityOperations,
  isCommunityOperation,
} from "../../src/contracts/community-operations";
import {
  errorStatus,
  type AuthorPost,
  type CommunityErrorCode,
  type OwnerPost,
} from "../../src/contracts/community";
import { parseCommunityVideo } from "../../src/features/community/video";
import {
  authorFixture,
  ownerFixture,
  publicFixture,
  v3Limits,
  POST_ID,
  USER_ID,
  WHEN,
} from "../../tools/test/fixtures/community-v3";

/** Browser-owned fake transport only: no fixture implementation is imported by the application. */
export async function installCommunityFixture(
  page: Page,
  options: { owner?: boolean; member?: boolean; posts?: AuthorPost[] } = {},
) {
  const png = await sharp({ create: { width: 24, height: 32, channels: 3, background: "#eeeeee" } })
    .png()
    .toBuffer();
  const state = {
    member: options.member ?? true,
    owner: options.owner ?? false,
    paused: false,
    malformed: false,
    failCode: null as CommunityErrorCode | null,
    loseCreateOnce: false,
    loseWriteOnce: null as string | null,
    reviewRecords: new Map<string, OwnerPost>(),
    trust: new Map<string, boolean>(),
    mediaRequests: [] as { mediaId: string; mode: string }[],
    loseUploadOnce: false,
    holdUpload: null as Promise<void> | null,
    readyMedia: false,
    uploaded: [] as Buffer[],
    calls: [] as { operation: string; input: Record<string, unknown> }[],
    posts: options.posts ?? [
      authorFixture({
        author: publicFixture().author,
        status: "published",
        title: publicFixture().title,
        publishedAt: WHEN,
      }),
    ],
    operations: new Map<string, { input: string; output: unknown; resourceId: string | null }>(),
    uploads: new Map<
      string,
      { postId: string; mediaId: string; status: "issued" | "finalizing"; expiresAt: string }
    >(),
  };
  await page.route("https://accounts.swiminai.com/products.json", (route) =>
    route.fulfill({ json: { version: 1, products: [] } }),
  );
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({
      json: {
        mode: "mock",
        user: state.member
          ? { id: USER_ID, name: "Fixture member", email: "member@example.test", avatarUrl: null }
          : null,
      },
    }),
  );
  const fail = (route: Route, code: CommunityErrorCode) =>
    route.fulfill({
      status: errorStatus[code],
      json: { error: { code, retryable: false, requestId: "fixture-request" } },
    });
  function ownerPost(post: AuthorPost): OwnerPost {
    const previous =
      state.reviewRecords.get(post.id) ??
      ownerFixture({
        ...post,
        reports: post.status === "hidden" ? ownerFixture().reports : [],
        reportCount: post.status === "hidden" ? 1 : 0,
      });
    const current = ownerFixture({
      ...post,
      reports: previous.reports,
      history: previous.history,
      reportRound: previous.reportRound,
      reportCount: previous.reportCount,
      authorTrusted: state.trust.get(post.author.id) ?? previous.authorTrusted,
    });
    state.reviewRecords.set(post.id, current);
    return current;
  }
  await page.route("**/api/community/v3/*", async (route) => {
    const url = new URL(route.request().url()),
      name = url.pathname.split("/").at(-1)!;
    if (!isCommunityOperation(name)) return fail(route, "INVALID_INPUT");
    const definition = communityOperations[name];
    const parsed = definition.input.safeParse(
      route.request().method() === "GET"
        ? JSON.parse(url.searchParams.get("input") ?? "{}")
        : route.request().postDataJSON(),
    );
    if (!parsed.success) return fail(route, "INVALID_INPUT");
    const input = parsed.data as Record<string, unknown>;
    state.calls.push({ operation: name, input });
    if (definition.access !== "public" && !state.member) return fail(route, "AUTH_REQUIRED");
    if (definition.access === "owner" && !state.owner) return fail(route, "OWNER_REQUIRED");
    if (state.failCode) return fail(route, state.failCode);
    if (state.malformed)
      return route.fulfill({ json: { invalid: "No private queue should render." } });
    if (
      state.paused &&
      ["create_draft", "update_draft", "create_upload", "submit_post"].includes(name)
    )
      return fail(route, "SUBMISSIONS_PAUSED");
    const key = `${name}:${input.operationId}`;
    const remembered = state.operations.get(key);
    if (definition.write && remembered) {
      if (remembered.input !== JSON.stringify(input)) return fail(route, "IDEMPOTENCY_CONFLICT");
      return route.fulfill({ json: remembered.output });
    }
    const post = state.posts.find((item) => item.id === input.postId);
    let output: unknown;
    switch (name) {
      case "get_limits":
        output = { ...v3Limits, submissionsOpen: !state.paused };
        break;
      case "get_operation": {
        const operation = state.operations.get(`${input.operation}:${input.operationId}`);
        if (!operation) return fail(route, "OPERATION_UNAVAILABLE");
        output = {
          operationId: input.operationId,
          status: "succeeded",
          resourceId: operation.resourceId,
          resultCode: null,
        };
        break;
      }
      case "list_posts":
        output = {
          posts: state.posts
            .filter((item) => item.status === "published")
            .map((item) => publicProjection(item)),
          nextCursor: null,
          hasMore: false,
        };
        break;
      case "get_post":
        if (!post || post.status !== "published") return fail(route, "POST_UNAVAILABLE");
        output = { post: publicProjection(post) };
        break;
      case "list_my_posts":
        output = {
          posts: state.posts.filter(
            (item) => item.author.id === USER_ID && (!input.status || item.status === input.status),
          ),
          nextCursor: null,
          hasMore: false,
        };
        break;
      case "get_my_post":
        if (!post || post.author.id !== USER_ID) return fail(route, "POST_UNAVAILABLE");
        output = { post };
        break;
      case "create_draft":
      case "update_draft": {
        const content = parsed.data as {
          content: {
            kind: "image" | "video" | "audio";
            title?: string | null;
            description?: string | null;
            recipe?: string | null;
            tool?: string | null;
            actors?: AuthorPost["actors"];
            videoUrl?: string;
          };
        };
        if (name === "update_draft" && (!post || post.author.id !== USER_ID))
          return fail(route, "POST_UNAVAILABLE");
        if (post && post.revision !== input.expectedRevision)
          return fail(route, "REVISION_CONFLICT");
        const next = authorFixture({
          ...(post ?? {}),
          id: post?.id ?? randomUUID(),
          revision: (post?.revision ?? 0) + 1,
          status: "draft",
          kind: content.content.kind,
          title: content.content.title ?? null,
          description: content.content.description ?? null,
          recipe: content.content.recipe ?? null,
          tool: content.content.tool ?? null,
          actors: content.content.actors ?? [],
          media: post?.media ?? [],
          video: content.content.videoUrl ? parseCommunityVideo(content.content.videoUrl) : null,
          creditConfirmed: false,
          rightsConfirmed: false,
        });
        if (post) state.posts.splice(state.posts.indexOf(post), 1, next);
        else state.posts.push(next);
        output = { operationId: input.operationId, post: next };
        break;
      }
      case "submit_post": {
        if (!post || post.author.id !== USER_ID) return fail(route, "POST_UNAVAILABLE");
        if (post.revision !== input.expectedRevision) return fail(route, "REVISION_CONFLICT");
        if (
          !post.title ||
          !post.actors.length ||
          (!post.video &&
            (!post.media.length || post.media.some((item) => item.processingStatus !== "ready")))
        )
          return fail(route, "INVALID_STATE");
        post.status = "pending";
        post.creditConfirmed = true;
        post.rightsConfirmed = true;
        post.submittedAt = WHEN;
        output = { operationId: input.operationId, post };
        break;
      }
      case "set_like":
        if (!post || post.status !== "published") return fail(route, "POST_UNAVAILABLE");
        post.viewerHasLiked = input.liked === true;
        post.likeCount = input.liked ? 1 : 0;
        output = { liked: post.viewerHasLiked, count: post.likeCount };
        break;
      case "report_post":
        if (!post) return fail(route, "POST_UNAVAILABLE");
        output = { operationId: input.operationId, status: "received" };
        break;
      case "delete_post":
        if (!post || post.author.id !== USER_ID) return fail(route, "POST_UNAVAILABLE");
        post.status = "deleted";
        post.title = null;
        post.media = [];
        output = { operationId: input.operationId, status: "deleting" };
        break;
      case "create_upload": {
        if (!post || post.author.id !== USER_ID) return fail(route, "POST_UNAVAILABLE");
        const uploadId = randomUUID(),
          mediaId = randomUUID(),
          expiresAt = new Date(Date.now() + 600000).toISOString();
        state.uploads.set(uploadId, { postId: post.id, mediaId, status: "issued", expiresAt });
        post.media.push({
          id: mediaId,
          kind: post.kind === "audio" ? "audio" : "image",
          sortOrder: post.media.length,
          altText: null,
          processingStatus: "reserved",
          reviewStatus: "unreviewed",
        });
        output = { uploadId, mediaId, expiresAt, status: "issued", processingStatus: "reserved" };
        break;
      }
      case "complete_upload":
      case "get_upload_status": {
        const upload = state.uploads.get(String(input.uploadId));
        if (!upload) return fail(route, "MEDIA_UNAVAILABLE");
        const parent = state.posts.find((item) => item.id === upload.postId)!;
        const medium = parent.media.find((item) => item.id === upload.mediaId)!;
        if (name === "complete_upload") {
          upload.status = "finalizing";
          medium.processingStatus = "validating";
        }
        output = {
          uploadId: input.uploadId,
          mediaId: upload.mediaId,
          status: upload.status,
          processingStatus: medium.processingStatus,
          expiresAt: upload.expiresAt,
          failureCode: null,
        };
        break;
      }
      case "get_actor_votes":
        output = { actorSlug: input.actorSlug, count: 2, voted: true };
        break;
      case "set_actor_vote":
        output = { count: input.voted ? 2 : 1, voted: Boolean(input.voted) };
        break;
      case "review_post": {
        if (!post) return fail(route, "POST_UNAVAILABLE");
        if (post.revision !== input.expectedRevision) return fail(route, "REVISION_CONFLICT");
        const before = ownerPost(post);
        const action = String(input.action);
        const allowed =
          action === "approve"
            ? post.status === "pending" && before.submittedRevision === post.revision
            : action === "return"
              ? ["pending", "hidden"].includes(post.status)
              : action === "hide"
                ? post.status === "published"
                : post.status === "hidden" && !before.legacyV1;
        if (!allowed) return fail(route, "INVALID_STATE");
        if (action !== "approve" && !String(input.reason ?? "").trim())
          return fail(route, "INVALID_INPUT");
        const reason = String(input.reason ?? "").trim() || null;
        if (action === "approve" || action === "restore") {
          post.status = "published";
          post.publishedAt = WHEN;
          post.returnedReason = null;
          post.hiddenReason = null;
          post.media.forEach((media) => {
            if (media.processingStatus === "ready") media.reviewStatus = "approved";
          });
        } else if (action === "return") {
          post.status = "returned";
          post.returnedReason = reason;
          post.hiddenReason = null;
        } else {
          post.status = "hidden";
          post.hiddenReason = reason;
        }
        const reportRound =
          before.reportRound +
          (action === "restore" || (action === "return" && before.status === "hidden") ? 1 : 0);
        state.reviewRecords.set(post.id, {
          ...before,
          reportRound,
          reportCount: before.reports.filter((report) => report.round === reportRound).length,
          history: [
            ...before.history,
            {
              action,
              source: "owner_manual",
              reason,
              postRevision: post.revision,
              createdAt: WHEN,
            },
          ],
        });
        output = { operationId: input.operationId, post: ownerPost(post) };
        break;
      }
      case "set_author_trust":
        state.trust.set(String(input.userId), Boolean(input.trusted));
        output = {
          operationId: input.operationId,
          userId: input.userId,
          trusted: input.trusted,
          status: input.trusted ? "trusted" : "revoked",
        };
        break;
      case "set_submission_paused":
        state.paused = input.paused === true;
        output = { operationId: input.operationId, submissionsOpen: !state.paused };
        break;
      case "list_review_queue":
        output = {
          posts: state.posts
            .filter((item) =>
              input.status
                ? item.status === input.status
                : ["pending", "hidden"].includes(item.status),
            )
            .map(ownerPost),
          nextCursor: null,
          hasMore: false,
        };
        break;
      case "get_review_detail":
        if (!post) return fail(route, "POST_UNAVAILABLE");
        output = { post: ownerPost(post) };
        break;
      default:
        return fail(route, "COMMUNITY_UNAVAILABLE");
    }
    if (definition.write)
      state.operations.set(key, {
        input: JSON.stringify(input),
        output: structuredClone(output),
        resourceId: post?.id ?? (output as { post?: AuthorPost }).post?.id ?? null,
      });
    if (name === "create_upload" && state.loseUploadOnce) {
      state.loseUploadOnce = false;
      return route.abort("connectionreset");
    }
    if (definition.write && name === state.loseWriteOnce) {
      state.loseWriteOnce = null;
      return route.abort("connectionreset");
    }
    if (name === "create_draft" && state.loseCreateOnce) {
      state.loseCreateOnce = false;
      return route.abort("connectionreset");
    }
    const checked = definition.output.safeParse(output);
    if (!checked.success) throw Error(`Broken fixture for ${name}: ${checked.error.message}`);
    return route.fulfill({ json: checked.data });
  });
  await page.route("**/api/community/transfer/*", async (route) => {
    const id = new URL(route.request().url()).pathname.split("/").at(-1)!;
    if (!state.member) return fail(route, "AUTH_REQUIRED");
    if (route.request().postDataJSON()?.uploadId !== id) return fail(route, "INVALID_INPUT");
    if (!state.uploads.has(id)) return fail(route, "UPLOAD_EXPIRED");
    return route.fulfill({
      json: {
        uploadId: id,
        uploadUrl: `https://uploads.fixture.invalid/${id}`,
        uploadUrlExpiresAt: new Date(Date.now() + 300000).toISOString(),
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      },
    });
  });
  await page.route("https://uploads.fixture.invalid/**", async (route) => {
    const headers = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "PUT, OPTIONS",
      "access-control-allow-headers": "content-type, x-upsert",
    };
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
    state.uploaded.push(route.request().postDataBuffer() ?? Buffer.alloc(0));
    if (state.holdUpload) await state.holdUpload;
    return route.fulfill({ status: 200, headers, body: "" });
  });
  await page.route("**/api/community/media/*", (route) => {
    const input = route.request().postDataJSON();
    const mediaId = new URL(route.request().url()).pathname.split("/").at(-1)!;
    if (!["read", "review"].includes(input?.mode) || input?.mediaId !== mediaId)
      return fail(route, "INVALID_INPUT");
    if (input.mode === "review" && !state.owner) return fail(route, "OWNER_REQUIRED");
    state.mediaRequests.push({ mediaId, mode: input.mode });
    return route.fulfill({
      json: {
        mediaId,
        url: "https://media.fixture.invalid/post.png",
        mime: "image/png",
        expiresInSeconds: 300,
      },
    });
  });
  await page.route("https://media.fixture.invalid/**", (route) =>
    route.fulfill({ contentType: "image/png", body: png }),
  );
  await page.route("https://www.youtube-nocookie.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Isolated player fixture</title><p>No external video request.</p>",
    }),
  );
  return state;
}
function publicProjection(post: AuthorPost) {
  return publicFixture({
    id: post.id,
    revision: post.revision,
    kind: post.kind ?? "image",
    title: post.title ?? "Fixture",
    description: post.description,
    recipe: post.recipe,
    tool: post.tool,
    actors: post.actors,
    author: post.author,
    media: post.media.map((medium) => ({
      id: medium.id,
      kind: medium.kind,
      sortOrder: medium.sortOrder,
      altText: medium.altText,
    })),
    video: post.video,
    viewerHasLiked: post.viewerHasLiked,
    likeCount: post.likeCount,
  });
}
export { POST_ID, authorFixture };
