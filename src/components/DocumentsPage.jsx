import React, { useState, useMemo } from 'react';
import { Panel, PanelHeader, StatusBadge, Btn, Modal, Toast, exportToCsv } from './ui';
import { documents as baseDocuments } from '../data';

const badgeMap = { green: 'green', yellow: 'yellow', red: 'red', blue: 'blue' };

export default function DocumentsPage() {
  const [docs, setDocs] = useState(() => {
    try {
      const saved = localStorage.getItem('factoryiq_documents');
      return saved ? JSON.parse(saved) : baseDocuments;
    } catch {
      return baseDocuments;
    }
  });

  React.useEffect(() => {
    localStorage.setItem('factoryiq_documents', JSON.stringify(docs));
  }, [docs]);

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'title', direction: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({
    title: '',
    type: '',
    revision: '',
    owner: '',
    uploadDate: '',
    status: 'Draft',
  });
  const filters = ['All', 'Approved', 'Pending', 'Draft', 'Review', 'Expiring'];

  const visibleDocs = useMemo(() => {
    let items = [...docs];
    if (filter !== 'All') {
      items = items.filter(
        d => d.status === filter || (filter === 'Expiring' && d.status === 'Expiring')
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(d =>
        (d.title || '').toLowerCase().includes(q) ||
        (d.type || '').toLowerCase().includes(q) ||
        (d.owner || '').toLowerCase().includes(q) ||
        (d.meta || '').toLowerCase().includes(q)
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
  }, [docs, filter, search, sort]);

  function toggleSort(key) {
    setSort(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  }

  function handleExport() {
    if (!visibleDocs.length) return;
    exportToCsv('documents.csv', visibleDocs, [
      { header: 'Document', accessor: 'title' },
      { header: 'Type', accessor: 'type' },
      { header: 'Revision', accessor: 'revision' },
      { header: 'Owner', accessor: 'owner' },
      { header: 'Upload Date', accessor: 'uploadDate' },
      { header: 'Status', accessor: 'status' },
      { header: 'Details', accessor: 'meta' },
    ]);
    setToast(`Exported ${visibleDocs.length} document${visibleDocs.length === 1 ? '' : 's'} as CSV`);
  }

  function handleUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
      const file = e.target.files?.[0];
      if (file) {
        const uploadDate = new Date().toISOString().slice(0, 10);
        const newDoc = {
          icon: '📄',
          title: file.name,
          type: 'Uploaded File',
          revision: 'Rev 1',
          owner: 'Local User',
          uploadDate,
          status: 'Draft',
          badge: 'blue',
          meta: `Uploaded File • Rev 1 • Local User • ${uploadDate}`,
        };
        setDocs(prev => [newDoc, ...prev]);
        setToast(`Uploaded ${file.name}`);
      }
    };
    input.click();
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleAddDocument(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      return;
    }
    const uploadDate =
      form.uploadDate.trim() ||
      new Date().toISOString().slice(0, 10);
    const newDoc = {
      icon: '📄',
      title: form.title.trim(),
      type: form.type.trim() || 'General',
      revision: form.revision.trim() || 'Rev 1',
      owner: form.owner.trim() || 'Unassigned',
      uploadDate,
      status: form.status || 'Draft',
      badge:
        form.status === 'Approved'
          ? 'green'
          : form.status === 'Pending' || form.status === 'Review'
          ? 'yellow'
          : form.status === 'Draft'
          ? 'blue'
          : form.status === 'Expiring'
          ? 'red'
          : 'blue',
      meta: `${form.type || 'Document'} • ${form.revision || 'Rev 1'} • ${form.owner || 'Unassigned'} • ${uploadDate}`,
    };
    setDocs(prev => [newDoc, ...prev]);
    setShowModal(false);
    setForm({
      title: '',
      type: '',
      revision: '',
      owner: '',
      uploadDate: '',
      status: 'Draft',
    });
    setToast('Document added to workspace (demo only – no backend).');
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Documents & Collaboration</h1>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Versioned documents, approval workflows, engineering viewers</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={handleUpload}>↑ Upload</Btn>
          <Btn onClick={handleExport}>↓ Export</Btn>
          <Btn primary onClick={() => setShowModal(true)}>+ New Document</Btn>
        </div>
      </div>
      <Panel>
        <PanelHeader dotColor="#0084ff" title="Recent Documents">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                border: filter === f ? '1px solid #0084ff' : '1px solid var(--border)',
                background: filter === f ? 'rgba(0,132,255,0.1)' : 'transparent',
                color: filter === f ? '#0084ff' : 'var(--muted)',
              }}>
              {f}
            </button>
          ))}
        </PanelHeader>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              Showing <strong style={{ color: 'var(--text)' }}>{visibleDocs.length}</strong> document{visibleDocs.length === 1 ? '' : 's'}
            </div>
            <input
              type="text"
              placeholder="Search by name, type, owner…"
              value={search}
              onChange={e => setSearch(e.target.value)}
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr>
                  {[
                    { key: 'title', label: 'Document' },
                    { key: 'type', label: 'Type' },
                    { key: 'revision', label: 'Revision' },
                    { key: 'owner', label: 'Owner' },
                    { key: 'uploadDate', label: 'Upload Date' },
                    { key: 'status', label: 'Status' },
                    { key: 'meta', label: 'Details' },
                  ].map(col => (
                    <th
                      key={col.key}
                      onClick={() => toggleSort(col.key)}
                      style={{
                        textAlign: col.key === 'meta' ? 'left' : 'left',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        color: 'var(--muted)',
                        padding: '8px 10px',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
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
                {visibleDocs.map(d => (
                  <tr
                    key={d.title}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    style={{ transition: 'background 0.15s', cursor: 'pointer' }}
                  >
                    <td style={{ padding: '10px 10px', fontSize: 13 }}>
                      <span style={{ marginRight: 8 }}>{d.icon}</span>
                      <span style={{ fontWeight: 500 }}>{d.title}</span>
                    </td>
                    <td style={{ padding: '10px 10px', fontSize: 12, color: 'var(--muted)' }}>{d.type || '—'}</td>
                    <td style={{ padding: '10px 10px', fontSize: 12, color: 'var(--muted)' }}>{d.revision || '—'}</td>
                    <td style={{ padding: '10px 10px', fontSize: 12, color: 'var(--muted)' }}>{d.owner || '—'}</td>
                    <td style={{ padding: '10px 10px', fontSize: 12, color: 'var(--muted)' }}>{d.uploadDate || '—'}</td>
                    <td style={{ padding: '10px 10px' }}>
                      <StatusBadge color={badgeMap[d.badge]}>{d.status}</StatusBadge>
                    </td>
                    <td style={{ padding: '10px 10px', fontSize: 12, color: 'var(--muted)' }}>{d.meta}</td>
                  </tr>
                ))}
                {!visibleDocs.length && (
                  <tr>
                    <td colSpan={6} style={{ padding: '14px 10px', fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
                      No documents match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 24, fontSize: 12, color: 'var(--muted)' }}>
            <span>Threads: <strong style={{ color: 'var(--text)' }}>18 active</strong></span>
            <span>Reviews: <strong style={{ color: '#ffd166' }}>6 pending</strong></span>
            <span>KB Articles: <strong style={{ color: '#00e5a0' }}>142</strong></span>
          </div>
        </div>
      </Panel>
      <Modal open={showModal} title="Add New Document" onClose={() => setShowModal(false)}>
        <form onSubmit={handleAddDocument} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Document name</label>
            <input
              name="title"
              value={form.title}
              onChange={handleFormChange}
              placeholder="e.g. PRG-2401 BOM Rev 5.0"
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>Type</label>
              <input
                name="type"
                value={form.type}
                onChange={handleFormChange}
                placeholder="BOM, Control Plan, WI…"
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
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>Revision</label>
              <input
                name="revision"
                value={form.revision}
                onChange={handleFormChange}
                placeholder="Rev 1.0"
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
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Owner</label>
            <input
              name="owner"
              value={form.owner}
              onChange={handleFormChange}
              placeholder="e.g. J. Torres"
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
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Upload date</label>
            <input
              type="date"
              name="uploadDate"
              value={form.uploadDate}
              onChange={handleFormChange}
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
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleFormChange}
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--surface2)',
                color: 'var(--text)',
                fontSize: 13,
              }}
            >
              <option value="Draft">Draft</option>
              <option value="Review">Review</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Expiring">Expiring</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <Btn onClick={() => setShowModal(false)} style={{ padding: '6px 14px' }}>Cancel</Btn>
            <Btn primary style={{ padding: '6px 16px' }} type="submit">Add Document</Btn>
          </div>
        </form>
      </Modal>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
