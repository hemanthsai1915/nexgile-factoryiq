import React from 'react';

// ── Token helpers ──────────────────────────────────────────────────────────────
const COLORS = {
  green:  { accent: '#00e5a0', dim: 'rgba(0,229,160,0.12)',  border: 'rgba(0,229,160,0.25)'  },
  blue:   { accent: '#0084ff', dim: 'rgba(0,132,255,0.12)',  border: 'rgba(0,132,255,0.25)'  },
  yellow: { accent: '#ffd166', dim: 'rgba(255,209,102,0.12)',border: 'rgba(255,209,102,0.25)'},
  orange: { accent: '#ff6b35', dim: 'rgba(255,107,53,0.12)', border: 'rgba(255,107,53,0.25)' },
  red:    { accent: '#ff4757', dim: 'rgba(255,71,87,0.12)',   border: 'rgba(255,71,87,0.25)'  },
  muted:  { accent: '#5a6680', dim: 'rgba(90,102,128,0.12)', border: 'rgba(90,102,128,0.25)' },
};

export const getColor = (key) => COLORS[key] || COLORS.muted;

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ color = 'green', children }) {
  const c = getColor(color);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 4, fontSize: 12,
      letterSpacing: 0, fontWeight: 500, lineHeight: 1.4,
      background: c.dim, color: c.accent, border: `1px solid ${c.border}`,
      fontFamily: 'var(--font-sans)',
    }}>
      ● {children}
    </span>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────
export function Panel({ children, style }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      overflow: 'hidden',
      animation: 'fadeUp 0.4s ease both',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── PanelHeader ───────────────────────────────────────────────────────────────
export function PanelHeader({ dotColor = '#00e5a0', title, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: 0, lineHeight: 1.4 }}>
          {title}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{children}</div>
    </div>
  );
}

// ── Pill ──────────────────────────────────────────────────────────────────────
export function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: 12,
      fontSize: 12, letterSpacing: 0, lineHeight: 1.4, cursor: 'pointer',
      border: active ? '1px solid rgba(0,229,160,0.5)' : '1px solid var(--border)',
      background: active ? 'rgba(0,229,160,0.1)' : 'transparent',
      color: active ? '#00e5a0' : 'var(--muted)',
      fontFamily: 'var(--font-sans)',
      transition: 'all 0.15s',
    }}>
      {children}
    </button>
  );
}

// ── Btn ───────────────────────────────────────────────────────────────────────
export function Btn({ primary, onClick, children, style }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 16px', borderRadius: 6, cursor: 'pointer',
      fontFamily: 'var(--font-sans)', fontSize: 13, letterSpacing: 0, lineHeight: 1.4,
      transition: 'all 0.15s',
      background: primary ? '#00e5a0' : 'var(--surface2)',
      color: primary ? '#000' : 'var(--text)',
      border: primary ? '1px solid #00e5a0' : '1px solid var(--border)',
      fontWeight: primary ? 600 : 400,
      ...style,
    }}>
      {children}
    </button>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({ value, color = '#00e5a0', width = 80 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width, height: 4, background: 'var(--dim)', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 1s ease' }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 32, lineHeight: 1.4 }}>{value}%</span>
    </div>
  );
}

// ── Sparkline ────────────────────────────────────────────────────────────────
export function Sparkline({ data, color = '#00e5a0', height = 24, width = 120 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const last = data[data.length - 1];
  const lastX = width;
  const lastY = height - ((last - min) / range) * (height - 4) - 2;
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
    </svg>
  );
}

// ── SectionLabel ─────────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10, lineHeight: 1.4 }}>
      {children}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ style }) {
  return <div style={{ height: 1, background: 'var(--border)', ...style }} />;
}

// ── Tab Bar ───────────────────────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 16px' }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} style={{
          padding: '10px 16px', fontSize: 13, cursor: 'pointer',
          color: active === t ? '#00e5a0' : 'var(--muted)',
          background: 'none', border: 'none',
          borderBottom: active === t ? '2px solid #00e5a0' : '2px solid transparent',
          marginBottom: -1, fontFamily: 'var(--font-sans)', letterSpacing: 0,
          transition: 'all 0.15s',
        }}>
          {t}
        </button>
      ))}
    </div>
  );
}

// ── Modal ───────────────────────────────────────────────────────────────────────
export function Modal({ open, title, onClose, children, width = 520 }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5,10,20,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 40,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: width,
          background: 'var(--surface)',
          borderRadius: 10,
          border: '1px solid var(--border)',
          boxShadow: '0 18px 55px rgba(0,0,0,0.55)',
          overflow: 'hidden',
          animation: 'fadeUp 0.25s ease both',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {title}
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}

// ── Toast ───────────────────────────────────────────────────────────────────────
export function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 50,
        maxWidth: 320,
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 8,
          padding: '10px 14px',
          border: '1px solid var(--border)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          fontSize: 13,
          color: 'var(--text)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 16 }}>✓</span>
        <div style={{ flex: 1 }}>{message}</div>
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--muted)',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ── CSV Export Helper ───────────────────────────────────────────────────────────
export function exportToCsv(filename, rows, columns) {
  if (!rows || !rows.length) return;
  const header = columns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',');
  const body = rows
    .map(row =>
      columns
        .map(col => {
          const raw = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
          const value = raw == null ? '' : String(raw);
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\n');
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
const COMMON_OPTIONS = {
  site: ['Hyderabad', 'Pune', 'Chennai', 'Bangalore'],
  line: ['Line 1', 'Line 2', 'Line 3', 'Line 4'],
  station: ['SMT-1', 'SMT-2', 'Assembly', 'Test', 'Pack'],
  owner: ['System', 'Admin', 'Engineer'],
  type: ['SOP', 'Drawing', 'Spec', 'Report'],
  product: ['ECU-Pro', 'Sensor-X', 'Motor-Drive'],
  supplier: ['TechCorp', 'GlobalParts', 'AutoSupply'],
  program: ['Prj-Alpha', 'Prj-Beta', 'Prj-Gamma'],
  dateRange: ['Today', 'This Week', 'This Month', 'Q1 2026', 'Q2 2026'],
  user: ['Alice', 'Bob', 'System'],
  action: ['Login', 'Update', 'Delete', 'Create'],
  role: ['admin', 'manager', 'operator', 'viewer']
};

export function GlobalFilterModal({ open, onClose, filters, onApply }) {
  const [localFilters, setLocalFilters] = React.useState(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  const handleChange = (key, val) => setLocalFilters(prev => ({ ...prev, [key]: val }));

  if (!open) return null;

  return (
    <Modal open={open} title="Global Filters" onClose={onClose} width={400}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.keys(localFilters).map(key => (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'capitalize' }}>{key}</label>
            {COMMON_OPTIONS[key] && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                {COMMON_OPTIONS[key].map(opt => (
                  <Pill 
                    key={opt} 
                    active={localFilters[key]?.toLowerCase() === opt.toLowerCase()} 
                    onClick={() => handleChange(key, localFilters[key]?.toLowerCase() === opt.toLowerCase() ? '' : opt)}
                  >
                    {opt}
                  </Pill>
                ))}
              </div>
            )}
            <input 
              value={localFilters[key]} 
              onChange={e => handleChange(key, e.target.value)}
              placeholder={`Filter by ${key}...`}
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
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
          <Btn onClick={onClose} style={{ padding: '6px 14px' }}>Cancel</Btn>
          <Btn primary onClick={() => { onApply(localFilters); onClose(); }} style={{ padding: '6px 16px' }}>Apply Filters</Btn>
        </div>
      </div>
    </Modal>
  );
}
