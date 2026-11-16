import { alternatives, categories } from '@/lib/fed3/alternatives';
import { appIntroductions } from '@/lib/fed3/app-introductions';
import { appStart } from '@/lib/fed3/app-start';
import { comparisonBriefs } from '@/lib/fed3/comparison-briefs';
import type { AppDocument } from './model';

const logoNames: Record<string, string> = { Signal: 'signal.svg', Brave: 'brave.svg', 'Proton Mail': 'proton-mail.svg', Nextcloud: 'nextcloud.svg', ONLYOFFICE: 'onlyoffice.webp', WhatsApp: 'whatsapp.svg', 'Google Chrome': 'chrome.svg', Gmail: 'gmail.svg', 'Google Drive': 'drive.svg', 'Google Docs': 'docs.svg' };
// Validate the bundled seed in tests and before writing it to the database;
// public components do not need to ship the schema validator to visitors.
export const seedDocuments: AppDocument[] = alternatives.map((app, index) => ({ ...app, categoryLabel: categories[app.category as keyof typeof categories], logo: `/app-logos/${logoNames[app.name]}`, currentLogo: `/app-logos/${logoNames[app.current]}`, reviewedOn: '2026-10-24', introduction: appIntroductions[app.id], start: appStart[app.id], briefs: comparisonBriefs[app.id], downloads: [], media: [], sortOrder: index * 10 }));
