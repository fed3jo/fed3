import type { PrivacyCompany } from '@/lib/fed3/privacy-cases';

export function PrivacyText({ text }: { text: string }) {
  return text.split(/(\[\[.*?\]\])/g).map((part, index) => part.startsWith('[[')
    ? <mark key={index}>{part.slice(2, -2)}</mark> : part);
}

export function PrivacyBrandMark({ company }: { company: PrivacyCompany }) {
  return <svg viewBox="0 0 36 26" fill="none" direction="ltr" aria-hidden="true">
    {company === 'meta' ? <path d="M3 17C0 3 10 0 18 14c8 14 17 9 15-1C31 2 25 1 18 13 10 26 4 25 3 17Z" stroke="#369cff" strokeWidth="3" />
      : company === 'google' ? <text x="8" y="23" fontFamily="Arial,sans-serif" fontSize="28" fontWeight="700" fill="#4285f4">G</text>
        : <g transform="translate(6 1)"><path fill="#f25022" d="M0 0h11v11H0z" /><path fill="#7fba00" d="M13 0h11v11H13z" /><path fill="#00a4ef" d="M0 13h11v11H0z" /><path fill="#ffb900" d="M13 13h11v11H13z" /></g>}
  </svg>;
}
