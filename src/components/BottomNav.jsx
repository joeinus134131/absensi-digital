import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Home, QrCode, FileText, Users, CheckCircle2, FileSpreadsheet, Activity, MapPin, CalendarClock } from 'lucide-react';

export default function BottomNav({ activePage, setActivePage }) {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  // 4 tabs per role — curated for most used actions per role
  const getTabsForRole = () => {
    switch (role) {
      case 'EMPLOYEE':
        return [
          { id: 'DASHBOARD', label: 'Beranda', icon: Home },
          { id: 'KIOSK', label: 'QR Scan', icon: QrCode },
          { id: 'MY_REQUESTS', label: 'Pengajuan', icon: FileText },
          { id: 'SHIFT_MANAGEMENT', label: 'Jadwal', icon: CalendarClock }
        ];
      case 'MANAGER':
        return [
          { id: 'DASHBOARD', label: 'Tim', icon: Home },
          { id: 'APPROVALS', label: 'Approval', icon: CheckCircle2 },
          { id: 'KIOSK', label: 'QR Scan', icon: QrCode },
          { id: 'SHIFT_MANAGEMENT', label: 'Shift', icon: CalendarClock }
        ];
      case 'HR_ADMIN':
      case 'SUPER_ADMIN':
        return [
          { id: 'DASHBOARD', label: 'Beranda', icon: Home },
          { id: 'HR_MASTER', label: 'Karyawan', icon: Users },
          { id: 'APPROVALS', label: 'Approval', icon: CheckCircle2 },
          { id: 'GEOFENCE_CONFIG', label: 'Geofence', icon: MapPin }
        ];
      case 'PAYROLL_AUDITOR':
        return [
          { id: 'DASHBOARD', label: 'Beranda', icon: Home },
          { id: 'PAYROLL_EXPORT', label: 'Payroll', icon: FileSpreadsheet },
          { id: 'AUDIT_TRAIL', label: 'Audit', icon: Activity },
          { id: 'KIOSK', label: 'QR Scan', icon: QrCode }
        ];
      default:
        return [
          { id: 'DASHBOARD', label: 'Beranda', icon: Home },
          { id: 'KIOSK', label: 'QR Scan', icon: QrCode },
          { id: 'MY_REQUESTS', label: 'Pengajuan', icon: FileText },
          { id: 'SHIFT_MANAGEMENT', label: 'Jadwal', icon: CalendarClock }
        ];
    }
  };

  const tabs = getTabsForRole();

  return (
    <nav className="bottom-nav mobile-only">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activePage === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActivePage(tab.id)}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon">
              <Icon size={isActive ? 18 : 20} color={isActive ? '#FFFFFF' : 'var(--text-muted)'} strokeWidth={isActive ? 2.2 : 1.8} />
            </div>
            <span className="nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
