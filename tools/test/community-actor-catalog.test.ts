import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { ACTORS } from "../../src/content/actors/index.ts";
import {
  READ_CATALOG_SQL,
  applyCatalogSql,
  normalizeCatalogState,
  planActorCatalog,
  siteActorCatalog,
  syncActorCatalog,
} from "../release/community-actor-catalog.ts";
import { catalogOptions } from "../release/sync-community-actors.ts";
import { communityOperations } from "../../src/contracts/community-operations.ts";

const REF = "abcdefghijklmnopqrst";
const EMPTY = { actors: [], versions: [] };
const desired = siteActorCatalog(ACTORS);

test("catalog sync is a manual release gate, never a browser operation or automatic build side effect", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(pkg.scripts["community:actors:sync"], "node tools/release/sync-community-actors.ts");
  for (const [name, command] of Object.entries(pkg.scripts))
    if (name !== "community:actors:sync")
      assert(!/sync-community-actors|community:actors:sync/.test(String(command)));
  assert(!Object.keys(communityOperations).some((name) => name.startsWith("service_")));
  const guide = readFileSync("docs/reference/release.md", "utf8");
  assert.match(guide, /community:actors:sync --project-ref <project-ref> --check/);
  assert.match(guide, /--apply --expect-plan <planSha256>/);
  assert.match(guide, /promote 前还须对同候选再跑一次目录/);
});

test("catalog derives all picker actors plus explicit history, never retired identities or default versions", () => {
  assert.equal(desired.length, 97);
  assert.equal(
    desired.reduce((n, r) => n + r.assetVersions.length, 0),
    99,
  );
  assert.deepEqual(
    desired.map((r) => r.slug).sort(),
    ACTORS.filter((a) => typeof a.version === "string")
      .map((a) => a.slug)
      .sort(),
  );
  for (const actor of ACTORS)
    assert(desired.find((r) => r.slug === actor.slug)?.assetVersions.includes(actor.version!));
  assert.deepEqual(desired.find((r) => r.slug === "tang-yunqiu")?.assetVersions, [
    "1.0.0",
    "1.1.0",
  ]);
  assert(!desired.some((r) => ["lei-le", "chang-shulan"].includes(r.slug)));
});
test("catalog validation rejects empty, missing-version, duplicate and injectable source before any query", async () => {
  for (const rows of [
    [],
    [{ slug: "test" }],
    [{ slug: "bad';drop", version: "1" }],
    [{ slug: "ok", version: "'1" }],
    [
      { slug: "same", version: "1" },
      { slug: "same", version: "2" },
    ],
  ])
    assert.throws(() => siteActorCatalog(rows));
  let calls = 0;
  await assert.rejects(
    syncActorCatalog({
      projectRef: REF,
      desired,
      apply: true,
      query: async () => {
        calls++;
        return [];
      },
    }),
    /expect-plan/,
  );
  assert.equal(calls, 0);
  assert.throws(() =>
    normalizeCatalogState({
      actors: [],
      versions: [{ slug: "orphan", assetVersion: "1", enabled: true }],
    }),
  );
});
test("default CLI is read-only, mutually exclusive modes and explicit approval prevent accidental sync", () => {
  assert.equal(catalogOptions(["--project-ref", REF]).mode, "dry-run");
  for (const args of [
    [],
    ["--project-ref", REF, "--apply"],
    ["--project-ref", REF, "--apply", "--dry-run"],
    ["--project-ref", REF, "--project-ref", REF],
    ["--project-ref", REF, "--report", ".devspace-reports/../secret.json"],
  ])
    assert.throws(() => catalogOptions(args));
});
test("plan is deterministic, target-bound, preserves disabled rows and forecasts native audits", () => {
  const a = planActorCatalog(REF, desired, EMPTY);
  assert.deepEqual(a, planActorCatalog(REF, [...desired].reverse(), EMPTY));
  assert.notEqual(
    a.planSha256,
    planActorCatalog("bcdefghijklmnopqrstu", desired, EMPTY).planSha256,
  );
  assert.deepEqual(a.counts, {
    insertActors: 97,
    insertVersions: 99,
    disableActors: 0,
    disableVersions: 0,
    changedActors: 97,
    expectedAuditRows: 97,
    deletedRows: 0,
  });
  assert.equal(planActorCatalog(REF, desired, a.after).changes.length, 0);
  assert.throws(() => applyCatalogSql({ ...a, planSha256: "0".repeat(64) }), /modified/);
});

test("Postgres contract fixture: empty catalog reproduces rejection, sync is atomic/idempotent and denied to members", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(readFileSync("tools/test/fixtures/community-catalog.sql", "utf8"));
  const query = async (sql: string) => {
    const results = await db.exec(sql);
    return results.findLast((r) => r.rows.length)?.rows ?? [];
  };
  const snapshot = async () => (await query(READ_CATALOG_SQL))[0].snapshot;
  const content = (slug: string, assetVersion: string, kind = "image") => ({
    kind,
    title: "Catalog contract fixture",
    actors: [{ slug, assetVersion }],
  });
  await t.test(
    "documented membership gate rejects the three reported actor/version pairs before media is involved",
    async () => {
      for (const [slug, version] of [
        ["zhang-qiang", "1.0.0"],
        ["tang-yunqiu", "1.1.0"],
        ["misha-luo", "1.1.0"],
      ])
        for (const kind of ["image", "audio"])
          await assert.rejects(
            db.query("select private.fixture_validate_actor_refs($1::jsonb)", [
              JSON.stringify(content(slug, version, kind)),
            ]),
            /INVALID_INPUT/,
          );
      assert.deepEqual(await snapshot(), EMPTY);
    },
  );
  await t.test("dry-run reads only and never invokes the service function", async () => {
    const calls: string[] = [];
    const r = await syncActorCatalog({
      projectRef: REF,
      desired,
      query: async (sql) => {
        calls.push(sql);
        return query(sql);
      },
    });
    assert.equal(r.applied, false);
    assert.equal(r.plan.changes.length, 97);
    assert(calls.every((sql) => sql.startsWith("BEGIN READ ONLY;")));
    assert.deepEqual(await snapshot(), EMPTY);
  });
  await t.test("wrong approved plan cannot write anything", async () => {
    await assert.rejects(
      syncActorCatalog({
        projectRef: REF,
        desired,
        query,
        apply: true,
        expectedPlan: "0".repeat(64),
      }),
      /changed since review/,
    );
    assert.deepEqual(await snapshot(), EMPTY);
  });
  await t.test(
    "reviewed plan applies 97 actors and 99 versions with 97 audit events, then reads back",
    async () => {
      const plan = planActorCatalog(REF, desired, EMPTY);
      const r = await syncActorCatalog({
        projectRef: REF,
        desired,
        query,
        apply: true,
        expectedPlan: plan.planSha256,
      });
      assert(r.applied && r.verified);
      assert.deepEqual(normalizeCatalogState(await snapshot()), plan.after);
      assert.equal(
        (await db.query<{ n: number }>("select count(*)::int n from swimmer_party.audit_events"))
          .rows[0].n,
        97,
      );
      for (const actor of ACTORS)
        for (const kind of ["image", "audio"])
          await db.query("select private.fixture_validate_actor_refs($1::jsonb)", [
            JSON.stringify(content(actor.slug, actor.version!, kind)),
          ]);
    },
  );
  await t.test(
    "identical repeat is a no-op, no second audit and no automatic apply on lost reply",
    async () => {
      // Repeat the exact original approved command after success: already converged means no writes.
      const plan = planActorCatalog(REF, desired, EMPTY);
      let writes = 0;
      const r = await syncActorCatalog({
        projectRef: REF,
        desired,
        apply: true,
        expectedPlan: plan.planSha256,
        query: async (sql) => {
          if (!sql.startsWith("BEGIN READ ONLY")) writes++;
          return query(sql);
        },
      });
      assert(r.verified && !r.applied);
      assert.equal(writes, 0);
      assert.equal(
        (await db.query<{ n: number }>("select count(*)::int n from swimmer_party.audit_events"))
          .rows[0].n,
        97,
      );
    },
  );
  await t.test(
    "unknown versions still fail; source-recorded 1.0 history remains usable",
    async () => {
      await db.query("select private.fixture_validate_actor_refs($1::jsonb)", [
        JSON.stringify(content("tang-yunqiu", "1.0.0")),
      ]);
      await assert.rejects(
        db.query("select private.fixture_validate_actor_refs($1::jsonb)", [
          JSON.stringify(content("tang-yunqiu", "99.0")),
        ]),
        /INVALID_INPUT/,
      );
    },
  );
  await t.test(
    "delisting disables actor/version without deleting dependent historical references",
    async () => {
      await db.exec(
        "insert into swimmer_party.site_actors values ('retired', true, now()); insert into swimmer_party.site_actor_versions values ('retired','1',true,now()); create table swimmer_party.fixture_post_actor(slug text, version text, foreign key(slug,version) references swimmer_party.site_actor_versions(slug,asset_version)); insert into swimmer_party.fixture_post_actor values ('retired','1');",
      );
      const plan = planActorCatalog(REF, desired, await snapshot());
      assert.deepEqual(plan.changes, [{ slug: "retired", enabled: false, assetVersions: [] }]);
      await syncActorCatalog({
        projectRef: REF,
        desired,
        query,
        apply: true,
        expectedPlan: plan.planSha256,
      });
      assert.equal(
        (
          await db.query<{ n: number }>(
            "select count(*)::int n from swimmer_party.fixture_post_actor",
          )
        ).rows[0].n,
        1,
      );
      assert.equal(
        (
          await db.query<{ enabled: boolean }>(
            "select enabled from swimmer_party.site_actor_versions where slug='retired'",
          )
        ).rows[0].enabled,
        false,
      );
    },
  );
  await t.test(
    "database drift after planning aborts the write transaction rather than overwriting",
    async () => {
      const smaller = desired.filter((r) => r.slug !== "zhang-qiang");
      const plan = planActorCatalog(REF, smaller, await snapshot());
      await db.exec("update swimmer_party.site_actors set enabled=false where slug='bao-man'");
      await assert.rejects(db.exec(applyCatalogSql(plan)), /ACTOR_CATALOG_CHANGED_REPLAN/);
      await db.exec("rollback");
      assert.equal(
        (
          await db.query<{ enabled: boolean }>(
            "select enabled from swimmer_party.site_actors where slug='zhang-qiang'",
          )
        ).rows[0].enabled,
        true,
      );
      await db.exec("update swimmer_party.site_actors set enabled=true where slug='bao-man'");
    },
  );
  await t.test(
    "a later RPC failure rolls back the entire batch, including earlier audits",
    async () => {
      const before = await snapshot();
      const plan = planActorCatalog(
        REF,
        [
          ...desired,
          { slug: "zz-one", enabled: true, assetVersions: ["1"] },
          { slug: "zz-two", enabled: true, assetVersions: ["1"] },
        ],
        before,
      );
      await db.exec(
        "create function swimmer_party.fixture_fail() returns trigger language plpgsql as $$begin if new.slug='zz-two' then raise exception 'fixture error'; end if; return new; end$$; create trigger fixture_fail before insert on swimmer_party.site_actors for each row execute function swimmer_party.fixture_fail();",
      );
      await assert.rejects(db.exec(applyCatalogSql(plan)), /fixture error/);
      await db.exec("rollback");
      assert.deepEqual(await snapshot(), before);
      assert.equal(
        (
          await db.query<{ n: number }>(
            "select count(*)::int n from swimmer_party.audit_events where meta->>'slug'='zz-one'",
          )
        ).rows[0].n,
        0,
      );
      await db.exec("drop trigger fixture_fail on swimmer_party.site_actors");
    },
  );
  await t.test("signed-in member role cannot invoke the service-only sync function", async () => {
    await assert.rejects(
      db.exec(
        "begin;set local role authenticated;select swimmer_party.service_sync_site_actor('intruder',true,array['1']);commit;",
      ),
      /permission denied/,
    );
    await db.exec("rollback");
    assert.equal(
      (
        await db.query<{ n: number }>(
          "select count(*)::int n from swimmer_party.site_actors where slug='intruder'",
        )
      ).rows[0].n,
      0,
    );
  });
  await t.test(
    "lost apply reply is not retried and a new dry-run observes the committed state",
    async () => {
      const next = [...desired, { slug: "new-actor", enabled: true, assetVersions: ["1"] }];
      const plan = planActorCatalog(REF, next, await snapshot());
      let writes = 0;
      await assert.rejects(
        syncActorCatalog({
          projectRef: REF,
          desired: next,
          apply: true,
          expectedPlan: plan.planSha256,
          query: async (sql) => {
            const rows = await query(sql);
            if (sql.startsWith("BEGIN;")) {
              writes++;
              throw Error("lost response");
            }
            return rows;
          },
        }),
        /lost response/,
      );
      assert.equal(writes, 1);
      assert.equal(
        (await syncActorCatalog({ projectRef: REF, desired: next, query })).plan.changes.length,
        0,
      );
    },
  );
});
