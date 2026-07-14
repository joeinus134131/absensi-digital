import { db } from '../db/database.js';

export const getLeaveRequests = (req, res) => {
  const { user_id, role } = req.query;
  const requests = db.getTable('leave_requests');
  const users = db.getTable('users');

  const enriched = requests.map(reqItem => {
    const usr = users.find(u => u.id === reqItem.user_id);
    return {
      ...reqItem,
      user_name: usr ? usr.full_name : 'Unknown Employee',
      user_nik: usr ? usr.nik : '-',
      user_department: usr ? usr.department : '-'
    };
  }).reverse();

  if (role === 'EMPLOYEE' && user_id) {
    return res.json({ success: true, requests: enriched.filter(r => r.user_id === user_id) });
  }

  res.json({ success: true, requests: enriched });
};

export const submitLeaveRequest = (req, res) => {
  const { user_id, type, start_date, end_date, reason } = req.body;
  const newReq = db.insert('leave_requests', {
    user_id,
    type,
    start_date,
    end_date,
    reason,
    status: 'PENDING_MANAGER'
  });
  res.json({ success: true, message: 'Pengajuan berhasil dikirim kepada Manajer.', request: newReq });
};

export const updateApprovalStatus = (req, res) => {
  const { request_id, status, approver_role, notes } = req.body;
  const updated = db.update('leave_requests', request_id, {
    status,
    approved_by: approver_role,
    approved_at: new Date().toISOString(),
    notes: notes || ''
  });

  res.json({ success: true, message: `Status pengajuan diubah menjadi ${status}.`, request: updated });
};
