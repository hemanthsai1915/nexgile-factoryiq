# Nexgile – FactoryIQ Manufacturing Excellence Portal

A frontend-only React application implementing the full functional requirements from the Nexgile–FactoryIQ condensed spec.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher) — download from https://nodejs.org
- npm (comes with Node.js)

### Install & Run

```bash
# 1. Navigate into the project folder
cd nexgile-factoryiq

# 2. Install dependencies (first time only, takes ~1–2 min)
npm install

# 3. Start the development server
npm start
```

The app will open automatically at **http://localhost:3000**

---

## 📦 What's Included

### Modules (all navigable via sidebar)

| Module | Status | Notes |
|--------|--------|-------|
| **Dashboard** | ✅ Full | KPI strip, programs, alerts, production, quality, supply, Gantt, RMA, heatmap, docs |
| **Quality / NCR** | ✅ Full | NCR log, CAPA tracker, SPC chart, audit schedule |
| **Forecasting** | ✅ Full | Forecast vs actuals area chart, EOL tracker, capacity by site |
| **Program Tracking** | 🔷 Placeholder | Module stub ready |
| **Production** | 🔷 Placeholder | Module stub ready |
| **Supply Chain** | 🔷 Placeholder | Module stub ready |
| **After-Sales / RMA** | 🔷 Placeholder | Module stub ready |
| **Documents** | 🔷 Placeholder | Module stub ready |
| **SPC & Defects** | 🔷 Placeholder | Module stub ready |
| **Capacity View** | 🔷 Placeholder | Module stub ready |

### Tech Stack
- **React 18** — UI framework
- **Recharts** — Charts (bar, line, area, pie, SPC)
- **DM Mono + Syne + Instrument Serif** — Typography (Google Fonts)
- **CSS Variables** — Theming system

### Data
All data is mock/static defined in `src/data.js`. No backend, no database, no API calls.

---

## 🗂 Project Structure

```
src/
  App.jsx               — Root app, page routing via useState
  index.js              — React entry point
  index.css             — Global CSS variables & animations
  data.js               — All mock data
  components/
    ui.jsx              — Shared UI components (Panel, Badge, Button, etc.)
    Layout.jsx          — Topbar & Sidebar
    Dashboard.jsx       — Main overview dashboard
    QualityPage.jsx     — Quality / NCR / CAPA / SPC
    ForecastPage.jsx    — Forecasting & Capacity
```

---

## 🎨 Design System

| Token | Value | Use |
|-------|-------|-----|
| `--accent` | `#00e5a0` | Primary green (on-track, healthy) |
| `--accent2` | `#0084ff` | Blue (info, design phase) |
| `--accent3` | `#ff6b35` | Orange (supply, RMA) |
| `--warn` | `#ffd166` | Yellow (at-risk, warnings) |
| `--danger` | `#ff4757` | Red (critical, delayed) |
| `--bg` | `#0a0c0f` | Page background |
| `--surface` | `#111418` | Card surface |
| Font: Display | Syne 800 | Titles, KPI values |
| Font: Body | DM Mono | All UI text |
| Font: Accent | Instrument Serif italic | Page title accents |
