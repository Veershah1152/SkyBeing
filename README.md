# SKYBEING 🛍️

A full-stack e-commerce web application built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## 📁 Project Structure

```
SKYBEING/
├── frontend/     # React + Vite app (port 5173)
└── backend/      # Node.js + Express API (port 8000)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account

---

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env     # fill in your real values
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env     # fill in your real values
npm run dev
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
See [`backend/.env.example`](./backend/.env.example) for all required variables:
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — Secret key for JWT tokens
- `CLOUDINARY_*` — Cloudinary image upload credentials
- `GOOGLE_CLIENT_*` — Google OAuth credentials
- `RAZORPAY_*` — Razorpay payment gateway credentials

### Frontend (`frontend/.env`)
See [`frontend/.env.example`](./frontend/.env.example):
- `VITE_GOOGLE_CLIENT_ID` — Google OAuth Client ID

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Redux Toolkit, TailwindCSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT, Google OAuth 2.0 |
| Payments | Razorpay |
| Images | Cloudinary |

---

## 📜 License
All rights reserved © SKYBEING
