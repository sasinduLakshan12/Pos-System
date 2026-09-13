# LoomPOS Smart Store — POS Order & Inventory System

> **Techloom.ai Software Engineer Intern — Practical Assessment Submission**

A full-stack, concurrency-safe Point-of-Sale (POS) and E-Commerce Inventory & Order Processing System built with a **Node.js Express REST API Backend** and a **React Vite Web UI Frontend**.

---

## 🏗️ Architecture: Decoupled Backend & Frontend

```
┌──────────────────────────────────────────────┐
│       React Web UI Frontend (Vite)           │
│        http://localhost:3000                 │
└──────────────────────┬───────────────────────┘
                       │ REST API Requests (/api/*)
                       ▼
┌──────────────────────────────────────────────┐
│       Node.js Express REST API Server        │
│        http://localhost:5000                 │
└──────────────────────┬───────────────────────┘
                       │ Transactions & Persisted Schemas
                       ▼
┌──────────────────────────────────────────────┐
│     MongoDB (Mongoose) / SQLite WAL Engine   │
└──────────────────────────────────────────────┘
```

---

## 🚀 Step-by-Step Running Guide

### 1. Install Dependencies

```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 2. Start Backend API Server (Terminal 1)
```bash
cd backend
npm run dev
```
👉 **Backend REST API running at**: `http://localhost:5000`

### 3. Start React Frontend UI (Terminal 2)
```bash
cd frontend
npm run dev
```
👉 **React Web App running at**: `http://localhost:3000`

---

## ⚡ Concurrency Verification Test

Run the included automated concurrency script:

```bash
cd backend
npm run test:concurrency
```

### Test Output Log:
```text
⚡ Starting Concurrency Verification Test...
Target: UltraWide 34" Monitor (Product ID: 3, Limited Stock: 3 units)
Simulating 15 simultaneous checkout requests...

[User 1] ✅ Reserved Order: ORD-1UTMIRD
[User 2] ❌ Rejected: Insufficient stock for "UltraWide 34" Monitor"
[User 3] ✅ Reserved Order: ORD-6KZ3OXQ
[User 4] ✅ Reserved Order: ORD-SZTQ6BH
...
================ TEST SUMMARY ================
Total Requests Sent : 15
Successful Locks    : 3
Rejected (Out of Stock): 12
🏆 VERIFICATION PASSED: No overselling occurred! Stock integrity maintained perfectly.
```
