import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import QRKioskStation from './components/QRKioskStation.jsx';
import EmployeeDashboard from './pages/EmployeeDashboard.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import HRAdminDashboard from './pages/HRAdminDashboard.jsx';
import PayrollDashboard from './pages/PayrollDashboard.jsx';

export default function App() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('DASHBOARD');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        color: 'var(--text-main)',
        fontSize: '1.2rem',
        fontWeight: 600
      }}>
        ⏳ Memuat Platform WajibAbsen Enterprise...
      </div>
    );
  }

  // Render main body depending on activePage and Role
  const renderContent = () => {
    if (activePage === 'KIOSK') {
      return <QRKioskStation />;
    }

    if (activePage === 'HR_MASTER' || activePage === 'GEOFENCE_CONFIG') {
      return <HRAdminDashboard />;
    }

    if (activePage === 'APPROVALS') {
      return <ManagerDashboard />;
    }

    if (activePage === 'PAYROLL_EXPORT') {
      return <PayrollDashboard />;
    }

    // Default 'DASHBOARD' renders role-specific dashboard
    if (!user) return <EmployeeDashboard />;

    switch (user.role) {
      case 'MANAGER':
        return <ManagerDashboard />;
      case 'HR_ADMIN':
      case 'SUPER_ADMIN':
        return <HRAdminDashboard />;
      case 'PAYROLL_AUDITOR':
        return <PayrollDashboard />;
      case 'EMPLOYEE':
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <div style={{
        display: 'flex',
        gap: '24px',
        margin: '0 16px 36px 16px',
        flex: 1
      }}>
        {activePage !== 'KIOSK' && (
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
        )}

        <main style={{ flex: 1, minWidth: 0 }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
