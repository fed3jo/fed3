-- Service-only writes. Public visitors use validated same-origin server endpoints.
create table public.eng_events(id uuid primary key,kind text not null check(kind in ('download','game_start','game_complete')),app text not null default '',platform text not null default '',created_at timestamptz not null default now());
create index on public.eng_events(created_at);
create table public.eng_daily(day date not null,kind text not null,app text not null default '',platform text not null default '',cohort_day date not null,total bigint not null default 0,primary key(day,kind,app,platform,cohort_day));
create table public.eng_attempts(id uuid primary key,started_at timestamptz not null default now(),expires_at timestamptz not null default(now()+interval '24 hours'),stage integer not null default 0 check(stage between 0 and 3),initial_stage integer not null default 0,completed_at timestamptz);
create table public.eng_limits(key text not null,bucket timestamptz not null,hits integer not null,expires_at timestamptz not null,primary key(key,bucket));
create table public.eng_forms(id text primary key,draft jsonb not null,published_version integer,version integer not null default 1);
create table public.eng_form_versions(form_id text not null references public.eng_forms(id),version integer not null,definition jsonb not null,published_at timestamptz not null default now(),primary key(form_id,version));
create table public.eng_responses(id uuid primary key,form_id text not null,form_version integer not null,locale text not null check(locale in ('ar','en')),answers jsonb not null,analysis jsonb not null,request_hash text not null,consent_version text not null default '2026-11-16',created_at timestamptz not null default now(),status text not null default 'received' check(status in ('received','reviewing','contacted','closed','erased')),note text not null default '',foreign key(form_id,form_version) references public.eng_form_versions(form_id,version));
create index on public.eng_responses(created_at desc);
create table public.eng_form_daily(day date not null,form_id text not null,form_version integer not null,question text not null,option text not null,total bigint not null default 0,primary key(day,form_id,form_version,question,option));
create table public.eng_maintenance(id integer primary key check(id=1),last_run timestamptz);
insert into public.eng_maintenance values(1,null);
do $$ declare t text; begin foreach t in array array['eng_events','eng_daily','eng_attempts','eng_limits','eng_forms','eng_form_versions','eng_responses','eng_form_daily','eng_maintenance'] loop execute format('alter table public.%I enable row level security',t);execute format('revoke all on public.%I from anon,authenticated',t);execute format('grant all on public.%I to service_role',t);end loop;end $$;

create function public.eng_limit(p_key text,p_max integer,p_seconds integer) returns boolean language plpgsql set search_path=public,pg_temp as $$
declare b timestamptz; n integer;
begin
 b:=to_timestamp(floor(extract(epoch from now())/p_seconds)*p_seconds);
 insert into eng_limits values(p_key,b,1,b+make_interval(secs=>p_seconds)) on conflict(key,bucket) do update set hits=eng_limits.hits+1 returning hits into n;
 return n<=p_max;
end $$;

create function public.eng_event(p_id uuid,p_kind text,p_app text default '',p_platform text default '',p_stage integer default 0) returns jsonb language plpgsql set search_path=public,pg_temp as $$
declare a eng_attempts;d date:=(now() at time zone 'Asia/Amman')::date;c date;existing eng_events;
begin
 if p_kind='progress' then
   select * into a from eng_attempts where id=p_id for update;
   if a.id is null or a.expires_at<now() then raise exception 'attempt_expired';end if;
   if p_stage<a.stage or p_stage>a.stage+1 or p_stage not between 1 and 3 then raise exception 'invalid_progress';end if;
   update eng_attempts set stage=p_stage where id=p_id;return jsonb_build_object('ok',true);
 end if;
 if p_kind='game_complete' then
   select * into a from eng_attempts where id=p_id for update;
   if a.id is null or a.expires_at<now() then raise exception 'attempt_expired';end if;
   if a.completed_at is not null then return jsonb_build_object('ok',true,'duplicate',true);end if;
   if a.stage<>3 or now()-a.started_at<interval '20 seconds' then raise exception 'invalid_completion';end if;
   update eng_attempts set completed_at=now() where id=p_id;
   c:=(a.started_at at time zone 'Asia/Amman')::date;
   -- Start and completion use distinct event IDs but the attempt row enforces uniqueness.
   insert into eng_events(id,kind) values(gen_random_uuid(),p_kind);
 else
   if p_kind not in ('download','game_start') then raise exception 'invalid_kind';end if;
   insert into eng_events(id,kind,app,platform) values(p_id,p_kind,p_app,p_platform) on conflict(id) do nothing;
   if not found then
     select * into existing from eng_events where id=p_id;
     if existing.kind<>p_kind or existing.app<>p_app or existing.platform<>p_platform then raise exception 'event_conflict';end if;
     return jsonb_build_object('ok',true,'duplicate',true);
   end if;
   if p_kind='game_start' then
     if p_stage not between 0 and 3 then raise exception 'invalid_stage';end if;
     insert into eng_attempts(id,stage,initial_stage) values(p_id,p_stage,p_stage);
   end if;
   c:=d;
 end if;
 insert into eng_daily(day,kind,app,platform,cohort_day,total) values(d,p_kind,p_app,p_platform,c,1) on conflict(day,kind,app,platform,cohort_day) do update set total=eng_daily.total+1;
 return jsonb_build_object('ok',true);
end $$;

create function public.eng_form_edit(p_actor uuid,p_action text,p_body jsonb,p_expected integer) returns jsonb language plpgsql set search_path=public,pg_temp as $$
declare m cms_staff; f eng_forms;r eng_responses;v integer;
begin
 select * into m from cms_staff where user_id=p_actor and active;if m.user_id is null then raise exception 'forbidden' using errcode='42501';end if;
 if p_action<>'save' and m.role<>'manager' then raise exception 'manager_required' using errcode='42501';end if;
 if p_action in ('response','erase') then
   if p_action='erase' then
     update eng_responses set answers='{}',note='',status='erased' where id=(p_body->>'id')::uuid returning * into r;
   else
     update eng_responses set status=p_body->>'status',note=left(p_body->>'note',2000) where id=(p_body->>'id')::uuid and status<>'erased' returning * into r;
   end if;
   if r.id is null then raise exception 'not_found';end if;
 else
   select * into f from eng_forms where id='local-cloud' for update;
   if f.version is distinct from p_expected then raise exception 'revision_conflict' using errcode='40001';end if;
   if p_action='save' then update eng_forms set draft=p_body,version=version+1 where id=f.id returning * into f;
   elsif p_action='publish' then
     v:=coalesce(f.published_version,0)+1;
     insert into eng_form_versions(form_id,version,definition) values(f.id,v,f.draft);
     update eng_forms set published_version=v,version=version+1 where id=f.id returning * into f;
   else raise exception 'invalid_action';end if;
 end if;
 insert into cms_audit(actor,email,action,target,detail) values(p_actor,m.email,'form_'||p_action,coalesce(r.id::text,'local-cloud'),jsonb_build_object('version',f.published_version));
 return coalesce(to_jsonb(r),to_jsonb(f));
end $$;

create function public.eng_submit(p_id uuid,p_version integer,p_locale text,p_answers jsonb,p_analysis jsonb,p_hash text) returns jsonb language plpgsql set search_path=public,pg_temp as $$
declare r eng_responses;definition jsonb;q jsonb;answer jsonb;o text;d date:=(now() at time zone 'Asia/Amman')::date;
begin
 perform pg_advisory_xact_lock(hashtext(p_id::text));
 select * into r from eng_responses where id=p_id;
 if r.id is not null then
   if r.request_hash<>p_hash then raise exception 'submission_conflict';end if;
   return jsonb_build_object('ok',true,'id',r.id,'analysis',r.analysis,'duplicate',true);
 end if;
 select v.definition into definition from eng_form_versions v join eng_forms f on f.id=v.form_id where v.form_id='local-cloud' and v.version=p_version and (f.draft is not null) and exists(select 1 from eng_form_versions current_v where current_v.form_id=f.id and current_v.version=f.published_version and (current_v.definition->>'active')::boolean);
 if definition is null then raise exception 'form_closed';end if;
 insert into eng_responses(id,form_id,form_version,locale,answers,analysis,request_hash) values(p_id,'local-cloud',p_version,p_locale,p_answers,p_analysis,p_hash);
 insert into eng_form_daily values(d,'local-cloud',p_version,'__total','submitted',1) on conflict(day,form_id,form_version,question,option) do update set total=eng_form_daily.total+1;
 insert into eng_form_daily values(d,'local-cloud',p_version,'__score',p_analysis->>'band',1) on conflict(day,form_id,form_version,question,option) do update set total=eng_form_daily.total+1;
 for q in select value from jsonb_array_elements(definition->'questions') loop
   answer:=p_answers->(q->>'id');
   if answer is null then continue;end if;
   if q->>'type' in ('single','multi') then
     for o in select value#>>'{}' from jsonb_array_elements(case when jsonb_typeof(answer)='array' then answer else jsonb_build_array(answer) end) loop
       insert into eng_form_daily values(d,'local-cloud',p_version,q->>'id',o,1) on conflict(day,form_id,form_version,question,option) do update set total=eng_form_daily.total+1;
     end loop;
   end if;
 end loop;
 return jsonb_build_object('ok',true,'id',p_id,'analysis',p_analysis);
end $$;

create function public.eng_report(p_from date,p_to date) returns jsonb language plpgsql set search_path=public,pg_temp as $$
begin
 if p_from>p_to or p_to-p_from>366 then raise exception 'invalid_period';end if;
 return jsonb_build_object('daily',coalesce((select jsonb_agg(to_jsonb(d) order by day,kind) from eng_daily d where day between p_from and p_to),'[]'::jsonb),'forms',coalesce((select jsonb_agg(to_jsonb(d) order by day,form_version) from eng_form_daily d where day between p_from and p_to),'[]'::jsonb),'maintenance',(select last_run from eng_maintenance where id=1));
end $$;

create function public.eng_cleanup() returns void language plpgsql set search_path=public,pg_temp as $$
begin
 delete from eng_events where created_at<now()-interval '30 days';
 delete from eng_attempts where expires_at<now();
 delete from eng_limits where expires_at<now();
 delete from eng_responses where created_at<now()-interval '1 year';
 update eng_maintenance set last_run=now() where id=1;
end $$;
revoke all on function public.eng_limit(text,integer,integer),public.eng_event(uuid,text,text,text,integer),public.eng_form_edit(uuid,text,jsonb,integer),public.eng_submit(uuid,integer,text,jsonb,jsonb,text),public.eng_report(date,date),public.eng_cleanup() from public,anon,authenticated;
grant execute on function public.eng_limit(text,integer,integer),public.eng_event(uuid,text,text,text,integer),public.eng_form_edit(uuid,text,jsonb,integer),public.eng_submit(uuid,integer,text,jsonb,jsonb,text),public.eng_report(date,date),public.eng_cleanup() to service_role;
