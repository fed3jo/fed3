import Image from 'next/image';

const logos: Record<string, string> = {
  Signal: 'signal.svg', Brave: 'brave.svg', 'Proton Mail': 'proton-mail.svg',
  Nextcloud: 'nextcloud.svg', ONLYOFFICE: 'onlyoffice.webp', WhatsApp: 'whatsapp.svg',
  'Google Chrome': 'chrome.svg', Gmail: 'gmail.svg', 'Google Drive': 'drive.svg', 'Google Docs': 'docs.svg',
};

export function AppLogo({ name, size = 40 }: { name: string; size?: number }) {
  return <Image src={`/app-logos/${logos[name]}`} width={size} height={size} alt="" unoptimized style={{ objectFit: 'contain', flexShrink: 0 }} />;
}
