<div align="center">

# 💎 Himesh Expense Tracker (PWA)

### Production-grade, Offline-First Personal Finance Dashboard & PWA

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Dexie.js](https://img.shields.io/badge/Dexie.js-IndexedDB-10B981?style=for-the-badge&logo=dexie&logoColor=white)](https://dexie.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline_First-6366F1?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

**Strict, minimal, high-density fintech dashboard inspired by Linear, Stripe Dashboard, and Mercury Bank.**  
Engineered with **0ms perceptible latency**, native desktop/mobile PWA installability, and local IndexedDB persistence.

[Features](#-key-features) • [Design System](#-fintech-design-system) • [Architecture](#-architecture--stack) • [Keyboard Shortcuts](#-keyboard-shortcuts) • [Getting Started](#-getting-started) • [Deployment](#-vercel-deployment)

</div>

---

## ✨ Key Features

### 1. ⚡ 0ms Latency Offline-First Engine
- **Persistent IndexedDB Storage**: Uses **Dexie.js** with strictly indexed fields (`++id, title, amount, type, paymentMode, category, createdAt`).
- **Live Reactivity**: Driven by `dexie-react-hooks` (`useLiveQuery`) for instant zero-re-render UI updates without server latency or network roundtrips.
- **Indian Standard Time (IST)**: Native timestamp precision (`Asia/Kolkata`, `+05:30`) and rupee currency formatting (`₹ INR` with `en-IN` tabular numerals).

### 2. 📊 Executive Financial Summary
- **Net Financial Position**: Real-time balance calculation (`Total Income - Total Spends`) with visual savings retention badge.
- **Cash on Hand vs. Digital Outflow**: Dual-tone segmented progress bar comparing physical Cash against digital channels (UPI, Debit/Credit Card, NetBanking).
- **Velocity & Burn Rate**: Daily average spend velocity tracking and projected 30-day run rate metrics.

### 3. 📈 High-Density Analytics
- **Category Donut Chart**: Interactive Recharts donut visualization with custom dark HTML tooltips and monetary value indicators (`Food`, `Travel`, `College`, `Tech`, `Bills`, `Misc`).
- **30-Day Expense Velocity Area Chart**: Smooth gradient-filled cash outflow trajectory with crosshair tooltips.

### 4. 🗂️ Transaction Feed & Multi-Filter Ledger
- **High-Density Desktop Table & Mobile Fallback**: Compact, tabular-numeral data grid with responsive cards for smartphones.
- **Live Multi-Criteria Filtering**:
  - Full-text keyword search across titles and notes.
  - Date presets: `Today`, `Past 7D`, `Past 30D`, `This Month`, `Last Month`, `Custom Range`, and `All Time`.
  - Channel toggles (`UPI`, `Cash`, `Card`, `NetBanking`) and Transaction types (`Expense`, `Income`).
  - Sorting by Newest, Oldest, Highest Amount, and Lowest Amount.
- **Inline Actions**: Direct record quick-edit and safe delete with confirmation dialog.

### 5. ⚡ Quick Entry Drawer & Fast-Pills
- **Keyboard Shortcut**: Press `Cmd+K` / `Ctrl+K` or `N` from anywhere to trigger instant entry.
- **Fast Increment Top-ups**: One-tap pills (`+₹50`, `+₹100`, `+₹200`, `+₹500`, `+₹1000`, `+₹2000`).
- **Smart Suggestions**: Quick chips for frequent expenses (Chai & Snacks, Metro, Exam Fee, Cloud Server, Zomato, etc.).

### 6. 🛡️ Enterprise Data Safety Center
- **RFC 4180 CSV Export**: One-click export for Excel, Google Sheets, and financial audits.
- **JSON Backup & Safe Restore**: Full snapshot exports with a client-side JSON schema validator that verifies field types, limits, and structures prior to database merge/overwrite.
- **Sample Seeder & Wipe**: Load rich real-world Indian fintech mock data or perform factory reset.

### 7. 📱 Production PWA & Native Install
- **Service Worker (`sw.js`)**: Offline asset and navigation caching via a stale-while-revalidate strategy.
- **Smart Install Banner**: Intercepts `beforeinstallprompt` on Android Chrome and delivers step-by-step smart tooltips on iOS Safari ("Share -> Add to Home Screen").
- **State Persistence**: Install dismissal remembered in `localStorage`.

---

## 🎨 Fintech Design System

The interface adheres to strict enterprise fintech UI guidelines (zero chaotic neon blurs, zero oversized toy cards, zero text clipping):

| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| **Surface Background** | `#0B0F17` | Deep neutral slate canvas |
| **Panel Surface** | `#111827` | High-contrast card foreground panels |
| **Subtle Borders** | `#1F2937` | 1px clean separation borders |
| **Inflow / Balance** | `#10B981` (Emerald) | Positive deltas, income, UPI badges |
| **Outflow / Expense** | `#F43F5E` (Rose) | Outflows, negative balances, danger actions |
| **Primary Action** | `#6366F1` (Indigo) | Primary buttons, active focus rings, glows |
| **Cash Reserves** | `#F59E0B` (Amber) | Physical cash metrics, burn rate warnings |
| **Typography** | `Inter`, `font-sans` | Native tabular numerals (`tabular-nums`), `cv02-cv11` |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>⌘</kbd> + <kbd>K</kbd> or <kbd>Ctrl</kbd> + <kbd>K</kbd> | Open Quick Entry Sheet |
| <kbd>N</kbd> | Record New Transaction |
| <kbd>Ctrl</kbd> + <kbd>Enter</kbd> / <kbd>⌘</kbd> + <kbd>Enter</kbd> | Save & Submit Transaction |
| <kbd>Esc</kbd> | Close Modal / Cancel Action |

---

## 🏗️ Architecture & Stack

```
himesh-expense-tracker/
├── app/
│   ├── globals.css          # Design tokens, custom scrollbars, tabular-nums
│   ├── layout.tsx           # PWA metadata, theme viewport, font configuration
│   ├── manifest.ts          # Web App Manifest generator
│   └── page.tsx             # Executive Fintech Dashboard (High-density layout)
├── components/
│   ├── dashboard/
│   │   ├── ExecutiveSummary.tsx     # 3-Column Metric Cards (Net, Cash vs UPI, Run Rate)
│   │   ├── AnalyticsSection.tsx     # Recharts Donut & 30-Day Expense Velocity Area Chart
│   │   ├── TransactionFeed.tsx      # Desktop data grid + Mobile card fallback + Multi-filter
│   │   ├── Header.tsx               # Top enterprise navbar with live DB status
│   │   └── PwaInstallBanner.tsx     # Android Chrome & iOS Safari install trigger
│   ├── modals/
│   │   ├── TransactionModal.tsx     # Quick entry sheet (+₹ pills, suggestions, autofocus)
│   │   ├── DataBackupModal.tsx      # CSV/JSON exports, schema validator restore, seeder
│   │   └── DeleteConfirmModal.tsx   # Deletion confirmation dialog
│   └── ui/                          # Atomic Button, Card, Badge, Input components
├── lib/
│   ├── db.ts                # Dexie IndexedDB schema, CRUD, seeders, export/import
│   ├── types.ts             # Strict TypeScript definitions & schema interfaces
│   ├── utils.ts             # INR Currency formatters, IST date-time, CSV generator
│   └── hooks/
│       ├── useTransactions.ts # dexie-react-hooks live queries
│       └── usePWA.ts        # PWA install prompt & offline status tracker
└── public/
    ├── sw.js                # Offline service worker cache strategy
    ├── icon-192.png         # PWA icon 192x192
    └── icon-512.png         # PWA icon 512x512
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.17.0` or higher (Node 20+ / 22+ recommended)
- **npm** or **yarn** or **pnpm**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/himesh112005/Himesh-Expense-Tracker.git
cd Himesh-Expense-Tracker

# 2. Install dependencies
npm install

# 3. Launch the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Production Build & Verification

```bash
# Compile and check strict TypeScript types
npm run build

# Start the production server
npm run start
```

---

## 🌐 Vercel Deployment

Deploy with zero configuration to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/himesh112005/Himesh-Expense-Tracker.git)

1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Framework Preset: **Next.js**.
4. Click **Deploy**. (Build passes with 0 dynamic-route or type errors).

---

## 🔒 Privacy & Offline Guarantee

- **Zero Cloud Leakage**: All financial entries and balances reside purely in your browser's local **IndexedDB**.
- **No Third-Party Analytics**: No telemetry trackers or invasive scripts.
- **Self-Contained Backups**: Export your data at any time in RFC-compliant CSV or JSON format.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
Built with precision by <strong>Himesh</strong>
</div>
