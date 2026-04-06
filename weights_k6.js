import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

/**
 * ENV:
 *  BASE_URL="https://growt-farm.vercel.app"
 *  IOT_KEY="growt_...."
 *
 * Data generator:
 *  SN_PREFIX="SN-1769434254-A-SEED-"
 *  RFID_PREFIX="RF-1769434254-A-SEED-"
 *  SN_COUNT="150"
 *  RFID_COUNT="250"
 *
 * Pairing mode:
 *  PAIR_MODE="lock"   // lock = rfidIndex mengikuti snIndex (minim mismatch ownership)
 *  PAIR_MODE="spread" // spread = variasi rfid lebih merata (bisa memicu mismatch kalau seed tidak konsisten)
 *
 * Interval device untuk estimasi kapasitas bersamaan (bisa multi):
 *  DEVICE_INTERVALS="5,10"   // detik, default 5
 *
 * Timeout request:
 *  REQ_TIMEOUT="10s"          // default 10s (realistis utk ingest IoT)
 *
 * Kriteria “kapasitas aman” (untuk ringkasan otomatis):
 *  SAFE_FAIL_RATE="0.01"      // default 1%
 *  SAFE_P95_MS="2000"         // default 2000ms
 */

const BASE_URL = __ENV.BASE_URL || "https://growt-farm.vercel.app";
const URL = `${BASE_URL}/api/iot/weights`;
const IOT_KEY = __ENV.IOT_KEY || "growt_9uB7pF23LzQ0dN5sX1kA3vZc8Yh4";

const SN_PREFIX = __ENV.SN_PREFIX || "SN-1769434254-A-SEED-";
const RFID_PREFIX = __ENV.RFID_PREFIX || "RF-1769434254-A-SEED-";
const SN_COUNT = parseInt(__ENV.SN_COUNT || "150", 10);
const RFID_COUNT = parseInt(__ENV.RFID_COUNT || "250", 10);

const PAIR_MODE = (__ENV.PAIR_MODE || "lock").toLowerCase();
const REQ_TIMEOUT = __ENV.REQ_TIMEOUT || "10s";

const DEVICE_INTERVALS = String(__ENV.DEVICE_INTERVALS || "5")
  .split(",")
  .map((s) => parseFloat(s.trim()))
  .filter((n) => Number.isFinite(n) && n > 0);

// “kapasitas aman” = fase tertinggi yang masih memenuhi dua kriteria ini
const SAFE_FAIL_RATE = parseFloat(__ENV.SAFE_FAIL_RATE || "0.01"); // 1%
const SAFE_P95_MS = parseFloat(__ENV.SAFE_P95_MS || "2000"); // 2s

// ===== Counters status code (total + bisa dibreakdown via tags phase bila tersedia) =====
export const status_201 = new Counter("status_201");
export const status_400 = new Counter("status_400");
export const status_401 = new Counter("status_401");
export const status_403 = new Counter("status_403");
export const status_409 = new Counter("status_409");
export const status_5xx = new Counter("status_5xx");
export const status_other = new Counter("status_other");

// ===== Utilities =====
function pad4(n) {
  return String(n).padStart(4, "0");
}
function snByIndex(i) {
  return `${SN_PREFIX}${pad4(i)}`;
}
function rfidByIndex(i) {
  return `${RFID_PREFIX}${pad4(i)}`;
}
function dummyWeightValid() {
  const r = Math.floor(Math.random() * (400 - 250 + 1)) + 250; // 250..400
  return r / 10; // 25.0..40.0
}
function measuredAtUnique() {
  const ms = Date.now() + (__VU % 1000) + (__ITER % 100000);
  return new Date(ms).toISOString();
}

function pickPair() {
  const snIndex = ((__VU - 1) % SN_COUNT) + 1; // 1..SN_COUNT
  let rfidIndex;

  if (PAIR_MODE === "lock") {
    rfidIndex = ((snIndex - 1) % RFID_COUNT) + 1;
  } else {
    rfidIndex = (((__ITER + snIndex) % RFID_COUNT) + 1);
  }

  return { sn: snByIndex(snIndex), rfid: rfidByIndex(rfidIndex) };
}

function addStatusCounter(code) {
  if (code === 201) status_201.add(1);
  else if (code === 400) status_400.add(1);
  else if (code === 401) status_401.add(1);
  else if (code === 403) status_403.add(1);
  else if (code === 409) status_409.add(1);
  else if (code >= 500) status_5xx.add(1);
  else status_other.add(1); // termasuk status 0 (timeout/network)
}

// ====== PHASES (sesuai yang Anda minta) ======
const PHASES = [
  { name: "RPS40", duration: "4m", rps: 40 },
  { name: "RPS60", duration: "4m", rps: 60 },
  { name: "RPS70", duration: "2m", rps: 70 },
  { name: "RPS75", duration: "2m", rps: 75 },
  { name: "RPS80", duration: "2m", rps: 80 },
  { name: "RPS85", duration: "2m", rps: 85 },
  { name: "RPS90", duration: "2m", rps: 90 },
  { name: "RPS95", duration: "2m", rps: 95 },
];

// hitung startTime kumulatif biar gak salah manual
function toSeconds(dur) {
  // dukung "2m", "4m", "30s"
  const m = /^(\d+)([smh])$/.exec(dur.trim());
  if (!m) throw new Error(`Bad duration: ${dur}`);
  const n = parseInt(m[1], 10);
  const u = m[2];
  if (u === "s") return n;
  if (u === "m") return n * 60;
  if (u === "h") return n * 3600;
  return n;
}

let startAtSec = 0;
const scenarios = {};
for (const p of PHASES) {
  const key = `phase_${p.name.toLowerCase()}`;
  scenarios[key] = {
    executor: "constant-arrival-rate",
    rate: p.rps,
    timeUnit: "1s",
    duration: p.duration,
    startTime: `${startAtSec}s`,

    // preAllocatedVUs jangan terlalu kecil, biar bukan bottleneck dari load generator
    preAllocatedVUs: Math.max(600, SN_COUNT * 4),
    maxVUs: 3000,

    exec: "send_weight_valid",
    tags: { test: "iot_weights_capacity", phase: p.name, case: "C1_VALID" },
  };

  startAtSec += toSeconds(p.duration);
}

export const options = {
  scenarios,

  // Threshold global (boleh Anda sesuaikan)
  thresholds: {
    // contoh SLA praktis: p95 < 2s dan fail rate < 2%
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<2000"],

    // sub-metric per phase (biar muncul di JSON + bisa kita olah)
    ...PHASES.reduce((acc, p) => {
      acc[`http_req_duration{phase:${p.name}}`] = ["p(95)<2000"];
      acc[`http_req_failed{phase:${p.name}}`] = ["rate<0.02"];
      acc[`http_reqs{phase:${p.name}}`] = []; // supaya series kepanggil saat summary
      return acc;
    }, {}),
  },
};

export function send_weight_valid() {
  const { sn, rfid } = pickPair();

  const payload = JSON.stringify({
    device_serial: sn,
    rfid: rfid,
    weight: dummyWeightValid(),
    measured_at: measuredAtUnique(),
  });

  const res = http.post(URL, payload, {
    headers: {
      "Content-Type": "application/json",
      "x-growt-iot-key": IOT_KEY,
    },
    tags: { endpoint: "iot_weights" },
    timeout: REQ_TIMEOUT,
  });

  addStatusCounter(res.status);

  const ok = check(res, { "status is 201": (r) => r.status === 201 });

  // sampling log error biar tidak spam
  if (!ok && (__ITER % 500 === 0)) {
    console.log(
      `ERR status=${res.status} sn=${sn.slice(-4)} rfid=${rfid.slice(-4)} body=${String(res.body).slice(0, 120)}`
    );
  }

  sleep(0.001);
}

// ===== handleSummary: summary.md + summary.json (lebih rinci, skripsi-ready) =====
function fmtMsOrS(v) {
  if (v === undefined || v === null) return "-";
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  if (n >= 1000) return `${(n / 1000).toFixed(2)} s`;
  return `${n.toFixed(0)} ms`;
}
function fmtPctRate(v) {
  if (v === undefined || v === null) return "-";
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  return `${(n * 100).toFixed(2)}%`;
}
function fmtInt(v) {
  if (v === undefined || v === null) return "-";
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  return `${Math.trunc(n)}`;
}
function getValues(data, metricName) {
  return data.metrics[metricName]?.values ?? null;
}
function vGet(values, key) {
  if (!values) return undefined;
  return values[key];
}
function estDevices(rps, intervalS) {
  return Math.round(rps * intervalS);
}

export function handleSummary(data) {
  const totalReq = data.metrics.http_reqs?.values?.count ?? 0;
  const totalRps = data.metrics.http_reqs?.values?.rate;

  const totalFailRate = data.metrics.http_req_failed?.values?.rate;
  const totalDur = getValues(data, "http_req_duration");

  const droppedTotal = data.metrics.dropped_iterations?.values?.count ?? 0;

  // custom counters (total)
  const c201 = data.metrics.status_201?.values?.count ?? 0;
  const c5xx = data.metrics.status_5xx?.values?.count ?? 0;
  const cOther = data.metrics.status_other?.values?.count ?? 0;

  // per phase rows
  const rows = PHASES.map((p) => {
    const vDur = getValues(data, `http_req_duration{phase:${p.name}}`);
    const vFail = data.metrics[`http_req_failed{phase:${p.name}}`]?.values;
    const vReqs = data.metrics[`http_reqs{phase:${p.name}}`]?.values;

    const countReq = vReqs?.count ?? 0;
    const failRate = vFail?.rate ?? 0;

    // estimasi sukses/gagal dari failRate * request (lebih stabil daripada ngandelin parsing status per phase)
    const estFail = Math.round(countReq * failRate);
    const estOk = Math.max(0, countReq - estFail);

    const p50 = vGet(vDur, "med");
    const p90 = vGet(vDur, "p(90)");
    const p95 = vGet(vDur, "p(95)");
    const avg = vGet(vDur, "avg");

    return {
      phase: p.name,
      rps: p.rps,
      duration: p.duration,
      reqs: countReq,
      estOk,
      estFail,
      failRate,
      p50,
      p90,
      p95,
      avg,
    };
  });

  // cari fase “kapasitas aman” otomatis
  // kriteria: failRate <= SAFE_FAIL_RATE dan p95 <= SAFE_P95_MS
  let safePhase = null;
  for (const r of rows) {
    const p95ms = Number(r.p95);
    const p95Ok = Number.isFinite(p95ms) ? p95ms <= SAFE_P95_MS : false;
    if (r.failRate <= SAFE_FAIL_RATE && p95Ok) safePhase = r;
  }

  let md = `## Ringkasan Pengujian Beban Endpoint /api/iot/weights (k6)\n\n`;
  md += `Skenario uji: beban dinaikkan bertahap untuk mencari ambang stabilitas endpoint ingest. Setiap fase berjalan berurutan sesuai target RPS dan durasi.\n\n`;

  md += `**Konfigurasi penting:**\n`;
  md += `- Timeout request: ${REQ_TIMEOUT}\n`;
  md += `- Pair mode: ${PAIR_MODE}\n`;
  md += `- SN_COUNT=${SN_COUNT}, RFID_COUNT=${RFID_COUNT}\n`;
  md += `- Interval device untuk estimasi: ${DEVICE_INTERVALS.join(", ")} detik\n\n`;

  md += `### Tabel Hasil per Fase (lebih rinci)\n\n`;
  md += `| Fase | Durasi | Target RPS | Total Request | Est. Sukses | Est. Gagal | Fail Rate | p50 | p90 | p95 | Avg |\n`;
  md += `|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n`;
  for (const r of rows) {
    md += `| ${r.phase} | ${r.duration} | ${r.rps} | ${fmtInt(r.reqs)} | ${fmtInt(r.estOk)} | ${fmtInt(r.estFail)} | ${fmtPctRate(r.failRate)} | ${fmtMsOrS(r.p50)} | ${fmtMsOrS(r.p90)} | ${fmtMsOrS(r.p95)} | ${fmtMsOrS(r.avg)} |\n`;
  }

  md += `\n### Estimasi Kapasitas Perangkat Bersamaan\n\n`;
  md += `Estimasi perangkat bersamaan dihitung dengan pendekatan sederhana: **device ≈ RPS × interval_kirim**.\n\n`;

  md += `| Fase | RPS | ${DEVICE_INTERVALS.map((s) => `≈Device@${s}s`).join(" | ")} |\n`;
  md += `|---|---:|${DEVICE_INTERVALS.map(() => "---:").join("|")}|\n`;
  for (const r of rows) {
    md += `| ${r.phase} | ${r.rps} | ${DEVICE_INTERVALS.map((s) => estDevices(r.rps, s)).join(" | ")} |\n`;
  }

  md += `\n### Ringkasan Total\n\n`;
  md += `| Metrik | Nilai |\n|---|---:|\n`;
  md += `| Total request (http_reqs) | ${fmtInt(totalReq)} |\n`;
  md += `| RPS rata-rata | ${totalRps !== undefined ? totalRps.toFixed(2) : "-"} req/s |\n`;
  md += `| Fail rate (http_req_failed) | ${fmtPctRate(totalFailRate)} |\n`;
  md += `| Latensi avg | ${fmtMsOrS(totalDur?.avg)} |\n`;
  md += `| Latensi p90 | ${fmtMsOrS(totalDur?.["p(90)"])} |\n`;
  md += `| Latensi p95 | ${fmtMsOrS(totalDur?.["p(95)"])} |\n`;
  md += `| Dropped iterations | ${fmtInt(droppedTotal)} |\n`;

  md += `\n### Distribusi Status (Total)\n\n`;
  md += `| Kategori | Jumlah |\n|---|---:|\n`;
  md += `| 201 (Sukses) | ${fmtInt(c201)} |\n`;
  md += `| 5xx (Server error) | ${fmtInt(c5xx)} |\n`;
  md += `| Other/0 (timeout/network/unknown) | ${fmtInt(cOther)} |\n`;

  md += `\n### Kapasitas Aman (indikatif)\n\n`;
  md += `Kriteria otomatis: failRate ≤ ${(SAFE_FAIL_RATE * 100).toFixed(2)}% dan p95 ≤ ${SAFE_P95_MS} ms.\n\n`;
  if (safePhase) {
    md += `Fase tertinggi yang masih memenuhi kriteria: **${safePhase.phase} (${safePhase.rps} RPS)**.\n\n`;
    md += `Estimasi device bersamaan pada fase ini:\n`;
    for (const s of DEVICE_INTERVALS) {
      md += `- Interval ${s}s: ≈ ${estDevices(safePhase.rps, s)} device\n`;
    }
    md += `\n`;
  } else {
    md += `Tidak ada fase yang memenuhi kriteria otomatis (cek failRate/p95 per fase). Anda bisa longgarkan SAFE_FAIL_RATE/SAFE_P95_MS bila target SLA memang lebih longgar.\n\n`;
  }

  return {
    "summary.md": md,
    "summary.json": JSON.stringify(data, null, 2),
  };
}
