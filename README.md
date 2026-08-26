# Himesh Expense Tracker (PWA)

A production-grade, offline-first Progressive Web App (PWA) built with **Next.js 14+ (App Router)**, **TypeScript (Strict Mode)**, **Tailwind CSS**, **Dexie.js (IndexedDB)**, **Recharts**, and **Lucide React**.

Designed with an Enterprise Fintech Dashboard aesthetic inspired by Linear, Stripe Dashboard, and Mercury Bank.

---

## ⚡ Features

- **Offline-First Persistence**: Powered by **Dexie.js** (IndexedDB) with real-time reactivity via `dexie-react-hooks` (`useLiveQuery`) for 0ms latency.
- **Executive Financial Summary**:
  - **Net Financial Balance** (Total Income - Total Spends) with savings rate retention metrics.
  - **Cash on Hand vs. Digital Outflow** (segmented visual breakdown comparing Cash vs. UPI/Card/NetBanking).
  - **Monthly Velocity & Run Rate** (Daily average spend burn rate, projected month-end outflow).
- **Interactive Analytics**:
  - **Recharts Donut Chart**: Category distribution with custom dark HTML tooltips and monetary value indicators.
  - **30-Day Expense Velocity Area Chart**: Smooth gradient-filled cash outflow trajectory.
- **High-Density Transaction Ledger**:
  - Desktop data table with responsive mobile card fallback.
  - Multi-parameter live filtering: keyword search, date range presets (`Today`, `7D`, `30D`, `This Month`, `Last Month`, `Custom`, `All`), payment modes (`UPI`, `Cash`, `Card`, `NetBanking`), categories (`Food`, `Travel`, `College`, `Tech`, `Bills`, `Misc`), and sorting.
  - Direct inline row editing and deletion with confirmation dialogs.
- **Quick Entry Modal (`Cmd+K` / `Ctrl+K` or `N`)**:
  - Segmented Expense/Income switch, formatted INR input, fast-increment pills (`+₹50`, `+₹100`, `+₹200`, `+₹500`, `+₹1000`, `+₹2000`).
  - Title suggestions (Chai, Metro, Lunch, Cloud Server, Exam Fee, etc.).
- **Enterprise Data Safety Center**:
  - RFC 4180-compliant **CSV Export**.
  - Structured **JSON Backup & Safe Restore** with client-side JSON schema validator.
  - Realistic Indian fintech sample data seeder & wipe tools.
- **PWA & Mobile Install Ready**:
  - Native install prompt banner intercepting `beforeinstallprompt` on Android Chrome.
  - Step-by-step smart instructions modal for iOS Safari ("Share -> Add to Home Screen").
  - Dismissal state persisted in `localStorage`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14+ (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Dexie.js](https://dexie.org/) (IndexedDB) + `dexie-react-hooks`
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: Vercel ready

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/himesh112005/Himesh-Expense-Tracker.git
cd Himesh-Expense-Tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production
```bash
npm run build
npm run start
```

---

## 🔒 Offline & Data Privacy

All transaction data is stored locally in your browser's IndexedDB. No financial records leave your device unless you explicitly export a JSON or CSV backup.
