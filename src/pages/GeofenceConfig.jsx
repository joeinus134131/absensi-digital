import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { MapPin, Wifi, CheckCircle2, Globe } from 'lucide-react';

export default function GeofenceConfig() {
  const { user } = useAuth();
  const [master, setMaster] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('branch_hq');

  const [lat, setLat] = useState(-6.225012);
  const [lng, setLng] = useState(106.806034);
  const [radius, setRadius] = useState(100);
  const [bssid, setBssid] = useState('00:1A:2B:3C:4D:5E');
  const [msg, setMsg] = useState('');

  const fetchMaster = () => {
    fetch('http://localhost:5001/api/hr/master')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMaster(data);
          const brn = data.branches.find(b => b.id === selectedBranch);
          if (brn) {
            setLat(brn.latitude);
            setLng(brn.longitude);
            setRadius(brn.radius_meters);
            setBssid(brn.bssid_whitelist);
          }
        }
      });
  };

  useEffect(() => {
    fetchMaster();
  }, [selectedBranch]);

  const handleUpdateGeofence = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5001/api/hr/branch-geofence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branch_id: selectedBranch,
        latitude: lat,
        longitude: lng,
        radius_meters: radius,
        bssid_whitelist: bssid
      })
    });
    const data = await res.json();
    if (data.success) {
      setMsg('Geofence & Wi-Fi BSSID berhasil diperbarui!');
      setTimeout(() => setMsg(''), 3000);
      fetchMaster();
    }
  };

  if (!master) return (
    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div className="animate-pulse-soft">Memuat konfigurasi geofence...</div>
    </div>
  );

  const selectedBranchData = master.branches.find(b => b.id === selectedBranch);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)',
        borderColor: 'rgba(16, 185, 129, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-success">Geofence & Lokasi</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MOD-04: Geolocation & Geofencing</span>
        </div>
        <h1 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Konfigurasi Geofence GPS</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Atur batas radius lokasi kantor, koordinat GPS, dan whitelist Wi-Fi BSSID per cabang.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Form */}
        <div className="glass-card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <MapPin size={18} color="var(--success-text)" />
            Edit Batas Geofence
          </h3>
          <form onSubmit={handleUpdateGeofence} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="form-label">Pilih Cabang / Kantor</label>
              <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} className="form-select">
                {master.branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="form-label">Latitude</label>
                <input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">Longitude</label>
                <input type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} className="form-input" />
              </div>
            </div>

            <div>
              <label className="form-label">Radius Toleransi (Meter)</label>
              <input type="number" value={radius} onChange={e => setRadius(e.target.value)} className="form-input" />
            </div>

            <div>
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Wifi size={13} color="var(--text-muted)" /> Wi-Fi BSSID Whitelist
                </span>
              </label>
              <input type="text" value={bssid} onChange={e => setBssid(e.target.value)} className="form-input" placeholder="MAC: 00:1A:2B:3C:4D:5E" />
            </div>

            {msg && (
              <div style={{
                padding: '10px 14px', background: 'var(--success-light)', borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success-text)', fontSize: '0.82rem',
                fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <CheckCircle2 size={14} /> {msg}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Simpan Perubahan
            </button>
          </form>
        </div>

        {/* Branch Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="glass-card" style={{ padding: '20px 24px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <Globe size={18} color="var(--primary)" />
              Daftar Cabang Terdaftar
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {master.branches.map(b => (
                <div key={b.id} style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: b.id === selectedBranch ? 'var(--primary-light)' : 'var(--bg-muted)',
                  border: b.id === selectedBranch ? '1px solid rgba(79, 107, 246, 0.2)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                  onClick={() => setSelectedBranch(b.id)}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>{b.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    Kode: {b.code} · Radius: {b.radius_meters}m · BSSID: {b.bssid_whitelist}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    GPS: {b.latitude}, {b.longitude}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Stations */}
          {master.qr_stations && master.qr_stations.length > 0 && (
            <div className="glass-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--text-main)' }}>Stasiun QR Terdaftar</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {master.qr_stations.map(st => (
                  <div key={st.id} style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-muted)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{st.station_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Kode: {st.station_code} · {st.location_note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
