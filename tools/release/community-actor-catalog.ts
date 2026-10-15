import { createHash } from "node:crypto";
import { z } from "zod";
import type { Actor } from "../../src/content/actors/index.ts";

const slug = z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/);
const version = z.string().regex(/^[A-Za-z0-9._-]{1,80}$/);
const actorRow = z.strictObject({ slug, enabled: z.boolean() });
const versionRow = actorRow.extend({ assetVersion: version });
const stateSchema = z.strictObject({
  actors: z.array(actorRow).max(10000),
  versions: z.array(versionRow).max(500000),
});
type CatalogState = z.infer<typeof stateSchema>;
type CatalogEntry = { slug: string; enabled: boolean; assetVersions: string[] };
const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

/** The website's shipped current and explicitly recorded historical versions, never guessed defaults. */
export function siteActorCatalog(
  actors: readonly Pick<Actor, "slug" | "version" | "versionHistory">[],
): CatalogEntry[] {
  if (!actors.length || actors.length > 10000) throw Error("Empty or oversized website catalog");
  const seen = new Set<string>();
  return actors
    .map((actor) => {
      const id = slug.parse(actor.slug);
      if (seen.has(id)) throw Error("Duplicate website actor");
      seen.add(id);
      const current = version.parse(actor.version);
      const versions = [
        ...new Set([current, ...(actor.versionHistory ?? []).map((v) => version.parse(v.version))]),
      ].sort(compare);
      if (versions.length > 50) throw Error("Too many actor versions");
      return { slug: id, enabled: true, assetVersions: versions };
    })
    .sort((a, b) => compare(a.slug, b.slug));
}
export function normalizeCatalogState(value: unknown): CatalogState {
  const result = stateSchema.parse(value);
  const actors = new Set<string>(),
    versions = new Set<string>();
  for (const row of result.actors) {
    if (actors.has(row.slug)) throw Error("Duplicate catalog actor");
    actors.add(row.slug);
  }
  for (const row of result.versions) {
    const id = `${row.slug}:${row.assetVersion}`;
    if (!actors.has(row.slug) || versions.has(id))
      throw Error("Invalid catalog version relationship");
    versions.add(id);
  }
  return {
    actors: result.actors.sort((a, b) => compare(a.slug, b.slug)),
    versions: result.versions.sort(
      (a, b) => compare(a.slug, b.slug) || compare(a.assetVersion, b.assetVersion),
    ),
  };
}
const CATALOG_SNAPSHOT = `jsonb_build_object(
  'actors', coalesce((select jsonb_agg(jsonb_build_object('slug', slug, 'enabled', enabled) order by slug collate "C") from swimmer_party.site_actors), '[]'::jsonb),
  'versions', coalesce((select jsonb_agg(jsonb_build_object('slug', slug, 'assetVersion', asset_version, 'enabled', enabled) order by slug collate "C", asset_version collate "C") from swimmer_party.site_actor_versions), '[]'::jsonb)
)`;
export const READ_CATALOG_SQL = `BEGIN READ ONLY;\nSET LOCAL statement_timeout = '15s';\nSELECT ${CATALOG_SNAPSHOT} AS snapshot;\nROLLBACK;`;

export function planActorCatalog(projectRef: string, desired: CatalogEntry[], value: unknown) {
  if (!/^[a-z]{20}$/.test(projectRef)) throw Error("Explicit Supabase project ref required");
  // Validate at this boundary as well; callers cannot supply arbitrary RPC/SQL values.
  const entries = siteActorCatalog(
    desired.map((row) => {
      if (row.enabled !== true || !row.assetVersions.length)
        throw Error("Desired actors must be enabled with versions");
      return {
        slug: row.slug,
        version: row.assetVersions[0],
        versionHistory: row.assetVersions
          .slice(1)
          .map((v) => ({ version: v, date: "", note: { en: "", zh: "" } })),
      };
    }),
  );
  const before = normalizeCatalogState(value);
  const all = new Map(entries.map((row) => [row.slug, row]));
  for (const row of before.actors)
    if (!all.has(row.slug))
      all.set(row.slug, { slug: row.slug, enabled: false, assetVersions: [] });
  const changes: CatalogEntry[] = [];
  const afterActors = new Map(before.actors.map((row) => [row.slug, { ...row }]));
  const afterVersions = new Map(
    before.versions.map((row) => [`${row.slug}:${row.assetVersion}`, { ...row }]),
  );
  for (const row of [...all.values()].sort((a, b) => compare(a.slug, b.slug))) {
    const existing = before.actors.find((item) => item.slug === row.slug);
    const versions = before.versions.filter((item) => item.slug === row.slug);
    if (
      existing?.enabled === row.enabled &&
      row.assetVersions.every((v) =>
        versions.some((item) => item.assetVersion === v && item.enabled === row.enabled),
      ) &&
      versions.every(
        (item) => item.enabled === (row.enabled && row.assetVersions.includes(item.assetVersion)),
      )
    )
      continue;
    changes.push(row);
    afterActors.set(row.slug, { slug: row.slug, enabled: row.enabled });
    for (const item of versions)
      afterVersions.set(`${row.slug}:${item.assetVersion}`, {
        ...item,
        enabled: row.enabled && row.assetVersions.includes(item.assetVersion),
      });
    for (const v of row.assetVersions)
      afterVersions.set(`${row.slug}:${v}`, {
        slug: row.slug,
        assetVersion: v,
        enabled: row.enabled,
      });
  }
  const after = normalizeCatalogState({
    actors: [...afterActors.values()],
    versions: [...afterVersions.values()],
  });
  const body = { projectRef, catalogSha256: digest(entries), before, changes, after };
  return {
    ...body,
    planSha256: digest(body),
    counts: {
      insertActors: after.actors.length - before.actors.length,
      insertVersions: after.versions.length - before.versions.length,
      disableActors: changes.filter((row) => !row.enabled).length,
      disableVersions: before.versions.filter(
        (row) =>
          row.enabled &&
          !after.versions.find((v) => v.slug === row.slug && v.assetVersion === row.assetVersion)
            ?.enabled,
      ).length,
      changedActors: changes.length,
      expectedAuditRows: changes.length,
      deletedRows: 0,
    },
  };
}
type CatalogPlan = ReturnType<typeof planActorCatalog>;
// Values have already been validated, but always escape literals rather than interpolate raw input.
const literal = (value: string) => "'" + value.replaceAll("'", "''") + "'";

/** One transaction; only the existing service-only function writes catalog rows and its native audit. */
export function applyCatalogSql(plan: CatalogPlan): string {
  const normalized = planActorCatalog(
    plan.projectRef,
    plan.after.actors
      .filter((a) => a.enabled)
      .map((a) => ({
        ...a,
        assetVersions: plan.after.versions
          .filter((v) => v.slug === a.slug && v.enabled)
          .map((v) => v.assetVersion),
      })),
    plan.before,
  );
  if (normalized.planSha256 !== plan.planSha256) throw Error("Invalid or modified catalog plan");
  return `BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
LOCK TABLE swimmer_party.site_actors, swimmer_party.site_actor_versions IN SHARE ROW EXCLUSIVE MODE;
DO $catalog_guard$ BEGIN
  IF (${CATALOG_SNAPSHOT}) IS DISTINCT FROM ${literal(JSON.stringify(plan.before))}::jsonb THEN
    RAISE EXCEPTION 'ACTOR_CATALOG_CHANGED_REPLAN';
  END IF;
END $catalog_guard$;
-- Operator-scoped Management API connection, narrowed for the native RPC; never a user session or browser credential.
SET LOCAL request.jwt.claims = '{"role":"service_role"}';
SET LOCAL ROLE service_role;
DO $catalog_apply$ BEGIN
${plan.changes.map((row) => `  PERFORM swimmer_party.service_sync_site_actor(${literal(row.slug)}, ${row.enabled ? "true" : "false"}, ARRAY[${row.assetVersions.map(literal).join(", ")}]::text[]);`).join("\n")}
END $catalog_apply$;
RESET ROLE;
DO $catalog_verify$ BEGIN
  IF (${CATALOG_SNAPSHOT}) IS DISTINCT FROM ${literal(JSON.stringify(plan.after))}::jsonb THEN
    RAISE EXCEPTION 'ACTOR_CATALOG_VERIFY_FAILED';
  END IF;
END $catalog_verify$;
SELECT ${CATALOG_SNAPSHOT} AS snapshot;
COMMIT;`;
}

type CatalogQuery = (sql: string) => Promise<unknown>;
function readSnapshot(rows: unknown): CatalogState {
  if (!Array.isArray(rows) || rows.length !== 1 || !rows[0]?.snapshot)
    throw Error("Unexpected catalog response");
  return normalizeCatalogState(rows[0].snapshot);
}
export async function syncActorCatalog({
  projectRef,
  desired,
  query,
  apply = false,
  expectedPlan,
  onPlan = () => undefined,
}: {
  projectRef: string;
  desired: CatalogEntry[];
  query: CatalogQuery;
  apply?: boolean;
  expectedPlan?: string;
  onPlan?: (plan: CatalogPlan) => void | Promise<void>;
}) {
  if (apply && !/^[a-f0-9]{64}$/.test(expectedPlan ?? ""))
    throw Error("Apply requires the reviewed --expect-plan hash");
  // Validate all desired input before opening a connection.
  planActorCatalog(projectRef, desired, { actors: [], versions: [] });
  const plan = planActorCatalog(projectRef, desired, readSnapshot(await query(READ_CATALOG_SQL)));
  await onPlan(plan);
  if (!apply) return { plan, applied: false, verified: false };
  if (plan.changes.length && expectedPlan !== plan.planSha256)
    throw Error("Catalog changed since review: dry-run and approve the new plan");
  if (plan.changes.length) {
    const written = readSnapshot(await query(applyCatalogSql(plan)));
    if (JSON.stringify(written) !== JSON.stringify(plan.after))
      throw Error("Apply response could not be verified; do not automatically retry");
  }
  // Independent post-commit read; never infer success from the request completing.
  const verified = readSnapshot(await query(READ_CATALOG_SQL));
  if (JSON.stringify(verified) !== JSON.stringify(plan.after))
    throw Error("Post-commit readback mismatch");
  return { plan, applied: plan.changes.length > 0, verified: true };
}
