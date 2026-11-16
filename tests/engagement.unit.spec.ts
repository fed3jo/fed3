import { test,expect } from '@playwright/test';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { initialForm } from '../lib/engagement/seed';
import { analyzeAnswers,formSchema,validateAnswers } from '../lib/engagement/model';
import { signTicket,verifyTicket } from '../lib/engagement/tokens';
const manager='00000000-0000-4000-8000-000000000001',editor='00000000-0000-4000-8000-000000000002';
async function database(){const db=new PGlite();await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${manager}'),('${editor}');create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);await db.exec(readFileSync('supabase/migrations/202611160001_cms.sql','utf8'));await db.exec(readFileSync('supabase/migrations/202611160002_engagement.sql','utf8'));await db.query(`insert into cms_staff(user_id,email,role) values($1,'manager@example.test','manager'),($2,'editor@example.test','editor')`,[manager,editor]);await db.query(`insert into eng_forms(id,draft,published_version) values('local-cloud',$1,1)`,[JSON.stringify(initialForm)]);await db.query(`insert into eng_form_versions(form_id,version,definition) values('local-cloud',1,$1)`,[JSON.stringify(initialForm)]);return db;}
async function event(db:PGlite,id:string,kind:string,stage=0,app='',platform=''){return (await db.query<{result:any}>(`select eng_event($1,$2,$3,$4,$5) result`,[id,kind,app,platform,stage])).rows[0].result;}
async function edit(db:PGlite,actor:string,action:string,body:unknown,version=1){return (await db.query<{result:any}>(`select eng_form_edit($1,$2,$3,$4) result`,[actor,action,JSON.stringify(body),version])).rows[0].result;}
const validAnswers=()=>Object.fromEntries(initialForm.questions.filter(q=>q.required).map(q=>[q.id,q.type==='single'?q.options[0].id:q.type==='multi'?[q.options[0].id]:'مؤسسة تجريبية']));
async function submit(db:PGlite,id:string,version=1,hash='same'){const answers=validateAnswers(initialForm,validAnswers());return (await db.query<{result:any}>(`select eng_submit($1,$2,'ar',$3,$4,$5) result`,[id,version,JSON.stringify(answers),JSON.stringify(analyzeAnswers(initialForm,answers)),hash])).rows[0].result;}
test('answers and scores validate stable option IDs, required fields and bilingual form revisions',()=>{
 expect(formSchema.safeParse(initialForm).success).toBe(true);const answers=validateAnswers(initialForm,validAnswers());expect(analyzeAnswers(initialForm,answers).score).toBe(100);
 expect(()=>validateAnswers(initialForm,{})).toThrow();expect(()=>validateAnswers(initialForm,{...answers,unknown:'x'})).toThrow();expect(()=>validateAnswers(initialForm,{...answers,network:'fake-option'})).toThrow();expect(()=>validateAnswers(initialForm,{...answers,needs:['option-1','option-1']})).toThrow();
 const bad=structuredClone(initialForm);bad.questions[0].id=bad.questions[1].id;expect(formSchema.safeParse(bad).success).toBe(false);
 const noScores=structuredClone(initialForm);for(const q of noScores.questions)for(const o of q.options)o.score=null;expect(analyzeAnswers(noScores,answers).score).toBeNull();
});
test('tickets reject tampering, kind confusion and expiry',()=>{const now=Date.now(),value={id:randomUUID(),kind:'game' as const,issued:now,exp:now+10000};const token=signTicket(value,'private');expect(verifyTicket(token,'game','private',now)).toEqual(value);expect(()=>verifyTicket(token+'x','game','private',now)).toThrow();expect(()=>verifyTicket(token,'form','private',now)).toThrow();expect(()=>verifyTicket(token,'game','private',now+11000)).toThrow();});
test('game client serializes stage receipts, counts a completion once and honors opt-out',async()=>{
 const names=['window','localStorage','sessionStorage','navigator','fetch'] as const;const previous=Object.fromEntries(names.map(n=>[n,Object.getOwnPropertyDescriptor(globalThis,n)]));const local=new Map<string,string>(),session=new Map<string,string>();const storage=(data:Map<string,string>)=>({getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>data.set(k,v)});const requests:{path:string;body:any}[]=[];
 try{
  Object.defineProperty(globalThis,'window',{configurable:true,value:{}});Object.defineProperty(globalThis,'navigator',{configurable:true,value:{doNotTrack:'0'}});Object.defineProperty(globalThis,'localStorage',{configurable:true,value:storage(local)});Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:storage(session)});Object.defineProperty(globalThis,'fetch',{configurable:true,value:async(path:string,init:RequestInit)=>{requests.push({path,body:JSON.parse(String(init.body))});return Response.json({ok:true,token:'fixture-ticket'});}});
  const {GameMeasurement}=await import('../lib/engagement/client');const game=new GameMeasurement();game.start(0);game.observe(1,false);game.observe(3,true);game.observe(3,true);
  await expect.poll(()=>requests.filter(r=>r.path.includes('complete')).length).toBe(1);expect(requests.filter(r=>r.path.includes('progress')).map(r=>r.body.stage)).toEqual([1,2,3]);expect(requests.filter(r=>r.path.includes('start'))).toHaveLength(1);
  const before=requests.length;local.set('fed3:metrics-disabled','1');game.start(0);game.observe(3,true);await Promise.resolve();expect(requests.length).toBe(before);
 }finally{for(const name of names){const descriptor=previous[name];if(descriptor)Object.defineProperty(globalThis,name,descriptor);else Reflect.deleteProperty(globalThis,name);}}
});
test('database deduplicates downloads and completions, rejects incomplete games and keeps start cohorts',async()=>{
 const db=await database();try{
  const click=randomUUID();await event(db,click,'download',0,'signal','Android');expect((await event(db,click,'download',0,'signal','Android')).duplicate).toBe(true);await expect(event(db,click,'download',0,'brave','general')).rejects.toThrow(/event_conflict/);
  const id=randomUUID();await event(db,id,'game_start');await expect(event(db,id,'game_complete')).rejects.toThrow(/invalid_completion/);await expect(event(db,id,'progress',3)).rejects.toThrow(/invalid_progress/);
  for(const stage of [1,2,3])await event(db,id,'progress',stage);await expect(event(db,id,'game_complete')).rejects.toThrow(/invalid_completion/);
  await db.query(`update eng_attempts set started_at=now()-interval '1 day' where id=$1`,[id]);await event(db,id,'game_complete');expect((await event(db,id,'game_complete')).duplicate).toBe(true);
  const rows=(await db.query<any>(`select * from eng_daily order by kind`)).rows;expect(rows.find(r=>r.kind==='download').total).toBe(1);expect(rows.find(r=>r.kind==='game_complete').total).toBe(1);expect(rows.find(r=>r.kind==='game_complete').cohort_day).not.toEqual(rows.find(r=>r.kind==='game_complete').day);
  const expired=randomUUID();await event(db,expired,'game_start');await db.query(`update eng_attempts set expires_at=now()-interval '1 second' where id=$1`,[expired]);await expect(event(db,expired,'progress',1)).rejects.toThrow(/attempt_expired/);
 }finally{await db.close();}
});
test('form drafts, published snapshots, private response access and idempotent submissions',async()=>{
 const db=await database();try{
  const id=randomUUID();await submit(db,id);expect((await submit(db,id)).duplicate).toBe(true);await expect(submit(db,id,1,'different')).rejects.toThrow(/submission_conflict/);
  const changed=structuredClone(initialForm);changed.title.ar='عنوان مسودة';const saved=await edit(db,editor,'save',changed);expect(saved.version).toBe(2);expect(saved.published_version).toBe(1);await expect(edit(db,editor,'publish',{},2)).rejects.toThrow(/manager_required/);await expect(edit(db,manager,'save',changed,1)).rejects.toThrow(/revision_conflict/);
  const published=await edit(db,manager,'publish',{},2);expect(published.published_version).toBe(2);expect((await db.query<any>('select definition from eng_form_versions where version=1')).rows[0].definition.title.ar).toBe(initialForm.title.ar);
  const response=await edit(db,manager,'response',{id,status:'reviewing',note:'متابعة داخلية'},0);expect(response.status).toBe('reviewing');await expect(edit(db,editor,'response',{id,status:'closed',note:''})).rejects.toThrow(/manager_required/);
  const erased=await edit(db,manager,'erase',{id});expect(erased.answers).toEqual({});expect(erased.note).toBe('');expect(erased.status).toBe('erased');expect((await submit(db,id)).duplicate).toBe(true);
  expect((await db.query<any>(`select total from eng_form_daily where question='__total'`)).rows[0].total).toBe(1);
  await db.exec('set role anon');await expect(db.query('select * from eng_responses')).rejects.toThrow(/permission denied/);await expect(db.query(`select eng_submit($1,1,'ar','{}','{}','x')`,[randomUUID()])).rejects.toThrow(/permission denied/);await db.exec('reset role');
  changed.active=false;await edit(db,manager,'save',changed,published.version);await edit(db,manager,'publish',{},published.version+1);await expect(submit(db,randomUUID())).rejects.toThrow(/form_closed/);
 }finally{await db.close();}
});
test('retention deletes detailed records while preserving anonymous daily aggregates and enforces shared rate limits',async()=>{
 const db=await database();try{
  await event(db,randomUUID(),'download',0,'signal','general');await submit(db,randomUUID());
  await db.exec(`update eng_events set created_at=now()-interval '31 days';update eng_responses set created_at=now()-interval '366 days';`);
  for(let i=0;i<3;i++){const result=(await db.query<{ok:boolean}>(`select eng_limit('opaque-security-key',2,60) ok`)).rows[0].ok;expect(result).toBe(i<2);}
  await db.exec('select eng_cleanup()');expect((await db.query(`select * from eng_responses`)).rows).toHaveLength(0);expect((await db.query(`select * from eng_events`)).rows).toHaveLength(0);expect((await db.query(`select * from eng_daily`)).rows).toHaveLength(1);expect((await db.query(`select * from eng_form_daily`)).rows.length).toBeGreaterThan(1);
  const columns=(await db.query<{column_name:string}>(`select column_name from information_schema.columns where table_name in ('eng_events','eng_daily','eng_form_daily','eng_responses')`)).rows.map(r=>r.column_name);expect(columns).not.toContain('ip');expect(columns).not.toContain('user_agent');
 }finally{await db.close();}
});
