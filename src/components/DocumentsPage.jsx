import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Panel, PanelHeader, StatusBadge, Btn, Modal, Toast, exportToCsv, GlobalFilterModal, ActiveFiltersIndicator } from './ui';
import { documents as baseDocuments } from '../data';
import { getStoredUser } from '../data/users';

const badgeMap = { green: 'green', yellow: 'yellow', red: 'red', blue: 'blue' };

function getDocRole(roleStr) {
  if (!roleStr) return 'customer';
  const r = roleStr.toLowerCase();
  if (['program_mgmt', 'manufacturing_ops', 'production_planning'].includes(r)) return 'manager';
  if (['engineering', 'quality_compliance', 'quality_engineering'].includes(r)) return 'engineer';
  if (['supply_chain', 'logistics', 'aftersales', 'service_repair', 'customer_success', 'customer'].includes(r)) return 'customer';
  if (r === 'admin') return 'admin';
  return 'customer'; // Default fallback
}

function ActionsDropdown({ doc, userRole, currentUser, onAction }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const role = getDocRole(userRole);
  const isOwner = doc.owner === currentUser;
  
  const canView = true;
  const canDownload = true;
  const canReplace = role === 'admin' || role === 'manager' || (role === 'engineer' && isOwner);
  const canEditMeta = role === 'admin' || role === 'manager' || isOwner;
  const canApprove = role === 'admin' || role === 'manager';
  const canArchive = role === 'admin' || role === 'manager';
  const canRestore = role === 'admin';
  const canDelete = role === 'admin' || isOwner;

  const actions = [];
  if (canView) actions.push({ label: 'View Document', id: 'view' });
  if (canDownload) actions.push({ label: 'Download Document', id: 'download' });
  if (canReplace) actions.push({ label: 'Replace Version', id: 'replace' });
  if (canEditMeta) actions.push({ label: 'Edit Metadata', id: 'edit' });
  if (canApprove && doc.status !== 'Approved') actions.push({ label: 'Approve', id: 'approve' });
  
  if (doc.status === 'Archived') {
    if (canRestore) actions.push({ label: 'Restore Document', id: 'restore', color: '#00e5a0' });
  } else {
    if (canArchive) actions.push({ label: 'Archive Document', id: 'archive', color: '#ffd166' });
  }
  
  if (canDelete) actions.push({ label: 'Delete Document', id: 'delete', color: '#ff4757' });

  if (actions.length === 0) return null;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{
          background: 'transparent', border: 'none', color: 'var(--muted)',
          cursor: 'pointer', padding: '4px 8px', fontSize: 16, borderRadius: 4,
          transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = open ? 'var(--text)' : 'var(--muted)'}
      >
        &#8942;
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 6, padding: '4px', minWidth: 160, zIndex: 50,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {actions.map(a => (
            <button
              key={a.id}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onAction(a.id, doc);
              }}
              style={{
                background: 'transparent', border: 'none',
                padding: '8px 12px', textAlign: 'left',
                fontSize: 12, color: a.color || 'var(--text)',
                cursor: 'pointer', borderRadius: 4, transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  const [currentUser] = useState(() => getStoredUser() || { role: 'customer', name: 'Guest' });
  const docRole = getDocRole(currentUser.role);
  
  const [docs, setDocs] = useState(() => {
    try {
      const saved = localStorage.getItem('factoryiq_documents');
      return saved ? JSON.parse(saved) : baseDocuments;
    } catch {
      return baseDocuments;
    }
  });

  useEffect(() => {
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
  const [showFilter, setShowFilter] = useState(false);
  const [globalFilters, setGlobalFilters] = useState({
    type: '',
    owner: '',
  });
  
  const [editModal, setEditModal] = useState({ open: false, doc: null, formData: { type: '', owner: '' } });
  
  const filters = ['All', 'Approved', 'Pending', 'Draft', 'Review', 'Expiring', 'Archived'];

  const visibleDocs = useMemo(() => {
    let items = [...docs];
    if (filter !== 'All') {
      items = items.filter(
        d => d.status === filter || (filter === 'Expiring' && d.status === 'Expiring')
      );
    } else {
      items = items.filter(d => d.status !== 'Archived');
    }
    
    // Role based restrictions
    if (docRole === 'customer') {
      items = items.filter(d => d.status === 'Approved');
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
    if (globalFilters.type) {
      items = items.filter(d => (d.type || '').toLowerCase().includes(globalFilters.type.toLowerCase()));
    }
    if (globalFilters.owner) {
      items = items.filter(d => (d.owner || '').toLowerCase().includes(globalFilters.owner.toLowerCase()));
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
  }, [docs, filter, search, sort, globalFilters, docRole]);

  function handleAction(actionId, doc) {
    if (actionId === 'view') {
      setToast(`Opening ${doc.title}...`);
    } else if (actionId === 'download') {
      setToast(`Downloading ${doc.title}...`);
    } else if (actionId === 'replace') {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = e => {
        const file = e.target.files?.[0];
        if (file) {
          const uploadDate = new Date().toISOString().slice(0, 10);
          
          // Basic logic to increment "Rev 1" -> "Rev 2"
          let nextRev = 'Rev 1';
          const revMatch = doc.revision?.match(/Rev\s*(\d+(\.\d+)?)/i);
          if (revMatch) {
            const num = parseFloat(revMatch[1]);
            if (!isNaN(num)) {
              nextRev = `Rev ${Math.floor(num) + 1}`;
            }
          } else {
             nextRev = doc.revision ? `${doc.revision} (New)` : 'Rev 1';
          }
          
          setDocs(prev => prev.map(d => {
            if (d.title === doc.title) {
               return {
                 ...d,
                 title: file.name,
                 revision: nextRev,
                 uploadDate,
                 status: 'Review',
                 badge: 'yellow',
                 meta: `${d.type || 'Document'} • ${nextRev} • ${d.owner} • ${uploadDate}`
               };
            }
            return d;
          }));
          setToast(`Replaced with ${file.name}`);
        }
      };
      input.click();
    } else if (actionId === 'edit') {
      setEditModal({ 
        open: true, 
        doc, 
        formData: { 
          type: doc.type || '', 
          owner: doc.owner || '', 
        } 
      });
    } else if (actionId === 'approve') {
       setDocs(prev => prev.map(d => d.title === doc.title ? { ...d, status: 'Approved', badge: 'green' } : d));
       setToast(`${doc.title} approved`);
    } else if (actionId === 'archive') {
       setDocs(prev => prev.map(d => d.title === doc.title ? { ...d, status: 'Archived', badge: 'muted' } : d));
       setToast(`${doc.title} archived`);
    } else if (actionId === 'restore') {
       setDocs(prev => prev.map(d => d.title === doc.title ? { ...d, status: 'Draft', badge: 'blue' } : d));
       setToast(`${doc.title} restored to Draft status`);
    } else if (actionId === 'delete') {
       if (window.confirm(`Are you sure you want to permanently delete "${doc.title}"?`)) {
         setDocs(prev => prev.filter(d => d.title !== doc.title));
         setToast(`${doc.title} deleted successfully`);
       }
    }
  }

  function toggleSort(key) {
    setSort(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    const { doc, formData } = editModal;
    if (!doc) return;
    
    setDocs(prev => prev.map(d => {
      if (d.title === doc.title) {
        const newDoc = {
          ...d,
          type: formData.type || d.type,
          owner: formData.owner || d.owner,
        };
        newDoc.meta = `${newDoc.type || 'Document'} • ${newDoc.revision} • ${newDoc.owner} • ${newDoc.uploadDate}`;
        return newDoc;
      }
      return d;
    }));
    setToast(`Updated metadata for ${doc.title}`);
    setEditModal({ open: false, doc: null, formData: { type: '', owner: '' } });
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
          owner: currentUser?.name || 'Local User',
          uploadDate,
          status: 'Draft',
          badge: 'blue',
          meta: `Uploaded File • Rev 1 • ${currentUser?.name || 'Local User'} • ${uploadDate}`,
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
      owner: form.owner.trim() || currentUser.name || 'Unassigned',
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
      meta: `${form.type || 'Document'} • ${form.revision || 'Rev 1'} • ${form.owner || currentUser.name || 'Unassigned'} • ${uploadDate}`,
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
          <Btn onClick={() => setShowFilter(true)}>⚙ Filters</Btn>
          {(docRole === 'admin' || docRole === 'manager' || docRole === 'engineer') && (
            <>
              <Btn onClick={handleUpload}>↑ Upload</Btn>
            </>
          )}
          <Btn onClick={handleExport}>↓ Export</Btn>
          {(docRole === 'admin' || docRole === 'manager' || docRole === 'engineer') && (
              <Btn primary onClick={() => setShowModal(true)}>+ New Document</Btn>
          )}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>
                Showing <strong style={{ color: 'var(--text)' }}>{visibleDocs.length}</strong> document{visibleDocs.length === 1 ? '' : 's'}
              </span>
              <ActiveFiltersIndicator filters={{ filter: filter === 'All' ? '' : filter, search, ...globalFilters }} onClear={() => { setFilter('All'); setSearch(''); setGlobalFilters({ type: '', owner: ''}); }} />
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
                    { key: 'actions', label: 'Actions' },
                  ].map(col => (
                    <th
                      key={col.key}
                      onClick={() => col.key !== 'actions' && toggleSort(col.key)}
                      style={{
                        textAlign: col.key === 'meta' ? 'left' : (col.key === 'actions' ? 'center' : 'left'),
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        color: 'var(--muted)',
                        padding: '8px 10px',
                        borderBottom: '1px solid var(--border)',
                        cursor: col.key === 'actions' ? 'default' : 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col.label}
                      {sort.key === col.key && col.key !== 'actions' && (
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
                      <StatusBadge color={d.status === 'Archived' ? 'muted' : badgeMap[d.badge] || 'blue'}>{d.status}</StatusBadge>
                    </td>
                    <td style={{ padding: '10px 10px', fontSize: 12, color: 'var(--muted)' }}>{d.meta}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                      <ActionsDropdown doc={d} currentUser={currentUser.name} userRole={docRole} onAction={handleAction} />
                    </td>
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

      {/* Edit Metadata Modal */}
      <Modal open={editModal.open} title="Edit Metadata" onClose={() => setEditModal(prev => ({ ...prev, open: false }))}>
        {editModal.doc && (
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ marginBottom: 12 }}>
              <strong style={{ fontSize: 13, color: 'var(--text)' }}>Editing: {editModal.doc.title}</strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: 'var(--muted)' }}>Type</label>
                <input
                  name="type"
                  value={editModal.formData.type}
                  onChange={e => setEditModal(prev => ({ ...prev, formData: { ...prev.formData, type: e.target.value }}))}
                  placeholder="e.g. BOM"
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
                <label style={{ fontSize: 12, color: 'var(--muted)' }}>Owner</label>
                <input
                  name="owner"
                  value={editModal.formData.owner}
                  onChange={e => setEditModal(prev => ({ ...prev, formData: { ...prev.formData, owner: e.target.value }}))}
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
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
              <Btn onClick={() => setEditModal(prev => ({ ...prev, open: false }))} style={{ padding: '6px 14px' }}>Cancel</Btn>
              <Btn primary type="submit" style={{ padding: '6px 16px' }}>Save Changes</Btn>
            </div>
          </form>
        )}
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
