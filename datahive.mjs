import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import { setTimeout } from 'timers/promises';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_FILE = path.join(__dirname, 'token.txt');
const DEVICES_DIR = path.join(__dirname, 'devices');

const DEVICE_PER_ACCOUNT = parseInt(process.env.DEVICE_PER_ACCOUNT, 10) || 1;

// === FINGERPRINT ===
const DESKTOP_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.680.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.670.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.668.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.655.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.654.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.647.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.648.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.654.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.650.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.680.0 Safari/537.36 Edg/136.0.680.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.670.0 Safari/537.36 Edg/135.0.670.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.668.0 Safari/537.36 Edg/134.0.668.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.655.0 Safari/537.36 Edg/133.0.655.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.654.0 Safari/537.36 Edg/132.0.654.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.647.0 Safari/537.36 Edg/131.0.647.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.648.0 Safari/537.36 Edg/130.0.648.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.654.0 Safari/537.36 Edg/129.0.654.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.650.0 Safari/537.36 Edg/128.0.650.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 OPR/137.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.680.0 Safari/537.36 OPR/136.0.680.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.670.0 Safari/537.36 OPR/135.0.670.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.668.0 Safari/537.36 OPR/134.0.668.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.655.0 Safari/537.36 OPR/133.0.655.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.654.0 Safari/537.36 OPR/132.0.654.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.647.0 Safari/537.36 OPR/131.0.647.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.648.0 Safari/537.36 OPR/130.0.648.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.654.0 Safari/537.36 OPR/129.0.654.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.650.0 Safari/537.36 OPR/128.0.650.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Version/16.6',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.680.0 Safari/537.36 Version/16.5',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.670.0 Safari/537.36 Version/16.4',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.668.0 Safari/537.36 Version/16.3',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.655.0 Safari/537.36 Version/16.2'
];

const CPU_FINGERPRINTS = [
  ['13th Gen Intel(R) Core(TM) i9-13900KF', '32', 'Windows 10'],
  ['13th Gen Intel(R) Core(TM) i9-13900KF', '32', 'Windows 11'],
  ['13th Gen Intel(R) Core(TM) i9-13900K', '32', 'Windows 10'],
  ['13th Gen Intel(R) Core(TM) i9-13900K', '32', 'Windows 11'],
  ['13th Gen Intel(R) Core(TM) i9-13900F', '32', 'Windows 10'],
  ['13th Gen Intel(R) Core(TM) i9-13900F', '32', 'Windows 11'],
  ['13th Gen Intel(R) Core(TM) i7-13700K', '24', 'Windows 10'],
  ['13th Gen Intel(R) Core(TM) i7-13700K', '24', 'Windows 11'],
  ['13th Gen Intel(R) Core(TM) i7-13700KF', '24', 'Windows 10'],
  ['13th Gen Intel(R) Core(TM) i7-13700KF', '24', 'Windows 11'],
  ['13th Gen Intel(R) Core(TM) i7-13700F', '24', 'Windows 10'],
  ['13th Gen Intel(R) Core(TM) i7-13700F', '24', 'Windows 11'],
  ['13th Gen Intel(R) Core(TM) i5-13600K', '20', 'Windows 10'],
  ['13th Gen Intel(R) Core(TM) i5-13600K', '20', 'Windows 11'],
  ['13th Gen Intel(R) Core(TM) i5-13600KF', '20', 'Windows 10'],
  ['13th Gen Intel(R) Core(TM) i5-13600KF', '20', 'Windows 11'],
  ['13th Gen Intel(R) Core(TM) i5-13500', '20', 'Windows 10'],
  ['13th Gen Intel(R) Core(TM) i5-13500', '20', 'Windows 11'],
  ['13th Gen Intel(R) Core(TM) i5-13400F', '16', 'Windows 10'],
  ['13th Gen Intel(R) Core(TM) i5-13400F', '16', 'Windows 11'],
  ['12th Gen Intel(R) Core(TM) i9-12900K', '24', 'Windows 10'],
  ['12th Gen Intel(R) Core(TM) i9-12900K', '24', 'Windows 11'],
  ['12th Gen Intel(R) Core(TM) i9-12900KF', '24', 'Windows 10'],
  ['12th Gen Intel(R) Core(TM) i9-12900KF', '24', 'Windows 11'],
  ['12th Gen Intel(R) Core(TM) i7-12700K', '20', 'Windows 10'],
  ['12th Gen Intel(R) Core(TM) i7-12700K', '20', 'Windows 11'],
  ['12th Gen Intel(R) Core(TM) i7-12700KF', '20', 'Windows 10'],
  ['12th Gen Intel(R) Core(TM) i7-12700KF', '20', 'Windows 11'],
  ['12th Gen Intel(R) Core(TM) i5-12600K', '16', 'Windows 10'],
  ['12th Gen Intel(R) Core(TM) i5-12600K', '16', 'Windows 11'],
  ['12th Gen Intel(R) Core(TM) i5-12600KF', '16', 'Windows 10'],
  ['12th Gen Intel(R) Core(TM) i5-12600KF', '16', 'Windows 11'],
  ['12th Gen Intel(R) Core(TM) i5-12400F', '12', 'Windows 10'],
  ['12th Gen Intel(R) Core(TM) i5-12400F', '12', 'Windows 11'],
  ['11th Gen Intel(R) Core(TM) i9-11900K', '16', 'Windows 10'],
  ['11th Gen Intel(R) Core(TM) i9-11900K', '16', 'Windows 11'],
  ['11th Gen Intel(R) Core(TM) i7-11700K', '16', 'Windows 10'],
  ['11th Gen Intel(R) Core(TM) i7-11700K', '16', 'Windows 11'],
  ['Intel(R) Core(TM) i7-11700', '16', 'Windows 10'],
  ['Intel(R) Core(TM) i7-11700', '16', 'Windows 11'],
  ['11th Gen Intel(R) Core(TM) i5-11600K', '12', 'Windows 10'],
  ['11th Gen Intel(R) Core(TM) i5-11600K', '12', 'Windows 11'],
  ['Intel(R) Core(TM) i5-11400F', '12', 'Windows 10'],
  ['Intel(R) Core(TM) i5-11400F', '12', 'Windows 11'],
  ['Intel(R) Core(TM) i9-10900K CPU @ 3.70GHz', '20', 'Windows 10'],
  ['Intel(R) Core(TM) i9-10900K CPU @ 3.70GHz', '20', 'Windows 11'],
  ['Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz', '16', 'Windows 10'],
  ['Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz', '16', 'Windows 11'],
  ['Intel(R) Core(TM) i5-10600K CPU @ 4.10GHz', '12', 'Windows 10'],
  ['Intel(R) Core(TM) i5-10600K CPU @ 4.10GHz', '12', 'Windows 11'],
  ['Intel(R) Core(TM) i5-10400F CPU @ 2.90GHz', '12', 'Windows 10'],
  ['Intel(R) Core(TM) i5-10400F CPU @ 2.90GHz', '12', 'Windows 11'],
  ['12th Gen Intel(R) Core(TM) i7-12700H', '20', 'Windows 10'],
  ['12th Gen Intel(R) Core(TM) i7-12700H', '20', 'Windows 11'],
  ['12th Gen Intel(R) Core(TM) i5-12500H', '16', 'Windows 10'],
  ['12th Gen Intel(R) Core(TM) i5-12500H', '16', 'Windows 11'],
  ['13th Gen Intel(R) Core(TM) i7-13700H', '20', 'Windows 10'],
  ['13th Gen Intel(R) Core(TM) i7-13700H', '20', 'Windows 11'],
  ['AMD Ryzen 9 7950X 16-Core Processor', '32', 'Windows 10'],
  ['AMD Ryzen 9 7950X 16-Core Processor', '32', 'Windows 11'],
  ['AMD Ryzen 9 7900X 12-Core Processor', '24', 'Windows 10'],
  ['AMD Ryzen 9 7900X 12-Core Processor', '24', 'Windows 11'],
  ['AMD Ryzen 7 7700X 8-Core Processor', '16', 'Windows 10'],
  ['AMD Ryzen 7 7700X 8-Core Processor', '16', 'Windows 11'],
  ['AMD Ryzen 7 7700 8-Core Processor', '16', 'Windows 10'],
  ['AMD Ryzen 7 7700 8-Core Processor', '16', 'Windows 11'],
  ['AMD Ryzen 5 7600X 6-Core Processor', '12', 'Windows 10'],
  ['AMD Ryzen 5 7600X 6-Core Processor', '12', 'Windows 11'],
  ['AMD Ryzen 5 7600 6-Core Processor', '12', 'Windows 10'],
  ['AMD Ryzen 5 7600 6-Core Processor', '12', 'Windows 11'],
  ['AMD Ryzen 9 5950X 16-Core Processor', '32', 'Windows 10'],
  ['AMD Ryzen 9 5950X 16-Core Processor', '32', 'Windows 11'],
  ['AMD Ryzen 9 5900X 12-Core Processor', '24', 'Windows 10'],
  ['AMD Ryzen 9 5900X 12-Core Processor', '24', 'Windows 11'],
  ['AMD Ryzen 7 5800X 8-Core Processor', '16', 'Windows 10'],
  ['AMD Ryzen 7 5800X 8-Core Processor', '16', 'Windows 11'],
  ['AMD Ryzen 7 5700X 8-Core Processor', '16', 'Windows 10'],
  ['AMD Ryzen 7 5700X 8-Core Processor', '16', 'Windows 11'],
  ['AMD Ryzen 5 5600X 6-Core Processor', '12', 'Windows 10'],
  ['AMD Ryzen 5 5600X 6-Core Processor', '12', 'Windows 11'],
  ['AMD Ryzen 5 5600 6-Core Processor', '12', 'Windows 10'],
  ['AMD Ryzen 5 5600 6-Core Processor', '12', 'Windows 11'],
  ['AMD Ryzen 9 3950X 16-Core Processor', '32', 'Windows 10'],
  ['AMD Ryzen 9 3950X 16-Core Processor', '32', 'Windows 11'],
  ['AMD Ryzen 9 3900X 12-Core Processor', '24', 'Windows 10'],
  ['AMD Ryzen 9 3900X 12-Core Processor', '24', 'Windows 11'],
  ['AMD Ryzen 7 3700X 8-Core Processor', '16', 'Windows 10'],
  ['AMD Ryzen 7 3700X 8-Core Processor', '16', 'Windows 11'],
  ['AMD Ryzen 5 3600 6-Core Processor', '12', 'Windows 10'],
  ['AMD Ryzen 5 3600 6-Core Processor', '12', 'Windows 11'],
  ['AMD Ryzen 7 5800H with Radeon Graphics', '16', 'Windows 10'],
  ['AMD Ryzen 7 5800H with Radeon Graphics', '16', 'Windows 11'],
  ['AMD Ryzen 5 5600H with Radeon Graphics', '12', 'Windows 10'],
  ['AMD Ryzen 5 5600H with Radeon Graphics', '12', 'Windows 11'],
  ['AMD Ryzen 7 6800H with Radeon Graphics', '16', 'Windows 10'],
  ['AMD Ryzen 7 6800H with Radeon Graphics', '16', 'Windows 11']
];


function getFingerprintFromDeviceId(deviceId) {
  const hash = deviceId.replace(/[^a-f0-9]/gi, '').substring(0, 8);
  const num = hash ? parseInt(hash, 16) : 0;
  const uaIndex = num % DESKTOP_USER_AGENTS.length;
  const cpuIndex = (num + 1) % CPU_FINGERPRINTS.length;
  return {
    userAgent: DESKTOP_USER_AGENTS[uaIndex],
    cpu: CPU_FINGERPRINTS[cpuIndex]
  };
}

// Dapatkan daftar device yang sudah ada untuk akun ini
async function getExistingDevices(accountIndex) {
  try {
    const files = await fs.readdir(DEVICES_DIR);
    return files
      .filter(f => f.startsWith(`${accountIndex}-`) && f.endsWith('.id'))
      .map(f => parseInt(f.split('-')[1], 10))
      .filter(d => !isNaN(d))
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
}

// Baca atau buat device ID
async function getOrCreateDeviceId(accountIndex, deviceIndex) {
  await fs.mkdir(DEVICES_DIR, { recursive: true });
  const deviceFile = path.join(DEVICES_DIR, `${accountIndex}-${deviceIndex}.id`);
  try {
    return (await fs.readFile(deviceFile, 'utf8')).trim();
  } catch {
    const newId = randomUUID();
    await fs.writeFile(deviceFile, newId);
    return newId;
  }
}

async function runDevice(accountIndex, deviceIndex) {
  const deviceId = await getOrCreateDeviceId(accountIndex, deviceIndex);
  const tokens = (await fs.readFile(TOKEN_FILE, 'utf8'))
    .split('\n')
    .map(t => t.trim())
    .filter(Boolean);

  if (accountIndex > tokens.length) {
    console.error(`[${accountIndex}-${deviceIndex}] ❌ Token tidak ada`);
    return;
  }

  const token = tokens[accountIndex - 1];
  const { userAgent, cpu } = getFingerprintFromDeviceId(deviceId);
  const [cpuModel, coreCount, osVersion] = cpu;

  // Ambil dari .env
  const BASE_URL = process.env.API_URL;
  const EXTENSION_ORIGIN = process.env.EXTENSION_ORIGIN;

  if (!BASE_URL || !EXTENSION_ORIGIN) {
    console.error('❌ .env tidak lengkap! Butuh API_URL dan EXTENSION_ORIGIN');
    process.exit(1);
  }

  const headers = {
    accept: '*/*',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,id;q=0.7',
    authorization: `Bearer ${token}`,
    'cache-control': 'no-cache',
    'content-type': 'application/json',
    pragma: 'no-cache',
    priority: 'u=1, i',
    'sec-ch-ua': '"Brave";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'none',
    'sec-fetch-storage-access': 'active',
    'sec-gpc': '1',
    'user-agent': userAgent,
    'x-app-version': '0.2.5',
    'x-cpu-architecture': 'x86_64',
    'x-cpu-model': cpuModel,
    'x-cpu-processor-count': coreCount,
    'x-device-id': deviceId,
    'x-device-model': `x64 - ${userAgent.includes('Edg/') ? 'Edge' : userAgent.includes('OPR/') ? 'Opera' : 'Chrome'} ${userAgent.match(/Chrome\/(\d+)/)?.[1] || '143'}`,
    'x-device-name': 'windows pc',
    'x-device-os': osVersion,
    'x-device-type': 'extension',
    'x-s': 'f',
    'x-user-agent': userAgent,
    'x-user-language': 'en-GB',
  };

  function buildPingHeaders(baseHeaders) {
    return {
      ...baseHeaders,
      origin: EXTENSION_ORIGIN,
      'content-length': '0',
    };
  }

  async function makeRequest(id, method, endpoint, hdrs) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, { method, headers: hdrs });
      console.log(`[${id}] ✅ ${method} ${endpoint} → ${res.status}`);
      if (endpoint === '/job' && res.ok) {
        const data = await res.json();
        if (data?.id) console.log(`[${id}] 🎯 JOB: ${data.id}`);
      }
      return res;
    } catch (err) {
      console.error(`[${id}] ❌ ${method} ${endpoint}:`, err.message);
    }
  }

  async function runCycle(id, hdrs) {
    const pingHdrs = buildPingHeaders(hdrs);
    await makeRequest(id, 'POST', '/ping', pingHdrs);
    await setTimeout(1000);
    await makeRequest(id, 'GET', '/worker', hdrs);
    await setTimeout(1000);
    await makeRequest(id, 'GET', '/network/worker-ip', hdrs);
    await setTimeout(1000);
    await makeRequest(id, 'GET', '/job', hdrs);
  }

  const id = `${accountIndex}-${deviceIndex}`;
  const startJitter = Math.floor(Math.random() * 5000);
  await setTimeout(startJitter);

  console.log(`[${id}] 🚀 Mulai (delay: ${startJitter}ms)`);
  console.log(`[${id}] 🆔 Device ID: ${deviceId}`);

  while (true) {
    await runCycle(id, headers);
    const interval = 28_000 + Math.floor(Math.random() * 4000);
    await setTimeout(interval);
  }
}

// === MAIN ===
async function main() {
  const tokens = (await fs.readFile(TOKEN_FILE, 'utf8'))
    .split('\n')
    .map(t => t.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    console.error('❌ token.txt kosong');
    process.exit(1);
  }


  for (let acc = 1; acc <= tokens.length; acc++) {
    const existing = await getExistingDevices(acc);
    if (existing.length === 0) {

      for (let dev = 1; dev <= DEVICE_PER_ACCOUNT; dev++) {
        await getOrCreateDeviceId(acc, dev);
      }
      console.log(`📦 Akun ${acc}: buat ${DEVICE_PER_ACCOUNT} device`);
    } else {
      console.log(`📦 Akun ${acc}: sudah ada ${existing.length} device`);
    }
  }

  const processes = [];
  for (let acc = 1; acc <= tokens.length; acc++) {
    const existing = await getExistingDevices(acc);
    const deviceCount = Math.min(existing.length, DEVICE_PER_ACCOUNT);
    for (let i = 0; i < deviceCount; i++) {
      const devIndex = existing[i];
      const child = spawn(process.execPath, [__filename, acc.toString(), devIndex.toString()], {
        stdio: 'inherit'
      });
      processes.push(child);
    }
  }

  console.log(`🚀 Menjalankan ${processes.length} device dari ${tokens.length} akun`);
}

if (process.argv.length === 4) {
  const acc = parseInt(process.argv[2], 10);
  const dev = parseInt(process.argv[3], 10);
  if (!isNaN(acc) && !isNaN(dev)) {
    runDevice(acc, dev).catch(console.error);
  } else {
    process.exit(1);
  }
} else {
  main().catch(console.error);
}
