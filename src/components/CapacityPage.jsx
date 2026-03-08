import React from 'react';
import { Panel, PanelHeader, Sparkline, Btn, GlobalFilterModal } from './ui';
import { linePerformance } from '../data';

export default function CapacityPage() {
  const capacityData = [
    { site: 'Hyderabad', lines: 4, util: 87, trend: [75, 78, 82, 80, 85, 88, 87] },
    { site: 'Pune', lines: 2, util: 72, trend: [68, 70, 65, 72, 74, 71, 72] },
    { site: 'Chennai', lines: 3, util: 91, trend: [85, 88, 90, 89, 91, 92, 91] },
    { site: 'Bangalore', lines: 2, util: 68, trend: [62, 65, 70, 66, 68, 69, 68] },
  ];
  const [showFilter, setShowFilter] = React.useState(false);
  const [globalFilters, setGlobalFilters] = React.useState({
    site: '',
  });

  const visibleCapacity = capacityData.filter(c => !globalFilters.site || c.site.toLowerCase().includes(globalFilters.site.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Capacity View</h1>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Site/line capacity, changeover scheduling, constraint analysis</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Panel>
          <PanelHeader dotColor="#ffd166" title="Site Capacity Utilization">
            <Btn onClick={() => setShowFilter(true)} style={{ fontSize: 11, padding: '4px 10px' }}>⚙ Filters</Btn>
          </PanelHeader>
          <div style={{ padding: 16 }}>
            {visibleCapacity.map(c => (
              <div key={c.site} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 90, fontSize: 13 }}>{c.site}</div>
                <Sparkline data={c.trend} color={c.util >= 85 ? '#00e5a0' : c.util >= 70 ? '#ffd166' : '#ff4757'} width={120} />
                <div style={{ width: 60, fontSize: 14, fontWeight: 600, color: c.util >= 85 ? '#00e5a0' : c.util >= 70 ? '#ffd166' : '#ff4757', textAlign: 'right' }}>{c.util}%</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.lines} lines</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHeader dotColor="#00e5a0" title="Line OEE">
            <Btn onClick={() => setShowFilter(true)} style={{ fontSize: 11, padding: '4px 10px' }}>⚙ Filters</Btn>
          </PanelHeader>
          <div style={{ padding: 16 }}>
            {linePerformance.map(l => (
              <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, fontSize: 13, color: 'var(--muted)' }}>{l.name}</div>
                <Sparkline data={l.trend} color={l.color} width={80} />
                <div style={{ fontSize: 14, fontWeight: 600, color: l.color, minWidth: 44 }}>{l.oee}%</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <GlobalFilterModal 
        open={showFilter} 
        onClose={() => setShowFilter(false)} 
        filters={globalFilters} 
        onApply={(f) => setGlobalFilters(f)} 
      />
    </div>
  );
}
