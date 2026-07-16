import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { MapPin, QrCode, ShieldAlert, CheckCircle2, XCircle, Wifi, Navigation, WifiOff, ScanFace, X } from 'lucide-react';

export default function CheckInModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('GEO');

  // GEO Form State
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
          message: 'Absensi tersimpan di antrean offline. Akan disinkronkan saat koneksi pulih.',
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
        tokenToSend = btoa(JSON.stringify(fakePayload));
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
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>Check-In Kehadiran</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Pilih metode yang sesuai untuk mencatat kehadiran Anda
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: 'var(--bg-muted)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => { setActiveTab('GEO'); setResult(null); }}
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'GEO' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'GEO' ? 'var(--primary-text)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'GEO' ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            <MapPin size={16} />
            Geolocation
          </button>

          <button
            onClick={() => { setActiveTab('QR'); setResult(null); }}
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'QR' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'QR' ? 'var(--primary-text)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'QR' ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            <QrCode size={16} />
            Scan QR Kiosk
          </button>
        </div>

        {/* GEO Tab */}
        {activeTab === 'GEO' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Distance Simulation */}
            <div style={{
              background: 'var(--bg-muted)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Navigation size={14} color="var(--primary)" />
                Simulasi Lokasi GPS
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setSimulatedDistance('INSIDE')}
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '0.8rem',
                    background: simulatedDistance === 'INSIDE' ? 'var(--success-light)' : 'var(--bg-surface)',
                    border: simulatedDistance === 'INSIDE' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-light)',
                    color: simulatedDistance === 'INSIDE' ? 'var(--success-text)' : 'var(--text-secondary)'
                  }}
                >
                  Dalam Radius (&lt; 100m)
                </button>
                <button
                  onClick={() => setSimulatedDistance('OUTSIDE')}
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '0.8rem',
                    background: simulatedDistance === 'OUTSIDE' ? 'var(--danger-light)' : 'var(--bg-surface)',
                    border: simulatedDistance === 'OUTSIDE' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-light)',
                    color: simulatedDistance === 'OUTSIDE' ? 'var(--danger-text)' : 'var(--text-secondary)'
                  }}
                >
                  Luar Radius (&gt; 350m)
                </button>
              </div>
            </div>

            {/* Toggle Options */}
            <div className="toggle-card" style={isBiometricVerified ? { borderColor: 'var(--primary)', background: 'var(--primary-soft)' } : {}}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ScanFace size={18} color={isBiometricVerified ? 'var(--primary)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>Verifikasi Biometrik</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Liveness check untuk keamanan tambahan</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isBiometricVerified}
                onChange={e => setIsBiometricVerified(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
            </div>

            <div className="toggle-card" style={isOfflineMode ? { borderColor: 'var(--info-text)', background: 'var(--info-soft)' } : {}}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <WifiOff size={18} color={isOfflineMode ? 'var(--info-text)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>Mode Offline</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Simpan lokal, sinkron saat online</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isOfflineMode}
                onChange={e => setIsOfflineMode(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--info-text)' }}
              />
            </div>

            <div className="toggle-card" style={isMockGps ? { borderColor: 'var(--danger)', background: 'var(--danger-soft)' } : {}}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={18} color={isMockGps ? 'var(--danger-text)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>Simulasi Fake GPS</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Uji penolakan otomatis mock location</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isMockGps}
                onChange={e => setIsMockGps(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--danger)' }}
              />
            </div>

            <button
              onClick={handleGeoCheckIn}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '4px' }}
            >
              {loading ? 'Memproses...' : 'Check-In via Geolocation'}
            </button>
          </div>
        )}

        {/* QR Tab */}
        {activeTab === 'QR' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="form-label">Pilih Stasiun Kiosk</label>
              <select value={qrStation} onChange={e => setQrStation(e.target.value)} className="form-select">
                <option value="KIOSK-JKT-01">Lobby HQ Sudirman Tower</option>
                <option value="KIOSK-BKS-01">Gudang Logistics Bekasi</option>
              </select>
            </div>

            <div>
              <label className="form-label">Simulasi Mode Scan</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setQrScanMode('VALID')}
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '0.8rem',
                    background: qrScanMode === 'VALID' ? 'var(--success-light)' : 'var(--bg-muted)',
                    border: qrScanMode === 'VALID' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-light)',
                    color: qrScanMode === 'VALID' ? 'var(--success-text)' : 'var(--text-secondary)'
                  }}
                >
                  Token Valid (Real-Time)
                </button>
                <button
                  onClick={() => setQrScanMode('EXPIRED')}
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '0.8rem',
                    background: qrScanMode === 'EXPIRED' ? 'var(--danger-light)' : 'var(--bg-muted)',
                    border: qrScanMode === 'EXPIRED' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-light)',
                    color: qrScanMode === 'EXPIRED' ? 'var(--danger-text)' : 'var(--text-secondary)'
                  }}
                >
                  Token Kedaluwarsa
                </button>
              </div>
            </div>

            <button
              onClick={handleQRScan}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '4px' }}
            >
              {loading ? 'Memindai...' : 'Scan QR & Check-In'}
            </button>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div style={{
            marginTop: '16px',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: result.success ? 'var(--success-light)' : 'var(--danger-light)',
            border: result.success ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            {result.success ? (
              <CheckCircle2 size={18} color="var(--success-text)" style={{ marginTop: '1px', flexShrink: 0 }} />
            ) : (
              <XCircle size={18} color="var(--danger-text)" style={{ marginTop: '1px', flexShrink: 0 }} />
            )}
            <div>
              <div style={{
                fontWeight: 600,
                fontSize: '0.85rem',
                color: result.success ? 'var(--success-text)' : 'var(--danger-text)',
                marginBottom: '2px'
              }}>
                {result.success ? 'Berhasil!' : 'Gagal'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {result.message}
              </div>
              {result.trust_score && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Trust Score: <strong>{result.trust_score}%</strong>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
