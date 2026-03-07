export const programs = [
  { id: 'PRG-2401', name: 'Orion X',   phase: 'Production', progress: 82, owner: 'J. Torres',  status: 'on-track',  site: 'Hyderabad' },
  { id: 'PRG-2312', name: 'Titan R2',  phase: 'NPI',        progress: 57, owner: 'A. Mistry',  status: 'at-risk',   site: 'Pune'      },
  { id: 'PRG-2319', name: 'Nova-S',    phase: 'R&D',        progress: 28, owner: 'M. Chen',    status: 'in-design', site: 'Bangalore' },
  { id: 'PRG-2408', name: 'Apex EV',   phase: 'Production', progress: 15, owner: 'S. Patel',   status: 'delayed',   site: 'Hyderabad' },
  { id: 'PRG-2321', name: 'Sigma C',   phase: 'NPI',        progress: 94, owner: 'R. Nguyen',  status: 'on-track',  site: 'Chennai'   },
  { id: 'PRG-2330', name: 'Delta Pro', phase: 'R&D',        progress: 42, owner: 'L. Kumar',   status: 'in-design', site: 'Pune'      },
];

export const kpiData = [
  { label: 'Active Programs', value: '24',    delta: '+2 vs Q3',   deltaUp: true,  color: 'green', unit: '' },
  { label: 'OTD Rate',        value: '94.2%', delta: '+1.4% vs target', deltaUp: true, color: 'blue', unit: '' },
  { label: 'Open NCRs',       value: '11',    delta: '+3 this week', deltaUp: false, color: 'yellow', unit: '' },
  { label: 'Open RMAs',       value: '31',    delta: '+7 pending',  deltaUp: false, color: 'orange', unit: '' },
  { label: 'Critical Alerts', value: '4',     delta: '+2 since yesterday', deltaUp: false, color: 'red', unit: '' },
];

export const productionData = [
  { day: 'MON', plan: 420, actual: 395, yield: 98.1 },
  { day: 'TUE', plan: 420, actual: 418, yield: 97.4 },
  { day: 'WED', plan: 420, actual: 310, yield: 85.2 },
  { day: 'THU', plan: 420, actual: 440, yield: 99.0 },
  { day: 'FRI', plan: 420, actual: 380, yield: 93.7 },
  { day: 'SAT', plan: 200, actual: 155, yield: 88.0 },
  { day: 'SUN', plan: 100, actual: 60,  yield: 80.0 },
];

export const linePerformance = [
  { name: 'Line 1 – Assembly', oee: 98.1, trend: [60,72,68,80,75,85,90,88,95,98], color: '#00e5a0' },
  { name: 'Line 2 – SMT',      oee: 87.3, trend: [80,75,82,70,78,72,74,68,72,74], color: '#ffd166' },
  { name: 'Line 3 – Test',     oee: 71.0, trend: [85,80,75,72,68,65,62,64,60,62], color: '#ff4757' },
  { name: 'Line 4 – Inspection',oee: 92.5,trend: [70,74,78,80,85,82,88,90,91,93], color: '#0084ff' },
];

export const defectData = [
  { name: 'Solder defects', value: 36, color: '#ff4757' },
  { name: 'Mechanical',     value: 25, color: '#ffd166' },
  { name: 'Test failure',   value: 16, color: '#0084ff' },
  { name: 'Cosmetic',       value: 23, color: '#00e5a0' },
];

export const alerts = [
  { id: 1, type: 'crit', icon: '🔴', title: 'NCR-0443 – Solder void >15% on PCB Rev C', meta: 'Line 3 · AOI triggered · RCA pending · 5-Why', time: '2h ago' },
  { id: 2, type: 'warn', icon: '🟡', title: 'PO-8812 Lead Time Spike — Supplier TechCo', meta: '+14 days vs baseline · Logistics re-routing', time: '4h ago' },
  { id: 3, type: 'crit', icon: '🔴', title: 'RMA-2291 – Customer CRIT: field failure Apex EV', meta: 'Apex EV · Diagnosis in progress · Tier-1 escalation', time: '6h ago' },
  { id: 4, type: 'warn', icon: '🟡', title: 'Cp/Cpk OOC – Station 7 torque spec drifting', meta: 'SPC alert · Cpk = 0.88 · Immediate action required', time: '8h ago' },
  { id: 5, type: 'info', icon: '🔵', title: 'Certification Expiry – IATF 16949 renewal due', meta: '21 days remaining · Audit scheduled Mar 27', time: '1d ago' },
  { id: 6, type: 'ok',   icon: '🟢', title: 'CAPA-0218 closed — Effectiveness verified', meta: 'Orion X · 8D complete · Containment lifted', time: '2d ago' },
];

export const suppliers = [
  { name: 'TechCo Inc.',  score: 91, leadTime: '+14d',   ltColor: '#ffd166' },
  { name: 'AlphaBoard',   score: 97, leadTime: 'On time', ltColor: '#00e5a0' },
  { name: 'ChipMart EU',  score: 74, leadTime: '+22d',   ltColor: '#ff4757' },
  { name: 'FlexParts',    score: 88, leadTime: '+3d',    ltColor: '#9aa5bc' },
  { name: 'MegaSemi',     score: 95, leadTime: 'On time', ltColor: '#00e5a0' },
];

export const rmaList = [
  { id: 'RMA-2291', product: 'Apex EV',  reason: 'Field failure', stage: 'Diagnosis', stageBadge: 'red'    },
  { id: 'RMA-2288', product: 'Orion X',  reason: 'Cosmetic',      stage: 'Triage',    stageBadge: 'yellow' },
  { id: 'RMA-2285', product: 'Sigma C',  reason: 'DOA',           stage: 'Repair',    stageBadge: 'blue'   },
  { id: 'RMA-2281', product: 'Titan R2', reason: 'Warranty',      stage: 'Closed',    stageBadge: 'green'  },
  { id: 'RMA-2279', product: 'Delta Pro',reason: 'Intermittent',  stage: 'Triage',    stageBadge: 'yellow' },
];

export const documents = [
  { icon: '📐', title: 'PRG-2401 BOM Rev 4.2',         meta: 'ECO-0441 · Updated 2h ago · J. Torres',       status: 'Approved',  badge: 'green'  },
  { icon: '🔬', title: 'PPAP Package – Sigma C',        meta: 'Level 3 · Awaiting customer sign-off',        status: 'Pending',   badge: 'yellow' },
  { icon: '📋', title: 'IATF 16949 Compliance Pack',    meta: 'Rev 2026.1 · Expires Mar 27 · ⚠ Expiring',   status: 'Expiring',  badge: 'red'    },
  { icon: '🗒️', title: 'Test Procedure TP-0088',        meta: 'Knowledge Base · 3D CAD viewer linked',       status: 'Draft',     badge: 'blue'   },
  { icon: '⚙️', title: 'Control Plan – Line 3 Station 7',meta: 'Updated after Cpk OOC event · Pending QE',  status: 'Review',    badge: 'yellow' },
  { icon: '📄', title: 'DFM Report – Nova-S',            meta: 'Design for manufacturability · Rev 1.2',      status: 'Approved',  badge: 'green'  },
  { icon: '📑', title: 'Work Instruction WI-0442',       meta: 'Assembly line 1 · Torque spec update',       status: 'Draft',     badge: 'blue'   },
  { icon: '📊', title: 'FMEA – Apex EV Subsystem A',     meta: 'RPN analysis · Updated 2026-02',             status: 'Review',    badge: 'yellow' },
  { icon: '🗂️', title: 'Spare Parts Catalog v3.1',      meta: 'Orion X / Sigma C / Titan R2',                status: 'Approved',  badge: 'green'  },
  { icon: '📃', title: 'Warranty Terms – 2026',          meta: 'Standard warranty · 24 months',               status: 'Approved',  badge: 'green'  },
];

export const auditLogs = [
  { id: 1, user: 'J. Torres', action: 'Document approved', target: 'PRG-2401 BOM Rev 4.2', time: '2h ago', type: 'approval' },
  { id: 2, user: 'M. Chen', action: 'NCR created', target: 'NCR-0443', time: '4h ago', type: 'create' },
  { id: 3, user: 'S. Patel', action: 'RMA status updated', target: 'RMA-2285', time: '5h ago', type: 'update' },
  { id: 4, user: 'A. Mistry', action: 'ECO submitted', target: 'ECO-0442', time: '6h ago', type: 'create' },
  { id: 5, user: 'R. Nguyen', action: 'Login', target: 'Portal', time: '8h ago', type: 'auth' },
  { id: 6, user: 'L. Kumar', action: 'Report exported', target: 'Forecast Q1', time: '1d ago', type: 'export' },
  { id: 7, user: 'J. Torres', action: 'Role config changed', target: 'Quality Eng', time: '2d ago', type: 'admin' },
];

export const ganttItems = [
  { label: 'PRG-2401 FAI Gate',     left: 5,  width: 25, color: '#00e5a0', bg: 'rgba(0,229,160,0.15)' },
  { label: 'Titan R2 Design Rev.',  left: 20, width: 35, color: '#ffd166', bg: 'rgba(255,209,102,0.15)' },
  { label: 'Nova-S Prototype',      left: 40, width: 30, color: '#0084ff', bg: 'rgba(0,132,255,0.15)'   },
  { label: 'Apex EV Qualification', left: 55, width: 38, color: '#ff4757', bg: 'rgba(255,71,87,0.15)'   },
  { label: 'Sigma C PPQ / Sign-off',left: 2,  width: 50, color: '#00e5a0', bg: 'rgba(0,229,160,0.15)' },
  { label: 'Delta Pro DR1',         left: 65, width: 25, color: '#0084ff', bg: 'rgba(0,132,255,0.15)'   },
];

export const spcData = Array.from({ length: 30 }, (_, i) => ({
  point: i + 1,
  value: 1.33 + Math.sin(i * 0.6) * 0.25 + (Math.random() - 0.5) * 0.15,
  ucl: 1.67,
  lcl: 0.99,
  target: 1.33,
}));

export const heatmapData = [
  0.05,0.1,0.2,0.1,0.05,0.3,0.15,0.1,0.2,0.5,0.8,0.3,
  0.1,0.2,0.6,0.4,0.1,0.5,0.7,0.3,0.9,1.0,0.6,0.2,
  0.3,0.1,0.4,0.2,0.05,0.2,0.4,0.1,0.5,0.7,0.4,0.1,
  0.05,0.1,0.1,0.05,0.2,0.1,0.2,0.1,0.1,0.3,0.2,0.1,
];

export const forecastData = [
  { month: 'Oct', forecast: 1800, actual: 1750, committed: 1800 },
  { month: 'Nov', forecast: 2100, actual: 2050, committed: 2100 },
  { month: 'Dec', forecast: 1950, actual: 1900, committed: 1950 },
  { month: 'Jan', forecast: 2200, actual: 2180, committed: 2200 },
  { month: 'Feb', forecast: 2400, actual: 2350, committed: 2400 },
  { month: 'Mar', forecast: 2600, actual: null,  committed: 2600 },
  { month: 'Apr', forecast: 2800, actual: null,  committed: 2700 },
  { month: 'May', forecast: 2750, actual: null,  committed: 2650 },
];
