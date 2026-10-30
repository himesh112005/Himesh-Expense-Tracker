<div align="center">

# Himesh Expense Tracker

### Minimalist, Offline-First Personal Finance Tracker & Account Manager

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Dexie.js](https://img.shields.io/badge/Dexie.js-IndexedDB-10B981?style=for-the-badge&logo=dexie&logoColor=white)](https://dexie.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline_First-10B981?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-zinc-800?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

**A clean, distraction-free daily expense and accounts tracker.**  
Built with solid black surfaces, a single crisp emerald accent, zero shadows, clean borders, 0ms latency offline persistence in IndexedDB, and no fake money data.

[Features](#key-features) • [Design System](#design-principles) • [Account Management](#account-management) • [Period Tracking](#period-tracking-daily-weekly-monthly-yearly) • [Architecture](#architecture)

</div>

---

## Key Features

### 1. 100% Real Transactions (No Fake Money)
- **Clean Slate on Launch**: Automatic dummy transaction seeding has been removed. You start with zero clutter to record genuine daily expenses.
- **One-Click Demo Purge**: Easily wipe previous cached sample data in one click without losing your actual accounts.

### 2. Multi-Account Information Management
- **Bank, UPI & Cash Storage**: Register your bank accounts (HDFC, SBI, ICICI, etc.), UPI handles, physical cash wallets, and credit cards.
- **Real-Time Account Balance Sync**: Spending or receiving money through any linked account automatically recalculates and keeps account balances synchronized.
- **Primary Account Tagging**: Mark your daily default account for quick checkout.

### 3. Dedicated Daily, Weekly, Monthly & Yearly Tracking
- **Daily View**: Today's spending total, 24-hour velocity, and today's transactions.
- **Weekly View**: 7-day spend breakdown, daily averages, and week-over-week trends.
- **Monthly View**: Full calendar month outflow vs inflow, savings retention rate, and month run-rate.
- **Yearly View**: 12-month annual comparison, annual highest expense categories, and net yearly growth.

### 4. Transaction Change History & Remarks
- **Audit Updates**: Whenever a transaction is updated (price correction, discount applied, split refund), record a change reason.
- **Remarks Badge**: Clear visual indicator on the ledger showing the edit note so your records remain transparent and reliable.

### 5. Minimalist Design System
- **Solid Black + Single Emerald Accent**: No purple-to-blue gradients, no multi-color distractions.
- **Borders over Shadows**: Clean 1px borders replace heavy drop-shadows.
- **Typography Scale**: `Plus Jakarta Sans` for bold, tight headings (-0.02em letter spacing, 1.1–1.3 line-height) and `DM Sans` for body (1.6–1.8 line-height).
- **Initial 8-Item Folding**: Displays 6–9 items initially with a clean "Show more" accordion to prevent visual fatigue.
- **Mobile Touch Targets**: All touch targets meet or exceed 44×44px standards.

### 6. Offline-First IndexedDB Engine
- **0ms Local Persistence**: Uses Dexie.js for instant offline operations on your device.
- **Data Backups**: Export full offline JSON snapshots or CSV spreadsheets anytime.

---

## Account Management

You can manage your liquidity across different channels:
1. **Bank Accounts**: Maintain balances for your primary and secondary bank accounts.
2. **UPI Wallets**: Track GPay, PhonePe, and Paytm transaction balances.
3. **Cash in Pocket**: Keep physical wallet balances updated.
4. **Credit Cards**: Track credit spends and payment settlements.

---

## Period Tracking (Daily, Weekly, Monthly, Yearly)

Switch between the period tabs in the executive summary:
- **Daily**: Track what you spent today vs yesterday.
- **Weekly**: Monitor the 7-day spending pattern.
- **Monthly**: Review monthly budgets and savings rate.
- **Yearly**: High-level overview of annual cash flow and category distributions.

---

## Design Principles

- **One solid base color + one accent color**: Deep solid black `#09090b` + Emerald `#10b981`.
- **Flat buttons with subtle hover transitions**: Clean, functional interactions.
- **No emoji spam**: SVG Lucide icons exclusively.
- **Concrete verbs in CTAs**: "Record expense", "Receive income", "Add account".

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>⌘</kbd> + <kbd>K</kbd> or <kbd>Ctrl</kbd> + <kbd>K</kbd> | Open Record Expense Modal |
| <kbd>N</kbd> | Record New Expense |
| <kbd>Ctrl</kbd> + <kbd>Enter</kbd> | Save & Submit Record |
| <kbd>Esc</kbd> | Close Modal / Cancel |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/himesh112005/Himesh-Expense-Tracker.git
cd Himesh-Expense-Tracker

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
