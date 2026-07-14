import { db } from '../db/database.js';

export const getPayrollSummary = (req, res) => {
  const users = db.getTable('users');
  const logs = db.getTable('attendance_logs');

  const summary = users.map(user => {
    const userLogs = logs.filter(l => l.user_id === user.id);
    const totalDays = userLogs.length;
    const lateDays = userLogs.filter(l => l.is_late).length;
    const totalLateMinutes = userLogs.reduce((acc, l) => acc + (l.late_minutes || 0), 0);
    const verifiedQrCount = userLogs.filter(l => l.check_in_method === 'DYNAMIC_QR_KIOSK').length;
    const verifiedGeoCount = userLogs.filter(l => l.check_in_method === 'GEOLOCATION_GPS' || l.check_in_method === 'WIFI_BSSID_VERIFIED' || l.check_in_method === 'GEO_BIOMETRIC_HYBRID').length;

    const avgTrust = totalDays > 0
      ? Math.round(userLogs.reduce((acc, l) => acc + (l.trust_score || 100), 0) / totalDays)
      : 100;

    return {
      user_id: user.id,
      nik: user.nik,
      full_name: user.full_name,
      department: user.department,
      position: user.position,
      role: user.role,
      total_attendance: totalDays,
      late_days: lateDays,
      total_late_minutes: totalLateMinutes,
      qr_attendance: verifiedQrCount,
      geo_attendance: verifiedGeoCount,
      avg_trust_score: avgTrust,
      estimated_payroll_deduction_idr: totalLateMinutes * 15000
    };
  });

  res.json({ success: true, summary });
};

// USP-7 & REQ-AUD-02: Executive Analytics & Punctuality Leaderboard
export const getExecutiveAnalytics = (req, res) => {
  const users = db.getTable('users');
  const logs = db.getTable('attendance_logs');

  // 1. Punctuality Leaderboard
  const leaderboard = users.map(u => {
    const userLogs = logs.filter(l => l.user_id === u.id);
    const totalDays = userLogs.length || 1;
    const onTimeCount = userLogs.filter(l => !l.is_late).length;
    const punctualityScore = Math.round((onTimeCount / totalDays) * 100);
    const avgTrust = Math.round(userLogs.reduce((acc, l) => acc + (l.trust_score || 100), 0) / totalDays);

    return {
      user_id: u.id,
      nik: u.nik,
      full_name: u.full_name,
      department: u.department,
      avatar: u.avatar,
      punctuality_score: punctualityScore,
      avg_trust_score: avgTrust,
      badge: punctualityScore === 100 ? '🥇 ZERO LATE CHAMPION' : (punctualityScore >= 90 ? '🥈 HIGH DISCIPLINE' : '🥉 STANDARD')
    };
  }).sort((a, b) => b.punctuality_score - a.punctuality_score);

  // 2. Early Warning Alerts
  const warnings = [
    {
      id: 'warn_01',
      severity: 'HIGH',
      title: 'Peringatan Anggaran Lembur (Overtime Burn Alert)',
      description: 'Pengajuan lembur pada Divisi Product & Engineering berpotensi melampaui alokasi kuota bulanan (+18%).'
    },
    {
      id: 'warn_02',
      severity: 'MEDIUM',
      title: 'Tren Keterlambatan Pagi (Grace Period Watch)',
      description: 'Sebanyak 15% karyawan pada cabang HQ Sudirman Tower hadir mendekati batas akhir toleransi 15 menit.'
    }
  ];

  res.json({
    success: true,
    leaderboard,
    warnings,
    total_active_employees: users.length,
    total_logs_processed: logs.length
  });
};

// USP-3 & REQ-REP-03: Universal Webhook API Trigger
export const testWebhookTrigger = (req, res) => {
  const { webhook_url, payload_type } = req.body;
  const samplePayload = {
    event: 'ATTENDANCE_VERIFIED',
    timestamp: new Date().toISOString(),
    platform: 'WajibAbsen Enterprise V1.0',
    data: {
      user_id: 'EMP-0301',
      full_name: 'Rayhan Putra Pratama',
      check_in_time: new Date().toISOString(),
      trust_score: 100,
      verified_by: 'DYNAMIC_QR_TOTP'
    }
  };

  res.json({
    success: true,
    message: `Payload siap dikirim ke Webhook HRIS/Payroll (${webhook_url || 'https://api.hris.example/webhook'}).`,
    payload: samplePayload
  });
};

export const exportPayrollCSV = (req, res) => {
  const users = db.getTable('users');
  const logs = db.getTable('attendance_logs');

  let csv = 'NIK,Nama Lengkap,Departemen,Jabatan,Total Hadir,Total Terlambat (Hari),Total Terlambat (Menit),Skor Kepercayaan Rata-Rata (%),Estimasi Potongan Terlambat (IDR)\n';

  users.forEach(user => {
    const userLogs = logs.filter(l => l.user_id === user.id);
    const totalDays = userLogs.length;
    const lateDays = userLogs.filter(l => l.is_late).length;
    const totalLateMinutes = userLogs.reduce((acc, l) => acc + (l.late_minutes || 0), 0);
    const avgTrust = totalDays > 0
      ? Math.round(userLogs.reduce((acc, l) => acc + (l.trust_score || 100), 0) / totalDays)
      : 100;
    const deduction = totalLateMinutes * 15000;

    csv += `"${user.nik}","${user.full_name}","${user.department}","${user.position}",${totalDays},${lateDays},${totalLateMinutes},${avgTrust},${deduction}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="WajibAbsen_Payroll_Export.csv"');
  res.send(csv);
};
