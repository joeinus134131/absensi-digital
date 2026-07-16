import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import CheckInModal from '../components/CheckInModal.jsx';
import { 
  Clock, 
  MapPin, 
  QrCode, 
  CheckCircle2, 
  Calendar, 
  PlusCircle, 
  ShieldCheck, 
  AlertTriangle,
  Award,
  RefreshCw,
  Paperclip,
  X
} from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [syncMessage, setSyncMessage] = useState('');

  // Leave Form
  const [leaveType, setLeaveType] = useState('CUTI_TAHUNAN');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  const fetchLogs = () => {
    if (!user) return;
    fetch(`http://localhost:5001/api/attendance/logs?role=EMPLOYEE&user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setLogs(data.logs);
      })
      .catch(err => console.error(err));
  };

  const checkOfflineQueue = () => {
    const q = JSON.parse(localStorage.getItem('wajibabsen_offline_queue') || '[]');
    setOfflineQueue(q);
  };

  useEffect(() => {
    fetchLogs();
    checkOfflineQueue();
  }, [user]);

  const handleSyncOfflineQueue = async () => {
    if (!offlineQueue.length) return;
    try {
      const res = await fetch('http://localhost:5001/api/attendance/sync-offline-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queued_logs: offlineQueue })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem('wajibabsen_offline_queue');
        setOfflineQueue([]);
        setSyncMessage(data.message);
        setTimeout(() => setSyncMessage(''), 3500);
        fetchLogs();
      }
    } catch (err) {
      setSyncMessage('Gagal menyinkronkan antrean. Periksa jaringan internet.');
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/api/approvals/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          type: leaveType,
          start_date: startDate,
          end_date: endDate,
          reason: attachmentName ? `${reason} (Lampiran: ${attachmentName})` : reason
        })
      });
      const data = await res.json();
      if (data.success) {
        setLeaveSuccess(true);
        setTimeout(() => {
          setShowLeaveModal(false);
          setLeaveSuccess(false);
          setAttachmentName('');
          setReason('');
          setStartDate('');
          setEndDate('');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const todayLog = logs.find(l => l.date === new Date().toISOString().split('T')[0]);

  const calendarDays = Array.from({ length: 14 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - idx));
    const dateStr = d.toISOString().split('T')[0];
    const matchLog = logs.find(l => l.date === dateStr);
    return { dateStr, dayNum: d.getDate(), log: matchLog };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Offline Queue Banner */}
      {offlineQueue.length > 0 && (
        <div style={{
          padding: '14px 20px',
          background: 'var(--info-light)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RefreshCw size={18} color="var(--info-text)" />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--info-text)', fontSize: '0.88rem' }}>
                {offlineQueue.length} data tersimpan offline
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Sinkronkan ke server saat koneksi tersedia
              </div>
            </div>
          </div>
          <button onClick={handleSyncOfflineQueue} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
            <RefreshCw size={14} /> Sinkronkan
          </button>
        </div>
      )}

      {syncMessage && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--success-light)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          color: 'var(--success-text)',
          fontSize: '0.85rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          {syncMessage}
        </div>
      )}

      {/* Welcome & Quick Action */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F4FF 100%)',
        borderColor: 'rgba(79, 107, 246, 0.1)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-success">Karyawan Aktif</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              HQ Sudirman Tower · Smart Auto-Shift
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px', color: 'var(--text-main)' }}>
            Selamat datang, {user?.full_name}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {todayLog
              ? `Check-in tercatat pukul ${new Date(todayLog.check_in_time).toLocaleTimeString('id-ID')} WIB via ${todayLog.check_in_method}.`
              : 'Anda belum mencatat kehadiran hari ini. Silakan check-in sekarang.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ padding: '12px 22px' }}>
            <QrCode size={18} />
            <span>Check-In Sekarang</span>
          </button>
          <button onClick={() => setShowLeaveModal(true)} className="btn btn-secondary" style={{ padding: '12px 18px' }}>
            <PlusCircle size={16} />
            <span>Ajukan Cuti</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Kehadiran 14 Hari Terakhir</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Ringkasan visual kepatuhan absensi harian</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}></span> Hadir
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)' }}></span> Terlambat
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))', gap: '6px' }}>
          {calendarDays.map(item => (
            <div key={item.dateStr} style={{
              padding: '8px 4px',
              borderRadius: 'var(--radius-sm)',
              background: item.log
                ? (item.log.is_late ? 'var(--warning-light)' : 'var(--success-light)')
                : 'var(--bg-muted)',
              border: item.log
                ? (item.log.is_late ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)')
                : '1px solid var(--border-subtle)',
              textAlign: 'center',
              transition: 'all var(--transition-fast)'
            }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{item.dateStr.slice(5)}</div>
              <div style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                margin: '2px 0',
                color: item.log ? (item.log.is_late ? 'var(--warning-text)' : 'var(--success-text)') : 'var(--text-dim)'
              }}>
                {item.dayNum}
              </div>
              <div style={{ fontSize: '0.6rem', fontWeight: 600, color: item.log ? (item.log.is_late ? 'var(--warning-text)' : 'var(--success-text)') : 'var(--text-dim)' }}>
                {item.log ? (item.log.is_late ? 'Telat' : 'Hadir') : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status Hari Ini</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '6px', color: todayLog ? (todayLog.is_late ? 'var(--warning-text)' : 'var(--success-text)') : 'var(--text-muted)' }}>
            {todayLog ? (todayLog.is_late ? `Terlambat ${todayLog.late_minutes}m` : 'Tepat Waktu') : 'Belum Absen'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {todayLog ? `Check-in: ${new Date(todayLog.check_in_time).toLocaleTimeString('id-ID')}` : 'Menunggu check-in'}
          </div>
        </div>

        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Trust Score</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '6px', color: 'var(--primary-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {todayLog ? `${todayLog.trust_score}%` : '100%'}
            <ShieldCheck size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Skor keamanan absensi</div>
        </div>

        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Sisa Cuti Tahunan</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '6px', color: 'var(--info-text)' }}>10 Hari</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Periode berjalan</div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--text-main)' }}>Riwayat Kehadiran</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Metode</th>
                <th>Trust Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Belum ada riwayat kehadiran.
                  </td>
                </tr>
              ) : (
                logs.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{l.date}</td>
                    <td>{new Date(l.check_in_time).toLocaleTimeString('id-ID')} WIB</td>
                    <td>{l.check_out_time ? `${new Date(l.check_out_time).toLocaleTimeString('id-ID')} WIB` : '—'}</td>
                    <td><span className="badge badge-info">{l.check_in_method}</span></td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--success-text)' }}>{l.trust_score}%</span>
                    </td>
                    <td>
                      {l.is_late ? (
                        <span className="badge badge-warning">Terlambat {l.late_minutes}m</span>
                      ) : (
                        <span className="badge badge-success">Tepat Waktu</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check-In Modal */}
      {showModal && (
        <CheckInModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchLogs();
            checkOfflineQueue();
          }}
        />
      )}

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowLeaveModal(false); }}>
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            {leaveSuccess ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--success-light)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 16px'
                }}>
                  <CheckCircle2 size={28} color="var(--success)" />
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>Pengajuan Berhasil!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Pengajuan cuti/izin Anda telah dikirim ke manajer untuk persetujuan.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem' }}>Ajukan Cuti / Izin</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Lengkapi formulir untuk mengirim pengajuan
                    </p>
                  </div>
                  <button onClick={() => setShowLeaveModal(false)} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSubmitLeave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="form-label">Jenis Pengajuan</label>
                    <select value={leaveType} onChange={e => setLeaveType(e.target.value)} className="form-select">
                      <option value="CUTI_TAHUNAN">Cuti Tahunan</option>
                      <option value="IZIN_SAKIT">Izin Sakit</option>
                      <option value="IZIN_PRIBADI">Izin Keperluan Pribadi</option>
                      <option value="KOREKSI_ABSEN">Koreksi Absensi</option>
                      <option value="LEMBUR">Pengajuan Lembur</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                      placeholder="Jelaskan alasan pengajuan Anda..."
                      required
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label className="form-label">Lampiran (Opsional)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="text"
                        value={attachmentName}
                        onChange={e => setAttachmentName(e.target.value)}
                        className="form-input"
                        placeholder="Nama file lampiran (surat dokter, dll)"
                      />
                      <Paperclip size={16} color="var(--text-muted)" />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px', padding: '12px' }}>
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
