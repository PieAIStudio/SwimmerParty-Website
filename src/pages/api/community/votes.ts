import type { NextApiRequest, NextApiResponse } from "next";
import { toggleVote, voteCount } from "@/features/community";
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const slug = typeof req.query.slug === "string" ? req.query.slug : "";
    return slug
      ? res.status(200).json({ count: voteCount(slug) })
      : res.status(400).json({ error: "slug-required" });
  }
  if (req.method !== "POST") return res.status(405).end();
  if (!/(?:^|;)\s*sp_mock_member=1(?:;|$)/.test(req.headers.cookie ?? ""))
    return res.status(401).json({ error: "sign-in-required" });
  const slug = typeof req.body?.slug === "string" ? req.body.slug : "";
  if (!slug) return res.status(400).json({ error: "slug-required" });
  return res.status(200).json(toggleVote(slug, "local-mock-member"));
}
export { voteCount };
