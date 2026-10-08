export type CommunityKind = "image" | "video" | "audio" | "game" | "other";
export type CommunityPost = {
  id: string;
  kind: CommunityKind;
  title: string;
  description?: string;
  author: string;
  authorId?: string;
  actorSlugs: string[];
  tool?: string;
  recipe?: string;
  mediaUrl?: string;
  official?: boolean;
  likes: number;
  createdAt: string;
  status: "published" | "pending" | "hidden";
};
