import React, { useState, useMemo } from 'react';
import { Panel, PanelHeader, StatusBadge, Btn, Toast, exportToCsv, GlobalFilterModal, ActiveFiltersIndicator } from './ui';
import { suppliers } from '../data';
import { supplyChainOrders, shipments } from '../data/mockData';

export default function SupplyPage() {
  const [poStatus, setPoStatus] = useState('All');
  const [poSearch, setPoSearch] = useState('');
  const [poSort, setPoSort] = useState({ key: 'id', direction: 'asc' });

  const [shipStatus, setShipStatus] = useState('All');
  const [shipSearch, setShipSearch] = useState('');
  const [shipSort, setShipSort] = useState({ key: 'id', direction: 'asc' });

  const [toast, setToast] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [globalFilters, setGlobalFilters] = useState({
    supplier: '',
    program: '',
  });

  const poStatusOptions = ['All', 'Pending', 'Confirmed', 'Shipped', 'In Transit', 'Received'];
  const shipStatusOptions = ['All', 'Pending', 'In Transit', 'Delivered', 'Cleared'];

  const visiblePOs = useMemo(() => {
    let items = [...supplyChainOrders];
    if (poStatus !== 'All') {
      items = items.filter(o => o.status === poStatus);
    }
    if (poSearch.trim()) {
      const q = poSearch.toLowerCase();
      items = items.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.supplier.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q)
      );
    }
    if (globalFilters.supplier) {
      items = items.filter(o => o.supplier.toLowerCase().includes(globalFilters.supplier.toLowerCase()));
    }
    if (poSort?.key) {
      items.sort((a, b) => {
        const avRaw = typeof poSort.key === 'string' ? a[poSort.key] : a.id;
        const bvRaw = typeof poSort.key === 'string' ? b[poSort.key] : b.id;
        const av = (avRaw ?? '').toString().toLowerCase();
        const bv = (bvRaw ?? '').toString().toLowerCase();
        if (av < bv) return poSort.direction === 'asc' ? -1 : 1;
        if (av > bv) return poSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [poStatus, poSearch, poSort, globalFilters]);

  const visibleShipments = useMemo(() => {
    let items = [...shipments];
    if (shipStatus !== 'All') {
      items = items.filter(s => s.status === shipStatus);
    }
    if (shipSearch.trim()) {
      const q = shipSearch.toLowerCase();
      items = items.filter(s =>
        s.id.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q) ||
        s.program.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q)
      );
    }
    if (globalFilters.program) {
      items = items.filter(s => s.program.toLowerCase().includes(globalFilters.program.toLowerCase()));
    }
    if (shipSort?.key) {
      items.sort((a, b) => {
        const av = (a[shipSort.key] ?? '').toString().toLowerCase();
        const bv = (b[shipSort.key] ?? '').toString().toLowerCase();
        if (av < bv) return shipSort.direction === 'asc' ? -1 : 1;
        if (av > bv) return shipSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [shipStatus, shipSearch, shipSort, globalFilters]);

  function togglePoSort(key) {
    setPoSort(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  }

  function toggleShipSort(key) {
    setShipSort(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  }

  function handleExportPOs() {
    if (!visiblePOs.length) return;
    exportToCsv('purchase-orders.csv', visiblePOs, [
      { header: 'PO', accessor: 'id' },
      { header: 'Supplier', accessor: 'supplier' },
      { header: 'Items', accessor: 'items' },
      { header: 'Value', accessor: o => o.value },
      { header: 'Status', accessor: 'status' },
      { header: 'ETA', accessor: 'eta' },
      { header: 'Delay', accessor: 'delay' },
    ]);
    setToast(`Exported ${visiblePOs.length} PO${visiblePOs.length === 1 ? '' : 's'} as CSV`);
  }

  function handleExportShipments() {
    if (!visibleShipments.length) return;
    exportToCsv('shipments.csv', visibleShipments, [
      { header: 'ID', accessor: 'id' },
      { header: 'Destination', accessor: 'destination' },
      { header: 'Program', accessor: 'program' },
      { header: 'Units', accessor: 'units' },
      { header: 'Status', accessor: 'status' },
      { header: 'ETA', accessor: 'eta' },
    ]);
    setToast(`Exported ${visibleShipments.length} shipment${visibleShipments.length === 1 ? '' : 's'} as CSV`);
  }
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Supply Chain & Materials</h1>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>PO tracking, supplier scorecards, inventory, logistics ETA</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Panel>
          <PanelHeader dotColor="#ff6b35" title="Purchase Orders">
            <select
              value={poStatus}
              onChange={e => setPoStatus(e.target.value)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--surface2)',
                color: 'var(--text)',
                fontSize: 12,
              }}
            >
              {poStatusOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Btn onClick={() => setShowFilter(true)} style={{ fontSize: 11, padding: '4px 10px' }}>⚙ Filters</Btn>
            <Btn onClick={handleExportPOs} style={{ fontSize: 11, padding: '4px 10px' }}>↓ Export</Btn>
          </PanelHeader>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Showing <strong style={{ color: 'var(--text)' }}>{visiblePOs.length}</strong> PO{visiblePOs.length === 1 ? '' : 's'}
                </div>
                <ActiveFiltersIndicator filters={globalFilters} onClear={() => setGlobalFilters({ supplier: '', program: '' })} />
              </div>
              <input
                type="text"
                placeholder="Search by PO, supplier, status…"
                value={poSearch}
                onChange={e => setPoSearch(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  fontSize: 12,
                  minWidth: 220,
                }}
              />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {[
                    { key: 'id', label: 'PO' },
                    { key: 'supplier', label: 'Supplier' },
                    { key: 'value', label: 'Value' },
                    { key: 'status', label: 'Status' },
                  ].map(col => (
                    <th
                      key={col.key}
                      onClick={() => togglePoSort(col.key)}
                      style={{
                        textAlign: 'left',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        color: 'var(--muted)',
                        padding: '8px 0',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                      }}
                    >
                      {col.label}
                      {poSort.key === col.key && (
                        <span style={{ marginLeft: 4 }}>{poSort.direction === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visiblePOs.map(o => (
                  <tr key={o.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: '10px 0', fontSize: 13, color: '#ff6b35' }}>{o.id}</td>
                    <td style={{ padding: '10px 0', fontSize: 13 }}>{o.supplier}</td>
                    <td style={{ padding: '10px 0', fontSize: 13, color: 'var(--muted)' }}>${(o.value / 1000).toFixed(0)}K</td>
                    <td style={{ padding: '10px 0' }}><StatusBadge color={o.status === 'Received' ? 'green' : o.delay ? 'red' : 'blue'}>{o.status}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel>
          <PanelHeader dotColor="#0084ff" title="Supplier Scorecard" />
          <div style={{ padding: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Supplier', 'Score', 'Lead Time'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {suppliers.map(s => (
                  <tr key={s.name} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: '10px 0', fontSize: 13 }}>{s.name}</td>
                    <td style={{ padding: '10px 8px 10px 0' }}>
                      <div style={{ width: 70, height: 5, background: 'var(--dim)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${s.score}%`, height: '100%', background: s.score >= 90 ? '#00e5a0' : s.score >= 80 ? '#ffd166' : '#ff4757', borderRadius: 3 }} />
                      </div>
                    </td>
                    <td style={{ padding: '10px 0', fontSize: 13, color: s.ltColor }}>{s.leadTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel style={{ gridColumn: '1 / -1' }}>
          <PanelHeader dotColor="#00e5a0" title="Shipments">
            <select
              value={shipStatus}
              onChange={e => setShipStatus(e.target.value)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--surface2)',
                color: 'var(--text)',
                fontSize: 12,
              }}
            >
              {shipStatusOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Btn onClick={() => setShowFilter(true)} style={{ fontSize: 11, padding: '4px 10px' }}>⚙ Filters</Btn>
            <Btn onClick={handleExportShipments} style={{ fontSize: 11, padding: '4px 10px' }}>↓ Export</Btn>
          </PanelHeader>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Showing <strong style={{ color: 'var(--text)' }}>{visibleShipments.length}</strong> shipment{visibleShipments.length === 1 ? '' : 's'}
                </div>
                <ActiveFiltersIndicator filters={globalFilters} onClear={() => setGlobalFilters({ supplier: '', program: '' })} />
              </div>
              <input
                type="text"
                placeholder="Search by ID, destination, program, status…"
                value={shipSearch}
                onChange={e => setShipSearch(e.target.value)}
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
                    { key: 'id', label: 'ID' },
                    { key: 'destination', label: 'Destination' },
                    { key: 'program', label: 'Program' },
                    { key: 'units', label: 'Units' },
                    { key: 'status', label: 'Status' },
                    { key: 'eta', label: 'ETA' },
                  ].map(col => (
                    <th
                      key={col.key}
                      onClick={() => toggleShipSort(col.key)}
                      style={{
                        textAlign: 'left',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        color: 'var(--muted)',
                        padding: '8px 14px',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                      }}
                    >
                      {col.label}
                      {shipSort.key === col.key && (
                        <span style={{ marginLeft: 4 }}>{shipSort.direction === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleShipments.map(s => (
                  <tr key={s.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#0084ff' }}>{s.id}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13 }}>{s.destination}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--muted)' }}>{s.program}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13 }}>{s.units}</td>
                    <td style={{ padding: '10px 14px' }}><StatusBadge color={s.status === 'Delivered' ? 'green' : s.status === 'In Transit' ? 'blue' : 'yellow'}>{s.status}</StatusBadge></td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--muted)' }}>{s.eta || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
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
