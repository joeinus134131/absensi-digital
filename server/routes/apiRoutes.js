import express from 'express';
import * as authCtrl from '../controllers/authController.js';
import * as qrCtrl from '../controllers/qrController.js';
import * as attCtrl from '../controllers/attendanceController.js';
import * as hrCtrl from '../controllers/hrController.js';
import * as appCtrl from '../controllers/approvalController.js';
import * as repCtrl from '../controllers/reportController.js';

const router = express.Router();

// Auth & Roles
router.post('/auth/login', authCtrl.login);
router.post('/auth/switch-role', authCtrl.switchRoleDemo);
router.get('/auth/roles', authCtrl.getRolesList);

// QR Kiosk
router.get('/qr/dynamic-token', qrCtrl.getDynamicQRToken);
router.post('/qr/scan', qrCtrl.verifyQRScan);

// Attendance Geo, Offline Queue Sync & History
router.post('/attendance/check-in-geo', attCtrl.checkInGeo);
router.post('/attendance/check-out', attCtrl.checkOutGeo);
router.post('/attendance/sync-offline-queue', attCtrl.syncOfflineQueue);
router.get('/attendance/logs', attCtrl.getAttendanceLogs);

// HR Master & Config
router.get('/hr/master', hrCtrl.getMasterData);
router.post('/hr/employee', hrCtrl.createEmployee);
router.post('/hr/shift', hrCtrl.createShift);
router.post('/hr/branch-geofence', hrCtrl.updateBranchGeofence);
router.post('/hr/reset-device', hrCtrl.resetUserDevice);

// Audit Trail
router.get('/audit/logs', hrCtrl.getAuditLogs);

// Approvals
router.get('/approvals/requests', appCtrl.getLeaveRequests);
router.post('/approvals/request', appCtrl.submitLeaveRequest);
router.post('/approvals/update-status', appCtrl.updateApprovalStatus);

// Payroll, Analytics, Webhook & Reports
router.get('/reports/payroll-summary', repCtrl.getPayrollSummary);
router.get('/reports/executive-analytics', repCtrl.getExecutiveAnalytics);
router.post('/reports/webhook-test', repCtrl.testWebhookTrigger);
router.get('/reports/export-csv', repCtrl.exportPayrollCSV);

export default router;
