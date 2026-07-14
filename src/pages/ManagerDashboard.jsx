import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Users, CheckCircle2, XCircle, Clock, ShieldAlert, Check, MessageSquare } from 'lucide-react';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(18, 25, 41, 0.85))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span className="badge badge-info">MANAJER / SUPERVISOR</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Departemen: {user?.department} • Multi-Level Approval Active</span>
        </div>
        <h1 style={{ fontSize: '1.65rem' }}>Dasbor Pengawasan Tim & Multi-Level Approval Workflow</h1>
      </div>

      {/* Pending Approvals */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem' }}>
            Menunggu Persetujuan Manajer ({requests.filter(r => r.status === 'PENDING_MANAGER').length})
          </h3>
          <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
            REQ-APP-02: Level 1 Manager Approval
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Jenis Pengajuan</th>
                <th>Tanggal</th>
                <th>Alasan & Lampiran</th>
                <th>Status</th>
                <th>Catatan Review</th>
                <th>Aksi Persetujuan</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(reqItem => (
                <tr key={reqItem.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{reqItem.user_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{reqItem.user_nik}</div>
                  </td>
                  <td><span className="badge badge-info">{reqItem.type}</span></td>
                  <td>{reqItem.start_date} s/d {reqItem.end_date}</td>
                  <td style={{ maxWidth: '240px' }}>{reqItem.reason}</td>
                  <td>
                    {reqItem.status === 'PENDING_MANAGER' && <span className="badge badge-warning">Pending Manager</span>}
                    {reqItem.status === 'APPROVED' && <span className="badge badge-success">Disetujui</span>}
                    {reqItem.status === 'REJECTED' && <span className="badge badge-danger">Ditolak</span>}
                  </td>
                  <td>
                    {reqItem.status === 'PENDING_MANAGER' ? (
                      <input
                        type="text"
                        placeholder="Catatan persetujuan/penolakan..."
                        value={rejectNote[reqItem.id] || ''}
                        onChange={e => setRejectNote({ ...rejectNote, [reqItem.id]: e.target.value })}
                        style={{ padding: '6px 10px', borderRadius: '6px', background: '#121929', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem' }}
                      />
                    ) : (
                      <span>{reqItem.note || '-'}</span>
                    )}
                  </td>
                  <td>
                    {reqItem.status === 'PENDING_MANAGER' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleApprove(reqItem.id, 'APPROVED')}
                          className="btn"
                          style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.2)', color: '#6EE7B7' }}
                        >
                          <Check size={16} /> Setujui
                        </button>
                        <button
                          onClick={() => handleApprove(reqItem.id, 'REJECTED')}
                          className="btn"
                          style={{ padding: '6px 12px', background: 'rgba(244, 63, 94, 0.2)', color: '#FDA4AF' }}
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Team Attendance Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Pemantauan Kehadiran Tim Real-Time</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Waktu Check-In</th>
                <th>Metode</th>
                <th>Jarak ke Kantor</th>
                <th>Trust Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teamLogs.map(l => (
                <tr key={l.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{l.user_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.user_nik}</div>
                  </td>
                  <td>{new Date(l.check_in_time).toLocaleTimeString('id-ID')} WIB</td>
                  <td><span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{l.check_in_method}</span></td>
                  <td>{l.distance_meters}m</td>
                  <td>
                    <span style={{ fontWeight: 700, color: l.trust_score >= 90 ? '#10B981' : '#F59E0B' }}>
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
      </div>
    </div>
  );
}
