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

  db.insert('audit_logs', {
    actor_id: 'system',
    actor_role: 'HR_ADMIN',
    actor_name: 'HR Admin',
    action: 'RESET_DEVICE_BINDING',
    target_type: 'USER',
    details: `Reset device binding untuk user ${user_id}`,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Device Binding untuk karyawan berhasil direset. Karyawan kini dapat mengikat perangkat baru.', user: updated });
};

export const createShift = (req, res) => {
  const { name, start_time, end_time, grace_period_minutes, is_overnight, flexible_hours, branch_id } = req.body;
  const newShift = db.insert('shifts', {
    name,
    start_time,
    end_time,
    grace_period_minutes: Number(grace_period_minutes) || 15,
    is_overnight: !!is_overnight,
    flexible_hours: !!flexible_hours,
    branch_id: branch_id || 'branch_hq'
  });

  db.insert('audit_logs', {
    actor_id: 'system',
    actor_role: 'HR_ADMIN',
    actor_name: 'HR Admin',
    action: 'CONFIG_CREATE_SHIFT',
    target_type: 'SHIFT',
    details: `Shift baru dibuat: ${name} (${start_time} - ${end_time})`,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Shift baru berhasil dibuat.', shift: newShift });
};

export const getAuditLogs = (req, res) => {
  const logs = db.getTable('audit_logs');
  const users = db.getTable('users');

  // Enrich with actor names
  const enriched = logs.map(log => {
    const actor = users.find(u => u.id === log.actor_id);
    return {
      ...log,
      actor_name: log.actor_name || (actor ? actor.full_name : log.actor_id)
    };
  }).reverse();

  res.json({ success: true, logs: enriched });
};
