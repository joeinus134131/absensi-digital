import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldCheck, Menu, X, Home, Users, MapPin, QrCode, CheckCircle2, FileSpreadsheet, Activity, CalendarClock, FileText } from 'lucide-react';

export default function MobileHeader({ activePage, setActivePage }) {
  const { user, switchRole } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const role = user?.role;

  // Full menu for the drawer
  const allMenuItems = [
    { id: 'DASHBOARD', label: 'Beranda', icon: Home, roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'PAYROLL_AUDITOR', 'SUPER_ADMIN'] },
    { id: 'MY_REQUESTS', label: 'Pengajuan Saya', icon: FileText, roles: ['EMPLOYEE'] },
    { id: 'HR_MASTER', label: 'Master Karyawan', icon: Users, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
    { id: 'GEOFENCE_CONFIG', label: 'Konfigurasi Geofence', icon: MapPin, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
    { id: 'SHIFT_MANAGEMENT', label: 'Shift & Roster', icon: CalendarClock, roles: ['HR_ADMIN', 'SUPER_ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { id: 'KIOSK', label: 'QR Kiosk Station', icon: QrCode, roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
    { id: 'APPROVALS', label: 'Persetujuan & Cuti', icon: CheckCircle2, roles: ['MANAGER', 'HR_ADMIN'] },
    { id: 'PAYROLL_EXPORT', label: 'Ekspor Payroll', icon: FileSpreadsheet, roles: ['HR_ADMIN', 'PAYROLL_AUDITOR', 'SUPER_ADMIN'] },
    { id: 'AUDIT_TRAIL', label: 'Audit Trail', icon: Activity, roles: ['HR_ADMIN', 'SUPER_ADMIN', 'PAYROLL_AUDITOR'] }
  ];

  const allowedItems = allMenuItems.filter(item => item.roles.includes(role));

  const getPageTitle = () => {
    const found = allMenuItems.find(m => m.id === activePage);
    return found ? found.label : 'WajibAbsen';
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="mobile-header mobile-only">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #4F6BF6, #6366F1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0
          }}>
            <ShieldCheck size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {getPageTitle()}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {user?.full_name}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            background: 'var(--bg-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {showMenu ? <X size={18} color="var(--text-main)" /> : <Menu size={18} color="var(--text-main)" />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {showMenu && (
        <div className="mobile-only" style={{
          position: 'fixed',
          inset: 0,
          top: '57px',
          zIndex: 90,
          background: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(2px)',
          animation: 'fadeIn 0.15s ease'
        }}
          onClick={() => setShowMenu(false)}
        >
          <div style={{
            background: 'var(--bg-surface)',
            width: '280px',
            height: '100%',
            padding: '16px',
            borderRight: '1px solid var(--border-light)',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)'
          }}
            onClick={e => e.stopPropagation()}
          >
            {/* User Card */}
            {user && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                background: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px'
              }}>
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user.full_name}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.full_name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{user.position}</div>
                </div>
              </div>
            )}

            {/* Role Switcher */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>
                Demo Peran
              </label>
              <select
                value={user?.role}
                onChange={(e) => {
                  switchRole(e.target.value);
                  setActivePage('DASHBOARD');
                  setShowMenu(false);
                }}
                className="form-select"
                style={{ fontSize: '0.82rem' }}
              >
                <option value="EMPLOYEE">Karyawan</option>
                <option value="MANAGER">Manajer</option>
                <option value="HR_ADMIN">HR Admin</option>
                <option value="PAYROLL_AUDITOR">Payroll & Auditor</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            {/* Menu Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', padding: '0 8px' }}>
                Semua Menu
              </div>
              {allowedItems.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActivePage(item.id); setShowMenu(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '11px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: isActive ? 'var(--primary-light)' : 'transparent',
                      color: isActive ? 'var(--primary-text)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <Icon size={18} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
