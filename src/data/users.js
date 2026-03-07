// Role-based mock auth - no backend/database. Store selected role in localStorage.

export const ROLES = [
  { value: 'customer', label: 'Customer' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'supply_chain', label: 'Supply Chain / Procurement' },
  { value: 'quality_compliance', label: 'Quality / Compliance' },
  { value: 'program_mgmt', label: 'Program / Project Management' },
  { value: 'aftersales', label: 'After-Sales / Service' },
  { value: 'customer_success', label: 'Customer Success' },
  { value: 'production_planning', label: 'Production Planning' },
  { value: 'manufacturing_ops', label: 'Manufacturing Ops' },
  { value: 'quality_engineering', label: 'Quality Engineering' },
  { value: 'logistics', label: 'Logistics / Supply Chain' },
  { value: 'service_repair', label: 'Service / Repair' },
];

export const ROLE_LABELS = Object.fromEntries(ROLES.map(r => [r.value, r.label]));

export const ROLE_MODULES = {
  customer: ['dashboard', 'quality', 'documents', 'forecast', 'aftersales'],
  engineering: ['dashboard', 'programs', 'production', 'quality', 'documents', 'spc', 'capacity', 'forecast'],
  supply_chain: ['dashboard', 'supply', 'forecast', 'documents'],
  quality_compliance: ['dashboard', 'quality', 'spc', 'documents', 'audit'],
  program_mgmt: ['dashboard', 'programs', 'production', 'quality', 'supply', 'documents', 'forecast', 'capacity'],
  aftersales: ['dashboard', 'aftersales', 'documents'],
  customer_success: ['dashboard', 'quality', 'documents', 'aftersales', 'forecast'],
  production_planning: ['dashboard', 'production', 'forecast', 'capacity'],
  manufacturing_ops: ['dashboard', 'production', 'quality', 'capacity'],
  quality_engineering: ['dashboard', 'quality', 'spc', 'documents'],
  logistics: ['dashboard', 'supply', 'forecast'],
  service_repair: ['dashboard', 'aftersales', 'documents'],
};

export const ROLE_DASHBOARD_WIDGETS = {
  customer: ['projects', 'quality_summary', 'shipments', 'rma'],
  engineering: ['kpi', 'programs', 'alerts', 'production', 'quality', 'supply', 'gantt', 'rma', 'heatmap', 'docs'],
  supply_chain: ['kpi', 'supply', 'forecast_summary', 'shipments', 'orders'],
  quality_compliance: ['kpi', 'quality', 'alerts', 'spc_summary', 'docs'],
  program_mgmt: ['kpi', 'programs', 'alerts', 'production', 'quality', 'supply', 'gantt', 'rma', 'docs'],
  aftersales: ['rma', 'quality_summary', 'docs'],
  customer_success: ['projects', 'quality_summary', 'shipments', 'rma'],
  production_planning: ['kpi', 'production', 'forecast_summary', 'capacity_summary'],
  manufacturing_ops: ['kpi', 'production', 'quality', 'alerts', 'capacity_summary'],
  quality_engineering: ['kpi', 'quality', 'alerts', 'spc_summary', 'heatmap'],
  logistics: ['shipments', 'orders', 'supply', 'forecast_summary'],
  service_repair: ['rma', 'docs'],
};

export const STORAGE_KEYS = {
  ROLE: 'factoryiq_role',
  NAME: 'factoryiq_name',
};

export function getStoredUser() {
  const role = localStorage.getItem(STORAGE_KEYS.ROLE);
  if (!role) return null;
  const name = ROLE_LABELS[role] || role;
  return { role, name };
}

export function storeRole(role) {
  localStorage.setItem(STORAGE_KEYS.ROLE, role);
  localStorage.setItem(STORAGE_KEYS.NAME, ROLE_LABELS[role] || role);
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.ROLE);
  localStorage.removeItem(STORAGE_KEYS.NAME);
}
