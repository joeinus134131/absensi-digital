import React, { useState, useEffect } from 'react';
import { QrCode, RefreshCw, ShieldAlert, CheckCircle2, Clock, MapPin, Camera } from 'lucide-react';

export default function QRKioskStation() {
  const [stationCode, setStationCode] = useState('KIOSK-JKT-01');
  const [qrToken, setQrToken] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(15);
  const [cycleTimestamp, setCycleTimestamp] = useState(null);

  const fetchDynamicToken = () => {
    fetch(`http://localhost:5001/api/qr/dynamic-token?station_code=${stationCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQrToken(data.qr_token);
          setRemainingSeconds(data.remaining_seconds || 15);
          setCycleTimestamp(data.cycle_timestamp);
        }
      })
      .catch(err => console.error('Kiosk offline or server unreachable', err));
  };

  useEffect(() => {
    fetchDynamicToken();
    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          fetchDynamicToken();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stationCode]);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-card" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '32px',
        textAlign: 'center',
        borderColor: 'rgba(79, 107, 246, 0.15)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>Kiosk Station</span>
          </div>
          <select
            value={stationCode}
            onChange={e => setStationCode(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.75rem' }}
          >
            <option value="KIOSK-JKT-01">Lobby HQ Sudirman</option>
            <option value="KIOSK-BKS-01">Gudang Bekasi</option>
          </select>
        </div>

        <h2 style={{ fontSize: '1.35rem', marginBottom: '6px', color: 'var(--text-main)' }}>Scan untuk Check-In</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px', lineHeight: 1.5 }}>
          Arahkan kamera aplikasi WajibAbsen ke layar ini. Token berputar setiap 15 detik.
        </p>

        {/* QR Code */}
        <div style={{
          background: '#FFFFFF',
          padding: '24px',
          borderRadius: 'var(--radius-xl)',
          display: 'inline-block',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-light)',
          position: 'relative'
        }}>
          <svg width="200" height="200" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#FFFFFF" />
            {/* Top Left Corner */}
            <rect x="10" y="10" width="24" height="24" fill="#1E293B" />
            <rect x="14" y="14" width="16" height="16" fill="#FFFFFF" />
            <rect x="18" y="18" width="8" height="8" fill="#4F6BF6" />
            {/* Top Right Corner */}
            <rect x="66" y="10" width="24" height="24" fill="#1E293B" />
            <rect x="70" y="14" width="16" height="16" fill="#FFFFFF" />
            <rect x="74" y="18" width="8" height="8" fill="#4F6BF6" />
            {/* Bottom Left Corner */}
            <rect x="10" y="66" width="24" height="24" fill="#1E293B" />
            <rect x="14" y="70" width="16" height="16" fill="#FFFFFF" />
            <rect x="18" y="74" width="8" height="8" fill="#4F6BF6" />
            {/* Dynamic Pattern */}
            <rect x="42" y="12" width="6" height="6" fill="#1E293B" />
            <rect x="52" y="18" width="8" height="8" fill="#1E293B" />
            <rect x="40" y="38" width="20" height="20" fill="#1E293B" rx="4" />
            <rect x="44" y="42" width="12" height="12" fill="#4F6BF6" rx="2" />
            <rect x="15" y="45" width="12" height="12" fill="#1E293B" />
            <rect x="70" y="45" width="14" height="14" fill="#1E293B" />
            <rect x="45" y="70" width="12" height="12" fill="#1E293B" />
            <rect x="68" y="70" width="18" height="18" fill="#1E293B" />
          </svg>

          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--primary)',
            color: '#FFFFFF',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>
            TOTP DYNAMIC
          </div>
        </div>

        {/* Selfie Liveness Badge */}
        <div style={{
          marginTop: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          background: 'var(--primary-light)',
          border: '1px solid rgba(79, 107, 246, 0.15)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.75rem',
          color: 'var(--primary-text)',
          fontWeight: 500
        }}>
          <Camera size={14} />
          <span>QR Scan + Selfie Liveness aktif</span>
        </div>

        {/* Countdown */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Token berikutnya:</span>
            <span style={{ fontWeight: 700, color: remainingSeconds <= 3 ? 'var(--danger-text)' : 'var(--primary-text)' }}>
              {remainingSeconds} detik
            </span>
          </div>

          <div className="progress-bar">
            <div className="progress-bar-fill" style={{
              width: `${(remainingSeconds / 15) * 100}%`,
              background: remainingSeconds <= 3 ? 'var(--danger)' : 'var(--primary)'
            }} />
          </div>
        </div>

        {/* Security Note */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '0.72rem',
          color: 'var(--text-muted)'
        }}>
          <ShieldAlert size={14} color="var(--warning-text)" />
          <span>Screenshot kedaluwarsa &gt;15 detik otomatis ditolak</span>
        </div>
      </div>
    </div>
  );
}
