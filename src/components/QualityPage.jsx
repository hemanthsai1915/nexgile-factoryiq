import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { Panel, PanelHeader, StatusBadge, Btn, TabBar, Modal, Toast, exportToCsv, GlobalFilterModal, ActiveFiltersIndicator } from './ui';
import { spcData } from '../data';

const ncrs = [
  { id:'NCR-0443', title:'Solder void >15% on PCB Rev C', line:'Line 3', station:'AOI-7', severity:'Critical', status:'open',    rca:'5-Why',    owner:'M. Chen',  date:'2026-03-06' },
  { id:'NCR-0442', title:'Torque spec OOC Station 7',     line:'Line 1', station:'STA-7',  severity:'Major',    status:'open',    rca:'Fishbone', owner:'S. Patel', date:'2026-03-05' },
  { id:'NCR-0441', title:'BOM mismatch – capacitor value',line:'Line 2', station:'SMT-3',  severity:'Minor',    status:'closed',  rca:'8D',       owner:'J. Torres',date:'2026-03-04' },
  { id:'NCR-0440', title:'X-Ray void >20% batch 2024C',   line:'Line 3', station:'XRAY-1', severity:'Critical', status:'capa',    rca:'5-Why',    owner:'A. Mistry',date:'2026-03-03' },
  { id:'NCR-0439', title:'Cosmetic scratch – front panel', line:'Line 4', station:'VIS-2',  severity:'Minor',    status:'closed',  rca:'8D',       owner:'R. Nguyen',date:'2026-03-01' },
];

const capaList = [
  { id:'CAPA-0220', ncr:'NCR-0443', stage:'Containment',  due:'2026-03-10', progress:20, color:'#ff4757' },
  { id:'CAPA-0219', ncr:'NCR-0442', stage:'RCA in progress', due:'2026-03-12', progress:45, color:'#ffd166' },
  { id:'CAPA-0218', ncr:'NCR-0435', stage:'Effectiveness', due:'2026-03-08', progress:90, color:'#00e5a0' },
  { id:'CAPA-0217', ncr:'NCR-0430', stage:'Closed',        due:'2026-02-28', progress:100, color:'#5a6680' },
];

const severityMap = { Critical:'red', Major:'yellow', Minor:'blue' };
const statusMap2  = { open:'red', closed:'green', capa:'yellow' };

function SpcChart() {
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const ooc = payload.value > payload.ucl || payload.value < payload.lcl;
    if (!ooc) return null;
    return <circle cx={cx} cy={cy} r={5} fill="#ff4757" stroke="#ff475780" strokeWidth={6} />;
  };
  return (
    <Panel>
      <PanelHeader dotColor="#ffd166" title="SPC Control Chart — Station 7 Torque">
        <span style={{ fontSize:10, color:'var(--muted)' }}>30 points · Cpk = 0.88</span>
      </PanelHeader>
      <div style={{ padding:'12px 8px 8px 0' }}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={spcData} margin={{ top:8, right:20, left:-10, bottom:0 }}>
            <CartesianGrid stroke="rgba(30,37,48,0.8)" vertical={false} />
            <XAxis dataKey="point" tick={{ fontSize:9, fill:'#5a6680' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0.7,1.9]} tick={{ fontSize:9, fill:'#5a6680' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, fontSize:11 }} />
            <ReferenceLine y={1.67} stroke="#ff4757" strokeDasharray="4 4" label={{ value:'UCL', fill:'#ff4757', fontSize:9, position:'right' }} />
            <ReferenceLine y={1.33} stroke="#00e5a0" strokeDasharray="4 4" label={{ value:'Target', fill:'#00e5a0', fontSize:9, position:'right' }} />
            <ReferenceLine y={0.99} stroke="#ff4757" strokeDasharray="4 4" label={{ value:'LCL', fill:'#ff4757', fontSize:9, position:'right' }} />
            <Line type="monotone" dataKey="value" stroke="#0084ff" strokeWidth={1.5} dot={<CustomDot />} activeDot={{ r:4, fill:'#0084ff' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

export default function QualityPage() {
  const [tab, setTab] = useState('NCR Log');
  const [ncrList, setNcrList] = useState(() => {
    try {
      const saved = localStorage.getItem('factoryiq_ncrs');
      return saved ? JSON.parse(saved) : ncrs;
    } catch {
      return ncrs;
    }
  });

  React.useEffect(() => {
    localStorage.setItem('factoryiq_ncrs', JSON.stringify(ncrList));
  }, [ncrList]);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'id', direction: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({
    id: '',
    title: '',
    line: '',
    station: '',
    severity: 'Critical',
    status: 'open',
    rca: '5-Why',
    owner: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [showFilter, setShowFilter] = useState(false);
  const [globalFilters, setGlobalFilters] = useState({
    line: '',
    station: '',
  });

  const visibleNcrs = useMemo(() => {
    let items = [...ncrList];
    if (severityFilter !== 'All') {
      items = items.filter(n => n.severity === severityFilter);
    }
    if (statusFilter !== 'All') {
      items = items.filter(n => n.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(n =>
        n.id.toLowerCase().includes(q) ||
        n.title.toLowerCase().includes(q) ||
        n.line.toLowerCase().includes(q) ||
        n.station.toLowerCase().includes(q) ||
        n.owner.toLowerCase().includes(q)
      );
    }
    if (globalFilters.line) {
      items = items.filter(n => n.line.toLowerCase().includes(globalFilters.line.toLowerCase()));
    }
    if (globalFilters.station) {
      items = items.filter(n => n.station.toLowerCase().includes(globalFilters.station.toLowerCase()));
    }
    if (sort?.key) {
      items.sort((a, b) => {
        const av = (a[sort.key] ?? '').toString().toLowerCase();
        const bv = (b[sort.key] ?? '').toString().toLowerCase();
        if (av < bv) return sort.direction === 'asc' ? -1 : 1;
        if (av > bv) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [ncrList, severityFilter, statusFilter, search, sort, globalFilters]);

  function toggleSort(key) {
    setSort(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleAddNcr(e) {
    e.preventDefault();
    const id = form.id.trim() || `NCR-${Math.floor(4400 + Math.random() * 50)}`;
    const newNcr = {
      id,
      title: form.title.trim() || 'New NCR',
      line: form.line.trim() || 'Line 1',
      station: form.station.trim() || 'STA-1',
      severity: form.severity,
      status: form.status,
      rca: form.rca.trim() || '5-Why',
      owner: form.owner.trim() || 'Unassigned',
      date: form.date || new Date().toISOString().slice(0, 10),
    };
    setNcrList(prev => [newNcr, ...prev]);
    setShowModal(false);
    setForm({
      id: '',
      title: '',
      line: '',
      station: '',
      severity: 'Critical',
      status: 'open',
      rca: '5-Why',
      owner: '',
      date: new Date().toISOString().slice(0, 10),
    });
    setToast('NCR created (demo only – no backend).');
  }

  function handleExportNcr() {
    if (!visibleNcrs.length) return;
    exportToCsv('ncr-log.csv', visibleNcrs, [
      { header: 'ID', accessor: 'id' },
      { header: 'Title', accessor: 'title' },
      { header: 'Line', accessor: 'line' },
      { header: 'Station', accessor: 'station' },
      { header: 'Severity', accessor: 'severity' },
      { header: 'Status', accessor: n => n.status.toUpperCase() },
      { header: 'RCA', accessor: 'rca' },
      { header: 'Owner', accessor: 'owner' },
      { header: 'Date', accessor: 'date' },
    ]);
    setToast(`Exported ${visibleNcrs.length} NCR${visibleNcrs.length === 1 ? '' : 's'} as CSV`);
  }
  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, letterSpacing:'-0.5px' }}>
          Quality <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:'italic', color:'#ffd166' }}>& Compliance</span>
        </h1>
        <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>NCR/CAPA · SPC · Audit Management · Certifications</div>
      </div>

      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[['Open NCRs','11','#ff4757'],['Open CAPAs','5','#ffd166'],['Cpk Avg','1.42','#00e5a0'],['Cert Valid','100%','#0084ff']].map(([l,v,c]) => (
          <div key={l} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'14px 16px', animation:'fadeUp 0.4s ease both' }}>
            <div style={{ fontSize:9, letterSpacing:'0.02em', textTransform:'uppercase', color:'var(--muted)', marginBottom:8 }}>{l}</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* SPC */}
      <div style={{ marginBottom:16 }}><SpcChart /></div>

      {/* NCR/CAPA Tabs */}
      <Panel>
        <PanelHeader dotColor="#ff4757" title="NCR / CAPA Workflow">
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 10 }}
          >
            {['All', 'Critical', 'Major', 'Minor'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 10 }}
          >
            {['All', 'open', 'closed', 'capa'].map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.toUpperCase()}</option>
            ))}
          </select>
          <Btn onClick={() => setShowFilter(true)} style={{ fontSize:10, padding:'3px 10px' }}>⚙ Filters</Btn>
          <Btn onClick={handleExportNcr} style={{ fontSize:10, padding:'3px 10px' }}>↓ Export</Btn>
          <Btn onClick={() => setShowModal(true)} style={{ fontSize:10, padding:'3px 10px' }}>+ New NCR</Btn>
        </PanelHeader>
        <TabBar tabs={['NCR Log','CAPA Tracker','Audit Schedule']} active={tab} onChange={setTab} />

        {tab === 'NCR Log' && (
          <>
            <div style={{ padding: '6px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  Showing <strong style={{ color: 'var(--text)' }}>{visibleNcrs.length}</strong> NCR{visibleNcrs.length === 1 ? '' : 's'}
                </div>
                <ActiveFiltersIndicator filters={globalFilters} onClear={() => setGlobalFilters({ line: '', station: '' })} />
              </div>
              <input
                type="text"
                placeholder="Search by ID, issue, line, station, owner…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  fontSize: 11,
                  minWidth: 260,
                }}
              />
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  {[
                    { key: 'id', label: 'ID' },
                    { key: 'title', label: 'Issue' },
                    { key: 'line', label: 'Line' },
                    { key: 'station', label: 'Station' },
                    { key: 'severity', label: 'Severity' },
                    { key: 'status', label: 'Status' },
                    { key: 'rca', label: 'RCA' },
                    { key: 'owner', label: 'Owner' },
                  ].map(col => (
                    <th
                      key={col.key}
                      onClick={() => toggleSort(col.key)}
                      style={{ textAlign:'left', fontSize:9, letterSpacing:'0.02em', textTransform:'uppercase', color:'var(--muted)', padding:'7px 14px', borderBottom:'1px solid var(--border)', fontWeight:400, cursor: 'pointer' }}
                    >
                      {col.label}
                      {sort.key === col.key && (
                        <span style={{ marginLeft: 4 }}>{sort.direction === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleNcrs.map(n => (
                  <tr key={n.id}
                    onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                    style={{ cursor:'pointer', transition:'background 0.1s' }}
                  >
                    <td style={{ padding:'9px 14px', fontSize:11, color:'#0084ff' }}>{n.id}</td>
                    <td style={{ padding:'9px 14px', fontSize:11 }}>{n.title}</td>
                    <td style={{ padding:'9px 14px', fontSize:11, color:'var(--muted)' }}>{n.line}</td>
                    <td style={{ padding:'9px 14px', fontSize:11, color:'var(--muted)' }}>{n.station}</td>
                    <td style={{ padding:'9px 14px' }}><StatusBadge color={severityMap[n.severity]}>{n.severity}</StatusBadge></td>
                    <td style={{ padding:'9px 14px' }}><StatusBadge color={statusMap2[n.status]}>{n.status.toUpperCase()}</StatusBadge></td>
                    <td style={{ padding:'9px 14px', fontSize:11, color:'var(--muted)' }}>{n.rca}</td>
                    <td style={{ padding:'9px 14px', fontSize:11, color:'var(--muted)' }}>{n.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {tab === 'CAPA Tracker' && (
          <div style={{ padding:'14px 16px' }}>
            {capaList.map(c => (
              <div key={c.id} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, padding:'12px 14px', marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <div>
                    <span style={{ fontSize:12, fontWeight:600, color:'#0084ff' }}>{c.id}</span>
                    <span style={{ fontSize:11, color:'var(--muted)', marginLeft:8 }}>→ {c.ncr}</span>
                  </div>
                  <div style={{ fontSize:10, color:'var(--muted)' }}>Due: {c.due}</div>
                </div>
                <div style={{ fontSize:11, color:'var(--text2)', marginBottom:8 }}>{c.stage}</div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ flex:1, height:5, background:'var(--dim)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ width:`${c.progress}%`, height:'100%', background:c.color, borderRadius:3 }} />
                  </div>
                  <span style={{ fontSize:11, color:c.color, minWidth:32, textAlign:'right' }}>{c.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'Audit Schedule' && (
          <div style={{ padding:'14px 16px' }}>
            {[
              { type:'IATF 16949 Internal', date:'Mar 27 2026', status:'Scheduled', color:'yellow' },
              { type:'Customer Quality Audit – OEM-A', date:'Apr 14 2026', status:'Upcoming', color:'blue' },
              { type:'FDA 21 CFR Audit', date:'May 05 2026', status:'Planned', color:'muted' },
              { type:'AS9100 Surveillance', date:'Jun 12 2026', status:'Planned', color:'muted' },
            ].map(a => (
              <div key={a.type} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(30,37,48,0.5)' }}>
                <div>
                  <div style={{ fontSize:12 }}>{a.type}</div>
                  <div style={{ fontSize:10, color:'var(--muted)', marginTop:2 }}>{a.date}</div>
                </div>
                <StatusBadge color={a.color}>{a.status}</StatusBadge>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <Modal open={showModal} title="Create New NCR" onClose={() => setShowModal(false)}>
        <form onSubmit={handleAddNcr} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: 'var(--muted)' }}>NCR ID (optional)</label>
              <input
                name="id"
                value={form.id}
                onChange={handleFormChange}
                placeholder="e.g. NCR-0444"
                style={{
                  padding: '7px 9px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  fontSize: 12,
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: 'var(--muted)' }}>Owner</label>
              <input
                name="owner"
                value={form.owner}
                onChange={handleFormChange}
                placeholder="e.g. M. Chen"
                style={{
                  padding: '7px 9px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  fontSize: 12,
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: 'var(--muted)' }}>Issue summary</label>
            <input
              name="title"
              value={form.title}
              onChange={handleFormChange}
              placeholder="Short description of the non-conformance"
              style={{
                padding: '7px 9px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--surface2)',
                color: 'var(--text)',
                fontSize: 12,
              }}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: 'var(--muted)' }}>Line</label>
              <input
                name="line"
                value={form.line}
                onChange={handleFormChange}
                placeholder="e.g. Line 3"
                style={{
                  padding: '7px 9px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  fontSize: 12,
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: 'var(--muted)' }}>Station</label>
              <input
                name="station"
                value={form.station}
                onChange={handleFormChange}
                placeholder="e.g. AOI-7"
                style={{
                  padding: '7px 9px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  fontSize: 12,
                }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: 'var(--muted)' }}>Severity</label>
              <select
                name="severity"
                value={form.severity}
                onChange={handleFormChange}
                style={{
                  padding: '7px 9px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  fontSize: 12,
                }}
              >
                <option value="Critical">Critical</option>
                <option value="Major">Major</option>
                <option value="Minor">Minor</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: 'var(--muted)' }}>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleFormChange}
                style={{
                  padding: '7px 9px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  fontSize: 12,
                }}
              >
                <option value="open">OPEN</option>
                <option value="capa">CAPA</option>
                <option value="closed">CLOSED</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: 'var(--muted)' }}>RCA Method</label>
            <input
              name="rca"
              value={form.rca}
              onChange={handleFormChange}
              placeholder="e.g. 5-Why, Fishbone, 8D…"
              style={{
                padding: '7px 9px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--surface2)',
                color: 'var(--text)',
                fontSize: 12,
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: 'var(--muted)' }}>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleFormChange}
              style={{
                padding: '7px 9px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--surface2)',
                color: 'var(--text)',
                fontSize: 12,
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <Btn onClick={() => setShowModal(false)} style={{ fontSize: 11, padding: '5px 12px' }}>Cancel</Btn>
            <Btn primary type="submit" style={{ fontSize: 11, padding: '5px 14px' }}>Create NCR</Btn>
          </div>
        </form>
      </Modal>
      <GlobalFilterModal 
        open={showFilter} 
        onClose={() => setShowFilter(false)} 
        filters={globalFilters} 
        onApply={(f) => setGlobalFilters(f)} 
      />
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
