# CHECKLIST MONITORING & GAP ANALYSIS IMPLEMENTASI BRD PLATFORM WAJIBABSEN

Dokumen ini merupakan pemetaan (*mapping*) komprehensif antara seluruh spesifikasi dalam **Business Requirements Document (`BRD_WajibAbsen_Platform.md`)** dengan status implementasi saat ini pada platform **WajibAbsen Monolith Full-Stack V1.0**, sekaligus menjadi panduan peta jalan (*roadmap*) untuk pengembangan fase selanjutnya.

---

## 1. Ringkasan Progres Keseluruhan

| Kategori Modul | Total Fitur / REQ | Terimplementasi (V1.0) | Dalam Pengembangan / Roadmap | Persentase Selesai |
| :--- | :---: | :---: | :---: | :---: |
| **MOD-01: Autentikasi & Keamanan Sesi** | 4 | 3 | 1 | **75%** |
| **MOD-02: Portal & Dashboard Karyawan** | 4 | 3 | 1 | **75%** |
| **MOD-03: Mesin Absensi Barcode / QR Code** | 4 | 3 | 1 | **75%** |
| **MOD-04: Geolocation & Geofencing** | 4 | 3 | 1 | **75%** |
| **MOD-05: Manajemen Shift & Jadwal** | 3 | 1 | 2 | **33%** |
| **MOD-06: Alur Persetujuan (Approval)** | 2 | 1 | 1 | **50%** |
| **MOD-07: Master Data Organisasi** | 2 | 1 | 1 | **50%** |
| **MOD-08: Pelaporan & Ekspor Payroll** | 3 | 2 | 1 | **67%** |
| **MOD-09: Log Audit & Analitik Eksekutif** | 2 | 1 | 1 | **50%** |
| **7 Commercial Value-Add USPs** | 7 | 4 | 3 | **57%** |
| **TOTAL** | **35** | **22** | **13** | **63% (MVP Core Complete)** |

---

## 2. Checklist Detail Status Implementasi BRD

### MOD-01: Autentikasi & Manajemen Sesi (Security & Device Binding)
- [x] **REQ-AUTH-01 (Single Device Binding)**: Pengikatan pengenal perangkat (`device_fingerprint`) pada login pertama dan penolakan login dari perangkat asing.
- [x] **REQ-AUTH-02 (Keamanan Sesi & JWT)**: Pembuatan token JWT bersertifikasi masa aktif serta pembagian peran granular.
- [x] **REQ-AUTH-03 (Manajemen Reset Device ID)**: Tombol *Reset Device Binding* oleh HR Admin pada dasbor untuk membuka pengikatan perangkat lama karyawan.
- [ ] **REQ-AUTH-04 (Biometric / Face Passkey Login)**: Autentikasi sidik jari atau pengenalan wajah native pada perangkat seluler/PWA *(Fase 2)*.

### MOD-02: Portal & Dashboard Karyawan (Mobile / Web Responsive)
- [x] **REQ-EMP-01 (Ringkasan Kehadiran Hari Ini)**: Tampilan status kehadiran, jadwal shift aktif, serta tombol aksi cepat *Check-In / Check-Out*.
- [x] **REQ-EMP-02 (Riwayat Kehadiran & Trust Score)**: Tabel riwayat absensi dengan penanda warna keterlambatan dan persentase *Attendance Trust Score*.
- [x] **REQ-EMP-03 (Self-Service Form Pengajuan)**: Formulir mandiri untuk pengajuan Cuti Tahunan, Izin Sakit, Lembur Proyek, dan Koreksi Kehadiran.
- [ ] **REQ-EMP-04 (Unggah Bukti Lampiran & Kalender Grid Interaktif)**: Fitur unggah lampiran surat dokter (file PDF/Image) dan visualisasi kalender bulanan penuh *(Fase 2)*.

### MOD-03: Mesin Absensi Barcode / QR Code (Dynamic Rotating QR)
- [x] **REQ-QR-01 (Kiosk Display Station Mode)**: Layar Kiosk kantor dengan Kode QR dinamis yang berputar otomatis setiap 15 detik dilengkapi hitung mundur siklus.
- [x] **REQ-QR-02 (Anti-Screenshot Protection)**: Tanda tangan kriptografi TOTP HMAC dan penolakan pemindaian terhadap foto tangkapan layar yang kedaluwarsa (>15–20s).
- [x] **REQ-QR-03 (Multi-Station Support)**: Pemilihan stasiun Kiosk (HQ Lobby Sudirman vs Bekasi Logistics Hub).
- [ ] **REQ-QR-04 (Hybrid QR + Selfie Liveness Validation)**: Penggabungan pindai QR Kiosk dengan swafoto kamera depan Kiosk dalam < 2 detik *(Fase 3)*.

### MOD-04: Mesin Absensi Geolocation & Geofencing
- [x] **REQ-GEO-01 (Multi-Geofencing Radius Haversine)**: Perhitungan presisi jarak koordinat GPS (meter) terhadap batas radius cabang kerja yang ditetapkan.
- [x] **REQ-GEO-02 (Anti-Mock GPS / Fake GPS Detection)**: Deteksi bendera manipulasi koordinat palsu, penolakan check-in otomatis, dan log insiden keamanan.
- [x] **REQ-GEO-03 (Secondary Wi-Fi BSSID Whitelist)**: Validasi alternatif sah berdasarkan kesesuaian MAC Address / BSSID Wi-Fi kantor.
- [ ] **REQ-GEO-04 (Offline-First Geolocation Queue)**: Penyimpanan antrean absensi di *Local Storage/IndexedDB* saat sinyal putus & auto-sync saat internet pulih *(Fase 2)*.

### MOD-05: Manajemen Shift, Jadwal & Roster Kerja
- [x] **REQ-SHF-01 (Konfigurasi Aturan Jam Kerja & Grace Period)**: Pendataan shift reguler, shift fleksibel, serta toleransi keterlambatan menit (*Grace Period*).
- [ ] **REQ-SHF-02 (Smart Auto-Shift Detection Engine)**: Deteksi otomatis shift kerja (Pagi/Siang/Malam) berdasarkan waktu kedatangan karyawan tanpa penyetelan manual *(Fase 2)*.
- [ ] **REQ-SHF-03 (Visual Roster Builder & Impor Excel Shift)**: Penjadwalan shift bergilir bulanan secara visual interaktif dan impor file Excel *(Fase 2)*.

### MOD-06: Alur Persetujuan (Approval Workflow)
- [x] **REQ-APP-01 (1st Level Manager Approval)**: Dasbor khusus Manajer untuk memantau kehadiran tim dan melakukan *Approve / Reject* atas pengajuan cuti/izin/lembur.
- [ ] **REQ-APP-02 (Multi-Level Approval & HR Final Override)**: Alur persetujuan berjenjang 2 tingkat (Manajer $\rightarrow$ HR Admin) disertai catatan penolakan *(Fase 2)*.

### MOD-07: Master Data Organisasi (HR Admin Tenant)
- [x] **REQ-MAS-01 (CRUD Master Karyawan & Cabang Geofence)**: Manajemen data karyawan, penyesuaian koordinat GPS cabang, radius meter, dan Wi-Fi BSSID.
- [ ] **REQ-MAS-02 (Manajemen Divisi & Hierarki Atasan Dinamis)**: Pengelompokan divisi multilevel dan relasi atasan-bawahan dinamis *(Fase 2)*.

### MOD-08: Pelaporan, Rekapitulasi & Ekspor Payroll
- [x] **REQ-REP-01 (Rekap Kehadiran & Kalkulasi Potongan Terlambat)**: Tabel ringkasan hari hadir, total hari/menit terlambat, skor kepercayaan rata-rata, dan estimasi denda potongan.
- [x] **REQ-REP-02 (Ekspor Siap Payroll CSV)**: Unduhan langsung file rekapitulasi berformat CSV yang siap diimpor ke sistem penggajian.
- [ ] **REQ-REP-03 (Universal HRIS Webhook / API & Excel Multi-Sheet)**: Konektor otomatis via Webhook API ke software HRIS populer (Talenta, Mekari, SAP, Odoo) *(Fase 3)*.

### MOD-09: Log Audit & Analitik Eksekutif
- [x] **REQ-AUD-01 (Security & Anti-Fraud Audit Log)**: Pencatatan otomatis insiden *Fake GPS* ke tabel log sistem.
- [ ] **REQ-AUD-02 (Executive Early Warning Dashboard & Punctuality Leaderboard)**: Dasbor eksekutif untuk deteksi dini lonjakan keterlambatan divisi dan papan peringkat kedisiplinan *(Fase 3)*.

---

## 3. Checklist Peningkatan Nilai Jual Produk (7 Commercial USPs)

- [x] **USP-1: Dynamic Rotating QR Code + Anti-Screenshot Kiosk** *(Terimplementasi V1.0)*
- [x] **USP-2: Multi-Layer Anti-Fraud Engine & Attendance Trust Score (0-100%)** *(Terimplementasi V1.0)*
- [x] **USP-3: Payroll Ready Exporter & Denda Keterlambatan Otomatis** *(Terimplementasi V1.0)*
- [x] **USP-4: Multi-Role Access Control (ACL Matrix 5 Peran dengan Switcher Cepat)** *(Terimplementasi V1.0)*
- [ ] **USP-5: Offline-First Attendance Queue & Silent Background Sync** *(Prioritas Pengembangan Berikutnya - Fase 2)*
- [ ] **USP-6: Smart Auto-Shift Detection Engine** *(Prioritas Pengembangan Berikutnya - Fase 2)*
- [ ] **USP-7: Gamifikasi Kedisiplinan (*Punctuality Leaderboard*) & Executive Early Warning Alert** *(Prioritas Pengembangan Berikutnya - Fase 3)*

---

## 4. Rekomendasi Roadmap Pengembangan Selanjutnya (Next Action Items)

Jika Anda ingin melanjutkan pengembangan menuju **Fase 2 (Enterprise Advanced Features)**, urutan prioritas yang paling berdampak pada nilai jual produk adalah:

1. **Implementasi Offline-First Queue (IndexedDB & Service Worker)**:
   - Memasangkan Service Worker pada PWA agar karyawan yang berada di area *blank spot* (basement/tambang/pabrik) tetap bisa check-in, dan data otomatis terkirim saat sinyal kembali normal.
2. **Smart Auto-Shift Detection**:
   - Menambahkan algoritma kecocokan waktu kedatangan agar sistem otomatis menentukan shift kerja karyawan.
3. **Multi-Level Approval Matrix dengan HR Override**:
   - Memperluas alur persetujuan menjadi Manajer $\rightarrow$ HR Admin disertai notifikasi status.
