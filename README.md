# 🏨 The Ledger — Hotel & Event Booking System

A full-stack hotel and event booking web application with user authentication, real-time room selection, and complete payment flow.

🔗 **Live Demo:** [ledger-booking.netlify.app](https://ledger-booking.netlify.app)  
💻 **GitHub:** [github.com/Anushri488/the-ledger](https://github.com/Anushri488/the-ledger)

---

## ✨ Features

- 🔐 **User Authentication** — Signup & Login with JWT tokens
- 📅 **Interactive Calendar** — Date range picker for hotel stays, single date for events
- 🏠 **Room Selection** — Dynamic room cards with live pricing
- 💳 **Payment Flow** — UPI, Credit/Debit Card, and Net Banking options
- 📋 **My Bookings** — View all past bookings after login
- 📱 **Responsive Design** — Works on desktop and mobile

---

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- Custom Calendar UI (no libraries)
- Deployed on **Netlify**
- **Frontend:** https://ledger-booking.netlify.app/

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT (JSON Web Tokens) for authentication
- bcryptjs for password encryption
- Deployed on **Render**
- **Backend:** https://the-ledger-xr8h.onrender.com

---

## 📁 Project Structure

```
the-ledger/
├── frontend/
│   └── booking-app-fixed/
│       ├── index.html
│       ├── css/
│       │   └── style.css
│       ├── js/
│       │   ├── app.js
│       │   ├── api.js
│       │   ├── calendar.js
│       │   └── validation.js
│       ├── data/
│       │   └── rooms.json
│       └── assets/
│           └── images/
└── backend/
    ├── server.js
    ├── models/
    │   ├── User.js
    │   └── Booking.js
    └── routes/
        ├── auth.js
        └── bookings.js
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Start the server:
```bash
node server.js
```

### Frontend Setup

Open `frontend/booking-app-fixed/index.html` with **Live Server** in VS Code.

> Make sure `js/api.js` has `const API = 'http://localhost:5000/api'` for local development.

---



## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create new booking |
| GET | `/api/bookings/my` | Get user's bookings |

---

## 👩‍💻 Developer

**Anushri Mishra**  

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
