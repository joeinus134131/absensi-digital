import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { MapPin, QrCode, ShieldAlert, CheckCircle2, XCircle, Wifi, Navigation, WifiOff, ScanFace } from 'lucide-react';

export default function CheckInModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('GEO');

  // GEO Form State
  const [latitude, setLatitude] = useState(-6.225010);
  const [longitude, setLongitude] = useState(106.806030);
  const [simulatedDistance, setSimulatedDistance] = useState('INSIDE');
  const [isMockGps, setIsMockGps] = useState(false);
  const [wifiBssid, setWifiBssid] = useState('00:1A:2B:3C:4D:5E');
  const [isBiometricVerified, setIsBiometricVerified] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // QR Form State
  const [qrStation, setQrStation] = useState('KIOSK-JKT-01');
  const [qrScanMode, setQrScanMode] = useState('VALID');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGeoCheckIn = async () => {
    setLoading(true);
    setResult(null);

    const targetLat = simulatedDistance === 'OUTSIDE' ? -6.229500 : -6.225012;
    const targetLng = simulatedDistance === 'OUTSIDE' ? 106.812000 : 106.806034;

    // USP-5: Offline-First Local Queue handling
    if (isOfflineMode) {
      setTimeout(() => {
        const offlineQueue = JSON.parse(localStorage.getItem('wajibabsen_offline_queue') || '[]');
        const newOfflineLog = {
          id: `off_${Date.now()}`,
          user_id: user.id,
          timestamp: new Date().toISOString(),
          latitude: targetLat,
          longitude: targetLng,
          distance_meters: simulatedDistance === 'OUTSIDE' ? 350 : 12,
          trust_score: 95
        };
        offlineQueue.push(newOfflineLog);
        localStorage.setItem('wajibabsen_offline_queue', JSON.stringify(offlineQueue));

        setResult({
          success: true,
          is_offline: true,
          message: `Absensi tersimpan aman di Antrean Offline (IndexedDB/Local Queue). Akan disinkronisasikan otomatis saat jaringan pulih.`,
          trust_score: 95
        });
        if (onSuccess) onSuccess();
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/attendance/check-in-geo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          latitude: targetLat,
          longitude: targetLng,
          is_mock_location: isMockGps,
          wifi_bssid: wifiBssid,
          is_biometric_verified: isBiometricVerified
        })
      });
      const data = await res.json();
      setResult(data);
      if (data.success && onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      setResult({ success: false, message: 'Gagal terhubung ke server WajibAbsen.' });
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async () => {
    setLoading(true);
    setResult(null);

    try {
      const tokenRes = await fetch(`http://localhost:5001/api/qr/dynamic-token?station_code=${qrStation}`);
      const tokenData = await tokenRes.json();

      let tokenToSend = tokenData.qr_token;
      if (qrScanMode === 'EXPIRED') {
        const fakePayload = {
          station_id: 'station_hq_01',
          station_code: qrStation,
          branch_id: 'branch_hq',
          cycle_timestamp: Math.floor(Date.now() / 1000) - 60,
          signature: 'TOTP_EXPIRED_SIGNATURE'
        };
        tokenToSend = Buffer.from(JSON.stringify(fakePayload)).toString('base64');
      }

      const res = await fetch('http://localhost:5001/api/qr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          qr_token: tokenToSend
        })
      });
      const data = await res.json();
      setResult(data);
      if (data.success && onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      setResult({ success: false, message: 'Gagal memindai token QR.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(4, 10, 20, 0.88)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '28px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem' }}>Check-In Kehadiran ({user.full_name})</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Pilih metode kehadiran sesuai standar keamanan platform WajibAbsen
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
            Tutup
          </button>
        </div>

        {/* Method Switcher Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          background: 'rgba(255,255,255,0.04)',
          padding: '6px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => { setActiveTab('GEO'); setResult(null); }}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'GEO' ? '#10B981' : 'transparent',
              color: activeTab === 'GEO' ? '#04140D' : 'var(--text-main)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <MapPin size={18} />
            <span>Geolocation + Smart Shift</span>
          </button>

          <button
            onClick={() => { setActiveTab('QR'); setResult(null); }}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'QR' ? '#10B981' : 'transparent',
              color: activeTab === 'QR' ? '#04140D' : 'var(--text-main)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <QrCode size={18} />
            <span>Scan Dynamic QR Kiosk</span>
          </button>
        </div>

        {/* TAB 1: GEOLOCATION */}
        {activeTab === 'GEO' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#10B981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Navigation size={16} />
                <span>Simulasi Koordinat GPS Ponsel (Haversine Check):</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={() => setSimulatedDistance('INSIDE')}
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: simulatedDistance === 'INSIDE' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.05)',
                    border: simulatedDistance === 'INSIDE' ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.1)',
                    color: simulatedDistance === 'INSIDE' ? '#6EE7B7' : 'var(--text-main)'
                  }}
                >
                  📍 Dalam Radius Kantor (&lt; 100m)
                </button>
                <button
                  onClick={() => setSimulatedDistance('OUTSIDE')}
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: simulatedDistance === 'OUTSIDE' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255,255,255,0.05)',
                    border: simulatedDistance === 'OUTSIDE' ? '1px solid #F43F5E' : '1px solid rgba(255,255,255,0.1)',
                    color: simulatedDistance === 'OUTSIDE' ? '#FDA4AF' : 'var(--text-main)'
                  }}
                >
                  🚀 Luar Radius Kantor (&gt; 350m)
                </button>
              </div>
            </div>

            {/* Biometric Face / Liveness Check */}
            <div style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: isBiometricVerified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
              border: isBiometricVerified ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ScanFace size={20} color={isBiometricVerified ? '#10B981' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>Verifikasi Swafoto Biometrik (Liveness Check)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    REQ-AUTH-04: Tambah skor keamanan dan anti-titip absen
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isBiometricVerified}
                onChange={e => setIsBiometricVerified(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            {/* Offline-First Mode Toggle (USP-5) */}
            <div style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: isOfflineMode ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
              border: isOfflineMode ? '1px solid #06B6D4' : '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <WifiOff size={20} color={isOfflineMode ? '#06B6D4' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>Simulasi Kondisi Tanpa Internet (Offline-First Queue)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    USP-5: Simpan ke antrean lokal & sinkron otomatis saat online
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isOfflineMode}
                onChange={e => setIsOfflineMode(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            {/* Anti-Mock GPS Toggle */}
            <div style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: isMockGps ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255,255,255,0.03)',
              border: isMockGps ? '1px solid #F43F5E' : '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={20} color={isMockGps ? '#F43F5E' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>Simulasi Aplikasi Fake GPS (Mock Location)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    REQ-GEO-02: Uji penolakan otomatis & audit log alert
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isMockGps}
                onChange={e => setIsMockGps(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <button
              onClick={handleGeoCheckIn}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', marginTop: '6px' }}
            >
              {loading ? 'Memvalidasi Geolocation & Security...' : '🚀 Check-In Sekarang (Validasi GPS + Smart Shift)'}
            </button>
          </div>
        )}

        {/* TAB 2: DYNAMIC QR */}
        {activeTab === 'QR' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#10B981', marginBottom: '8px' }}>
                Skenario Pemindaian Kode QR Kiosk:
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => setQrScanMode('VALID')}
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: qrScanMode === 'VALID' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.05)',
                    border: qrScanMode === 'VALID' ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.1)',
                    color: qrScanMode === 'VALID' ? '#6EE7B7' : 'var(--text-main)'
                  }}
                >
                  🟢 Scan QR Live (&lt; 15s Valid)
                </button>
                <button
                  onClick={() => setQrScanMode('EXPIRED')}
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: qrScanMode === 'EXPIRED' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255,255,255,0.05)',
                    border: qrScanMode === 'EXPIRED' ? '1px solid #F43F5E' : '1px solid rgba(255,255,255,0.1)',
                    color: qrScanMode === 'EXPIRED' ? '#FDA4AF' : 'var(--text-main)'
                  }}
                >
                  🔴 Scan Screenshot (&gt; 15s Expired)
                </button>
              </div>
            </div>

            <button
              onClick={handleQRScan}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', marginTop: '8px' }}
            >
              {loading ? 'Memindai QR & HMAC Signature...' : '📷 Pindai QR Code Layar Kiosk'}
            </button>
          </div>
        )}

        {/* RESULT FEEDBACK */}
        {result && (
          <div style={{
            marginTop: '18px',
            padding: '16px',
            borderRadius: '12px',
            background: result.success ? (result.is_offline ? 'rgba(6, 182, 212, 0.18)' : 'rgba(16, 185, 129, 0.15)') : 'rgba(244, 63, 94, 0.15)',
            border: result.success ? (result.is_offline ? '1px solid #06B6D4' : '1px solid #10B981') : '1px solid #F43F5E',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            {result.success ? (
              <CheckCircle2 size={24} color={result.is_offline ? '#06B6D4' : '#10B981'} style={{ flexShrink: 0 }} />
            ) : (
              <XCircle size={24} color="#F43F5E" style={{ flexShrink: 0 }} />
            )}
            <div>
              <div style={{ fontWeight: 700, color: result.success ? (result.is_offline ? '#93C5FD' : '#6EE7B7') : '#FDA4AF' }}>
                {result.success ? (result.is_offline ? 'Tersimpan di Antrean Offline (Offline-First)' : 'Kehadiran Sah Terverifikasi!') : 'Check-In Ditolak Sistem!'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '4px' }}>
                {result.message}
              </div>
              {result.trust_score !== undefined && (
                <div style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '6px', fontWeight: 600 }}>
                  Attendance Trust Score: {result.trust_score}%
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
