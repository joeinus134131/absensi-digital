import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { MapPin, Users, Smartphone, RefreshCw, Plus, CheckCircle2, Clock, Filter, Layers } from 'lucide-react';

export default function HRAdminDashboard() {
  const { user } = useAuth();
  const [master, setMaster] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('branch_hq');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Geofence edit
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
      setMsg('Batas Geofence & Wi-Fi BSSID berhasil diperbarui!');
      setTimeout(() => setMsg(''), 3000);
      fetchMaster();
    }
  };

  const handleResetDevice = async (userId) => {
    const res = await fetch('http://localhost:5001/api/hr/reset-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });
    const data = await res.json();
    if (data.success) {
      alert('Device binding berhasil direset!');
      fetchMaster();
    }
  };

  if (!master) return <div style={{ padding: '24px' }}>Memuat data master HR...</div>;

  const filteredUsers = deptFilter === 'ALL'
    ? master.users
    : master.users.filter(u => u.department === deptFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(18, 25, 41, 0.9))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span className="badge" style={{ background: 'rgba(139,92,246,0.2)', color: '#C4B5FD', border: '1px solid #8B5CF6' }}>
            HR / TENANT ADMIN
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PT WajibAbsen Teknologi Nusantara</span>
        </div>
        <h1 style={{ fontSize: '1.65rem' }}>Pusat Konfigurasi Master Data, Geofence & Smart Shift</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Geofence Configuration */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin color="#10B981" />
            <span>Konfigurasi Geofence & Wi-Fi BSSID</span>
          </h3>
          <form onSubmit={handleUpdateGeofence} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pilih Cabang / Kantor</label>
              <select
                value={selectedBranch}
                onChange={e => setSelectedBranch(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#121929', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', marginTop: '4px' }}
              >
                {master.branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latitude (GPS)</label>
                <input
                  type="number" step="any"
                  value={lat}
                  onChange={e => setLat(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#121929', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Longitude (GPS)</label>
                <input
                  type="number" step="any"
                  value={lng}
                  onChange={e => setLng(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#121929', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', marginTop: '4px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Radius Toleransi Geofence (Meter)</label>
              <input
                type="number"
                value={radius}
                onChange={e => setRadius(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#121929', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', marginTop: '4px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Wi-Fi BSSID Whitelist (MAC Address)</label>
              <input
                type="text"
                value={bssid}
                onChange={e => setBssid(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#121929', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', marginTop: '4px' }}
              />
            </div>

            {msg && (
              <div className="badge badge-success" style={{ padding: '10px', justifyContent: 'center' }}>
                {msg}
              </div>
            )}

            <button type="submit" className="btn btn-primary">
              Simpan Perubahan Geofence
            </button>
          </form>
        </div>

        {/* Shift Summary & Smart Auto-Shift Engine Box (REQ-SHF-02) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock color="#10B981" />
              <span>Smart Auto-Shift Detection Engine</span>
            </h3>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>AKTIF (REQ-SHF-02)</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Sistem mencocokkan waktu kehadiran secara otomatis dengan jadwal terdekat tanpa intervensi manual harian.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {master.shifts.map(s => (
              <div key={s.id} style={{
                padding: '14px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#6EE7B7' }}>{s.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Jam: {s.start_time} - {s.end_time} • Grace Period: {s.grace_period_minutes} Menit
                  </div>
                </div>
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Auto-Matched</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REQ-MAS-02: Department & Manager Hierarchy Filter */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Master Karyawan & Status Pengikatan Perangkat (Device Binding)</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>REQ-MAS-02: Hierarki Organisasi & Manajemen Divisi</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '8px', background: '#121929', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.82rem' }}
            >
              <option value="ALL">Semua Departemen (All)</option>
              <option value="Executive">Executive</option>
              <option value="HR & People">HR & People</option>
              <option value="Product & Engineering">Product & Engineering</option>
              <option value="Finance & Accounting">Finance & Accounting</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>NIK</th>
                <th>Nama Lengkap</th>
                <th>Peran (Role)</th>
                <th>Jabatan / Divisi</th>
                <th>Hardware ID Terikat</th>
                <th>Aksi Reset Device</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.nik}</td>
                  <td>{u.full_name}</td>
                  <td><span className="badge badge-info">{u.role}</span></td>
                  <td>{u.position} ({u.department})</td>
                  <td>
                    {u.device_fingerprint ? (
                      <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                        🔒 {u.device_fingerprint}
                      </span>
                    ) : (
                      <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>
                        Belum Terikat
                      </span>
                    )}
                  </td>
                  <td>
                    {u.device_fingerprint && (
                      <button
                        onClick={() => handleResetDevice(u.id)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        <RefreshCw size={14} /> Reset Device ID
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
