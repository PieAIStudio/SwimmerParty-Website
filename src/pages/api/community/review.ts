import type { NextApiRequest, NextApiResponse } from "next";
import { listReviewQueue, reviewPost } from "@/features/community";

function isMember(req: NextApiRequest) {
  return /(?:^|;)\s*sp_mock_member=1(?:;|$)/.test(req.headers.cookie ?? "");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isMember(req)) return res.status(401).json({ error: "sign-in-required" });
  if (req.method === "GET") return res.status(200).json({ posts: listReviewQueue() });
  if (req.method !== "POST") return res.status(405).end();
  const body = req.body as Record<string, unknown>;
  if (typeof body.id !== "string" || !["approve", "hide"].includes(String(body.action)))
    return res.status(400).json({ error: "invalid-review" });
  const post = reviewPost(body.id, body.action as "approve" | "hide");
  return post ? res.status(200).json({ post }) : res.status(404).json({ error: "not-found" });
}
