import {
  normalizeUploadTarget,
  uploadTargetResponseSchema,
  type TransferTarget,
} from "../../contracts/community-transfer.ts";
import { uploadInputSchema, type UploadStatus } from "../../contracts/community.ts";
import { callCommunity, WriteSession } from "./api.ts";
import { CommunityError, responseError } from "./errors.ts";

export type UploadProgress = {
  stage: "reserving" | "uploading" | "validating" | "ready";
  loaded: number;
  total: number;
  uploadId?: string;
};
/** Byte progress is transport evidence only; 100% does not mean ready or published. */
function sendUpload(
  file: File,
  target: TransferTarget,
  progress: (loaded: number, total: number) => void,
  signal: AbortSignal,
): Promise<void> {
  if (Date.parse(target.expiresAt) <= Date.now())
    return Promise.reject(new CommunityError("UPLOAD_EXPIRED"));
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const finish = (error?: CommunityError) => {
      signal.removeEventListener("abort", abort);
      if (error) reject(error);
      else resolve();
    };
    xhr.open(target.method, target.url);
    xhr.withCredentials = false;
    xhr.timeout = 120000;
    for (const [name, value] of Object.entries(target.headers)) xhr.setRequestHeader(name, value);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) progress(event.loaded, event.total);
    };
    xhr.onload = () =>
      finish(
        xhr.status >= 200 && xhr.status < 300
          ? undefined
          : new CommunityError(xhr.status === 403 ? "UPLOAD_EXPIRED" : "PROCESSING_UNAVAILABLE"),
      );
    xhr.onerror = xhr.ontimeout = () =>
      finish(new CommunityError("PROCESSING_UNAVAILABLE", { uncertain: true }));
    xhr.onabort = () => finish(new CommunityError("PROCESSING_UNAVAILABLE", { uncertain: true }));
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) {
      finish(new CommunityError("PROCESSING_UNAVAILABLE"));
      return;
    }
    xhr.send(file);
  });
}
export async function uploadCommunityFile(options: {
  postId: string;
  revision: number;
  file: File;
  durationMs?: number;
  sortOrder: number;
  existingUploadId?: string;
  renewExpired?: boolean;
  journal: WriteSession;
  progress: (value: UploadProgress) => void;
  signal: AbortSignal;
}): Promise<UploadStatus> {
  const { file, signal, progress } = options;
  progress({ stage: "reserving", loaded: 0, total: file.size });
  const input = uploadInputSchema.parse({
    mime: file.type,
    bytes: file.size,
    sortOrder: options.sortOrder,
    ...(options.durationMs ? { durationMs: options.durationMs } : {}),
  });
  let intent = options.existingUploadId
    ? await callCommunity("get_upload_status", { uploadId: options.existingUploadId }, signal)
    : await options.journal.execute(
        "create_upload",
        { postId: options.postId, expectedRevision: options.revision, file: input },
        callCommunity,
        signal,
      );
  if (
    options.existingUploadId &&
    options.renewExpired &&
    !["completed", "finalizing"].includes(intent.status)
  ) {
    // Only an explicit expiry recovery starts a new intent; uncertain completion keeps its original operation ID.
    intent = await options.journal.execute(
      "create_upload",
      { postId: options.postId, expectedRevision: options.revision, file: input },
      callCommunity,
      signal,
    );
  }
  if (intent.status === "expired") throw new CommunityError("UPLOAD_EXPIRED");
  if (intent.status === "failed" || intent.processingStatus === "failed")
    throw new CommunityError(intent.failureCode ?? "MEDIA_INVALID");
  if (intent.status === "completed" || intent.status === "finalizing") {
    progress({
      stage: intent.processingStatus === "ready" ? "ready" : "validating",
      loaded: file.size,
      total: file.size,
      uploadId: intent.uploadId,
    });
    return intent;
  }
  progress({ stage: "uploading", loaded: 0, total: file.size, uploadId: intent.uploadId });
  // The same-origin route invokes only the B2 upload-target edge function with the verified user.
  const targetResponse = await fetch(`/api/community/transfer/${intent.uploadId}`, {
    method: "POST",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ uploadId: intent.uploadId }),
    signal,
  });
  const targetBody: unknown = await targetResponse.json().catch(() => null);
  if (!targetResponse.ok) throw responseError(targetBody, targetResponse.status);
  const rawTarget = uploadTargetResponseSchema.safeParse(targetBody);
  if (!rawTarget.success) throw new CommunityError("PROCESSING_UNAVAILABLE");
  if (Date.parse(rawTarget.data.uploadUrlExpiresAt) <= Date.now())
    throw new CommunityError("UPLOAD_EXPIRED");
  const target = normalizeUploadTarget(rawTarget.data, intent.uploadId, file.type);
  await sendUpload(
    file,
    target,
    (loaded, total) => progress({ stage: "uploading", loaded, total, uploadId: intent.uploadId }),
    signal,
  );
  progress({ stage: "validating", loaded: file.size, total: file.size, uploadId: intent.uploadId });
  const status = await options.journal.execute(
    "complete_upload",
    { uploadId: intent.uploadId },
    callCommunity,
    signal,
  );
  if (status.processingStatus === "ready")
    progress({ stage: "ready", loaded: file.size, total: file.size, uploadId: intent.uploadId });
  return status;
}
