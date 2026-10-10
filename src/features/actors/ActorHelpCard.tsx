"use client";

import { GameHelpCard, GameIconButton, type GameHelpCardTopic } from "@pieai/swimmer-ui-kit";
import { Link } from "@/i18n/navigation";

/**
 * The "?" beside the CTA row. Its trigger is built in this client component: passing a trigger
 * built by the server component crashed server rendering for some actors (zhang-qiang, chen-wei).
 */
export function ActorHelpCard({
  label,
  link,
  topics,
}: {
  label: string;
  link: { href: string; label: string };
  topics: readonly GameHelpCardTopic[];
}) {
  return (
    <GameHelpCard label={label} topics={topics} link={link} placement="bottom" align="end">
      <GameIconButton href="/guide" linkComponent={Link} label={label} size="sm">
        ?
      </GameIconButton>
    </GameHelpCard>
  );
}
