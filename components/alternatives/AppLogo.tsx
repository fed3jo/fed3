'use client';
import { useCatalog } from './CatalogContext';
import Image from 'next/image';

const logos: Record<string, string> = {
  Signal: 'signal.svg', Brave: 'brave.svg', 'Proton Mail': 'proton-mail.svg',
  Nextcloud: 'nextcloud.svg', ONLYOFFICE: 'onlyoffice.webp', WhatsApp: 'whatsapp.svg',
  'Google Chrome': 'chrome.svg', Gmail: 'gmail.svg', 'Google Drive': 'drive.svg', 'Google Docs': 'docs.svg',
};

export function AppLogo({ name, size = 40 }: { name: string; size?: number }) {
  const {logos:custom}=useCatalog();
  const src=custom[name] ?? (logos[name] ? '/app-logos/'+logos[name] : null);
  if(!src)return <span aria-hidden="true" style={{width:size,height:size,display:'inline-grid',placeItems:'center',borderRadius:Math.round(size/4),background:'#062759',color:'white',fontSize:size/2}}>{name.slice(0,1)}</span>;
  return <Image src={src} width={size} height={size} alt="" unoptimized style={{ objectFit: 'contain', flexShrink: 0 }} />;
}
