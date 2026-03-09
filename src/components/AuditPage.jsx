import React from 'react';
import { Panel, PanelHeader, Btn, GlobalFilterModal, ActiveFiltersIndicator } from './ui';
import { auditLogs } from '../data';

export default function AuditPage() {
  const [showFilter, setShowFilter] = React.useState(false);
  const [globalFilters, setGlobalFilters] = React.useState({
    user: '',
    action: '',
  });

  const visibleLogs = auditLogs.filter(a => {
    let match = true;
    if (globalFilters.user && !a.user.toLowerCase().includes(globalFilters.user.toLowerCase())) match = false;
    if (globalFilters.action && !a.action.toLowerCase().includes(globalFilters.action.toLowerCase())) match = false;
    return match;
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Audit Logs</h1>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Full audit trail for portal actions, document changes, approvals</div>
      </div>
      <Panel>
        <PanelHeader dotColor="#5a6680" title="Recent Activity">
          <ActiveFiltersIndicator filters={globalFilters} onClear={() => setGlobalFilters({ user: '', action: '' })} />
          <Btn onClick={() => setShowFilter(true)} style={{ fontSize: 11, padding: '4px 10px' }}>⚙ Filters</Btn>
        </PanelHeader>
        <div style={{ padding: 0 }}>
          {visibleLogs.map(a => (
            <div key={a.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '12px 16px', borderBottom: '1px solid var(--border)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ width: 100, fontSize: 13, fontWeight: 500 }}>{a.user}</div>
              <div style={{ flex: 1, fontSize: 13 }}>{a.action}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.target}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{a.time}</div>
            </div>
          ))}
        </div>
      </Panel>
      <GlobalFilterModal 
        open={showFilter} 
        onClose={() => setShowFilter(false)} 
        filters={globalFilters} 
        onApply={(f) => setGlobalFilters(f)} 
      />
    </div>
  );
}
