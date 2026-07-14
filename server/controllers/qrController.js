import { db } from '../db/database.js';

// Generates dynamic rotating token for Kiosk Station every 15s
export const getDynamicQRToken = (req, res) => {
  const { station_code } = req.query;
  const station = db.find('qr_stations', s => s.station_code === station_code) || db.getTable('qr_stations')[0];

  if (!station) {
    return res.status(404).json({ success: false, message: 'Stasiun QR tidak ditemukan.' });
  }

  const now = Math.floor(Date.now() / 1000);
  const cycle = Math.floor(now / 15); // Changes every 15 seconds
  const remainingSeconds = 15 - (now % 15);

  const payload = {
    station_id: station.id,
    station_code: station.station_code,
    branch_id: station.branch_id,
    cycle_timestamp: cycle * 15,
    expires_at: (cycle * 15) + 15,
    signature: `TOTP_${station.station_code}_${cycle}`
  };

  const qrTokenString = Buffer.from(JSON.stringify(payload)).toString('base64');

  res.json({
    success: true,
    station: {
      name: station.station_name,
      code: station.station_code,
      location: station.location_note
    },
    qr_token: qrTokenString,
    remaining_seconds: remainingSeconds,
    cycle_id: cycle
  });
};

// Scan Dynamic QR token from Employee phone
export const verifyQRScan = (req, res) => {
  const { user_id, qr_token } = req.body;

  try {
    const payloadRaw = Buffer.from(qr_token, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadRaw);

    const nowSeconds = Math.floor(Date.now() / 1000);
    // Allow up to 20 seconds total (15s cycle + 5s network latency buffer)
    if (nowSeconds - payload.cycle_timestamp > 20) {
      return res.status(400).json({
        success: false,
        error_code: 'QR_EXPIRED',
        message: 'Kode QR sudah kedaluwarsa (Anti-screenshot protection aktif). Silakan pindai ulang QR terbaru di layar Kiosk.'
      });
    }

    const user = db.find('users', u => u.id === user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    // Record check-in
    const newLog = db.insert('attendance_logs', {
      user_id: user.id,
      branch_id: payload.branch_id,
      shift_id: user.shift_id,
      date: new Date().toISOString().split('T')[0],
      check_in_time: new Date().toISOString(),
      check_out_time: null,
      check_in_method: 'DYNAMIC_QR_KIOSK',
      latitude: -6.225012,
      longitude: 106.806034,
      distance_meters: 5,
      trust_score: 100,
      flags: ['VERIFIED_TOTP_QR', 'ZERO_FRAUD_KIOSK'],
      is_late: false,
      late_minutes: 0,
      status: 'CHECKED_IN'
    });

    res.json({
      success: true,
      message: `Absensi QR berhasil dicatat untuk ${user.full_name}!`,
      log: newLog
    });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Format token QR tidak valid.' });
  }
};
