'use client';
import type { ComponentProps } from 'react';
import { recordDownload } from '@/lib/engagement/client';
export function DownloadLink({appId,platform='general',measured=true,onClick,...props}:ComponentProps<'a'>&{appId:string;platform?:string;measured?:boolean}){
  return <a {...props} onClick={event=>{onClick?.(event);if(!event.defaultPrevented&&measured&&!location.pathname.includes('/admin/'))recordDownload(appId,platform);}}/>;
}
