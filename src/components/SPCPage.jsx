import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { Panel, PanelHeader, Btn, GlobalFilterModal } from './ui';
import { spcData, defectData, heatmapData } from '../data';

const RCOLORS = ['#ff4757', '#ffd166', '#0084ff', '#00e5a0'];

export default function SPCPage() {
  const [hovered, setHovered] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [globalFilters, setGlobalFilters] = useState({
    station: '',
  });

  const visibleDefects = defectData.filter(d => !globalFilters.station || d.name.toLowerCase().includes(globalFilters.station.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 6 }}>SPC & Defect Analytics</h1>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Control charts, Cp/Cpk trends, escaped defects, yield analytics</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        <Panel>
          <PanelHeader dotColor="#ffd166" title="Cpk Control Chart · Station 7">
            <Btn onClick={() => setShowFilter(true)} style={{ fontSize: 11, padding: '4px 10px' }}>⚙ Filters</Btn>
          </PanelHeader>
          <div style={{ padding: 16 }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={spcData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(30,37,48,0.6)" vertical={false} />
                <XAxis dataKey="point" tick={{ fontSize: 10, fill: '#5a6680' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0.8, 2]} tick={{ fontSize: 10, fill: '#5a6680' }} axisLine={false} tickLine={false} />
                <Tooltip content={({ active, payload }) => active && payload?.[0] && (
                  <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 12 }}>
                    Point {payload[0].payload.point}: {payload[0].value?.toFixed(3)}
                  </div>
                )} />
                <ReferenceLine y={1.67} stroke="#ff4757" strokeDasharray="4 4" />
                <ReferenceLine y={0.99} stroke="#ff4757" strokeDasharray="4 4" />
                <ReferenceLine y={1.33} stroke="#00e5a0" strokeDasharray="2 2" />
                <Line type="monotone" dataKey="value" stroke="#ffd166" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, color: 'var(--muted)' }}>
              <span>UCL: 1.67</span><span>LCL: 0.99</span><span>Target Cpk: 1.33</span>
            </div>
          </div>
        </Panel>
        <Panel>
          <PanelHeader dotColor="#ff4757" title="Defect Distribution">
            <Btn onClick={() => setShowFilter(true)} style={{ fontSize: 11, padding: '4px 10px' }}>⚙ Filters</Btn>
          </PanelHeader>
          <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 100, height: 100 }} />
            <div style={{ flex: 1 }}>
              {visibleDefects.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: RCOLORS[i] }} />
                  <span style={{ flex: 1 }}>{d.name}</span>
                  <span style={{ color: 'var(--muted)' }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
        <Panel style={{ gridColumn: '1 / -1' }}>
          <PanelHeader dotColor="#ff4757" title="Defect Station Heatmap — Line 3 · Last 30 days" />
          <div style={{ padding: '8px 16px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4 }}>
              {heatmapData.map((v, i) => (
                <div key={i} title={`Defect rate: ${Math.round(v * 100)}%`}
                  onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                  style={{
                    height: 24, borderRadius: 4, cursor: 'pointer',
                    background: `rgba(255,71,87,${v})`,
                    border: hovered === i ? '1px solid #ff4757' : '1px solid transparent',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 11, color: 'var(--muted)' }}>
              <span>Low</span>{[0.1, 0.3, 0.55, 0.8, 1].map(v => <div key={v} style={{ width: 16, height: 16, borderRadius: 2, background: `rgba(255,71,87,${v})` }} />)}<span>High</span>
            </div>
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
