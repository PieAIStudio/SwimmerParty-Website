const votes = new Map<string, Set<string>>();
export function toggleVote(slug: string, userId: string) {
  const set = votes.get(slug) ?? new Set<string>();
  if (set.has(userId)) {
    set.delete(userId);
  } else set.add(userId);
  votes.set(slug, set);
  return { voted: set.has(userId), count: set.size };
}
export function voteCount(slug: string) {
  return votes.get(slug)?.size ?? 0;
}
