# 💰 Financial Analytics Dashboard

A full-stack financial dashboard that enables users to track and analyze transactions with powerful features like interactive charts, filtering, JWT-based authentication, and configurable CSV export.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (TypeScript)
- **Tailwind CSS** for styling
- **ECharts** for interactive visualizations
- **Axios** for API integration

### Backend
- **Node.js** with **Express** (TypeScript)
- **MongoDB** with Mongoose ODM
- **JWT** for secure user authentication
- **CSV-Writer** for export functionality

---

## ✨ Features

- 📊 **Dashboard** with revenue vs expense charts (monthly/yearly)
- 🔐 **JWT-based login & authentication**
- 📁 **Transaction Table** with:
  - Pagination
  - Sorting
  - Searching
  - Filters (category/date/type)
- 📤 **Export to CSV** (configurable columns)
- 🧮 Monthly summaries and statistics

---


## 📦 Installation

### Prerequisites

- Node.js ≥ 18.x
- MongoDB Compass (local or cloud)

### Backend Setup

```bash
cd backend
npm install
npm run dev
