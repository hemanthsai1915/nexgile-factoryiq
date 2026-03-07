import React, { useState, useEffect } from 'react';
import { Topbar, Sidebar } from './components/Layout';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import QualityPage from './components/QualityPage';
import ForecastPage from './components/ForecastPage';
import DocumentsPage from './components/DocumentsPage';
import SupplyPage from './components/SupplyPage';
import ProgramsPage from './components/ProgramsPage';
import ProductionPage from './components/ProductionPage';
import AftersalesPage from './components/AftersalesPage';
import SPCPage from './components/SPCPage';
import CapacityPage from './components/CapacityPage';
import RolesPage from './components/RolesPage';
import AuditPage from './components/AuditPage';
import { getStoredUser, ROLE_MODULES } from './data/users';

const PAGE_MAP = {
  dashboard:  null,
  programs:   <ProgramsPage />,
  production: <ProductionPage />,
  quality:    <QualityPage />,
  supply:     <SupplyPage />,
  aftersales: <AftersalesPage />,
  documents:  <DocumentsPage />,
  spc:        <SPCPage />,
  capacity:   <CapacityPage />,
  forecast:   <ForecastPage />,
  roles:      <RolesPage />,
  audit:      <AuditPage />,
};

export default function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  function handleLogin(userData) {
    setUser(userData || getStoredUser());
    setActivePage('dashboard');
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div style={{ position:'relative', zIndex:1 }}>
      <Topbar user={user} onLogout={() => setUser(null)} />
      <div style={{ display:'flex', minHeight:'calc(100vh - 52px)' }}>
        <Sidebar role={user.role} active={activePage} onChange={setActivePage} />
        <main style={{ flex:1, padding:28, overflowX:'hidden', maxWidth:'100%', minWidth:0 }}>
          {(() => {
            const allowed = ROLE_MODULES[user.role] || ['dashboard'];
            const page = allowed.includes(activePage) ? activePage : 'dashboard';
            return page === 'dashboard' ? <Dashboard role={user.role} /> : (PAGE_MAP[page] ?? <Dashboard role={user.role} />);
          })()}

          {/* Footer */}
          <div style={{
            marginTop:28, paddingTop:16,
            borderTop:'1px solid var(--border)',
            display:'flex', justifyContent:'space-between',
            fontSize:13, color:'var(--muted)', letterSpacing: 0,
          }}>
            <span>Nexgile – FactoryIQ © 2026 · Manufacturing Excellence Portal v2.4.1</span>
            <span>Functional Requirements Prototype · No DB · Local React App</span>
            <span>Role: {user.name || user.role}</span>
          </div>
        </main>
      </div>
    </div>
  );
}
