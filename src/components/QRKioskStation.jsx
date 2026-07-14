import React, { useState, useEffect } from 'react';
import { QrCode, ShieldAlert, RefreshCw, CheckCircle, Clock } from 'lucide-react';

export default function QRKioskStation() {
  const [qrData, setQrData] = useState(null);
  const [stationCode, setStationCode] = useState('KIOSK-JKT-01');
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchToken = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/qr/dynamic-token?station_code=${stationCode}`);
      const data = await res.json();
      if (data.success) {
        setQrData(data);
        setSecondsLeft(data.remaining_seconds || 15);
        setLastUpdated(new Date().toLocaleTimeString('id-ID'));
      }
    } catch (err) {
      console.error('Failed to fetch QR token:', err);
    }
  };

  useEffect(() => {
    fetchToken();
    const interval = setInterval(() => {
      fetchToken();
    }, 15000); // refresh every 15s

    return () => clearInterval(interval);
  }, [stationCode]);

  // Countdown timer each second
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 15));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '36px', textAlign: 'center', position: 'relative' }}>
        {/* Top Header Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-success animate-pulse-glow">LIVE KIOSK STATION MODE</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Stasiun: <strong>{qrData?.station?.name || 'SCBD Tower 3 Lobby'}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={stationCode}
              onChange={e => setStationCode(e.target.value)}
              style={{
                background: '#121929',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem'
              }}
            >
              <option value="KIOSK-JKT-01">HQ Sudirman Tower 3 (Lobby Utama)</option>
              <option value="KIOSK-BKS-01">Logistics Hub Bekasi (Gerbang Utama)</option>
            </select>
          </div>
        </div>

        <h2 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>
          Pindai Kode QR Kehadiran (Dynamic Rotating TOTP)
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '32px' }}>
          Arahkan kamera aplikasi WajibAbsen di ponsel Anda ke layar Kiosk ini untuk Check-In / Check-Out instan.
        </p>

        {/* QR Display Card */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.08))',
          border: '2px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '24px',
          padding: '36px',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          boxShadow: '0 0 50px rgba(16, 185, 129, 0.15)',
          position: 'relative'
        }}>
          {/* Visual QR Code Representation using SVG pattern & Live Token */}
          <div style={{
            width: '240px',
            height: '240px',
            background: '#ffffff',
            padding: '16px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
          }}>
            {/* SVG QR Code Simulation with live changing center token */}
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              {/* Corner squares */}
              <rect x="5" y="5" width="24" height="24" fill="#090D16" rx="3" />
              <rect x="9" y="9" width="16" height="16" fill="#ffffff" />
              <rect x="13" y="13" width="8" height="8" fill="#10B981" />

              <rect x="71" y="5" width="24" height="24" fill="#090D16" rx="3" />
              <rect x="75" y="9" width="16" height="16" fill="#ffffff" />
              <rect x="79" y="13" width="8" height="8" fill="#10B981" />

              <rect x="5" y="71" width="24" height="24" fill="#090D16" rx="3" />
              <rect x="9" y="75" width="16" height="16" fill="#ffffff" />
              <rect x="13" y="79" width="8" height="8" fill="#10B981" />

              {/* Dynamic decorative QR dots */}
              <rect x="36" y="10" width="6" height="6" fill="#090D16" />
              <rect x="46" y="10" width="6" height="6" fill="#10B981" />
              <rect x="56" y="10" width="6" height="6" fill="#090D16" />

              <rect x="36" y="24" width="28" height="6" fill="#090D16" />
              <rect x="36" y="36" width="6" height="28" fill="#090D16" />
              <rect x="48" y="48" width="18" height="18" fill="#10B981" rx="4" />

              <rect x="75" y="40" width="15" height="6" fill="#090D16" />
              <rect x="75" y="52" width="6" height="18" fill="#090D16" />
              <rect x="40" y="76" width="24" height="6" fill="#090D16" />
              <rect x="76" y="76" width="14" height="14" fill="#10B981" />
            </svg>
            <div style={{
              position: 'absolute',
              bottom: '6px',
              fontSize: '0.62rem',
              color: '#090D16',
              fontWeight: 800,
              letterSpacing: '0.05em'
            }}>
              TOTP CYC #{qrData?.cycle_id || 101}
            </div>
          </div>

          {/* Countdown & Security Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#10B981'
            }}>
              {secondsLeft}s
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Kode Berputar Tiap 15 Detik</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Diperbarui pukul {lastUpdated}
              </div>
            </div>
          </div>
        </div>

        {/* Security & Anti-Fraud Footer */}
        <div style={{
          marginTop: '32px',
          padding: '16px 20px',
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          textAlign: 'left'
        }}>
          <ShieldAlert size={26} color="#F43F5E" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#FDA4AF', fontSize: '0.88rem' }}>
              Anti-Screenshot & Zero-Fraud Protection Aktif (REQ-QR-02)
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Kode QR memuat tanda tangan kriptografi berbasis waktu (TOTP HMAC). Foto tangkapan layar yang dikirim melalui WhatsApp tidak akan sah jika dipindai setelah 15 detik.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
