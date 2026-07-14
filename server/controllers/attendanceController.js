import { db } from '../db/database.js';

// Haversine formula to calculate distance between two coordinates in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Smart Auto-Shift Detection Engine (REQ-SHF-02 & USP-6)
export function detectSmartShift(checkInTimeStr, branchId) {
  const shifts = db.filter('shifts', s => s.branch_id === branchId || s.branch_id === 'branch_hq');
  if (!shifts.length) return null;

  const checkInDate = new Date(checkInTimeStr);
  const checkInMinutes = checkInDate.getHours() * 60 + checkInDate.getMinutes();

  let closestShift = shifts[0];
  let minDiff = 99999;

  shifts.forEach(shift => {
    const [h, m] = shift.start_time.split(':').map(Number);
    const shiftStartMinutes = h * 60 + m;
    const diff = Math.abs(checkInMinutes - shiftStartMinutes);
    if (diff < minDiff) {
      minDiff = diff;
      closestShift = shift;
    }
  });

  return closestShift;
}

export const checkInGeo = (req, res) => {
  const { user_id, latitude, longitude, is_mock_location, wifi_bssid, is_biometric_verified } = req.body;

  const user = db.find('users', u => u.id === user_id);
  if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });

  const branch = db.find('branches', b => b.id === user.branch_id) || db.getTable('branches')[0];

  // 1. Check Anti-Mock GPS / Fake GPS (REQ-GEO-02)
  if (is_mock_location) {
    db.insert('audit_logs', {
      actor_id: user.id,
      actor_role: user.role,
      action: 'SECURITY_ALERT_FAKE_GPS',
      target_type: 'ATTENDANCE_SECURITY',
      details: `Deteksi Mock Location / Fake GPS pada koordinat ${latitude}, ${longitude}`,
      timestamp: new Date().toISOString()
    });

    return res.status(403).json({
      success: false,
      error_code: 'FAKE_GPS_DETECTED',
      message: 'Aplikasi Fake GPS / Mock Location terdeteksi di perangkat Anda! Check-In ditolak dan insiden dilaporkan ke HR.'
    });
  }

  // 2. Calculate Distance to Branch
  const distance = calculateDistanceMeters(Number(latitude), Number(longitude), branch.latitude, branch.longitude);
  const isWithinRadius = distance <= branch.radius_meters;
  const isWifiMatched = wifi_bssid && wifi_bssid === branch.bssid_whitelist;

  if (!isWithinRadius && !isWifiMatched) {
    return res.status(400).json({
      success: false,
      error_code: 'OUT_OF_GEOFENCE_RADIUS',
      distance_meters: distance,
      branch_name: branch.name,
      radius_meters: branch.radius_meters,
      message: `Posisi Anda (${distance} meter dari ${branch.name}) berada di luar batas radius kantor (${branch.radius_meters} meter).`
    });
  }

  // 3. Smart Auto-Shift Detection (REQ-SHF-02 & USP-6)
  const now = new Date();
  const detectedShift = detectSmartShift(now.toISOString(), branch.id);

  // 4. Calculate Attendance Trust Score (0-100)
  let trustScore = 100;
  const flags = ['VERIFIED_GPS'];

  if (distance > branch.radius_meters * 0.8) {
    trustScore -= 5;
  }
  if (isWifiMatched) {
    flags.push('VERIFIED_WIFI_BSSID');
  }
  if (is_biometric_verified) {
    flags.push('VERIFIED_BIOMETRIC_LIVENESS');
  }

  // Check late status against Detected Shift
  let isLate = false;
  let lateMinutes = 0;

  if (detectedShift) {
    const [shiftHour, shiftMinute] = detectedShift.start_time.split(':').map(Number);
    const expectedTime = new Date(now);
    expectedTime.setHours(shiftHour, shiftMinute + (detectedShift.grace_period_minutes || 0), 0, 0);

    if (now > expectedTime) {
      isLate = true;
      lateMinutes = Math.round((now - expectedTime) / 60000);
      flags.push('LATE_CHECK_IN');
    }
    flags.push(`AUTO_SHIFT_${detectedShift.name.toUpperCase().replace(/\s+/g, '_')}`);
  }

  const log = db.insert('attendance_logs', {
    user_id: user.id,
    branch_id: branch.id,
    shift_id: detectedShift ? detectedShift.id : null,
    date: now.toISOString().split('T')[0],
    check_in_time: now.toISOString(),
    check_out_time: null,
    check_in_method: is_biometric_verified ? 'GEO_BIOMETRIC_HYBRID' : (isWifiMatched ? 'WIFI_BSSID_VERIFIED' : 'GEOLOCATION_GPS'),
    latitude: Number(latitude),
    longitude: Number(longitude),
    distance_meters: distance,
    trust_score: trustScore,
    flags,
    is_late: isLate,
    late_minutes: lateMinutes,
    status: 'CHECKED_IN'
  });

  res.json({
    success: true,
    message: isLate
      ? `Check-in berhasil tercatat (${distance}m dari kantor) dengan Shift Otomatis "${detectedShift?.name}". Terlambat ${lateMinutes} menit.`
      : `Check-in Tepat Waktu berhasil tercatat (${distance}m dari kantor) dengan Shift Otomatis "${detectedShift?.name || 'Regular'}".`,
    log,
    detected_shift: detectedShift,
    distance_meters: distance,
    trust_score: trustScore
  });
};

export const checkOutGeo = (req, res) => {
  const { log_id } = req.body;
  const updated = db.update('attendance_logs', log_id, {
    check_out_time: new Date().toISOString(),
    status: 'COMPLETED'
  });

  if (!updated) return res.status(404).json({ success: false, message: 'Data check-in tidak ditemukan.' });
  res.json({ success: true, message: 'Check-out berhasil dicatat. Sampai jumpa besok!', log: updated });
};

// USP-5: Offline-First Queue Sync Endpoint
export const syncOfflineQueue = (req, res) => {
  const { queued_logs } = req.body;

  if (!Array.isArray(queued_logs) || queued_logs.length === 0) {
    return res.status(400).json({ success: false, message: 'Antrean log offline kosong.' });
  }

  const syncedLogs = [];
  const errors = [];

  queued_logs.forEach(item => {
    const user = db.find('users', u => u.id === item.user_id);
    if (!user) {
      errors.push(`User ID ${item.user_id} tidak ditemukan.`);
      return;
    }

    const branch = db.find('branches', b => b.id === user.branch_id) || db.getTable('branches')[0];
    const detectedShift = detectSmartShift(item.timestamp, branch.id);

    const newLog = db.insert('attendance_logs', {
      user_id: user.id,
      branch_id: branch.id,
      shift_id: detectedShift ? detectedShift.id : user.shift_id,
      date: item.timestamp ? item.timestamp.split('T')[0] : new Date().toISOString().split('T')[0],
      check_in_time: item.timestamp || new Date().toISOString(),
      check_out_time: null,
      check_in_method: 'OFFLINE_SYNCED_GEO',
      latitude: Number(item.latitude || -6.225010),
      longitude: Number(item.longitude || 106.806030),
      distance_meters: item.distance_meters || 15,
      trust_score: item.trust_score || 95,
      flags: ['VERIFIED_GPS', 'OFFLINE_FIRST_SYNCED'],
      is_late: false,
      late_minutes: 0,
      status: 'CHECKED_IN'
    });

    syncedLogs.push(newLog);
  });

  res.json({
    success: true,
    message: `Berhasil mensinkronisasikan ${syncedLogs.length} data absensi dari antrean offline!`,
    synced_count: syncedLogs.length,
    synced_logs: syncedLogs
  });
};

export const getAttendanceLogs = (req, res) => {
  const { user_id, role } = req.query;

  let logs = db.getTable('attendance_logs');

  if (role === 'EMPLOYEE' && user_id) {
    logs = logs.filter(l => l.user_id === user_id);
  } else if (role === 'MANAGER' && user_id) {
    const mgr = db.find('users', u => u.id === user_id);
    if (mgr) {
      const teamUserIds = db.filter('users', u => u.branch_id === mgr.branch_id).map(u => u.id);
      logs = logs.filter(l => teamUserIds.includes(l.user_id));
    }
  }

  const users = db.getTable('users');
  const branches = db.getTable('branches');

  const enriched = logs.map(log => {
    const usr = users.find(u => u.id === log.user_id);
    const brn = branches.find(b => b.id === log.branch_id);
    return {
      ...log,
      user_name: usr ? usr.full_name : 'Unknown',
      user_nik: usr ? usr.nik : '-',
      user_department: usr ? usr.department : '-',
      branch_name: brn ? brn.name : '-'
    };
  }).reverse();

  res.json({ success: true, logs: enriched });
};
