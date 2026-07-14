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
  Paperclip
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
        setSyncMessage(`✅ ${data.message}`);
        setTimeout(() => setSyncMessage(''), 3500);
        fetchLogs();
      }
    } catch (err) {
      setSyncMessage('❌ Gagal menyinkronkan antrean. Periksa jaringan internet.');
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
          reason: attachmentName ? `${reason} (Lampiran Bukti: ${attachmentName})` : reason
        })
      });
      const data = await res.json();
      if (data.success) {
        setLeaveSuccess(true);
        setTimeout(() => {
          setShowLeaveModal(false);
          setLeaveSuccess(false);
          setAttachmentName('');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const todayLog = logs.find(l => l.date === new Date().toISOString().split('T')[0]);

  // Build a simple 30-day visual grid for Calendar View (REQ-EMP-04)
  const calendarDays = Array.from({ length: 14 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - idx));
    const dateStr = d.toISOString().split('T')[0];
    const matchLog = logs.find(l => l.date === dateStr);
    return { dateStr, dayNum: d.getDate(), log: matchLog };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Offline Queue Bar if Any */}
      {offlineQueue.length > 0 && (
        <div className="glass-card" style={{
          padding: '16px 24px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(18, 25, 41, 0.9))',
          border: '1px solid #06B6D4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge" style={{ background: '#06B6D4', color: '#04140D', fontWeight: 800 }}>
              USP-5 OFFLINE QUEUE
            </span>
            <div>
              <div style={{ fontWeight: 700, color: '#A5F3FC' }}>
                Terdapat {offlineQueue.length} data check-in tersimpan lokal (Offline-First Mode)
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Klik tombol sinkronisasi untuk mengirimkannya ke server backend secara aman.
              </div>
            </div>
          </div>
          <button
            onClick={handleSyncOfflineQueue}
            className="btn btn-primary"
            style={{ padding: '10px 18px', background: '#06B6D4', color: '#04140D', fontWeight: 700 }}
          >
            <RefreshCw size={16} /> Sinkronkan Antrean Sekarang
          </button>
        </div>
      )}

      {syncMessage && (
        <div className="badge badge-success" style={{ padding: '12px 18px', fontSize: '0.9rem' }}>
          {syncMessage}
        </div>
      )}

      {/* Top Welcome & Check-In Action Card */}
      <div className="glass-card" style={{
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        background: 'linear-gradient(135deg, rgba(18, 25, 41, 0.9), rgba(16, 185, 129, 0.08))'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-success">PORTAL KARYAWAN</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Cabang: <strong>HQ Sudirman Tower 3</strong> • Shift: <strong>Smart Auto-Shift Enabled</strong>
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Selamat datang, {user?.full_name}!</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            {todayLog
              ? `Anda sudah melakukan Check-In pukul ${new Date(todayLog.check_in_time).toLocaleTimeString('id-ID')} WIB via ${todayLog.check_in_method}.`
              : 'Anda belum mencatatkan kehadiran untuk hari ini. Silakan klik tombol di bawah.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '1rem' }}
          >
            <QrCode size={20} />
            <span>Check-In / Check-Out Sekarang</span>
          </button>

          <button
            onClick={() => setShowLeaveModal(true)}
            className="btn btn-secondary"
            style={{ padding: '14px 20px' }}
          >
            <PlusCircle size={18} />
            <span>Ajukan Cuti / Izin</span>
          </button>
        </div>
      </div>

      {/* REQ-EMP-04: Visual Monthly Calendar Grid */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Kalender Grid Kehadiran Visual (14 Hari Terakhir)</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>REQ-EMP-04: Indikator visual kepatuhan absensi harian</p>
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }}></span> Tepat Waktu
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }}></span> Terlambat
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, minmax(0, 1fr))', gap: '8px' }}>
          {calendarDays.map(item => (
            <div key={item.dateStr} style={{
              padding: '10px 4px',
              borderRadius: '8px',
              background: item.log ? (item.log.is_late ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)') : 'rgba(255,255,255,0.03)',
              border: item.log ? (item.log.is_late ? '1px solid #F59E0B' : '1px solid #10B981') : '1px solid rgba(255,255,255,0.06)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.dateStr.slice(5)}</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, margin: '4px 0', color: item.log ? (item.log.is_late ? '#FCD34D' : '#6EE7B7') : 'var(--text-muted)' }}>
                {item.dayNum}
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                {item.log ? (item.log.is_late ? 'Terlambat' : 'Hadir') : 'Off'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Status Hari Ini
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '6px', color: todayLog ? '#10B981' : '#F59E0B' }}>
            {todayLog ? (todayLog.is_late ? `Terlambat (${todayLog.late_minutes}m)` : 'Hadir Tepat Waktu') : 'Belum Absen'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Attendance Trust Score
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '6px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{todayLog ? `${todayLog.trust_score}%` : '100%'}</span>
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Sisa Kuota Cuti Tahunan
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '6px', color: '#06B6D4' }}>
            10 Hari
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Riwayat Kehadiran Pribadi</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Waktu Check-In</th>
                <th>Waktu Check-Out</th>
                <th>Metode Validasi</th>
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
                    <td style={{ fontWeight: 600 }}>{l.date}</td>
                    <td>{new Date(l.check_in_time).toLocaleTimeString('id-ID')} WIB</td>
                    <td>{l.check_out_time ? `${new Date(l.check_out_time).toLocaleTimeString('id-ID')} WIB` : '-'}</td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                        {l.check_in_method}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#10B981' }}>{l.trust_score}%</span>
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
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(4,10,20,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
            <h3 style={{ marginBottom: '16px' }}>Formulir Pengajuan Cuti / Izin</h3>
            <form onSubmit={handleSubmitLeave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jenis Pengajuan</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#121929', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', marginTop: '4px' }}
                >
                  <option value="CUTI_TAHUNAN">Cuti Tahunan</option>
                  <option value="IZIN_SAKIT">Izin Sakit (Surat Dokter)</option>
                  <option value="LEMBUR_PROYEK">Pengajuan Lembur</option>
                  <option value="KOREKSI_ABSEN">Koreksi Absensi Lupa Check-Out</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mulai Tanggal</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#121929', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sampai Tanggal</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#121929', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Alasan & Keterangan</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#121929', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', marginTop: '4px' }}
                  placeholder="Jelaskan keperluan Anda secara lengkap..."
                />
              </div>

              {/* REQ-EMP-04: Lampiran Bukti */}
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lampirkan Bukti Dokumen (Surat Dokter / Bukti Izin)</label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px',
                  padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.2)'
                }}>
                  <Paperclip size={18} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Nama file lampiran (contoh: surat_dokter_rsia.pdf)..."
                    value={attachmentName}
                    onChange={e => setAttachmentName(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {leaveSuccess ? (
                <div className="badge badge-success" style={{ padding: '12px', justifyContent: 'center' }}>
                  🎉 Pengajuan berhasil dikirim kepada Manajer!
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Kirim Pengajuan
                  </button>
                  <button type="button" onClick={() => setShowLeaveModal(false)} className="btn btn-secondary">
                    Batal
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
