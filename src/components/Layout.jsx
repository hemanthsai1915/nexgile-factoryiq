import React, { useState, useRef, useEffect } from 'react';
import { ROLE_MODULES, ROLE_LABELS } from '../data/users';
import { logout } from '../data/users';

const NAV = [
  { section: 'Overview',   items: [{ icon: '◈', label: 'Dashboard', id: 'dashboard' }] },
  { section: 'Modules', items: [
    { icon: '⬡', label: 'Program Tracking', id: 'programs', badge: null },
    { icon: '⬡', label: 'Production',        id: 'production', badge: null },
    { icon: '⬡', label: 'Quality / NCR',     id: 'quality',  badge: 3 },
    { icon: '⬡', label: 'Supply Chain',      id: 'supply',   badge: null },
    { icon: '⬡', label: 'After-Sales / RMA', id: 'aftersales', badge: 7 },
    { icon: '⬡', label: 'Documents',         id: 'documents', badge: null },
  ]},
  { section: 'Analytics', items: [
    { icon: '⬡', label: 'SPC & Defects',  id: 'spc',      badge: null },
    { icon: '⬡', label: 'Capacity View',  id: 'capacity', badge: null },
    { icon: '⬡', label: 'Forecasting',    id: 'forecast', badge: null },
  ]},
  { section: 'Settings', items: [
    { icon: '⬡', label: 'Role Config', id: 'roles',  badge: null },
    { icon: '⬡', label: 'Audit Logs',  id: 'audit',  badge: null },
  ]},
];

function filterNavByRole(role) {
  const allowed = new Set(ROLE_MODULES[role || ''] || ['dashboard']);
  return NAV.map(({ section, items }) => ({
    section,
    items: items.filter(item => allowed.has(item.id)),
  })).filter(s => s.items.length > 0);
}

export function Topbar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const now = new Date().toLocaleString('en-IN', { weekday:'short', day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  const roleLabel = user?.role ? (ROLE_LABELS[user.role] || user.name || user.role) : '';
  const initials = roleLabel ? roleLabel.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'US' : 'US';
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: 52,
      background: 'rgba(10,12,15,0.94)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(14px)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28,
          background: '#00e5a0',
          clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
          animation: 'pulseRing 3s ease-in-out infinite',
        }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, letterSpacing: 0 }}>
            Nexgile <span style={{ color: '#00e5a0' }}>—</span> FactoryIQ
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            Manufacturing Excellence Portal
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 20,
          border: '1px solid rgba(0,229,160,0.3)',
          fontSize: 12, letterSpacing: '0.03em', color: '#00e5a0', textTransform: 'uppercase',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5a0', animation: 'blink 2s ease-in-out infinite' }} />
          All Systems Nominal
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{now}</div>
        <div ref={ref} style={{ position: 'relative' }}>
          <div
            onClick={() => setOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 10px', borderRadius: 6,
              background: open ? 'var(--surface3)' : 'var(--surface2)',
              border: '1px solid var(--border)', cursor: 'pointer',
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'linear-gradient(135deg,#0084ff,#00e5a0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#000',
            }}>{initials}</div>
            <span style={{ fontSize: 14 }}>{user?.name || 'User'}</span>
          <span style={{ color: 'var(--muted)', fontSize: 12, transform: open ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 0.15s' }}>▾</span>
          </div>
          {open && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              minWidth: 160,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              overflow: 'hidden', zIndex: 200,
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{roleLabel}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Mock session · Local storage</div>
              </div>
              <div
                onClick={() => { setOpen(false); logout(); onLogout?.(); }}
                style={{
                  padding: '10px 14px', cursor: 'pointer', fontSize: 12,
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: '#ff4757',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,71,87,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                Log out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function Sidebar({ role, active, onChange }) {
  const filteredNav = filterNavByRole(role || 'admin');
  return (
    <nav style={{
      width: 220, flexShrink: 0,
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      padding: '18px 0', position: 'sticky', top: 52,
      height: 'calc(100vh - 52px)', overflowY: 'auto',
    }}>
      {filteredNav.map(({ section, items }, si) => (
        <div key={section}>
          {si > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '10px 16px' }} />}
          <div style={{ padding: '0 16px 10px' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8, paddingLeft: 8 }}>
              {section}
            </div>
            {items.map(item => {
              const isActive = active === item.id;
              return (
                <div key={item.id} onClick={() => onChange(item.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                  marginBottom: 2,
                  background: isActive ? 'rgba(0,229,160,0.08)' : 'transparent',
                  color: isActive ? '#00e5a0' : 'var(--muted)',
                  border: isActive ? '1px solid rgba(0,229,160,0.2)' : '1px solid transparent',
                  transition: 'all 0.15s',
                  animation: 'slideIn 0.3s ease both',
                }}>
                  <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ fontSize: 14, flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 11,
                      background: 'rgba(255,71,87,0.18)', color: '#ff4757',
                      border: '1px solid rgba(255,71,87,0.3)',
                    }}>{item.badge}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
