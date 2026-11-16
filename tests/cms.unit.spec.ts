import { test, expect } from '@playwright/test';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { appSchema, backupSchema, publishIssues } from '../lib/cms/model';
import { seedDocuments } from '../lib/cms/seed';
import { mediaSignature } from '../lib/cms/media';
import { remapBackup, verifyBackupFiles } from '../lib/cms/backup';

const manager='00000000-0000-4000-8000-000000000001',editor='00000000-0000-4000-8000-000000000002';
async function database(){
  const db=new PGlite();
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${manager}'),('${editor}');create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
  await db.exec(readFileSync('supabase/migrations/202611160001_cms.sql','utf8'));
  await db.query(`insert into cms_staff(user_id,email,role) values($1,'manager@example.test','manager'),($2,'editor@example.test','editor')`,[manager,editor]);
  return db;
}
async function apply(db:PGlite,actor:string,action:string,body:unknown,version:number|null=null){const r=await db.query<{result:any}>('select cms_apply($1,$2,$3,$4) as result',[actor,action,JSON.stringify(body),version]);return r.rows[0].result;}
async function snapshot(db:PGlite){const r=await db.query<{value:unknown}>('select cms_snapshot($1) as value',[manager]);return backupSchema.parse(r.rows[0].value);}

test('existing five apps meet publication requirements and unsafe content is rejected',()=>{
  expect(seedDocuments).toHaveLength(5);
  for(const doc of seedDocuments){expect(appSchema.safeParse(doc).success,doc.id).toBe(true);expect(publishIssues(doc),doc.id).toEqual([]);}
  expect(appSchema.safeParse({...seedDocuments[0],official:'javascript:alert(1)'}).success).toBe(false);
  expect(appSchema.safeParse({...seedDocuments[0],reviewedOn:'2026-02-31'}).success).toBe(false);
  const invalid=structuredClone(seedDocuments[0]);invalid.rows[0].sources=[29];expect(publishIssues(invalid).length).toBeGreaterThan(0);
});
test('draft edits are isolated, conflicts preserve data, and only managers publish or archive',async()=>{
  const db=await database();try{
    await apply(db,manager,'seed',{apps:seedDocuments});
    const doc=structuredClone(seedDocuments[0]);doc.description.ar='مسودة جديدة';
    const saved=await apply(db,editor,'save',doc,1);expect(saved.version).toBe(2);expect(saved.published.description.ar).not.toBe(doc.description.ar);
    await expect(apply(db,editor,'publish',{id:doc.id},2)).rejects.toThrow(/manager_required/);
    await expect(apply(db,manager,'save',doc,1)).rejects.toThrow(/revision_conflict/);
    const published=await apply(db,manager,'publish',{id:doc.id},2);expect(published.published.description.ar).toBe(doc.description.ar);
    const archived=await apply(db,manager,'archive',{id:doc.id},3);expect(archived.archived).toBe(true);expect(archived.published).not.toBeNull();
    const count=await db.query<{n:number}>(`select count(*)::integer n from cms_audit`);expect(count.rows[0].n).toBe(4);
    await db.exec('set role authenticated');await expect(db.query(`select cms_apply($1,'publish',$2,4)`,[manager,JSON.stringify({id:doc.id})])).rejects.toThrow(/permission denied/);await db.exec('reset role');
  }finally{await db.close();}
});
test('snapshot restores all five apps atomically and preserves staff/audit; stale restores fail',async()=>{
  const db=await database();try{
    await apply(db,manager,'seed',{apps:seedDocuments});const original=await snapshot(db);
    const changed=structuredClone(seedDocuments[0]);changed.gain.ar='تعديل بعد النسخة';await apply(db,manager,'save',changed,1);await apply(db,manager,'publish',{id:changed.id},2);
    await expect(apply(db,manager,'restore',original,original.version)).rejects.toThrow(/revision_conflict/);
    const current=await snapshot(db);await apply(db,manager,'restore',original,current.version);const restored=await snapshot(db);
    expect(restored.apps.map(a=>a.draft)).toEqual(original.apps.map(a=>a.draft));expect(restored.apps.map(a=>a.published)).toEqual(original.apps.map(a=>a.published));
    await expect(apply(db,manager,'staff',{user_id:manager,email:'manager@example.test',role:'editor',active:true})).rejects.toThrow(/last_manager/);
    const staff=await db.query(`select * from cms_staff`);expect(staff.rows).toHaveLength(2);
    const audit=await db.query<{n:number}>(`select count(*)::integer n from cms_audit`);expect(audit.rows[0].n).toBe(4);
    const bad=structuredClone(original);bad.apps[0].id='mismatched';await expect(apply(db,manager,'restore',bad,restored.version)).rejects.toThrow();
    expect((await snapshot(db)).apps).toEqual(restored.apps);
  }finally{await db.close();}
});
test('backup media verifies hashes before restore and rewrites references for a new project',async()=>{
  const bytes=Uint8Array.from([137,80,78,71,13,10,26,10,0,1]);
  const media={id:'00000000-0000-4000-8000-000000000003',path:'uploads/asset.png',url:'https://old.example.test/asset.png',mime:'image/png' as const,bytes:bytes.length,name:'صورة',alt:{ar:'صورة',en:'Image'},license:'CC0',sourceUrl:'',sha256:createHash('sha256').update(bytes).digest('hex')};
  const doc=structuredClone(seedDocuments[0]);doc.logo=media.url;
  const backup=backupSchema.parse({format:'fed3-cms',schemaVersion:1,exportedAt:new Date().toISOString(),version:1,apps:[{id:doc.id,draft:doc,published:doc,version:1,position:0,archived:false,updated_at:new Date().toISOString()}],media:[media]});
  await verifyBackupFiles(backup,async()=>bytes);await expect(verifyBackupFiles(backup,async()=>Uint8Array.from([1,2]))).rejects.toThrow();
  const mapped=remapBackup(backup,new Map([[media.id,{path:'restores/new/asset.png',url:'https://new.example.test/asset.png'}]]));
  expect(mapped.apps[0].published?.logo).toBe('https://new.example.test/asset.png');expect(mapped.media[0].path).toBe('restores/new/asset.png');
  expect(mediaSignature(new TextEncoder().encode('<svg onload=alert(1)>'),'image/png')).toBe(false);
});
