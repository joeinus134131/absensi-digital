import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldCheck, Monitor, UserCheck, Users, Briefcase, FileSpreadsheet, Lock, ChevronDown } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, switchRole } = useAuth();

  const roleConfigs = {
    EMPLOYEE: { label: 'Karyawan', icon: UserCheck, color: '#10B981' },
    MANAGER: { label: 'Manajer', icon: Users, color: '#4F6BF6' },
    HR_ADMIN: { label: 'HR Admin', icon: Briefcase, color: '#8B5CF6' },
    PAYROLL_AUDITOR: { label: 'Payroll', icon: FileSpreadsheet, color: '#F59E0B' },
    SUPER_ADMIN: { label: 'Super Admin', icon: Lock, color: '#EF4444' }
  };

  const currentRoleConfig = user ? roleConfigs[user.role] : roleConfigs.EMPLOYEE;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-light)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, #4F6BF6, #6366F1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(79, 107, 246, 0.3)'
        }}>
          <ShieldCheck size={22} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)' }}>
              Wajib<span style={{ color: 'var(--primary)' }}>Absen</span>
            </span>
            <span className="badge badge-info" style={{ fontSize: '0.62rem' }}>Enterprise</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>
            Platform Kehadiran Digital
          </p>
        </div>
      </div>

      {/* Center: Kiosk Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => setActivePage('KIOSK')}
          className="btn btn-secondary"
          style={{
            padding: '8px 16px',
            fontSize: '0.82rem',
            borderColor: activePage === 'KIOSK' ? 'var(--primary)' : undefined,
            background: activePage === 'KIOSK' ? 'var(--primary-soft)' : undefined,
            color: activePage === 'KIOSK' ? 'var(--primary-text)' : undefined
          }}
        >
          <Monitor size={16} color={activePage === 'KIOSK' ? 'var(--primary)' : 'var(--text-muted)'} />
          <span>QR Kiosk Station</span>
        </button>
      </div>

      {/* Right: Role Switcher & User */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Role Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-muted)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Peran:</span>
            <select
              value={user.role}
              onChange={(e) => {
                switchRole(e.target.value);
                setActivePage('DASHBOARD');
              }}
              style={{
                background: 'transparent',
                color: 'var(--text-main)',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                paddingRight: '4px'
              }}
            >
              <option value="EMPLOYEE">Karyawan</option>
              <option value="MANAGER">Manajer</option>
              <option value="HR_ADMIN">HR Admin</option>
              <option value="PAYROLL_AUDITOR">Payroll & Auditor</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          {/* User Profile */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '14px',
            borderLeft: '1px solid var(--border-light)'
          }}>
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user.full_name}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2px solid ${currentRoleConfig?.color || 'var(--primary)'}`,
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
              }}
            />
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.full_name}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {user.position} · <span style={{ color: currentRoleConfig?.color, fontWeight: 600 }}>{currentRoleConfig?.label}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
