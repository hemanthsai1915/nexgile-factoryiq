import React, { useState, useMemo } from 'react';
import { Panel, PanelHeader, StatusBadge, ProgressBar, Pill, Btn, Modal, Toast, exportToCsv, GlobalFilterModal } from './ui';
import { programs, ganttItems } from '../data';

const statusMap = { 'on-track': { color: 'green', label: 'On Track' }, 'at-risk': { color: 'yellow', label: 'At Risk' }, 'in-design': { color: 'blue', label: 'In Design' }, 'delayed': { color: 'red', label: 'Delayed' } };
const progressColor = { 'on-track': '#00e5a0', 'at-risk': '#ffd166', 'in-design': '#0084ff', 'delayed': '#ff4757' };

export default function ProgramsPage() {
  const [progList, setProgList] = useState(() => {
    try {
      const saved = localStorage.getItem('factoryiq_programs');
      return saved ? JSON.parse(saved) : programs;
    } catch {
      return programs;
    }
  });

  React.useEffect(() => {
    localStorage.setItem('factoryiq_programs', JSON.stringify(progList));
  }, [progList]);

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'id', direction: 'asc' });
  const [toast, setToast] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: '',
    name: '',
    phase: 'R&D',
    owner: '',
    site: '',
    status: 'on-track',
  });
  const [showFilter, setShowFilter] = useState(false);
  const [globalFilters, setGlobalFilters] = useState({
    site: '',
    owner: '',
  });
  const phases = ['All', 'R&D', 'NPI', 'Production'];

  const visiblePrograms = useMemo(() => {
    let items = [...progList];
    if (filter !== 'All') {
      items = items.filter(p => p.phase === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.site.toLowerCase().includes(q)
      );
    }
    if (globalFilters.site) {
      items = items.filter(p => p.site.toLowerCase().includes(globalFilters.site.toLowerCase()));
    }
    if (globalFilters.owner) {
      items = items.filter(p => p.owner.toLowerCase().includes(globalFilters.owner.toLowerCase()));
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
  }, [progList, filter, search, sort, globalFilters]);

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

  function handleAddProgram(e) {
    e.preventDefault();
    const newProg = {
      id: form.id.trim() || `PRG-${Math.floor(2500 + Math.random() * 100)}`,
      name: form.name.trim() || 'New Program',
      phase: form.phase,
      progress: 0,
      owner: form.owner.trim() || 'Unassigned',
      status: form.status,
      site: form.site.trim() || 'HQ',
    };
    setProgList(prev => [newProg, ...prev]);
    setShowModal(false);
    setForm({
      id: '', name: '', phase: 'R&D', owner: '', site: '', status: 'on-track'
    });
    setToast('Program created (demo only – no backend).');
  }

  function handleExport() {
    if (!visiblePrograms.length) return;
    exportToCsv('programs.csv', visiblePrograms, [
      { header: 'ID', accessor: 'id' },
      { header: 'Name', accessor: 'name' },
      { header: 'Phase', accessor: 'phase' },
      { header: 'Site', accessor: 'site' },
      { header: 'Progress %', accessor: p => p.progress },
      { header: 'Owner', accessor: 'owner' },
      { header: 'Status', accessor: 'status' },
    ]);
    setToast(`Exported ${visiblePrograms.length} program${visiblePrograms.length === 1 ? '' : 's'} as CSV`);
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Program / Project Tracking</h1>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Full Gantt, NPI gates, BOM/ECO log, evidence repository</div>
      </div>
      <Panel style={{ marginBottom: 20 }}>
        <PanelHeader dotColor="#00e5a0" title="Programs">
          {phases.map(p => <Pill key={p} active={filter === p} onClick={() => setFilter(p)}>{p}</Pill>)}
          <Btn onClick={() => setShowFilter(true)} style={{ fontSize: 11, padding: '4px 10px' }}>⚙ Filters</Btn>
          <Btn onClick={handleExport} style={{ fontSize: 11, padding: '4px 10px' }}>↓ Export</Btn>
          <Btn primary onClick={() => setShowModal(true)} style={{ fontSize: 11, padding: '4px 10px' }}>+ New Program</Btn>
        </PanelHeader>
        <div style={{ padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            Showing <strong style={{ color: 'var(--text)' }}>{visiblePrograms.length}</strong> program{visiblePrograms.length === 1 ? '' : 's'}
          </div>
          <input
            type="text"
            placeholder="Search by ID, name, owner, site…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--surface2)',
              color: 'var(--text)',
              fontSize: 12,
              minWidth: 260,
            }}
          />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {[
                { key: 'id', label: 'Program' },
                { key: 'phase', label: 'Phase' },
                { key: 'site', label: 'Site' },
                { key: 'progress', label: 'Progress' },
                { key: 'owner', label: 'Owner' },
                { key: 'status', label: 'Status' },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  style={{
                    textAlign: 'left',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
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
            {visiblePrograms.map(p => {
              const s = statusMap[p.status];
              return (
                <tr key={p.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} style={{ cursor: 'pointer' }}>
                  <td style={{ padding: '12px 14px', fontSize: 14 }}><span style={{ color: 'var(--muted)', fontSize: 11, marginRight: 8 }}>{p.id}</span>{p.name}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--muted)' }}>{p.phase}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--muted)' }}>{p.site}</td>
                  <td style={{ padding: '12px 14px' }}><ProgressBar value={p.progress} color={progressColor[p.status]} width={90} /></td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--muted)' }}>{p.owner}</td>
                  <td style={{ padding: '12px 14px' }}><StatusBadge color={s.color}>{s.label}</StatusBadge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
      <Panel>
        <PanelHeader dotColor="#00e5a0" title="Milestone Gantt – Q1 2026" />
        <div style={{ padding: '10px 16px 16px' }}>
          {ganttItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', height: 36, borderBottom: '1px solid rgba(30,37,48,0.4)' }}>
              <div style={{ width: 140, flexShrink: 0, fontSize: 13, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
              <div style={{ flex: 1, position: 'relative', height: 24, display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: '52%', top: 0, bottom: 0, width: 1, background: 'rgba(255,107,53,0.6)' }} />
                <div style={{ position: 'absolute', left: `${item.left}%`, width: `${item.width}%`, height: 20, borderRadius: 4, background: item.bg, border: `1px solid ${item.color}40`, display: 'flex', alignItems: 'center', paddingLeft: 8, fontSize: 11, color: item.color, fontWeight: 600 }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Modal open={showModal} title="Create New Program" onClose={() => setShowModal(false)}>
        <form onSubmit={handleAddProgram} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>Program ID (optional)</label>
              <input name="id" value={form.id} onChange={handleFormChange} placeholder="e.g. PRG-2510" style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 13 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>Name</label>
              <input name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Echo X" required style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 13 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>Phase</label>
              <select name="phase" value={form.phase} onChange={handleFormChange} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 13 }}>
                <option value="R&D">R&D</option>
                <option value="NPI">NPI</option>
                <option value="Production">Production</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>Status</label>
              <select name="status" value={form.status} onChange={handleFormChange} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 13 }}>
                <option value="on-track">On Track</option>
                <option value="at-risk">At Risk</option>
                <option value="in-design">In Design</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>Owner</label>
              <input name="owner" value={form.owner} onChange={handleFormChange} placeholder="e.g. A. Smith" style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 13 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>Site</label>
              <input name="site" value={form.site} onChange={handleFormChange} placeholder="e.g. HQ" style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 13 }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <Btn onClick={() => setShowModal(false)} style={{ padding: '6px 14px' }}>Cancel</Btn>
            <Btn primary style={{ padding: '6px 16px' }} type="submit">Create Program</Btn>
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
