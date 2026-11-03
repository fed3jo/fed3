export function FeatureIcon({ name, size = 26 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    encryption: <><path d="M12 3 4.5 6v5c0 5 7.5 10 7.5 10s7.5-5 7.5-10V6Z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
    collection: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 4 16 4 16 0V5M4 12v7c0 4 16 4 16 0v-7" /></>,
    control: <><rect x="3" y="3" width="18" height="7" rx="2" /><rect x="3" y="14" width="18" height="7" rx="2" /><path d="M7 6.5h.01M7 17.5h.01M12 10v4M12 6h5M12 17h5" /></>,
    features: <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="8" cy="6" r="2" fill="var(--icon-bg, #faf8f3)" /><circle cx="16" cy="12" r="2" fill="var(--icon-bg, #faf8f3)" /><circle cx="10" cy="18" r="2" fill="var(--icon-bg, #faf8f3)" /></>,
    platforms: <><rect x="2" y="4" width="14" height="11" rx="2" /><path d="M5 19h8M9 15v4" /><rect x="17" y="9" width="5" height="12" rx="1" /></>,
    cost: <><ellipse cx="9" cy="6" rx="6" ry="3" /><path d="M3 6v5c0 3 12 3 12 0V6M3 11v5c0 3 12 3 12 0v-5M17 9c5 0 6 4 2 6M18 15v6M15 18h6" /></>,
    backup: <><path d="M4 10a8 8 0 1 1 0 6M4 4v6h6" /><path d="M12 8v5l3 2" /></>,
    folder: <><path d="M3 8V5h7l2 3h9v12H3Z" /><path d="M3 12h18" /></>,
    people: <><circle cx="9" cy="7" r="3" /><circle cx="18" cy="9" r="2" /><path d="M3 21v-4a6 6 0 0 1 12 0v4M17 14c3 0 4 2 4 5v2" /></>,
    network: <><rect x="8" y="2" width="8" height="6" rx="1" /><rect x="2" y="16" width="7" height="6" rx="1" /><rect x="15" y="16" width="7" height="6" rx="1" /><path d="M12 8v4M5 16v-4h14v4" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m7 12 3 3 7-7" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.folder}</svg>;
}
