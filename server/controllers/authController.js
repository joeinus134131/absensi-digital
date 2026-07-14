import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';

const SECRET_KEY = 'WAJIB_ABSEN_ENTERPRISE_JWT_SECRET_KEY';

export const login = (req, res) => {
  const { email, password, device_fingerprint } = req.body;

  const user = db.find('users', u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Email atau password salah.' });
  }

  // Check Device Binding (REQ-AUTH-01)
  let deviceStatus = 'BOUND';
  let warningMessage = null;

  if (!user.device_fingerprint) {
    // Bind device on first login
    db.update('users', user.id, { device_fingerprint });
    deviceStatus = 'NEWLY_BOUND';
  } else if (user.device_fingerprint !== device_fingerprint && device_fingerprint) {
    // Device mismatch warning or block
    if (user.role === 'EMPLOYEE') {
      return res.status(403).json({
        success: false,
        error_code: 'DEVICE_MISMATCH',
        message: 'Perangkat ini tidak terdaftar dengan akun Anda. Harap ajukan Reset Device ID ke HR Admin.'
      });
    } else {
      warningMessage = 'Login dari perangkat baru terdeteksi (Admin/Manager bypass).';
    }
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, branch_id: user.branch_id },
    SECRET_KEY,
    { expiresIn: '12h' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      nik: user.nik,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      branch_id: user.branch_id,
      avatar: user.avatar
    },
    device_status: deviceStatus,
    warning: warningMessage
  });
};

// Quick Switch Role for Demo/Review purposes
export const switchRoleDemo = (req, res) => {
  const { targetRole } = req.body; // e.g. 'EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'PAYROLL_AUDITOR', 'SUPER_ADMIN'
  const user = db.find('users', u => u.role === targetRole);

  if (!user) {
    return res.status(404).json({ success: false, message: `Akun demo untuk peran ${targetRole} tidak ditemukan.` });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, branch_id: user.branch_id },
    SECRET_KEY,
    { expiresIn: '12h' }
  );

  res.json({
    success: true,
    token,
    user
  });
};

export const getRolesList = (req, res) => {
  const users = db.getTable('users');
  res.json({ success: true, users });
};
