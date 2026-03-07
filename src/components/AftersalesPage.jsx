import React, { useState, useMemo } from 'react';
import { Panel, PanelHeader, StatusBadge, Btn, Modal, Toast, exportToCsv } from './ui';
import { rmaList as baseRmaList } from '../data';

const badgeMap = { red: 'red', yellow: 'yellow', blue: 'blue', green: 'green' };

export default function AftersalesPage() {
  const [rmas, setRmas] = useState(() => {
    try {
      const saved = localStorage.getItem('factoryiq_rmas');
      return saved ? JSON.parse(saved) : baseRmaList;
    } catch {
      return baseRmaList;
    }
  });

  React.useEffect(() => {
    localStorage.setItem('factoryiq_rmas', JSON.stringify(rmas));
  }, [rmas]);
  const [stageFilter, setStageFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'id', direction: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({
    id: '',
    product: '',
    reason: '',
    stage: 'Diagnosis',
    stageBadge: 'red',
  });

  const stages = ['All', 'Diagnosis', 'Triage', 'Repair', 'Closed'];

  const visibleRmas = useMemo(() => {
    let items = [...rmas];
    if (stageFilter !== 'All') {
      items = items.filter(r => r.stage === stageFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(r =>
        r.id.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    }
    if (sort?.key) {
      items.sort((a, b) => {
        const av = (a[sort.key] || '').toString().toLowerCase();
        const bv = (b[sort.key] || '').toString().toLowerCase();
        if (av < bv) return sort.direction === 'asc' ? -1 : 1;
        if (av > bv) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [rmas, stageFilter, search, sort]);

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

  function handleStageChange(e) {
    const stage = e.target.value;
    setForm(prev => ({
      ...prev,
      stage,
      stageBadge:
        stage === 'Closed' ? 'green' :
        stage === 'Repair' ? 'blue' :
        stage === 'Triage' ? 'yellow' :
        'red',
    }));
  }

  function handleAddRma(e) {
    e.preventDefault();
    const id = form.id.trim() || `RMA-${Math.floor(2200 + Math.random() * 200)}`;
    const newRma = {
      id,
      product: form.product.trim() || 'Unassigned product',
      reason: form.reason.trim() || 'Not specified',
      stage: form.stage,
      stageBadge: form.stageBadge,
    };
    setRmas(prev => [newRma, ...prev]);
    setShowModal(false);
    setForm({
      id: '',
      product: '',
      reason: '',
      stage: 'Diagnosis',
      stageBadge: 'red',
    });
    setToast('RMA created (demo only – no backend).');
  }

  function handleExport() {
    if (!visibleRmas.length) return;
    exportToCsv(
      'rma-cases.csv',
      visibleRmas,
      [
        { header: 'RMA ID', accessor: 'id' },
        { header: 'Product', accessor: 'product' },
        { header: 'Reason', accessor: 'reason' },
        { header: 'Stage', accessor: 'stage' },
      ]
    );
    setToast(`Exported ${visibleRmas.length} RMA case${visibleRmas.length === 1 ? '' : 's'} as CSV`);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 6 }}>After-Sales / RMA / Warranty</h1>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Self-service RMA intake, repair diagnostics, warranty claims, spare parts</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Btn onClick={handleExport}>↓ Export</Btn>
          <Btn primary onClick={() => setShowModal(true)}>+ New RMA</Btn>
        </div>
      </div>
      <Panel>
        <PanelHeader dotColor="#ff6b35" title="After-Sales Service">
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--surface2)',
              color: 'var(--text)',
              fontSize: 12,
            }}
          >
            {stages.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </PanelHeader>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border)' }}>
          <div style={{ padding: 20, borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Open RMAs</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#ff6b35' }}>31</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>7 pending triage · 4 in repair</div>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Warranty Claims</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#ffd166' }}>12</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>3 pending approval</div>
          </div>
        </div>
        <div style={{ padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            Showing <strong style={{ color: 'var(--text)' }}>{visibleRmas.length}</strong> case{visibleRmas.length === 1 ? '' : 's'}
          </div>
          <input
            type="text"
            placeholder="Search by RMA ID, product, reason…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--surface2)',
              color: 'var(--text)',
              fontSize: 12,
              minWidth: 240,
            }}
          />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {[
                { key: 'id', label: 'RMA ID' },
                { key: 'product', label: 'Product' },
                { key: 'reason', label: 'Reason' },
                { key: 'stage', label: 'Stage' },
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
            {visibleRmas.map(r => (
              <tr key={r.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} style={{ cursor: 'pointer' }}>
                <td style={{ padding: '12px 14px', fontSize: 13, color: '#0084ff' }}>{r.id}</td>
                <td style={{ padding: '12px 14px', fontSize: 13 }}>{r.product}</td>
                <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--muted)' }}>{r.reason}</td>
                <td style={{ padding: '12px 14px' }}><StatusBadge color={badgeMap[r.stageBadge]}>{r.stage}</StatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', gap: 24, padding: '12px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)' }}>
          <span>Spare Parts: <strong style={{ color: '#00e5a0' }}>In Stock</strong></span>
          <span>Avg TAT: <strong style={{ color: 'var(--text)' }}>4.2 days</strong></span>
          <span>EOL LTB: <strong style={{ color: '#ffd166' }}>3 active</strong></span>
        </div>
      </Panel>
      <Modal open={showModal} title="Create New RMA" onClose={() => setShowModal(false)}>
        <form onSubmit={handleAddRma} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>RMA ID (optional)</label>
              <input
                name="id"
                value={form.id}
                onChange={handleFormChange}
                placeholder="e.g. RMA-2292"
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  fontSize: 13,
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>Product</label>
              <input
                name="product"
                value={form.product}
                onChange={handleFormChange}
                placeholder="e.g. Apex EV"
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  fontSize: 13,
                }}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Reason</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleFormChange}
              placeholder="e.g. Field failure, cosmetic issue, DOA…"
              rows={3}
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--surface2)',
                color: 'var(--text)',
                fontSize: 13,
                resize: 'vertical',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Stage</label>
            <select
              name="stage"
              value={form.stage}
              onChange={handleStageChange}
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--surface2)',
                color: 'var(--text)',
                fontSize: 13,
              }}
            >
              <option value="Diagnosis">Diagnosis</option>
              <option value="Triage">Triage</option>
              <option value="Repair">Repair</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <Btn onClick={() => setShowModal(false)} style={{ padding: '6px 14px' }}>Cancel</Btn>
            <Btn primary style={{ padding: '6px 16px' }} type="submit">Create RMA</Btn>
          </div>
        </form>
      </Modal>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
