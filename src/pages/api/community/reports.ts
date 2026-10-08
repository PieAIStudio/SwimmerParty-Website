import type { NextApiRequest, NextApiResponse } from "next";
import { reportPost } from "@/features/community";
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  if (!/(?:^|;)\s*sp_mock_member=1(?:;|$)/.test(req.headers.cookie ?? ""))
    return res.status(401).json({ error: "sign-in-required" });
  const { postId, reason } = req.body ?? {};
  if (typeof postId !== "string" || typeof reason !== "string")
    return res.status(400).json({ error: "invalid-report" });
  return res.status(200).json(reportPost(postId, "local-mock-member", reason));
}
