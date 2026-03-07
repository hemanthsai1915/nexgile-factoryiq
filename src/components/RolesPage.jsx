import React from 'react';
import { Panel, PanelHeader } from './ui';
import { ROLES, ROLE_MODULES } from '../data/users';

export default function RolesPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Role Configuration</h1>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Role-based views, permissions, and access management</div>
      </div>
      <Panel>
        <PanelHeader dotColor="#5a6680" title="Roles & Module Access" />
        <div style={{ padding: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>Role</th>
                <th style={{ textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>Modules</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map(r => (
                <tr key={r.value} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} style={{ cursor: 'default' }}>
                  <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 500 }}>{r.label}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--muted)' }}>
                    {(ROLE_MODULES[r.value] || []).join(' · ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
