import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldCheck, Monitor, UserCheck, Users, Briefcase, FileSpreadsheet, Lock } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, switchRole } = useAuth();

  const roleConfigs = {
    EMPLOYEE: { label: 'Karyawan (Staff)', icon: UserCheck, color: '#10B981' },
    MANAGER: { label: 'Manajer / Supervisor', icon: Users, color: '#3B82F6' },
    HR_ADMIN: { label: 'HR / Tenant Admin', icon: Briefcase, color: '#8B5CF6' },
    PAYROLL_AUDITOR: { label: 'Payroll & Auditor', icon: FileSpreadsheet, color: '#F59E0B' },
    SUPER_ADMIN: { label: 'Super Admin (SaaS Owner)', icon: Lock, color: '#F43F5E' }
  };

  const currentRoleConfig = user ? roleConfigs[user.role] : roleConfigs.EMPLOYEE;

  return (
    <header className="glass-card" style={{
      position: 'sticky',
      top: '12px',
      zIndex: 50,
      margin: '0 16px 20px 16px',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #10B981, #06B6D4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#04140D',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
        }}>
          <ShieldCheck size={26} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
              Wajib<span style={{ color: '#10B981' }}>Absen</span>
            </span>
            <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>Enterprise V1.0</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Zero-Fraud Attendance & Dynamic Geofencing Platform
          </p>
        </div>
      </div>

      {/* Center Actions: Kiosk Station Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => setActivePage('KIOSK')}
          className="btn btn-secondary"
          style={{
            borderColor: activePage === 'KIOSK' ? '#10B981' : undefined,
            background: activePage === 'KIOSK' ? 'rgba(16, 185, 129, 0.15)' : undefined
          }}
        >
          <Monitor size={18} color="#10B981" />
          <span>Buka QR Kiosk Station (Live 15s TOTP)</span>
        </button>
      </div>

      {/* Right ACL Switcher & User info */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Quick Role Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.04)',
            padding: '6px 12px',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ACL Demo Switch:</span>
            <select
              value={user.role}
              onChange={(e) => {
                switchRole(e.target.value);
                setActivePage('DASHBOARD');
              }}
              style={{
                background: '#121929',
                color: '#F8FAFC',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '5px 10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="EMPLOYEE">Karyawan (Staff)</option>
              <option value="MANAGER">Manajer / Supervisor</option>
              <option value="HR_ADMIN">HR / Perusahaan Admin</option>
              <option value="PAYROLL_AUDITOR">Auditor / Payroll Specialist</option>
              <option value="SUPER_ADMIN">Super Admin (SaaS Owner)</option>
            </select>
          </div>

          {/* Current User Profile Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '12px',
            borderLeft: '1px solid rgba(255,255,255,0.1)'
          }}>
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user.full_name}
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #10B981' }}
            />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{user.full_name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {user.position} • <span style={{ color: currentRoleConfig?.color }}>{currentRoleConfig?.label}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
