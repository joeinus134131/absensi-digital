import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import BottomNav from './components/BottomNav.jsx';
import MobileHeader from './components/MobileHeader.jsx';
import QRKioskStation from './components/QRKioskStation.jsx';
import EmployeeDashboard from './pages/EmployeeDashboard.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import HRAdminDashboard from './pages/HRAdminDashboard.jsx';
import PayrollDashboard from './pages/PayrollDashboard.jsx';
import ShiftManagement from './pages/ShiftManagement.jsx';
import AuditTrailPage from './pages/AuditTrailPage.jsx';
import MyRequestsPage from './pages/MyRequestsPage.jsx';
import GeofenceConfig from './pages/GeofenceConfig.jsx';

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
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        fontWeight: 500,
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div className="animate-pulse-soft" style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, #4F6BF6, #6366F1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '1.2rem'
        }}>
          W
        </div>
        <span>Memuat WajibAbsen...</span>
      </div>
    );
  }

  const renderContent = () => {
    if (activePage === 'KIOSK') return <QRKioskStation />;
    if (activePage === 'HR_MASTER') return <HRAdminDashboard />;
    if (activePage === 'GEOFENCE_CONFIG') return <GeofenceConfig />;
    if (activePage === 'SHIFT_MANAGEMENT') return <ShiftManagement />;
    if (activePage === 'APPROVALS') return <ManagerDashboard />;
    if (activePage === 'PAYROLL_EXPORT') return <PayrollDashboard />;
    if (activePage === 'AUDIT_TRAIL') return <AuditTrailPage />;
    if (activePage === 'MY_REQUESTS') return <MyRequestsPage />;

    // Default role-specific dashboard
    if (!user) return <EmployeeDashboard />;
    switch (user.role) {
      case 'MANAGER': return <ManagerDashboard />;
      case 'HR_ADMIN':
      case 'SUPER_ADMIN': return <HRAdminDashboard />;
      case 'PAYROLL_AUDITOR': return <PayrollDashboard />;
      case 'EMPLOYEE':
      default: return <EmployeeDashboard />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      {/* Desktop Navbar */}
      <div className="desktop-only">
        <Navbar activePage={activePage} setActivePage={setActivePage} />
      </div>

      {/* Mobile Header */}
      <MobileHeader activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <div className="app-content-wrapper">
        {/* Desktop Sidebar */}
        {activePage !== 'KIOSK' && (
          <div className="desktop-only">
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
          </div>
        )}

        {/* Page Content */}
        <main className="app-main-content">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
}
