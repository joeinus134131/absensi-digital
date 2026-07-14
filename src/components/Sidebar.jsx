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
  Layers 
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  // Build menu items based on ACL RBAC Matrix (BRD Section 5.2)
  const menuItems = [
    {
      id: 'DASHBOARD',
      label: role === 'EMPLOYEE' ? 'Portal Karyawan' :
             role === 'MANAGER' ? 'Dasbor Manajer & Tim' :
             role === 'HR_ADMIN' ? 'Dasbor HR & Manajemen Tenant' :
             role === 'PAYROLL_AUDITOR' ? 'Pusat Audit & Payroll' : 'Platform Super Admin',
      icon: Home,
      roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'PAYROLL_AUDITOR', 'SUPER_ADMIN']
    },
    {
      id: 'HR_MASTER',
      label: 'Master Karyawan & Cabang',
      icon: Users,
      roles: ['HR_ADMIN', 'SUPER_ADMIN']
    },
    {
      id: 'GEOFENCE_CONFIG',
      label: 'Konfigurasi Geofence GPS',
      icon: MapPin,
      roles: ['HR_ADMIN', 'SUPER_ADMIN']
    },
    {
      id: 'KIOSK',
      label: 'Layar Kiosk QR Kantor (Live)',
      icon: QrCode,
      roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN']
    },
    {
      id: 'APPROVALS',
      label: 'Persetujuan Izin & Cuti',
      icon: CheckCircle2,
      roles: ['MANAGER', 'HR_ADMIN']
    },
    {
      id: 'PAYROLL_EXPORT',
      label: 'Ekspor Payroll Siap Pakai',
      icon: FileSpreadsheet,
      roles: ['HR_ADMIN', 'PAYROLL_AUDITOR', 'SUPER_ADMIN']
    }
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="glass-card" style={{
      width: '260px',
      minWidth: '260px',
      padding: '20px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      height: 'fit-content'
    }}>
      <div style={{
        padding: '0 12px 12px 12px',
        fontSize: '0.72rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        Menu Navigasi ({role})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
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
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(6, 182, 212, 0.15))' : 'transparent',
                color: isActive ? '#10B981' : 'var(--text-main)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none'
              }}
            >
              <Icon size={19} color={isActive ? '#10B981' : 'var(--text-muted)'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ACL Security Badge info box */}
      <div style={{
        marginTop: '24px',
        padding: '14px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        fontSize: '0.78rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 600, marginBottom: '6px' }}>
          <ShieldCheck size={16} />
          <span>ACL Active Control</span>
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>
          Akses modul dan tombol aksi disesuaikan secara dinamis dengan peran pengguna sesuai standar keamanan WajibAbsen.
        </p>
      </div>
    </aside>
  );
}
