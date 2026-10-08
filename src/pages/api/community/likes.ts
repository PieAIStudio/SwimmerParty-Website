import type { NextApiRequest, NextApiResponse } from "next";
const likes = new Set<string>();
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  if (!/(?:^|;)\s*sp_mock_member=1(?:;|$)/.test(req.headers.cookie ?? ""))
    return res.status(401).json({ error: "sign-in-required" });
  const id = String(req.body?.postId ?? "");
  if (!id) return res.status(400).json({ error: "post-required" });
  const key = `local-mock-member:${id}`;
  if (likes.has(key)) likes.delete(key);
  else likes.add(key);
  return res.status(200).json({ liked: likes.has(key) });
}
