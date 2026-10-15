-- Synthetic v3 consumer contract for local Postgres tests only.
-- This is NOT a production migration or a copy of the private backend implementation.
-- Real migration/function comparisons are retained only in ignored local evidence.
create schema swimmer_party;
create schema private;
create schema auth;
create role service_role;
create role authenticated;
create function auth.role() returns text language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
$$;
create table swimmer_party.site_actors (
  slug text primary key,
  enabled boolean not null,
  created_at timestamptz not null default now()
);
create table swimmer_party.site_actor_versions (
  slug text references swimmer_party.site_actors(slug),
  asset_version text not null,
  enabled boolean not null,
  created_at timestamptz not null default now(),
  primary key (slug, asset_version)
);
create table swimmer_party.audit_events(kind text, action text, source text, reason text, meta jsonb);

-- The publicly documented membership precondition; not a substitute for the full draft validator.
create function private.fixture_validate_actor_refs(document jsonb) returns jsonb
language plpgsql as $$
declare actor_ref jsonb;
begin
  for actor_ref in select jsonb_array_elements(document->'actors') loop
    if not exists (
      select 1 from swimmer_party.site_actors a
      join swimmer_party.site_actor_versions v using (slug)
      where a.slug=actor_ref->>'slug' and v.asset_version=actor_ref->>'assetVersion'
        and a.enabled and v.enabled
    ) then raise exception 'INVALID_INPUT' using errcode='PT400'; end if;
  end loop;
  return document;
end $$;
create function private.fixture_catalog_state(actor_slug text) returns jsonb language sql as $$
  select jsonb_build_array(
    (select enabled from swimmer_party.site_actors where slug=actor_slug),
    coalesce((select jsonb_agg(jsonb_build_array(asset_version, enabled) order by asset_version)
              from swimmer_party.site_actor_versions where slug=actor_slug),'[]'::jsonb)
  )
$$;

-- A fake server port with the real RPC name/parameters and only the documented catalog/audit effects.
create function swimmer_party.service_sync_site_actor(p_slug text, p_enabled boolean, p_asset_versions text[])
returns jsonb language plpgsql security definer as $$
declare old_state jsonb; new_state jsonb;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'SERVICE_REQUIRED' using errcode='PT403';
  end if;
  old_state := private.fixture_catalog_state(p_slug);
  insert into swimmer_party.site_actors(slug,enabled) values(p_slug,p_enabled)
    on conflict(slug) do update set enabled=excluded.enabled
      where swimmer_party.site_actors.enabled is distinct from excluded.enabled;
  insert into swimmer_party.site_actor_versions(slug,asset_version,enabled)
    select p_slug, version, p_enabled from unnest(p_asset_versions) version
    on conflict(slug,asset_version) do update set enabled=excluded.enabled
      where swimmer_party.site_actor_versions.enabled is distinct from excluded.enabled;
  update swimmer_party.site_actor_versions set enabled=false
    where slug=p_slug and enabled and not(asset_version=any(p_asset_versions));
  new_state := private.fixture_catalog_state(p_slug);
  if old_state is distinct from new_state then
    insert into swimmer_party.audit_events(kind,action,source,meta)
      values('actor_catalog','sync','system',jsonb_build_object('slug',p_slug,'before',old_state,'after',new_state));
  end if;
  return jsonb_build_object('slug',p_slug,'enabled',p_enabled,'enabledVersions',
    (select count(*)::int from swimmer_party.site_actor_versions where slug=p_slug and enabled));
end $$;
revoke all on all tables in schema swimmer_party from public, service_role, authenticated;
revoke all on all functions in schema swimmer_party, private from public, authenticated;
grant usage on schema swimmer_party, private, auth to service_role;
grant execute on function swimmer_party.service_sync_site_actor(text,boolean,text[]) to service_role;
