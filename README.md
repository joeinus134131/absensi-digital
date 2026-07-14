# WajibAbsen — Platform Absensi Digital Enterprise Monolith

Platform Absensi Digital Enterprise **WajibAbsen** dibangun berdasarkan dokumen **Business Requirements Document (BRD)** (`BRD_WajibAbsen_Platform.md`), mengusung teknologi **Zero-Fraud Attendance** dengan perlindungan *Anti-Mock GPS*, *Dynamic Rotating QR Code (TOTP HMAC)*, serta matriks kontrol akses berjenjang (*Access Control List - ACL*) untuk 5 peran pengguna.

## 🌟 Fitur & Keunggulan Platform
1. **Dynamic Rotating QR Code (Kiosk Mode)**: Kode QR berbarcode di layar Kiosk kantor berputar setiap 15 detik dilengkapi verifikasi *time-based cryptographic signature* untuk mencegah penipuan *titip absen via screenshot*.
2. **Geolocation & Geofencing + Anti-Mock GPS**: Kalkulasi jarak real-time (*Haversine formula*) terhadap radius koordinat cabang serta deteksi penipuan dari aplikasi *Fake GPS / Mock Location*.
3. **Attendance Trust Score (Skor Kepercayaan 0–100%)**: Setiap check-in dievaluasi secara otomatis, memberi lencana kepatuhan dan peringatan dini bagi manajer dan HR.
4. **Matriks Hak Akses Granular (ACL 5 Peran)**:
   - **Karyawan (Staff)**: Check-In/Out, Riwayat Kehadiran pribadi, Pengajuan Cuti/Izin/Lembur mandiri.
   - **Manajer / Supervisor**: Live pengawasan kehadiran tim, *Approval Workflow* tingkat pertama.
   - **HR / Tenant Admin**: Master Karyawan, Konfigurasi Geofence & Wi-Fi BSSID cabang, Reset Device Binding.
   - **Payroll & Auditor**: Rekapitulasi siap payroll & Unduh format CSV terverifikasi.
   - **Super Admin**: Pengawasan penuh SaaS Platform.

## 🚀 Cara Menjalankan Secara Lokal
1. Install dependensi:
   ```bash
   npm install
   ```
2. (Opsional) Seeder data awal lengkap (otomatis dijalankan saat server pertama aktif):
   ```bash
   npm run seed
   ```
3. Jalankan aplikasi Full-Stack Monolith (Backend Express API port `5001` + Frontend React Vite port `3000`):
   ```bash
   npm run dev
   ```

Akses aplikasi di browser pada: `http://localhost:3000`
Gunakan **ACL Demo Switch** di bilah navigasi atas (*Navbar*) untuk berpindah peran secara instan!
