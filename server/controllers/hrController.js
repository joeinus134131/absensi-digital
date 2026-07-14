import { db } from '../db/database.js';

export const getMasterData = (req, res) => {
  res.json({
    success: true,
    companies: db.getTable('companies'),
    branches: db.getTable('branches'),
    shifts: db.getTable('shifts'),
    users: db.getTable('users').map(u => ({ ...u, password: '***' })),
    qr_stations: db.getTable('qr_stations')
  });
};

export const createEmployee = (req, res) => {
  const { nik, full_name, email, role, department, position, branch_id, shift_id } = req.body;
  const newEmp = db.insert('users', {
    nik,
    full_name,
    email,
    password: 'password123',
    role: role || 'EMPLOYEE',
    department: department || 'General',
    position: position || 'Staff',
    branch_id: branch_id || 'branch_hq',
    shift_id: shift_id || 'shift_reg_01',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  });
  res.json({ success: true, message: 'Karyawan berhasil ditambahkan.', employee: newEmp });
};

export const updateBranchGeofence = (req, res) => {
  const { branch_id, latitude, longitude, radius_meters, bssid_whitelist } = req.body;
  const updated = db.update('branches', branch_id, {
    latitude: Number(latitude),
    longitude: Number(longitude),
    radius_meters: Number(radius_meters),
    bssid_whitelist
  });
  if (!updated) return res.status(404).json({ success: false, message: 'Cabang tidak ditemukan.' });
  res.json({ success: true, message: 'Batas Geofence berhasil diperbarui!', branch: updated });
};

export const resetUserDevice = (req, res) => {
  const { user_id } = req.body;
  const updated = db.update('users', user_id, { device_fingerprint: null });
  res.json({ success: true, message: 'Device Binding untuk karyawan berhasil direset. Karyawan kini dapat mengikat perangkat baru.', user: updated });
};
