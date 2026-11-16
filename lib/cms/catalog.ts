import 'server-only';
import { cache } from 'react';
import { serviceClient, cmsConfigured } from './server';
import { appSchema, type AppDocument } from './model';
import { seedDocuments } from './seed';

// No configured database: keep the currently shipped catalog. Once connected,
// the database is authoritative, including an intentionally empty catalog.
export const publishedCatalog = cache(async ():Promise<AppDocument[]> => {
  if(!cmsConfigured())return seedDocuments;
  const {data,error}=await serviceClient().from('cms_apps').select('published').eq('archived',false).not('published','is',null).order('position').order('id');
  if(error)throw new Error('Published catalog is unavailable');
  return data.map(row=>appSchema.parse(row.published));
});
