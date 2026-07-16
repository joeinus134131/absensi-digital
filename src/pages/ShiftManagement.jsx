import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Clock, Plus, Calendar, Users, CheckCircle2, X } from 'lucide-react';

export default function ShiftManagement() {
  const { user } = useAuth();
  const [master, setMaster] = useState(null);
  const [showAddShift, setShowAddShift] = useState(false);
  const [newShift, setNewShift] = useState({
    name: '',
    start_time: '08:00',
    end_time: '17:00',
    grace_period_minutes: 15,
    is_overnight: false,
    flexible_hours: false
  });
  const [msg, setMsg] = useState('');

  const fetchMaster = () => {
    fetch('http://localhost:5001/api/hr/master')
      .then(res => res.json())
      .then(data => {
        if (data.success) setMaster(data);
      });
  };

  useEffect(() => {
    fetchMaster();
  }, []);

  const handleAddShift = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5001/api/hr/shift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newShift, branch_id: 'branch_hq' })
    });
    const data = await res.json();
    if (data.success) {
      setMsg('Shift baru berhasil ditambahkan!');
      setShowAddShift(false);
      setNewShift({ name: '', start_time: '08:00', end_time: '17:00', grace_period_minutes: 15, is_overnight: false, flexible_hours: false });
      setTimeout(() => setMsg(''), 3000);
      fetchMaster();
    }
  };

  if (!master) return (
    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div className="animate-pulse-soft">Memuat data shift...</div>
    </div>
  );

  // Build roster view: users grouped by shift
  const usersGroupedByShift = {};
  master.shifts.forEach(s => {
    usersGroupedByShift[s.id] = master.users.filter(u => u.shift_id === s.id);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 100%)',
        borderColor: 'rgba(16, 185, 129, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-success">Manajemen Shift</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MOD-05: Aturan Jam Kerja & Roster</span>
        </div>
        <h1 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Shift Kerja & Roster Jadwal</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Kelola shift regular, fleksibel, dan malam. Tetapkan jadwal karyawan per shift.
        </p>
      </div>

      {msg && (
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
          {msg}
        </div>
      )}

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Daftar Shift Aktif ({master.shifts.length})</h3>
        {(user.role === 'HR_ADMIN' || user.role === 'SUPER_ADMIN') && (
          <button onClick={() => setShowAddShift(true)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
            <Plus size={14} /> Tambah Shift Baru
          </button>
        )}
      </div>

      {/* Shift Cards with Roster */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {master.shifts.map(s => {
          const assignedUsers = usersGroupedByShift[s.id] || [];
          return (
            <div key={s.id} className="glass-card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="var(--primary)" />
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{s.name}</h4>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Jam: <strong>{s.start_time} — {s.end_time}</strong> · Grace Period: {s.grace_period_minutes} menit
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {s.flexible_hours && <span className="badge badge-info">Fleksibel</span>}
                  {s.is_overnight && <span className="badge badge-purple">Shift Malam</span>}
                  {!s.flexible_hours && !s.is_overnight && <span className="badge badge-success">Regular</span>}
                </div>
              </div>

              {/* Assigned Employees */}
              <div style={{
                background: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Karyawan Terjadwal ({assignedUsers.length})
                </div>
                {assignedUsers.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Belum ada karyawan yang ditetapkan ke shift ini.</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {assignedUsers.map(u => (
                      <div key={u.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.78rem'
                      }}>
                        <img
                          src={u.avatar}
                          alt={u.full_name}
                          style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.75rem' }}>{u.full_name}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{u.position}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Shift Modal */}
      {showAddShift && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddShift(false); }}>
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>Tambah Shift Baru</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Definisikan aturan jam kerja baru</p>
              </div>
              <button onClick={() => setShowAddShift(false)} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddShift} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Nama Shift</label>
                <input
                  type="text"
                  value={newShift.name}
                  onChange={e => setNewShift({ ...newShift, name: e.target.value })}
                  className="form-input"
                  placeholder="Contoh: Shift Siang (12:00 - 21:00)"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Jam Mulai</label>
                  <input
                    type="time"
                    value={newShift.start_time}
                    onChange={e => setNewShift({ ...newShift, start_time: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Jam Selesai</label>
                  <input
                    type="time"
                    value={newShift.end_time}
                    onChange={e => setNewShift({ ...newShift, end_time: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Grace Period (Menit)</label>
                <input
                  type="number"
                  value={newShift.grace_period_minutes}
                  onChange={e => setNewShift({ ...newShift, grace_period_minutes: Number(e.target.value) })}
                  className="form-input"
                  min={0}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newShift.flexible_hours}
                    onChange={e => setNewShift({ ...newShift, flexible_hours: e.target.checked })}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  Jam Fleksibel
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newShift.is_overnight}
                    onChange={e => setNewShift({ ...newShift, is_overnight: e.target.checked })}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  Shift Malam (Lintas Hari)
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '4px' }}>
                Simpan Shift
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
