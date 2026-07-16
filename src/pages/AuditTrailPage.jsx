import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Shield, AlertTriangle, Activity, Clock, Filter, RefreshCw } from 'lucide-react';

export default function AuditTrailPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = () => {
    setLoading(true);
    fetch('http://localhost:5001/api/audit/logs')
      .then(res => res.json())
      .then(data => {
        if (data.success) setLogs(data.logs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = filterType === 'ALL'
    ? logs
    : logs.filter(l => l.action.includes(filterType));

  const getActionBadge = (action) => {
    if (action.includes('SECURITY_ALERT')) return { className: 'badge badge-danger', label: 'Keamanan' };
    if (action.includes('CHECK_IN') || action.includes('ATTENDANCE')) return { className: 'badge badge-success', label: 'Absensi' };
    if (action.includes('APPROVAL') || action.includes('LEAVE')) return { className: 'badge badge-info', label: 'Persetujuan' };
    if (action.includes('CONFIG') || action.includes('GEOFENCE') || action.includes('RESET')) return { className: 'badge badge-warning', label: 'Konfigurasi' };
    return { className: 'badge badge-neutral', label: 'Sistem' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FEF2F2 100%)',
        borderColor: 'rgba(239, 68, 68, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-danger">Audit Trail</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Log Aktivitas & Keamanan Sistem</span>
        </div>
        <h1 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Jejak Audit & Aktivitas</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Rekam jejak seluruh aktivitas penting pada platform: check-in, perubahan konfigurasi, alert keamanan, dan persetujuan.
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color="var(--text-muted)" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '7px 12px', fontSize: '0.8rem' }}
          >
            <option value="ALL">Semua Aktivitas</option>
            <option value="SECURITY_ALERT">Alert Keamanan</option>
            <option value="CHECK_IN">Check-In / Absensi</option>
            <option value="APPROVAL">Persetujuan</option>
            <option value="CONFIG">Perubahan Konfigurasi</option>
          </select>
        </div>
        <button onClick={fetchAuditLogs} className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Audit Logs Table */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            <div className="animate-pulse-soft">Memuat log audit...</div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <Activity size={32} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              {filterType === 'ALL' ? 'Belum ada aktivitas tercatat.' : 'Tidak ada log untuk filter ini.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Kategori</th>
                  <th>Aksi</th>
                  <th>Aktor</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => {
                  const badge = getActionBadge(log.action);
                  return (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td><span className={badge.className}>{badge.label}</span></td>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.82rem' }}>
                        {log.action.replace(/_/g, ' ')}
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        <div>{log.actor_name || log.actor_id || '—'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.actor_role || ''}</div>
                      </td>
                      <td style={{ maxWidth: '280px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {log.details || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
