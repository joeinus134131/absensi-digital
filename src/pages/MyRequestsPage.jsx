import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, PlusCircle, X } from 'lucide-react';

export default function MyRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState('CUTI_TAHUNAN');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchRequests = () => {
    fetch(`http://localhost:5001/api/approvals/requests?role=EMPLOYEE&user_id=${user?.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setRequests(data.requests);
      });
  };

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5001/api/approvals/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason
      })
    });
    const data = await res.json();
    if (data.success) {
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowForm(false);
        setSubmitSuccess(false);
        setReason('');
        setStartDate('');
        setEndDate('');
        fetchRequests();
      }, 1500);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_MANAGER': return <span className="badge badge-warning"><Clock size={11} /> Menunggu</span>;
      case 'APPROVED': return <span className="badge badge-success"><CheckCircle2 size={11} /> Disetujui</span>;
      case 'REJECTED': return <span className="badge badge-danger"><XCircle size={11} /> Ditolak</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const getTypeLabel = (type) => {
    const map = {
      'CUTI_TAHUNAN': 'Cuti Tahunan',
      'IZIN_SAKIT': 'Izin Sakit',
      'IZIN_PRIBADI': 'Izin Pribadi',
      'KOREKSI_ABSEN': 'Koreksi Absen',
      'LEMBUR': 'Lembur',
      'LEMBUR_PROYEK': 'Lembur Proyek'
    };
    return map[type] || type;
  };

  // Stats
  const pendingCount = requests.filter(r => r.status === 'PENDING_MANAGER').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #ECFEFF 100%)',
        borderColor: 'rgba(6, 182, 212, 0.1)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-info">Pengajuan Saya</span>
          </div>
          <h1 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Riwayat Pengajuan & Status</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Pantau status pengajuan cuti, izin, lembur, dan koreksi absensi Anda.
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ padding: '10px 18px' }}>
          <PlusCircle size={16} /> Pengajuan Baru
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--warning-text)' }}>{pendingCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Menunggu</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--success-text)' }}>{approvedCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Disetujui</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--danger-text)' }}>{rejectedCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Ditolak</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-text)' }}>{requests.length}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Total</div>
        </div>
      </div>

      {/* Requests List */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--text-main)' }}>Semua Pengajuan</h3>

        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <FileText size={32} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Belum ada pengajuan. Klik "Pengajuan Baru" untuk memulai.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Jenis</th>
                  <th>Tanggal</th>
                  <th>Alasan</th>
                  <th>Status</th>
                  <th>Catatan Approver</th>
                  <th>Diajukan</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td><span className="badge badge-info">{getTypeLabel(r.type)}</span></td>
                    <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{r.start_date} — {r.end_date}</td>
                    <td style={{ maxWidth: '220px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{r.reason}</td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.notes || r.note || '—'}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--success-light)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 16px'
                }}>
                  <CheckCircle2 size={28} color="var(--success)" />
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>Berhasil Dikirim!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Pengajuan Anda telah masuk ke antrian persetujuan manajer.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem' }}>Pengajuan Baru</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Isi formulir lengkap</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="form-label">Jenis Pengajuan</label>
                    <select value={leaveType} onChange={e => setLeaveType(e.target.value)} className="form-select">
                      <option value="CUTI_TAHUNAN">Cuti Tahunan</option>
                      <option value="IZIN_SAKIT">Izin Sakit</option>
                      <option value="IZIN_PRIBADI">Izin Pribadi</option>
                      <option value="KOREKSI_ABSEN">Koreksi Absensi</option>
                      <option value="LEMBUR">Lembur</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label className="form-label">Tanggal Mulai</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input" required />
                    </div>
                    <div>
                      <label className="form-label">Tanggal Selesai</label>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input" required />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Alasan</label>
                    <textarea
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      className="form-input"
                      rows={3}
                      placeholder="Jelaskan alasan pengajuan..."
                      required
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '4px' }}>
                    Kirim Pengajuan
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
