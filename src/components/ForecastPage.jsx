import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import { Panel, PanelHeader, StatusBadge, Btn, GlobalFilterModal, ActiveFiltersIndicator } from './ui';
import { forecastData } from '../data';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 12px', fontSize:11 }}>
      <div style={{ color:'var(--muted)', marginBottom:4 }}>{label}</div>
      {payload.map(p => p.value != null && (
        <div key={p.name} style={{ color:p.color }}>{p.name}: {p.value?.toLocaleString()}</div>
      ))}
    </div>
  );
};

export default function ForecastPage() {
  const [showFilter, setShowFilter] = React.useState(false);
  const [globalFilters, setGlobalFilters] = React.useState({
    dateRange: '',
  });

  const visibleForecast = forecastData.filter(f => !globalFilters.dateRange || f.month.toLowerCase().includes(globalFilters.dateRange.toLowerCase()));
  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, letterSpacing:'-0.5px' }}>
          Forecast <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:'italic', color:'#0084ff' }}>& Capacity</span>
        </h1>
        <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>Customer forecast · MRP · Capacity commitments · EOL planning</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[['Forecast Accuracy','96.2%','#00e5a0'],['MRP Output','2,600 u','#0084ff'],['Capacity Util.','78%','#ffd166'],['EOL Items','7','#ff4757']].map(([l,v,c]) => (
          <div key={l} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'14px 16px', animation:'fadeUp 0.4s ease both' }}>
            <div style={{ fontSize:9, letterSpacing:'0.02em', textTransform:'uppercase', color:'var(--muted)', marginBottom:8 }}>{l}</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:c }}>{v}</div>
          </div>
        ))}
      </div>

      <Panel style={{ marginBottom:16 }}>
        <PanelHeader dotColor="#0084ff" title="Forecast vs Actuals — Monthly Units">
          <ActiveFiltersIndicator filters={globalFilters} onClear={() => setGlobalFilters({ dateRange: '' })} />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Btn onClick={() => setShowFilter(true)} style={{ fontSize: 11, padding: '4px 10px' }}>⚙ Filters</Btn>
            <span style={{ fontSize:10, color:'var(--muted)' }}>Oct 2025 – May 2026</span>
          </div>
        </PanelHeader>
        <div style={{ padding:'12px 8px 16px 0' }}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={visibleForecast} margin={{ top:8, right:20, left:-10, bottom:0 }}>
              <defs>
                <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0084ff" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0084ff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5a0" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00e5a0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(30,37,48,0.8)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'#5a6680' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:9, fill:'#5a6680' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:11, color:'var(--muted)', paddingLeft:16 }} />
              <Area type="monotone" dataKey="forecast"  name="Forecast"   stroke="#0084ff" fill="url(#gradForecast)" strokeWidth={1.5} strokeDasharray="5 3" />
              <Area type="monotone" dataKey="committed" name="Committed"  stroke="#ff6b35" fill="none" strokeWidth={1.5} strokeDasharray="3 3" />
              <Area type="monotone" dataKey="actual"    name="Actual"     stroke="#00e5a0" fill="url(#gradActual)"    strokeWidth={2} connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Panel>
          <PanelHeader dotColor="#ff4757" title="EOL / Obsolescence Tracker" />
          <div style={{ padding:'12px 16px' }}>
            {[
              { part:'IC-4401 FPGA', status:'NRND', ltb:'LTB Open', stock:'1,200 u', color:'red' },
              { part:'CAP-882 10µF', status:'EOL', ltb:'Redesign', stock:'340 u',   color:'red' },
              { part:'CON-221 USB-C',status:'Active → EOL', ltb:'LTB 2026-Q3', stock:'5,000 u', color:'yellow' },
              { part:'MCU-7700',     status:'Active',  ltb:'N/A', stock:'8,400 u',  color:'green' },
              { part:'OSC-33MHz',    status:'NRND', ltb:'Alt sourcing', stock:'600 u', color:'yellow' },
            ].map(e => (
              <div key={e.part} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(30,37,48,0.5)' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, color:'var(--text)' }}>{e.part}</div>
                  <div style={{ fontSize:10, color:'var(--muted)' }}>{e.ltb} · Stock: {e.stock}</div>
                </div>
                <StatusBadge color={e.color}>{e.status}</StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader dotColor="#ffd166" title="Capacity Utilisation by Site" />
          <div style={{ padding:'12px 8px 16px 0' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { site:'Hyderabad', util:78, capacity:100 },
                { site:'Pune',      util:91, capacity:100 },
                { site:'Bangalore', util:55, capacity:100 },
                { site:'Chennai',   util:82, capacity:100 },
              ]} margin={{ top:4, right:16, left:-20, bottom:0 }} layout="vertical">
                <CartesianGrid stroke="rgba(30,37,48,0.8)" horizontal={false} />
                <XAxis type="number" domain={[0,100]} tick={{ fontSize:9, fill:'#5a6680' }} axisLine={false} tickLine={false} unit="%" />
                <YAxis dataKey="site" type="category" tick={{ fontSize:10, fill:'#5a6680' }} axisLine={false} tickLine={false} width={75} />
                <Tooltip contentStyle={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, fontSize:11 }} />
                <Bar dataKey="util" name="Utilisation %" radius={[0,3,3,0]}>
                  {[78,91,55,82].map((v,i) => <Cell key={i} fill={v>85?'#ff4757':v>70?'#ffd166':'#00e5a0'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
