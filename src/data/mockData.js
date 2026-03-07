// Extended mock data for manufacturing portal demo - no backend

export const projects = [
  { id: 'PRG-2401', name: 'Orion X', phase: 'Production', progress: 82, owner: 'J. Torres', status: 'on-track', site: 'Hyderabad' },
  { id: 'PRG-2312', name: 'Titan R2', phase: 'NPI', progress: 57, owner: 'A. Mistry', status: 'at-risk', site: 'Pune' },
  { id: 'PRG-2319', name: 'Nova-S', phase: 'R&D', progress: 28, owner: 'M. Chen', status: 'in-design', site: 'Bangalore' },
  { id: 'PRG-2408', name: 'Apex EV', phase: 'Production', progress: 15, owner: 'S. Patel', status: 'delayed', site: 'Hyderabad' },
  { id: 'PRG-2321', name: 'Sigma C', phase: 'NPI', progress: 94, owner: 'R. Nguyen', status: 'on-track', site: 'Chennai' },
  { id: 'PRG-2330', name: 'Delta Pro', phase: 'R&D', progress: 42, owner: 'L. Kumar', status: 'in-design', site: 'Pune' },
];

export const supplyChainOrders = [
  { id: 'PO-8812', supplier: 'TechCo Inc.', items: 12, value: 245000, status: 'In Transit', eta: 'Mar 12', delay: '+14d' },
  { id: 'PO-8798', supplier: 'AlphaBoard', items: 8, value: 128000, status: 'Shipped', eta: 'Mar 8', delay: null },
  { id: 'PO-8801', supplier: 'ChipMart EU', items: 24, value: 412000, status: 'Pending', eta: 'Mar 22', delay: '+22d' },
  { id: 'PO-8789', supplier: 'FlexParts', items: 16, value: 89000, status: 'Received', eta: null, delay: null },
  { id: 'PO-8815', supplier: 'MegaSemi', items: 6, value: 156000, status: 'Confirmed', eta: 'Mar 15', delay: null },
];

export const qualityReports = [
  { id: 'NCR-0443', program: 'Orion X', type: 'Solder void', severity: 'Critical', status: 'Open', date: '2026-03-04' },
  { id: 'NCR-0440', program: 'Sigma C', type: 'Mechanical defect', severity: 'Major', status: 'Under review', date: '2026-03-02' },
  { id: 'CAPA-0218', program: 'Titan R2', type: '8D closed', severity: 'N/A', status: 'Closed', date: '2026-02-28' },
  { id: 'NCR-0438', program: 'Apex EV', type: 'Test failure', severity: 'Minor', status: 'Open', date: '2026-03-01' },
  { id: 'AUDIT-2026-03', program: 'IATF 16949', type: 'Renewal audit', severity: 'Info', status: 'Scheduled', date: '2026-03-27' },
];

export const shipments = [
  { id: 'SHP-2291', destination: 'Acme Corp, USA', program: 'Orion X', units: 1200, status: 'In Transit', eta: 'Mar 10' },
  { id: 'SHP-2288', destination: 'EuroTech GmbH', program: 'Sigma C', units: 800, status: 'Delivered', eta: null },
  { id: 'SHP-2290', destination: 'APAC Distribution', program: 'Titan R2', units: 450, status: 'Cleared', eta: 'Mar 14' },
  { id: 'SHP-2289', destination: 'Domestic Hub', program: 'Delta Pro', units: 320, status: 'Pending', eta: 'Mar 18' },
];

export const rmaCases = [
  { id: 'RMA-2291', product: 'Apex EV', reason: 'Field failure', stage: 'Diagnosis', stageBadge: 'red', opened: '2026-03-02' },
  { id: 'RMA-2288', product: 'Orion X', reason: 'Cosmetic', stage: 'Triage', stageBadge: 'yellow', opened: '2026-03-01' },
  { id: 'RMA-2285', product: 'Sigma C', reason: 'DOA', stage: 'Repair', stageBadge: 'blue', opened: '2026-02-28' },
  { id: 'RMA-2281', product: 'Titan R2', reason: 'Warranty', stage: 'Closed', stageBadge: 'green', opened: '2026-02-25' },
  { id: 'RMA-2279', product: 'Delta Pro', reason: 'Intermittent', stage: 'Triage', stageBadge: 'yellow', opened: '2026-03-03' },
];
