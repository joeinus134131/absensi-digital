import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Users, RefreshCw, Plus, CheckCircle2, Filter, X, UserPlus } from 'lucide-react';

export default function HRAdminDashboard() {
  const { user } = useAuth();
  const [master, setMaster] = useState(null);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [msg, setMsg] = useState('');

  // Add Employee Form
  const [newEmp, setNewEmp] = useState({
    nik: '',
    full_name: '',
    email: '',
    role: 'EMPLOYEE',
    department: 'Product & Engineering',
    position: '',
    branch_id: 'branch_hq',
    shift_id: 'shift_reg_01'
  });

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

  const handleResetDevice = async (userId) => {
    const res = await fetch('http://localhost:5001/api/hr/reset-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });
    const data = await res.json();
    if (data.success) {
      setMsg('Device binding berhasil direset!');
      setTimeout(() => setMsg(''), 3000);
      fetchMaster();
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5001/api/hr/employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmp)
    });
    const data = await res.json();
    if (data.success) {
      setMsg('Karyawan baru berhasil ditambahkan!');
      setShowAddEmployee(false);
      setNewEmp({ nik: '', full_name: '', email: '', role: 'EMPLOYEE', department: 'Product & Engineering', position: '', branch_id: 'branch_hq', shift_id: 'shift_reg_01' });
      setTimeout(() => setMsg(''), 3000);
      fetchMaster();
    }
  };

  if (!master) return (
    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div className="animate-pulse-soft">Memuat data karyawan...</div>
    </div>
  );

  const filteredUsers = deptFilter === 'ALL'
    ? master.users
    : master.users.filter(u => u.department === deptFilter);

  const departments = [...new Set(master.users.map(u => u.department))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F3FF 100%)',
        borderColor: 'rgba(139, 92, 246, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-purple">HR Admin</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PT WajibAbsen Teknologi Nusantara</span>
        </div>
        <h1 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Master Data Karyawan</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Kelola data karyawan, hierarki organisasi, dan status pengikatan perangkat (device binding).
        </p>
      </div>

      {msg && (
        <div style={{
          padding: '12px 16px', background: 'var(--success-light)', borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success-text)', fontSize: '0.85rem',
          fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <CheckCircle2 size={16} /> {msg}
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-text)' }}>{master.users.length}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Total Karyawan</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--success-text)' }}>
            {master.users.filter(u => u.device_fingerprint).length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Device Terikat</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--warning-text)' }}>
            {master.users.filter(u => !u.device_fingerprint).length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Belum Terikat</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--info-text)' }}>{master.branches.length}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Cabang Aktif</div>
        </div>
      </div>

      {/* Table with Action Bar */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Daftar Karyawan</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '7px 12px', fontSize: '0.8rem' }}
              >
                <option value="ALL">Semua Departemen</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            {(user.role === 'HR_ADMIN' || user.role === 'SUPER_ADMIN') && (
              <button onClick={() => setShowAddEmployee(true)} className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
                <UserPlus size={14} /> Tambah Karyawan
              </button>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>NIK</th>
                <th>Nama Lengkap</th>
                <th>Peran</th>
                <th>Jabatan / Divisi</th>
                <th>Cabang</th>
                <th>Device ID</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.nik}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {u.avatar && (
                        <img src={u.avatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                      )}
                      {u.full_name}
                    </div>
                  </td>
                  <td><span className="badge badge-info">{u.role}</span></td>
                  <td style={{ fontSize: '0.82rem' }}>{u.position} · {u.department}</td>
                  <td style={{ fontSize: '0.82rem' }}>{u.branch_id === 'branch_hq' ? 'HQ Jakarta' : 'Bekasi'}</td>
                  <td>
                    {u.device_fingerprint ? (
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{u.device_fingerprint}</span>
                    ) : (
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Belum Terikat</span>
                    )}
                  </td>
                  <td>
                    {u.device_fingerprint && (
                      <button
                        onClick={() => handleResetDevice(u.id)}
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.72rem' }}
                      >
                        <RefreshCw size={12} /> Reset
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddEmployee(false); }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>Tambah Karyawan Baru</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Lengkapi data untuk mendaftarkan karyawan</p>
              </div>
              <button onClick={() => setShowAddEmployee(false)} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">NIK</label>
                  <input type="text" value={newEmp.nik} onChange={e => setNewEmp({ ...newEmp, nik: e.target.value })} className="form-input" placeholder="EMP-XXXX" required />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} className="form-input" placeholder="email@company.id" required />
                </div>
              </div>

              <div>
                <label className="form-label">Nama Lengkap</label>
                <input type="text" value={newEmp.full_name} onChange={e => setNewEmp({ ...newEmp, full_name: e.target.value })} className="form-input" placeholder="Nama lengkap karyawan" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Peran (Role)</label>
                  <select value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })} className="form-select">
                    <option value="EMPLOYEE">Karyawan</option>
                    <option value="MANAGER">Manajer</option>
                    <option value="HR_ADMIN">HR Admin</option>
                    <option value="PAYROLL_AUDITOR">Payroll Auditor</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Departemen</label>
                  <select value={newEmp.department} onChange={e => setNewEmp({ ...newEmp, department: e.target.value })} className="form-select">
                    <option value="Product & Engineering">Product & Engineering</option>
                    <option value="HR & People">HR & People</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="Logistics & Operations">Logistics & Operations</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Jabatan / Posisi</label>
                <input type="text" value={newEmp.position} onChange={e => setNewEmp({ ...newEmp, position: e.target.value })} className="form-input" placeholder="Contoh: Software Engineer" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Cabang</label>
                  <select value={newEmp.branch_id} onChange={e => setNewEmp({ ...newEmp, branch_id: e.target.value })} className="form-select">
                    {master.branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Shift</label>
                  <select value={newEmp.shift_id} onChange={e => setNewEmp({ ...newEmp, shift_id: e.target.value })} className="form-select">
                    {master.shifts.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '4px' }}>
                Simpan Karyawan Baru
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
