import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Home, 
  MapPin, 
  QrCode, 
  Users, 
  Calendar, 
  FileSpreadsheet, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  FileText,
  Activity,
  CalendarClock
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const menuItems = [
    {
      id: 'DASHBOARD',
      label: role === 'EMPLOYEE' ? 'Portal Karyawan' :
             role === 'MANAGER' ? 'Dasbor Tim' :
             role === 'HR_ADMIN' ? 'Dasbor HR' :
             role === 'PAYROLL_AUDITOR' ? 'Audit & Payroll' : 'Super Admin',
      icon: Home,
      roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'PAYROLL_AUDITOR', 'SUPER_ADMIN']
    },
    {
      id: 'MY_REQUESTS',
      label: 'Pengajuan Saya',
      icon: FileText,
      roles: ['EMPLOYEE']
    },
    {
      id: 'HR_MASTER',
      label: 'Master Karyawan',
      icon: Users,
      roles: ['HR_ADMIN', 'SUPER_ADMIN']
    },
    {
      id: 'GEOFENCE_CONFIG',
      label: 'Konfigurasi Geofence',
      icon: MapPin,
      roles: ['HR_ADMIN', 'SUPER_ADMIN']
    },
    {
      id: 'SHIFT_MANAGEMENT',
      label: 'Shift & Roster',
      icon: CalendarClock,
      roles: ['HR_ADMIN', 'SUPER_ADMIN', 'MANAGER']
    },
    {
      id: 'KIOSK',
      label: 'QR Kiosk Station',
      icon: QrCode,
      roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN']
    },
    {
      id: 'APPROVALS',
      label: 'Persetujuan & Cuti',
      icon: CheckCircle2,
      roles: ['MANAGER', 'HR_ADMIN']
    },
    {
      id: 'PAYROLL_EXPORT',
      label: 'Ekspor Payroll',
      icon: FileSpreadsheet,
      roles: ['HR_ADMIN', 'PAYROLL_AUDITOR', 'SUPER_ADMIN']
    },
    {
      id: 'AUDIT_TRAIL',
      label: 'Audit Trail',
      icon: Activity,
      roles: ['HR_ADMIN', 'SUPER_ADMIN', 'PAYROLL_AUDITOR']
    }
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside style={{
      width: '240px',
      minWidth: '240px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      height: 'fit-content',
      position: 'sticky',
      top: '80px'
    }}>
      {/* Navigation Section */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 10px',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{
          padding: '0 12px 10px 12px',
          fontSize: '0.68rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em'
        }}>
          Navigasi
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {allowedItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary-text)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  width: '100%'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-muted)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={18} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Security Info */}
      <div style={{
        marginTop: '8px',
        padding: '14px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--primary-light)',
        border: '1px solid rgba(79, 107, 246, 0.12)',
        fontSize: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-text)', fontWeight: 600, marginBottom: '6px' }}>
          <ShieldCheck size={14} />
          <span>Akses Terkontrol</span>
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.5, fontSize: '0.72rem' }}>
          Menu disesuaikan dengan peran Anda secara otomatis berdasarkan kebijakan keamanan.
        </p>
      </div>
    </aside>
  );
}
