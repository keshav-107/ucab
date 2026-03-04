# Ucab — MERN Stack Cab Booking App

A full-stack cab booking application built with MongoDB, Express.js, React.js, and Node.js (MERN).

---

## Project Structure

```
ola-hu-uber/
├── backend/          ← Express.js + MongoDB API
│   ├── controllers/
│   ├── db/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── uploads/      ← Car images stored here (excluded from Git)
│   ├── .env          ← Set your MONGO_URI here
│   └── server.js
│
└── frontend/         ← React (Vite) app
    └── src/
        ├── api/axios.js
        ├── pages/
        │   ├── user/      ← Home, Login, Register, Uhome, Cabs, BookCab, Mybookings
        │   └── admin/     ← Alogin, Aregister, Ahome, Users, Bookings, Acabs, Addcar...
        ├── App.jsx
        └── index.css
```

---

## Local Development

### 1. Backend
```bash
cd backend
# Edit .env and set your MONGO_URI
npm install
npm start
```

### 2. Frontend
```bash
cd frontend
# Edit .env and set VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

---

## Deploying to Render (One Repo, Two Services)

### Backend — Web Service
| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

Set these **Environment Variables** in Render:
- `MONGO_URI` = your MongoDB Atlas connection string
- `JWT_SECRET` = `ucab_super_secret_key_2024`
- `PORT` = `8000`

### Frontend — Static Site
| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

Set these **Environment Variables** in Render:
- `VITE_API_URL` = your Render backend URL (e.g. `https://ucab-api.onrender.com`)

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/users/register` | None | Register user |
| POST | `/api/users/login` | None | User login |
| GET | `/api/users/profile` | User | Get profile |
| GET | `/api/users/all` | Admin | All users |
| PUT | `/api/users/:id` | User | Edit user |
| DELETE | `/api/users/:id` | Admin | Delete user |
| POST | `/api/admin/register` | None | Register admin |
| POST | `/api/admin/login` | None | Admin login |
| GET | `/api/cars/all` | None | List all cabs |
| POST | `/api/cars/add` | Admin | Add cab |
| GET | `/api/cars/:id` | None | Get cab |
| PUT | `/api/cars/:id` | Admin | Edit cab |
| DELETE | `/api/cars/:id` | Admin | Delete cab |
| POST | `/api/bookings/book` | User | Book cab |
| GET | `/api/bookings/mybookings` | User | User's bookings |
| GET | `/api/bookings/all` | Admin | All bookings |
| PUT | `/api/bookings/:id/status` | Admin | Update status |
| PUT | `/api/bookings/:id/cancel` | User | Cancel booking |

---

## Tech Stack

- **Frontend**: React (Vite), React Router, Axios, Bootstrap 5
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB (Atlas recommended)
- **Auth**: JWT + bcryptjs
- **Uploads**: Multer
