-- Run once in the Supabase SQL editor. No public sign-up grants CMS access.
create table public.cms_staff (
  user_id uuid primary key references auth.users(id) on delete restrict,
  email text not null, role text not null check (role in ('manager','editor')), active boolean not null default true
);
create table public.cms_apps (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  draft jsonb not null, published jsonb, archived boolean not null default false,
  version integer not null default 1, position integer not null default 0,
  updated_at timestamptz not null default now(),
  check (draft->>'id' = id), check (published is null or published->>'id' = id)
);
create table public.cms_media (id uuid primary key, data jsonb not null, created_at timestamptz not null default now());
create table public.cms_audit (id bigint generated always as identity primary key, actor uuid not null, email text not null, action text not null, target text, detail jsonb not null default '{}', created_at timestamptz not null default now());
create table public.cms_meta (id integer primary key check(id=1), version integer not null default 0);
insert into public.cms_meta(id) values(1);
alter table public.cms_staff enable row level security;
alter table public.cms_apps enable row level security;
alter table public.cms_media enable row level security;
alter table public.cms_audit enable row level security;
alter table public.cms_meta enable row level security;
revoke all on public.cms_staff, public.cms_apps, public.cms_media, public.cms_audit, public.cms_meta from anon, authenticated;
grant all on public.cms_staff, public.cms_apps, public.cms_media, public.cms_audit, public.cms_meta to service_role;
grant usage, select on sequence public.cms_audit_id_seq to service_role;

create function public.cms_apply(p_actor uuid, p_action text, p_body jsonb default '{}', p_expected integer default null)
returns jsonb language plpgsql security invoker set search_path = public, pg_temp as $$
declare member cms_staff; existing cms_apps; item jsonb; row_id text; changed jsonb; global_version integer;
begin
  select * into member from cms_staff where user_id=p_actor and active;
  if member.user_id is null then raise exception 'forbidden' using errcode='42501'; end if;
  if p_action not in ('save','media') and member.role <> 'manager' then raise exception 'manager_required' using errcode='42501'; end if;
  select version into global_version from cms_meta where id=1 for update;
  row_id := p_body->>'id';
  if p_action = 'save' then
    select * into existing from cms_apps where id=row_id for update;
    if existing.id is null then
      if p_expected is not null then raise exception 'revision_conflict' using errcode='40001'; end if;
      insert into cms_apps(id,draft) values(row_id,p_body) returning to_jsonb(cms_apps.*) into changed;
    else
      if p_expected is distinct from existing.version then raise exception 'revision_conflict' using errcode='40001'; end if;
      update cms_apps set draft=p_body, version=version+1, updated_at=now() where id=row_id returning to_jsonb(cms_apps.*) into changed;
    end if;
  elsif p_action in ('publish','archive','unarchive') then
    select * into existing from cms_apps where id=row_id for update;
    if existing.id is null then raise exception 'not_found' using errcode='P0002'; end if;
    if p_expected is distinct from existing.version then raise exception 'revision_conflict' using errcode='40001'; end if;
    update cms_apps set
      published=case when p_action='publish' then draft else published end,
      archived=case when p_action='archive' then true else false end,
      position=case when p_action='publish' then coalesce((draft->>'sortOrder')::integer,0) else position end,
      version=version+1, updated_at=now()
      where id=row_id returning to_jsonb(cms_apps.*) into changed;
  elsif p_action='seed' then
    for item in select value from jsonb_array_elements(p_body->'apps') loop
      insert into cms_apps(id,draft,published,position) values(item->>'id', item, item, (item->>'sortOrder')::integer) on conflict(id) do nothing;
    end loop;
  elsif p_action='media' then
    insert into cms_media(id,data) values((p_body->>'id')::uuid,p_body) on conflict(id) do update set data=excluded.data;
  elsif p_action='staff' then
    if p_body->>'role' not in ('manager','editor') then raise exception 'invalid_role'; end if;
    if exists(select 1 from cms_staff where user_id=(p_body->>'user_id')::uuid and role='manager' and active)
      and (p_body->>'role'<>'manager' or not (p_body->>'active')::boolean)
      and (select count(*) from cms_staff where role='manager' and active)<=1 then raise exception 'last_manager'; end if;
    insert into cms_staff(user_id,email,role,active) values((p_body->>'user_id')::uuid,p_body->>'email',p_body->>'role',(p_body->>'active')::boolean)
      on conflict(user_id) do update set email=excluded.email, role=excluded.role, active=excluded.active;
    row_id := p_body->>'user_id';
  elsif p_action='restore' then
    if p_expected is distinct from global_version then raise exception 'revision_conflict' using errcode='40001'; end if;
    -- Restores content only. Permissions and audit history are never overwritten.
    update cms_apps set archived=true, version=version+1, updated_at=now();
    for item in select value from jsonb_array_elements(p_body->'apps') loop
      insert into cms_apps(id,draft,published,archived,position) values(item->>'id',item->'draft',nullif(item->'published','null'::jsonb),(item->>'archived')::boolean,(item->>'position')::integer)
      on conflict(id) do update set draft=excluded.draft,published=excluded.published,archived=excluded.archived,position=excluded.position,updated_at=now();
    end loop;
    for item in select value from jsonb_array_elements(p_body->'media') loop
      insert into cms_media(id,data) values((item->>'id')::uuid,item) on conflict(id) do update set data=excluded.data;
    end loop;
  else raise exception 'invalid_action';
  end if;
  update cms_meta set version=version+1 where id=1;
  insert into cms_audit(actor,email,action,target,detail) values(p_actor,member.email,p_action,row_id,
    case when p_action='restore' then jsonb_build_object('apps',jsonb_array_length(p_body->'apps'),'sourceExport',p_body->>'exportedAt') else jsonb_build_object('name',coalesce(p_body->>'name',p_body->>'email'),'version',changed->'version') end);
  return coalesce(changed,jsonb_build_object('ok',true));
end $$;
revoke all on function public.cms_apply(uuid,text,jsonb,integer) from public, anon, authenticated;
grant execute on function public.cms_apply(uuid,text,jsonb,integer) to service_role;

create function public.cms_snapshot(p_actor uuid) returns jsonb
language plpgsql security invoker set search_path = public, pg_temp as $$
declare v integer;
begin
  if not exists(select 1 from cms_staff where user_id=p_actor and role='manager' and active) then raise exception 'manager_required' using errcode='42501'; end if;
  select version into v from cms_meta where id=1 for update;
  return jsonb_build_object('format','fed3-cms','schemaVersion',1,'exportedAt',to_char(now() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'version',v,
    'apps',coalesce((select jsonb_agg(to_jsonb(a) order by position,id) from cms_apps a),'[]'::jsonb),
    'media',coalesce((select jsonb_agg(data order by created_at,id) from cms_media),'[]'::jsonb));
end $$;
revoke all on function public.cms_snapshot(uuid) from public, anon, authenticated;
grant execute on function public.cms_snapshot(uuid) to service_role;

-- Files in this bucket are intended for public use. Draft text remains private.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('cms-media','cms-media',true,41943040,array['image/png','image/jpeg','image/webp','image/avif','video/mp4','video/webm']) on conflict(id) do nothing;
-- No browser write policy: short-lived, single-path signed upload tokens only.
