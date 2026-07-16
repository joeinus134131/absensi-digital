import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Users, CheckCircle2, XCircle, Clock, ShieldAlert, Check, MessageSquare, X } from 'lucide-react';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [teamLogs, setTeamLogs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [rejectNote, setRejectNote] = useState({});

  const fetchTeamData = () => {
    fetch(`http://localhost:5001/api/attendance/logs?role=MANAGER&user_id=${user.id}`)
      .then(res => res.json())
      .then(data => { if (data.success) setTeamLogs(data.logs); });

    fetch('http://localhost:5001/api/approvals/requests')
      .then(res => res.json())
      .then(data => { if (data.success) setRequests(data.requests); });
  };

  useEffect(() => {
    fetchTeamData();
  }, [user]);

  const handleApprove = async (id, newStatus) => {
    const note = rejectNote[id] || '';
    await fetch('http://localhost:5001/api/approvals/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: id,
        status: newStatus,
        approver_role: user.role,
        note
      })
    });
    fetchTeamData();
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING_MANAGER').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #EEF0FF 100%)',
        borderColor: 'rgba(79, 107, 246, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-info">Manajer / Supervisor</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Dept: {user?.department} · Approval Aktif
          </span>
        </div>
        <h1 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Pengawasan Tim & Persetujuan</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Kelola persetujuan cuti/izin dan pantau kehadiran tim Anda secara real-time.
        </p>
      </div>

      {/* Pending Approvals */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '1rem' }}>Menunggu Persetujuan</h3>
            {pendingCount > 0 && (
              <span style={{
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                minWidth: '22px',
                textAlign: 'center'
              }}>
                {pendingCount}
              </span>
            )}
          </div>
        </div>

        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Tidak ada pengajuan yang perlu ditinjau saat ini.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Karyawan</th>
                  <th>Jenis</th>
                  <th>Tanggal</th>
                  <th>Alasan</th>
                  <th>Status</th>
                  <th>Catatan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(reqItem => (
                  <tr key={reqItem.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{reqItem.user_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{reqItem.user_nik}</div>
                    </td>
                    <td><span className="badge badge-info">{reqItem.type}</span></td>
                    <td style={{ fontSize: '0.82rem' }}>{reqItem.start_date} — {reqItem.end_date}</td>
                    <td style={{ maxWidth: '200px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{reqItem.reason}</td>
                    <td>
                      {reqItem.status === 'PENDING_MANAGER' && <span className="badge badge-warning">Pending</span>}
                      {reqItem.status === 'APPROVED' && <span className="badge badge-success">Disetujui</span>}
                      {reqItem.status === 'REJECTED' && <span className="badge badge-danger">Ditolak</span>}
                    </td>
                    <td>
                      {reqItem.status === 'PENDING_MANAGER' ? (
                        <input
                          type="text"
                          placeholder="Catatan opsional..."
                          value={rejectNote[reqItem.id] || ''}
                          onChange={e => setRejectNote({ ...rejectNote, [reqItem.id]: e.target.value })}
                          className="form-input"
                          style={{ padding: '6px 10px', fontSize: '0.78rem', minWidth: '140px' }}
                        />
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{reqItem.note || '—'}</span>
                      )}
                    </td>
                    <td>
                      {reqItem.status === 'PENDING_MANAGER' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleApprove(reqItem.id, 'APPROVED')}
                            className="btn btn-success"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            <Check size={14} /> Setujui
                          </button>
                          <button
                            onClick={() => handleApprove(reqItem.id, 'REJECTED')}
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            <X size={14} /> Tolak
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Team Attendance */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '14px' }}>Kehadiran Tim Hari Ini</h3>
        {teamLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Belum ada data kehadiran tim untuk hari ini.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Karyawan</th>
                  <th>Waktu Check-In</th>
                  <th>Metode</th>
                  <th>Jarak</th>
                  <th>Trust Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teamLogs.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{l.user_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.user_nik}</div>
                    </td>
                    <td>{new Date(l.check_in_time).toLocaleTimeString('id-ID')} WIB</td>
                    <td><span className="badge badge-info" style={{ fontSize: '0.68rem' }}>{l.check_in_method}</span></td>
                    <td style={{ fontSize: '0.85rem' }}>{l.distance_meters}m</td>
                    <td>
                      <span style={{ fontWeight: 600, color: l.trust_score >= 90 ? 'var(--success-text)' : 'var(--warning-text)' }}>
                        {l.trust_score}%
                      </span>
                    </td>
                    <td>
                      {l.is_late ? (
                        <span className="badge badge-warning">Terlambat {l.late_minutes}m</span>
                      ) : (
                        <span className="badge badge-success">Tepat Waktu</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
