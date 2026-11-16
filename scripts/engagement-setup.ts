import { readFile,mkdir,writeFile } from 'node:fs/promises';
import { initialForm } from '../lib/engagement/seed';
async function main(){
const definition=JSON.stringify(initialForm).replaceAll("'","''");
const sql=`begin;\n${await readFile('supabase/migrations/202611160002_engagement.sql','utf8')}\ninsert into public.eng_forms(id,draft,published_version) values('local-cloud','${definition}'::jsonb,1);\ninsert into public.eng_form_versions(form_id,version,definition) values('local-cloud',1,'${definition}'::jsonb);\n${await readFile('supabase/engagement-retention.sql','utf8')}\ncommit;`;
await mkdir('tmp',{recursive:true});await writeFile('tmp/engagement-setup.sql',sql);console.log('جاهز: tmp/engagement-setup.sql. طبّقه مرة واحدة على المشروع بعد الاختبارات.');

}
main().catch(()=>{console.error('تعذّر تجهيز SQL.');process.exitCode=1;});
