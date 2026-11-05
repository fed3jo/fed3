type Connection = { effectiveType?: string; downlink?: number; saveData?: boolean };

export function hasConstrainedConnection() {
  if (typeof navigator === 'undefined') return false;
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  return Boolean(connection?.saveData || /^(slow-2g|2g|3g)$/.test(connection?.effectiveType || '')
    || (connection?.downlink !== undefined && connection.downlink > 0 && connection.downlink < 1.8));
}
