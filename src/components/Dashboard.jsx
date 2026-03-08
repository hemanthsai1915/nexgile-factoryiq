import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import {
  Panel, PanelHeader, StatusBadge, ProgressBar, Pill,
  Sparkline, SectionLabel, Divider, TabBar, Btn, Toast, exportToCsv, GlobalFilterModal
} from './ui';
import {
  kpiData, programs, productionData, linePerformance,
  defectData, alerts, suppliers, rmaList, documents, ganttItems, heatmapData,
  forecastData,
} from '../data';
import { projects, supplyChainOrders, shipments } from '../data/mockData';
import { ROLE_DASHBOARD_WIDGETS } from '../data/users';

// ── Status mapping ─────────────────────────────────────────────────────────────
const statusMap = {
  'on-track':  { color: 'green',  label: 'On Track'  },
  'at-risk':   { color: 'yellow', label: 'At Risk'   },
  'in-design': { color: 'blue',   label: 'In Design' },
  'delayed':   { color: 'red',    label: 'Delayed'   },
};

const progressColor = { 'on-track':'#00e5a0','at-risk':'#ffd166','in-design':'#0084ff','delayed':'#ff4757' };

// ── Custom tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'var(--surface2)', border:'1px solid var(--border)',
      borderRadius:6, padding:'8px 12px', fontSize:11, color:'var(--text)',
    }}>
      <div style={{ color:'var(--muted)', marginBottom:4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

// ── KPI Strip ──────────────────────────────────────────────────────────────────
function KpiStrip() {
  const topColors = { green:'#00e5a0', blue:'#0084ff', yellow:'#ffd166', orange:'#ff6b35', red:'#ff4757' };
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }}>
      {kpiData.map((k, i) => (
        <div key={k.label} style={{
          background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8,
          padding:'18px 20px', position:'relative', overflow:'hidden',
          animation:`fadeUp 0.4s ease ${i*0.07}s both`, cursor:'default',
          transition:'transform 0.15s, border-color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
        >
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:topColors[k.color] }} />
          <div style={{ fontSize:12, letterSpacing:'0.03em', textTransform:'uppercase', color:'var(--muted)', marginBottom:10, lineHeight:1.4 }}>{k.label}</div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:30, fontWeight:800, color:topColors[k.color], lineHeight:1.2, marginBottom:8 }}>{k.value}</div>
          <div style={{ fontSize:13, lineHeight:1.5, color: k.deltaUp ? '#00e5a0' : '#ff4757' }}>
            {k.deltaUp ? '↑' : '↑'} {k.delta}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Programs Panel ─────────────────────────────────────────────────────────────
function ProgramsPanel({ globalFilters }) {
  const [filter, setFilter] = useState('All');
  const phases = ['All','R&D','NPI','Production'];
  let filtered = filter === 'All' ? programs : programs.filter(p => p.phase === filter);
  if (globalFilters?.site) {
    filtered = filtered.filter(p => p.site?.toLowerCase().includes(globalFilters.site.toLowerCase()));
  }
  return (
    <Panel>
      <PanelHeader dotColor="#00e5a0" title="Program / Project Tracking">
        {phases.map(p => <Pill key={p} active={filter===p} onClick={() => setFilter(p)}>{p}</Pill>)}
      </PanelHeader>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            {['Program','Phase','Site','Progress','Owner','Status'].map(h => (
              <th key={h} style={{ textAlign:'left', fontSize:12, letterSpacing:'0.03em', textTransform:'uppercase', color:'var(--muted)', padding:'10px 14px', borderBottom:'1px solid var(--border)', fontWeight:500 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => {
            const s = statusMap[p.status];
            return (
              <tr key={p.id} style={{ cursor:'pointer', transition:'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <td style={{ padding:'12px 14px', fontSize:14, fontWeight:500, lineHeight:1.5 }}>
                  <span style={{ color:'var(--muted)', fontSize:12, marginRight:8 }}>{p.id}</span>{p.name}
                </td>
                <td style={{ padding:'12px 14px', fontSize:13, color:'var(--muted)', lineHeight:1.5 }}>{p.phase}</td>
                <td style={{ padding:'12px 14px', fontSize:13, color:'var(--muted)', lineHeight:1.5 }}>{p.site}</td>
                <td style={{ padding:'10px 14px' }}>
                  <ProgressBar value={p.progress} color={progressColor[p.status]} width={90} />
                </td>
                <td style={{ padding:'12px 14px', fontSize:13, color:'var(--muted)', lineHeight:1.5 }}>{p.owner}</td>
                <td style={{ padding:'10px 14px' }}><StatusBadge color={s.color}>{s.label}</StatusBadge></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Panel>
  );
}

// ── Alerts Panel ───────────────────────────────────────────────────────────────
function AlertsPanel({ globalFilters }) {
  const bgMap = { crit:'rgba(255,71,87,0.1)', warn:'rgba(255,209,102,0.1)', info:'rgba(0,132,255,0.1)', ok:'rgba(0,229,160,0.1)' };
  let filteredAlerts = alerts;
  if (globalFilters?.site) {
    filteredAlerts = filteredAlerts.filter(a => a.meta?.toLowerCase().includes(globalFilters.site.toLowerCase()) || a.title?.toLowerCase().includes(globalFilters.site.toLowerCase()));
  }
  return (
    <Panel>
      <PanelHeader dotColor="#ff4757" title="Active Alerts & NCR Queue">
        <Pill active>{filteredAlerts.length} Open</Pill>
      </PanelHeader>
      <div style={{ padding:'4px 0' }}>
        {filteredAlerts.map(a => (
          <div key={a.id} style={{
            display:'flex', alignItems:'flex-start', gap:10,
            padding:'10px 16px', borderBottom:'1px solid rgba(30,37,48,0.5)',
            cursor:'pointer', transition:'padding-left 0.15s, background 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.paddingLeft='22px'; e.currentTarget.style.background='var(--surface2)'; }}
          onMouseLeave={e => { e.currentTarget.style.paddingLeft='16px'; e.currentTarget.style.background='transparent'; }}
          >
            <div style={{ width:24, height:24, borderRadius:6, background:bgMap[a.type], display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>{a.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:'var(--text)', marginBottom:2 }}>{a.title}</div>
              <div style={{ fontSize:10, color:'var(--muted)' }}>{a.meta}</div>
            </div>
            <div style={{ fontSize:10, color:'var(--muted)', whiteSpace:'nowrap' }}>{a.time}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ── Production Panel ───────────────────────────────────────────────────────────
function ProductionPanel() {
  const [tab, setTab] = useState('Output vs Plan');
  return (
    <Panel>
      <PanelHeader dotColor="#0084ff" title="Production Visibility · Multi-site">
        <Pill active>Daily</Pill><Pill>Weekly</Pill>
      </PanelHeader>
      <TabBar tabs={['Output vs Plan','WIP / Rework','Line OEE']} active={tab} onChange={setTab} />
      <div style={{ padding:'12px 0 4px' }}>
        {tab === 'Output vs Plan' && (
          <>
            <div style={{ padding:'0 16px 8px', fontSize:10, color:'var(--muted)', letterSpacing:0, textTransform:'uppercase' }}>Units / Day — Week 10</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={productionData} margin={{ top:4, right:16, left:-20, bottom:0 }}>
                <CartesianGrid stroke="rgba(30,37,48,0.8)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize:10, fill:'#5a6680' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:9, fill:'#5a6680' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="plan"   name="Plan"   fill="rgba(90,102,128,0.3)" radius={[3,3,0,0]} />
                <Bar dataKey="actual" name="Actual" radius={[3,3,0,0]}>
                  {productionData.map((d, i) => (
                    <Cell key={i} fill={d.actual >= d.plan ? '#00e5a0' : d.actual >= d.plan*0.85 ? '#ffd166' : '#ff4757'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
        {tab === 'WIP / Rework' && (
          <div style={{ padding:'0 16px' }}>
            {[{label:'WIP Units',value:'124',color:'#0084ff'},{label:'In Rework',value:'18',color:'#ffd166'},{label:'Scrap Today',value:'7',color:'#ff4757'},{label:'Bottleneck',value:'Station 7',color:'#ff6b35'}].map(m => (
              <div key={m.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(30,37,48,0.5)' }}>
                <span style={{ fontSize:12, color:'var(--muted)' }}>{m.label}</span>
                <span style={{ fontSize:14, fontFamily:"'Syne',sans-serif", fontWeight:700, color:m.color }}>{m.value}</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'Line OEE' && (
          <div style={{ padding:'0 16px' }}>
            {linePerformance.map(l => (
              <div key={l.name} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(30,37,48,0.5)' }}>
                <div style={{ width:110, fontSize:11, color:'var(--muted)', flexShrink:0 }}>{l.name}</div>
                <Sparkline data={l.trend} color={l.color} width={100} />
                <div style={{ marginLeft:'auto', fontSize:12, fontWeight:600, color:l.color, minWidth:44, textAlign:'right' }}>{l.oee}%</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display:'flex', justifyContent:'space-around', padding:'10px 16px', borderTop:'1px solid var(--border)', marginTop:8 }}>
          {[['Yield (FPY)','93.4%','#00e5a0'],['Rework','4.1%','#ffd166'],['Scrap','2.5%','#ff4757'],['Throughput','418/d','var(--text)']].map(([l,v,c]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontSize:9, letterSpacing:0, color:'var(--muted)', textTransform:'uppercase', marginBottom:2 }}>{l}</div>
              <div style={{ fontSize:14, fontFamily:"'Syne',sans-serif", fontWeight:700, color:c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

// ── Quality Panel ──────────────────────────────────────────────────────────────
function QualityPanel() {
  const RCOLORS = ['#ff4757','#ffd166','#0084ff','#00e5a0'];
  return (
    <Panel>
      <PanelHeader dotColor="#ffd166" title="Quality & Compliance" />
      <div style={{ padding:'14px 16px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
          {[['Cpk avg','1.42','#00e5a0','Target ≥1.33'],['Escaped Defects','3','#ff4757','MTD · Target 0'],['CAPA Open','5','#ffd166','2 overdue'],['Cert Coverage','100%','#0084ff','IATF·FDA·AS91']].map(([l,v,c,sub]) => (
            <div key={l} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, padding:'10px 12px' }}>
              <div style={{ fontSize:9, letterSpacing:0, textTransform:'uppercase', color:'var(--muted)', marginBottom:5 }}>{l}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:c }}>{v}</div>
              <div style={{ fontSize:10, color:'var(--muted)', marginTop:2 }}>{sub}</div>
            </div>
          ))}
        </div>
        <SectionLabel>Defect Distribution</SectionLabel>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <PieChart width={90} height={90}>
            <Pie data={defectData} cx={40} cy={40} innerRadius={26} outerRadius={40} dataKey="value" strokeWidth={0}>
              {defectData.map((_, i) => <Cell key={i} fill={RCOLORS[i]} />)}
            </Pie>
          </PieChart>
          <div style={{ flex:1 }}>
            {defectData.map((d, i) => (
              <div key={d.name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, fontSize:11 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:RCOLORS[i], flexShrink:0 }} />
                <span style={{ flex:1, color:'var(--text2)' }}>{d.name}</span>
                <span style={{ color:'var(--muted)', fontSize:10 }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ── Supply Chain Panel ─────────────────────────────────────────────────────────
function SupplyPanel() {
  return (
    <Panel>
      <PanelHeader dotColor="#ff6b35" title="Supply Chain & Materials" />
      <div style={{ padding:'12px 0' }}>
        <div style={{ padding:'0 16px 10px' }}>
          <SectionLabel>Supplier Scorecard</SectionLabel>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Supplier','Score','Lead Time'].map(h => (
                  <th key={h} style={{ textAlign:'left', fontSize:12, letterSpacing:'0.03em', textTransform:'uppercase', color:'var(--muted)', padding:'8px 0 10px', fontWeight:500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.name} style={{ cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <td style={{ padding:'10px 0', fontSize:14, lineHeight:1.5 }}>{s.name}</td>
                  <td style={{ padding:'7px 8px' }}>
                    <div style={{ width:70, height:5, background:'var(--dim)', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ width:`${s.score}%`, height:'100%', background: s.score>=90?'#00e5a0':s.score>=80?'#ffd166':'#ff4757', borderRadius:3 }} />
                    </div>
                  </td>
                  <td style={{ padding:'10px 0', fontSize:13, color:s.ltColor, lineHeight:1.5 }}>{s.leadTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Divider style={{ margin:'0 16px' }} />
        <div style={{ padding:'10px 16px 0' }}>
          <SectionLabel>Inventory Status</SectionLabel>
          {[['Global Stock','Healthy','green'],['Consignment','$2.1M','blue'],['Min/Max Breaches','2 items','yellow'],['EOL/NRND Parts','7 at risk','red'],['Open POs','34 active','green']].map(([l,v,c]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid rgba(30,37,48,0.5)' }}>
              <span style={{ fontSize:13, color:'var(--muted)', lineHeight:1.5 }}>{l}</span>
              <StatusBadge color={c}>{v}</StatusBadge>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

// ── Gantt Panel ────────────────────────────────────────────────────────────────
function GanttPanel() {
  const months = ['JAN','FEB','MAR','APR'];
  return (
    <Panel>
      <PanelHeader dotColor="#00e5a0" title="Planned vs Actual — Milestone Gantt">
        <Pill active>Q1 2026</Pill><Pill>Q2 2026</Pill>
      </PanelHeader>
      <div style={{ padding:'12px 16px 6px', display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--muted)', letterSpacing:'0.03em' }}>
        {months.map(m => <span key={m}>{m}</span>)}
      </div>
      <div style={{ padding:'4px 16px 16px' }}>
        {ganttItems.map((item, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', height:34, position:'relative', borderBottom:'1px solid rgba(30,37,48,0.4)' }}>
            <div style={{ width:130, flexShrink:0, fontSize:13, color:'var(--muted)', paddingRight:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.5 }}>{item.label}</div>
            <div style={{ flex:1, position:'relative', height:'100%', display:'flex', alignItems:'center' }}>
              {/* Today line at 52% */}
              <div style={{ position:'absolute', left:'52%', top:0, bottom:0, width:1, background:'rgba(255,107,53,0.6)' }}>
                <span style={{ position:'absolute', top:3, left:3, fontSize:10, color:'#ff6b35', letterSpacing:'0.03em', whiteSpace:'nowrap' }}>TODAY</span>
              </div>
              <div style={{
                position:'absolute', left:`${item.left}%`, width:`${item.width}%`,
                height:18, borderRadius:3, background:item.bg,
                border:`1px solid ${item.color}40`,
                display:'flex', alignItems:'center', paddingLeft:6,
                fontSize:12, color:item.color, fontWeight:500, letterSpacing:0,
                overflow:'hidden', whiteSpace:'nowrap', cursor:'pointer',
                transition:'filter 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.filter='brightness(1.3)'}
              onMouseLeave={e => e.currentTarget.style.filter='brightness(1)'}
              >
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ── RMA Panel ──────────────────────────────────────────────────────────────────
function RMAPanel() {
  const badgeColorMap = { red:'red', yellow:'yellow', blue:'blue', green:'green' };
  const [toast, setToast] = useState('');
  return (
    <Panel>
      <PanelHeader dotColor="#ff6b35" title="After-Sales Service · RMA / Warranty">
        <Btn
          style={{ fontSize:13, padding:'6px 14px' }}
          onClick={() => setToast('Open the After-Sales / RMA module to manage full RMA intake and workflow.')}
        >
          + New RMA
        </Btn>
      </PanelHeader>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1px solid var(--border)' }}>
        <div style={{ padding:'18px 16px', borderRight:'1px solid var(--border)' }}>
          <div style={{ fontSize:12, letterSpacing:'0.03em', textTransform:'uppercase', color:'var(--muted)', marginBottom:8, lineHeight:1.4 }}>Open RMAs</div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:32, fontWeight:800, color:'#ff6b35' }}>31</div>
          <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.5 }}>7 pending triage · 4 in repair</div>
        </div>
        <div style={{ padding:'18px 16px' }}>
          <div style={{ fontSize:12, letterSpacing:'0.03em', textTransform:'uppercase', color:'var(--muted)', marginBottom:8, lineHeight:1.4 }}>Warranty Claims</div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:32, fontWeight:800, color:'#ffd166' }}>12</div>
          <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.5 }}>3 pending approval</div>
        </div>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            {['RMA ID','Product','Reason','Stage'].map(h => (
              <th key={h} style={{ textAlign:'left', fontSize:12, letterSpacing:'0.03em', textTransform:'uppercase', color:'var(--muted)', padding:'10px 14px', borderBottom:'1px solid var(--border)', fontWeight:500 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rmaList.map(r => (
            <tr key={r.id}
              onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
              style={{ cursor:'pointer', transition:'background 0.1s' }}
            >
              <td style={{ padding:'9px 14px', fontSize:11, color:'#0084ff' }}>{r.id}</td>
              <td style={{ padding:'9px 14px', fontSize:11 }}>{r.product}</td>
              <td style={{ padding:'9px 14px', fontSize:11, color:'var(--muted)' }}>{r.reason}</td>
              <td style={{ padding:'9px 14px' }}><StatusBadge color={badgeColorMap[r.stageBadge]}>{r.stage}</StatusBadge></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display:'flex', gap:16, padding:'10px 14px', borderTop:'1px solid var(--border)', fontSize:10, color:'var(--muted)' }}>
        <span>Spare Parts: <strong style={{ color:'#00e5a0' }}>In Stock</strong></span>
        <span>Avg TAT: <strong style={{ color:'var(--text)' }}>4.2 days</strong></span>
        <span>EOL LTB: <strong style={{ color:'#ffd166' }}>3 active</strong></span>
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </Panel>
  );
}

// ── Defect Heatmap ─────────────────────────────────────────────────────────────
function HeatmapPanel() {
  const [hovered, setHovered] = useState(null);
  return (
    <Panel>
      <PanelHeader dotColor="#ff4757" title="Defect Station Heatmap — Line 3">
        <span style={{ fontSize:10, color:'var(--muted)' }}>Last 30 days</span>
      </PanelHeader>
      <div style={{ padding:'8px 16px 2px', display:'flex', justifyContent:'space-between', fontSize:9, color:'var(--muted)', letterSpacing:0 }}>
        {['WEEK 1','WEEK 2','WEEK 3','WEEK 4'].map(w => <span key={w}>{w}</span>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(12,1fr)', gap:3, padding:'4px 16px 8px' }}>
        {heatmapData.map((v, i) => (
          <div key={i} title={`Defect rate: ${Math.round(v*100)}%`}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            style={{
              height:22, borderRadius:3, cursor:'pointer',
              background: `rgba(255,71,87,${v})`,
              border: hovered===i ? '1px solid #ff4757' : '1px solid transparent',
              transform: hovered===i ? 'scale(1.15)' : 'scale(1)',
              transition:'transform 0.1s, border-color 0.1s',
            }}
          />
        ))}
      </div>
      <div style={{ padding:'6px 16px 12px', display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--muted)' }}>
        <span>Low</span>
        {[0.1,0.3,0.55,0.8,1].map(v => (
          <div key={v} style={{ width:14, height:14, borderRadius:2, background:`rgba(255,71,87,${v})` }} />
        ))}
        <span>High</span>
      </div>
    </Panel>
  );
}

// ── Documents Panel ────────────────────────────────────────────────────────────
function DocsPanel({ globalFilters }) {
  const badgeMap = { green:'green', yellow:'yellow', red:'red', blue:'blue' };
  const [toast, setToast] = useState('');
  let filteredDocs = documents;
  if (globalFilters?.category) {
    filteredDocs = filteredDocs.filter(d => d.meta?.toLowerCase().includes(globalFilters.category.toLowerCase()) || d.title?.toLowerCase().includes(globalFilters.category.toLowerCase()));
  }
  return (
    <Panel>
      <PanelHeader dotColor="#0084ff" title="Documents, Collaboration & Knowledge">
        <Btn
          style={{ fontSize:13, padding:'6px 14px' }}
          onClick={() => setToast('Upload simulated – use the Documents module for full document creation and versioning.')}
        >
          ↑ Upload
        </Btn>
      </PanelHeader>
      <div style={{ padding:'12px 16px' }}>
        <SectionLabel>Recent Documents</SectionLabel>
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {filteredDocs.map(d => (
            <div key={d.title}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(0,132,255,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
              style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'9px 12px', background:'var(--surface2)',
                borderRadius:6, border:'1px solid var(--border)', cursor:'pointer',
                transition:'border-color 0.2s',
              }}
            >
              <div style={{ fontSize:18 }}>{d.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, color:'var(--text)', marginBottom:4, lineHeight:1.5 }}>{d.title}</div>
                <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.5 }}>{d.meta}</div>
              </div>
              <StatusBadge color={badgeMap[d.badge]}>{d.status}</StatusBadge>
            </div>
          ))}
        </div>
        <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)', display:'flex', gap:24, fontSize:13, color:'var(--muted)' }}>
          <span>Threads: <strong style={{ color:'var(--text)' }}>18 active</strong></span>
          <span>Reviews: <strong style={{ color:'#ffd166' }}>6 pending</strong></span>
          <span>KB Articles: <strong style={{ color:'#00e5a0' }}>142</strong></span>
        </div>
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </Panel>
  );
}

// ── Compact summary widgets for role-based dashboards ───────────────────────────
function ProjectsSummary({ globalFilters }) {
  let filteredProjects = projects;
  if (globalFilters?.site) {
    filteredProjects = filteredProjects.filter(p => p.site?.toLowerCase().includes(globalFilters.site.toLowerCase()));
  }
  return (
    <Panel>
      <PanelHeader dotColor="#00e5a0" title="My Programs" />
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            {['Program','Phase','Progress','Status'].map(h => (
              <th key={h} style={{ textAlign:'left', fontSize:10, letterSpacing:'0.03em', textTransform:'uppercase', color:'var(--muted)', padding:'8px 14px', borderBottom:'1px solid var(--border)', fontWeight:500 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredProjects.slice(0, 5).map(p => {
            const s = statusMap[p.status];
            return (
              <tr key={p.id} style={{ cursor:'pointer' }} onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <td style={{ padding:'10px 14px', fontSize:13 }}><span style={{ color:'var(--muted)', fontSize:11, marginRight:6 }}>{p.id}</span>{p.name}</td>
                <td style={{ padding:'10px 14px', fontSize:12, color:'var(--muted)' }}>{p.phase}</td>
                <td style={{ padding:'10px 14px' }}><ProgressBar value={p.progress} color={progressColor[p.status]} width={80} /></td>
                <td style={{ padding:'10px 14px' }}><StatusBadge color={s.color}>{s.label}</StatusBadge></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Panel>
  );
}

function QualitySummaryWidget() {
  return (
    <Panel>
      <PanelHeader dotColor="#ffd166" title="Quality Summary" />
      <div style={{ padding:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          {[['Cpk avg','1.42','#00e5a0'],['Escaped','3','#ff4757'],['CAPA Open','5','#ffd166'],['Cert','100%','#0084ff']].map(([l,v,c]) => (
            <div key={l} style={{ background:'var(--surface2)', borderRadius:6, padding:10 }}>
              <div style={{ fontSize:10, color:'var(--muted)', marginBottom:4 }}>{l}</div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:700, color:c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function ShipmentsWidget() {
  return (
    <Panel>
      <PanelHeader dotColor="#0084ff" title="Shipments" />
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            {['ID','Destination','Units','Status'].map(h => (
              <th key={h} style={{ textAlign:'left', fontSize:10, letterSpacing:'0.03em', textTransform:'uppercase', color:'var(--muted)', padding:'8px 14px', borderBottom:'1px solid var(--border)', fontWeight:500 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shipments.map(s => (
            <tr key={s.id} onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background='transparent'} style={{ cursor:'pointer' }}>
              <td style={{ padding:'10px 14px', fontSize:12, color:'#0084ff' }}>{s.id}</td>
              <td style={{ padding:'10px 14px', fontSize:12 }}>{s.destination}</td>
              <td style={{ padding:'10px 14px', fontSize:12, color:'var(--muted)' }}>{s.units}</td>
              <td style={{ padding:'10px 14px' }}><StatusBadge color={s.status==='Delivered'?'green':s.status==='In Transit'?'blue':'yellow'}>{s.status}</StatusBadge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

function OrdersWidget() {
  return (
    <Panel>
      <PanelHeader dotColor="#ff6b35" title="Purchase Orders" />
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            {['PO','Supplier','Value','Status'].map(h => (
              <th key={h} style={{ textAlign:'left', fontSize:10, letterSpacing:'0.03em', textTransform:'uppercase', color:'var(--muted)', padding:'8px 14px', borderBottom:'1px solid var(--border)', fontWeight:500 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {supplyChainOrders.map(o => (
            <tr key={o.id} onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background='transparent'} style={{ cursor:'pointer' }}>
              <td style={{ padding:'10px 14px', fontSize:12, color:'#ff6b35' }}>{o.id}</td>
              <td style={{ padding:'10px 14px', fontSize:12 }}>{o.supplier}</td>
              <td style={{ padding:'10px 14px', fontSize:12, color:'var(--muted)' }}>${(o.value/1000).toFixed(0)}K</td>
              <td style={{ padding:'10px 14px' }}><StatusBadge color={o.status==='Received'?'green':o.delay?'red':'blue'}>{o.status}</StatusBadge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

function ForecastSummary() {
  const recent = forecastData.slice(-4);
  return (
    <Panel>
      <PanelHeader dotColor="#00e5a0" title="Forecast Summary" />
      <div style={{ padding:16 }}>
        {recent.map(f => (
          <div key={f.month} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
            <span style={{ fontSize:14, lineHeight:1.5 }}>{f.month}</span>
            <span style={{ fontSize:15, fontWeight:600, color:'#00e5a0', lineHeight:1.5 }}>{f.forecast} / {f.actual || '—'}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function CapacitySummary() {
  return (
    <Panel>
      <PanelHeader dotColor="#ffd166" title="Capacity" />
      <div style={{ padding:16 }}>
        {linePerformance.map(l => (
          <div key={l.name} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
            <span style={{ fontSize:12, color:'var(--muted)' }}>{l.name}</span>
            <span style={{ fontSize:13, fontWeight:600, color:l.color }}>{l.oee}%</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SPCSummary() {
  return (
    <Panel>
      <PanelHeader dotColor="#ffd166" title="SPC Overview" />
      <div style={{ padding:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[['Cpk Target','1.33'],['Current Cpk','1.42'],['OOC Events','2'],['Stable','28/30']].map(([l,v]) => (
            <div key={l} style={{ background:'var(--surface2)', borderRadius:6, padding:12 }}>
              <div style={{ fontSize:12, color:'var(--muted)', marginBottom:6, lineHeight:1.4 }}>{l}</div>
              <div style={{ fontSize:14, fontWeight:600 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const WIDGET_MAP = {
  kpi: KpiStrip,
  programs: ProgramsPanel,
  alerts: AlertsPanel,
  production: ProductionPanel,
  quality: QualityPanel,
  supply: SupplyPanel,
  gantt: GanttPanel,
  rma: RMAPanel,
  heatmap: HeatmapPanel,
  docs: DocsPanel,
  projects: ProjectsSummary,
  quality_summary: QualitySummaryWidget,
  shipments: ShipmentsWidget,
  orders: OrdersWidget,
  forecast_summary: ForecastSummary,
  capacity_summary: CapacitySummary,
  spc_summary: SPCSummary,
};

export default function Dashboard({ role }) {
  const widgets = ROLE_DASHBOARD_WIDGETS[role] || ['kpi', 'programs', 'alerts'];
  const hasKpi = widgets.includes('kpi');
  const [toast, setToast] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [globalFilters, setGlobalFilters] = useState({
    site: '',
    dateRange: '',
    category: '',
  });

  function handleExportOverview() {
    exportToCsv('dashboard-kpis.csv', kpiData, [
      { header: 'Label', accessor: 'label' },
      { header: 'Value', accessor: 'value' },
      { header: 'Delta', accessor: 'delta' },
    ]);
    setToast('Exported high-level KPI summary (demo CSV).');
  }

  function handleFilters() {
    setShowFilter(true);
  }

  function handleNewProgram() {
    setToast('To create a full program record, open the Program Tracking module.');
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, letterSpacing: 0, lineHeight:1.2 }}>
            Manufacturing <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:'italic', color:'#00e5a0' }}>Overview</span>
          </h1>
          <div style={{ fontSize:15, color:'var(--muted)', marginTop:8, lineHeight:1.55 }}>
            R&D → NPI → Production · Multi-site
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Btn onClick={handleExportOverview}>↓ Export</Btn>
          <Btn onClick={handleFilters}>⚙ Filters</Btn>
          <Btn primary onClick={handleNewProgram}>+ New Program</Btn>
        </div>
      </div>

      {hasKpi && <KpiStrip />}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 20,
        alignItems: 'start',
      }}>
        {widgets.filter(w => w !== 'kpi').map(w => {
          const C = WIDGET_MAP[w];
          const isWide = ['programs', 'production', 'gantt'].includes(w);
          return C ? (
            <div key={w} style={{ minWidth: 0, gridColumn: isWide ? '1 / -1' : undefined }}>
              <C globalFilters={globalFilters} />
            </div>
          ) : null;
        })}
      </div>
      <GlobalFilterModal 
        open={showFilter} 
        onClose={() => setShowFilter(false)} 
        filters={globalFilters} 
        onApply={(f) => { setGlobalFilters(f); setToast('Filters applied across dashboard.'); }} 
      />
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
