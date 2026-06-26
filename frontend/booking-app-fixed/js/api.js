const API = 'https://the-ledger-xr8h.onrender.com/api';

async function signup(name, email, password) {
  const res = await fetch(`${API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

async function saveBooking(bookingData) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(bookingData),
  });
  return res.json();
}

async function getMyBookings() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/bookings/my`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
}