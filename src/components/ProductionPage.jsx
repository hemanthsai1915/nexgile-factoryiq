import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Panel, PanelHeader, Pill, Sparkline, Btn, GlobalFilterModal, ActiveFiltersIndicator } from './ui';
import { productionData, linePerformance } from '../data';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

export default function ProductionPage() {
  const [showFilter, setShowFilter] = React.useState(false);
  const [globalFilters, setGlobalFilters] = React.useState({
    line: '',
  });

  const visiblePerformance = linePerformance.filter(l => !globalFilters.line || l.name.toLowerCase().includes(globalFilters.line.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Production Visibility</h1>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Real-time line dashboards, WIP, AOI/X-ray, capacity · Multi-site</div>
      </div>
      <Panel style={{ marginBottom: 20 }}>
        <PanelHeader dotColor="#0084ff" title="Output vs Plan · Week 10">
          <ActiveFiltersIndicator filters={globalFilters} onClear={() => setGlobalFilters({ line: '' })} />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Btn onClick={() => setShowFilter(true)} style={{ fontSize: 11, padding: '4px 10px' }}>⚙ Filters</Btn>
            <Pill active>Daily</Pill><Pill>Weekly</Pill>
          </div>
        </PanelHeader>
        <div style={{ padding: 16 }}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={productionData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(30,37,48,0.8)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#5a6680' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#5a6680' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="plan" name="Plan" fill="rgba(90,102,128,0.3)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="actual" name="Actual" radius={[3, 3, 0, 0]}>
                {productionData.map((d, i) => (
                  <Cell key={i} fill={d.actual >= d.plan ? '#00e5a0' : d.actual >= d.plan * 0.85 ? '#ffd166' : '#ff4757'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px 0', borderTop: '1px solid var(--border)' }}>
            {[['Yield (FPY)', '93.4%', '#00e5a0'], ['Rework', '4.1%', '#ffd166'], ['Scrap', '2.5%', '#ff4757'], ['Throughput', '418/d', 'var(--text)']].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
      <Panel>
        <PanelHeader dotColor="#00e5a0" title="Line OEE">
          <Btn onClick={() => setShowFilter(true)} style={{ fontSize: 11, padding: '4px 10px' }}>⚙ Filters</Btn>
        </PanelHeader>
        <div style={{ padding: 16 }}>
          {visiblePerformance.map(l => (
            <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 120, fontSize: 13, color: 'var(--muted)' }}>{l.name}</div>
              <Sparkline data={l.trend} color={l.color} width={120} />
              <div style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: l.color }}>{l.oee}%</div>
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
