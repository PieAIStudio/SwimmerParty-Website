"use client";

import { GameHelpCard, GameIconButton, type GameHelpCardTopic } from "@pieai/swimmer-ui-kit";

/**
 * The "?" beside the CTA row. UIKit 3.2.1 also accepts a server-built trigger; this client component
 * keeps the original element, so the card's ARIA attributes stay on the link.
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
      <GameIconButton data-actor-help-trigger label={label} size="sm">
        ?
      </GameIconButton>
    </GameHelpCard>
  );
}
