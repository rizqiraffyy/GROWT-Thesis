## Ringkasan Pengujian Beban Endpoint /api/iot/weights (k6)

Skenario uji: beban dinaikkan bertahap untuk mencari ambang stabilitas endpoint ingest. Setiap fase berjalan berurutan sesuai target RPS dan durasi.

**Konfigurasi penting:**
- Timeout request: 10s
- Pair mode: lock
- SN_COUNT=150, RFID_COUNT=250
- Interval device untuk estimasi: 5, 10 detik

### Tabel Hasil per Fase (lebih rinci)

| Fase | Durasi | Target RPS | Total Request | Est. Sukses | Est. Gagal | Fail Rate | p50 | p90 | p95 | Avg |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| RPS40 | 4m | 40 | 9600 | 9599 | 1 | 0.01% | 1.32 s | 1.53 s | 2.08 s | 1.49 s |
| RPS60 | 4m | 60 | 14401 | 14358 | 43 | 0.30% | 1.33 s | 1.47 s | 1.89 s | 1.44 s |
| RPS70 | 2m | 70 | 8401 | 8401 | 0 | 0.00% | 1.32 s | 1.40 s | 1.48 s | 1.38 s |
| RPS75 | 2m | 75 | 9001 | 9001 | 0 | 0.00% | 1.32 s | 1.38 s | 1.44 s | 1.33 s |
| RPS80 | 2m | 80 | 9601 | 9599 | 2 | 0.02% | 1.32 s | 1.38 s | 1.42 s | 1.33 s |
| RPS85 | 2m | 85 | 10201 | 10200 | 1 | 0.01% | 1.32 s | 1.55 s | 2.65 s | 1.53 s |
| RPS90 | 2m | 90 | 10801 | 10799 | 2 | 0.02% | 1.32 s | 1.42 s | 1.74 s | 1.41 s |
| RPS95 | 2m | 95 | 11125 | 8836 | 2289 | 20.58% | 1.33 s | 10.00 s | 10.00 s | 3.15 s |

### Estimasi Kapasitas Perangkat Bersamaan

Estimasi perangkat bersamaan dihitung dengan pendekatan sederhana: **device ≈ RPS × interval_kirim**.

| Fase | RPS | ≈Device@5s | ≈Device@10s |
|---|---:|---:|---:|
| RPS40 | 40 | 200 | 400 |
| RPS60 | 60 | 300 | 600 |
| RPS70 | 70 | 350 | 700 |
| RPS75 | 75 | 375 | 750 |
| RPS80 | 80 | 400 | 800 |
| RPS85 | 85 | 425 | 850 |
| RPS90 | 90 | 450 | 900 |
| RPS95 | 95 | 475 | 950 |

### Ringkasan Total

| Metrik | Nilai |
|---|---:|
| Total request (http_reqs) | 83131 |
| RPS rata-rata | 68.70 req/s |
| Fail rate (http_req_failed) | 2.81% |
| Latensi avg | 1.65 s |
| Latensi p90 | 1.47 s |
| Latensi p95 | 2.59 s |
| Dropped iterations | 275 |

### Distribusi Status (Total)

| Kategori | Jumlah |
|---|---:|
| 201 (Sukses) | 80793 |
| 5xx (Server error) | 8 |
| Other/0 (timeout/network/unknown) | 2330 |

### Kapasitas Aman (indikatif)

Kriteria otomatis: failRate ≤ 1.00% dan p95 ≤ 2000 ms.

Fase tertinggi yang masih memenuhi kriteria: **RPS90 (90 RPS)**.

Estimasi device bersamaan pada fase ini:
- Interval 5s: ≈ 450 device
- Interval 10s: ≈ 900 device

