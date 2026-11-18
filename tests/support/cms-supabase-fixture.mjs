// Loopback-only Supabase HTTP contract fixture backed by actual PostgreSQL SQL.
// No production code imports this file; its test users and tokens are not credentials.
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const db=new PGlite();
const manager='00000000-0000-4000-8000-000000000001',editor='00000000-0000-4000-8000-000000000002';
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${manager}'),('${editor}');create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
await db.exec(readFileSync('supabase/migrations/202611160001_cms.sql','utf8'));
if(process.env.CMS_FIXTURE_ENGAGEMENT==='1'){
  await db.exec(readFileSync('supabase/migrations/202611160002_engagement.sql','utf8'));
  const {initialForm}=await import('../../lib/engagement/seed.ts');
  const {seedDocuments}=await import('../../lib/cms/seed.ts');
  await db.query(`insert into eng_forms(id,draft,published_version) values('local-cloud',$1,1)`,[JSON.stringify(initialForm)]);
  await db.query(`insert into eng_form_versions(form_id,version,definition) values('local-cloud',1,$1)`,[JSON.stringify(initialForm)]);
  for(const doc of seedDocuments)await db.query(`insert into cms_apps(id,draft,published,position) values($1,$2,$2,$3)`,[doc.id,JSON.stringify(doc),doc.sortOrder]);
}
await db.query(`insert into cms_staff(user_id,email,role) values($1,'manager@example.test','manager'),($2,'editor@example.test','editor')`,[manager,editor]);
const user=id=>({id,aud:'authenticated',role:'authenticated',email:id===manager?'manager@example.test':'editor@example.test',email_confirmed_at:new Date().toISOString(),app_metadata:{provider:'email'},user_metadata:{},created_at:new Date().toISOString()});
const token=id=>[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:id,aud:'authenticated',role:'authenticated',email:user(id).email,exp:Math.floor(Date.now()/1000)+3600,iat:Math.floor(Date.now()/1000)})).toString('base64url'),'fixture-only-signature'].join('.');
const reply=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(value===undefined?'':JSON.stringify(value));};
const server=createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1:3211');
    const chunks=[];for await(const chunk of req)chunks.push(chunk);const body=chunks.length?JSON.parse(Buffer.concat(chunks).toString()):{};
    if(url.pathname==='/auth/v1/token'){
      const id=body.email==='manager@example.test'?manager:body.email==='editor@example.test'?editor:null;
      if(!id||body.password!=='fixture-password-only')return reply(res,400,{error:'invalid_grant',error_description:'Invalid login credentials'});
      return reply(res,200,{access_token:token(id),token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:'fixture-refresh-'+id,user:user(id)});
    }
    if(url.pathname==='/auth/v1/logout')return reply(res,204);
    if(url.pathname==='/auth/v1/user'){
      const access=(req.headers.authorization||'').slice(7);let id;try{id=JSON.parse(Buffer.from(access.split('.')[1],'base64url')).sub;}catch{}
      return id===manager||id===editor?reply(res,200,user(id)):reply(res,401,{message:'Invalid token'});
    }
    if(req.headers.apikey!=='fixture-service-only')return reply(res,403,{message:'Fixture REST requires server key'});
    if(url.pathname.startsWith('/rest/v1/rpc/')){
      const name=url.pathname.split('/').pop();
      if(name==='cms_apply'){const r=await db.query('select cms_apply($1,$2,$3,$4) value',[body.p_actor,body.p_action,JSON.stringify(body.p_body),body.p_expected]);return reply(res,200,r.rows[0].value);}
      if(name==='cms_snapshot'){const r=await db.query('select cms_snapshot($1) value',[body.p_actor]);return reply(res,200,r.rows[0].value);}
      const args={eng_limit:['p_key','p_max','p_seconds'],eng_event:['p_id','p_kind','p_app','p_platform','p_stage'],eng_submit:['p_id','p_version','p_locale','p_answers','p_analysis','p_hash'],eng_form_edit:['p_actor','p_action','p_body','p_expected'],eng_report:['p_from','p_to']}[name];
      if(args){const r=await db.query(`select ${name}(${args.map((_,i)=>'$'+(i+1)).join(',')}) value`,args.map(key=>typeof body[key]==='object'&&body[key]!==null?JSON.stringify(body[key]):body[key]??({p_app:'',p_platform:'',p_stage:0}[key]??null)));return reply(res,200,r.rows[0].value);}
    }
    const table=url.pathname.split('/').pop();
    const columns={cms_apps:['id','draft','published','archived','version','position','updated_at'],cms_media:['id','data','created_at'],cms_staff:['user_id','email','role','active'],cms_audit:['id','actor','email','action','target','detail','created_at'],cms_meta:['id','version']};
    Object.assign(columns,{eng_forms:['id','draft','published_version','version'],eng_form_versions:['form_id','version','definition','published_at'],eng_attempts:['id','started_at','expires_at','stage','initial_stage','completed_at'],eng_responses:['id','form_id','form_version','locale','answers','analysis','request_hash','consent_version','created_at','status','note']});
    if(!columns[table]||req.method!=='GET')return reply(res,404,{message:'Fixture endpoint not implemented'});
    const selection=url.searchParams.get('select')||'*';if(selection!=='*'&&selection.split(',').some(c=>!columns[table].includes(c)))throw Error('Invalid projection');
    const values=[],where=[];
    for(const [key,value]of url.searchParams){if(!columns[table].includes(key))continue;if(value==='not.is.null'){where.push(`${key} is not null`);continue;}const op=value.startsWith('eq.')?'=':value.startsWith('gte.')?'>=':value.startsWith('lt.')?'<':null;if(op){values.push(value.slice(value.indexOf('.')+1));where.push(`${key}${op}$${values.length}`);}else if(value.startsWith('ilike.')){values.push(value.slice(6));where.push(`${key} ilike $${values.length}`);}}
    const order=(url.searchParams.get('order')||'').split(',').filter(Boolean).map(part=>{const [key,direction]=part.split('.');if(!columns[table].includes(key))throw Error('Invalid ordering');return key+(direction==='desc'?' desc':' asc');});
    const limit=Math.min(1000,Math.max(0,Number(url.searchParams.get('limit')||1000))),offset=Math.max(0,Number(url.searchParams.get('offset')||0));
    const result=await db.query(`select ${selection} from ${table}${where.length?' where '+where.join(' and '):''}${order.length?' order by '+order.join(','):''} limit ${limit} offset ${offset}`,values);
    if(req.headers.prefer?.includes('count=exact')){const count=await db.query(`select count(*)::int n from ${table}${where.length?' where '+where.join(' and '):''}`,values);res.setHeader('Content-Range',`${offset}-${offset+result.rows.length-1}/${count.rows[0].n}`);}
    if(req.headers.accept?.includes('application/vnd.pgrst.object+json'))return result.rows.length===1?reply(res,200,result.rows[0]):reply(res,406,{code:'PGRST116',message:'Expected one row'});
    return reply(res,200,result.rows);
  }catch(error){reply(res,400,{code:error.code||'fixture_error',message:error.message});}
});
server.listen(3211,'127.0.0.1',()=>console.log('CMS contract fixture ready on http://127.0.0.1:3211'));
process.on('SIGINT',()=>server.close(async()=>{await db.close();process.exit();}));
