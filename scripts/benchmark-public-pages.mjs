import { Agent, get } from 'node:http';
import { performance } from 'node:perf_hooks';

const origin = new URL(process.argv[2] ?? 'http://127.0.0.1:3019');
const requests = Number(process.argv[3] ?? 5000);
const parallel = Number(process.argv[4] ?? 500);
if (origin.protocol !== 'http:' || !['127.0.0.1', '[::1]'].includes(origin.hostname)
  || origin.username || origin.password || origin.pathname !== '/') {
  throw new Error('Provide a loopback HTTP origin, such as http://127.0.0.1:3019');
}
if (![requests, parallel].every(value => Number.isInteger(value) && value >= 1 && value <= 5000)) {
  throw new Error('Request count and concurrency must be integers from 1 to 5000');
}

const paths = ['/ar/', '/en/', '/ar/home-cloud/', '/en/home-cloud/', '/ar/alternatives/', '/en/alternatives/'];
const agent = new Agent({ keepAlive: true, maxSockets: parallel, maxFreeSockets: parallel });
const rows = [];
let active = 0;
let peak = 0;

function fetchPage(path, record = true) {
  return new Promise(resolve => {
    const start = performance.now();
    let settled = false;
    let counted = false;
    const finish = (status, bytes, cache) => {
      if (settled) return;
      settled = true;
      if (counted) active--;
      if (record) rows.push({ path, status, bytes, cache, ms: performance.now() - start });
      resolve(status);
    };
    const request = get(new URL(path, origin), { agent, headers: { 'Accept-Encoding': 'gzip' } }, response => {
      let bytes = 0;
      response.on('data', buffer => { bytes += buffer.length; });
      response.once('end', () => finish(response.statusCode, bytes, response.headers['x-nextjs-cache']));
      response.once('aborted', () => finish('aborted', bytes));
      response.once('error', error => finish(error.code ?? 'response-error', bytes));
    });
    request.once('socket', () => {
      if (!record) return;
      counted = true;
      active++;
      peak = Math.max(peak, active);
    });
    request.once('error', error => finish(error.code ?? 'error', 0));
    request.setTimeout(30_000, () => request.destroy(Object.assign(new Error('Timeout'), { code: 'timeout' })));
  });
}

try {
  for (const path of paths) {
    const status = await fetchPage(path, false);
    if (status !== 200) throw new Error(`Warmup for ${path} returned ${status}`);
  }
  const start = performance.now();
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(requests, parallel) }, async () => {
    while (next < requests) {
      const index = next++;
      await fetchPage(paths[index % paths.length]);
    }
  }));
  const durationSeconds = (performance.now() - start) / 1000;
  const successful = rows.filter(row => row.status === 200);
  const sorted = successful.map(row => row.ms).sort((a, b) => a - b);
  const percentile = p => sorted.length ? Math.round(sorted[Math.ceil(p * sorted.length) - 1]) : null;
  console.log(JSON.stringify({
    requests, concurrency: parallel, peak, succeeded: successful.length, durationSeconds: Number(durationSeconds.toFixed(2)),
    requestsPerSecond: Math.round(requests / durationSeconds),
    medianMs: percentile(.5), p95Ms: percentile(.95), p99Ms: percentile(.99),
    errors: rows.filter(row => row.status !== 200).reduce((counts, row) => {
      counts[row.status] = (counts[row.status] ?? 0) + 1;
      return counts;
    }, {}),
    routes: paths.map(path => {
      const matches = successful.filter(row => row.path === path);
      return { path, responses: matches.length, bytes: matches[0]?.bytes, cache: matches[0]?.cache ?? 'unspecified' };
    }),
  }, null, 2));
  if (successful.length !== requests) process.exitCode = 1;
} finally {
  agent.destroy();
}
