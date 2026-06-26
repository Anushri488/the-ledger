/* ============================================================
   app.js — main glue
   ============================================================ */

const state = {
  mode: 'hotel',
  rooms: [],
  selectedRoomId: null,
  selection: null,
};

const els = {};
let calendar;
const validators = {};

function cacheEls() {
  els.modeHotel = document.getElementById('modeHotelBtn');
  els.modeEvent = document.getElementById('modeEventBtn');
  els.calendarToggle = document.getElementById('calendarToggle');
  els.calendarWrap = document.getElementById('calendarWrap');
  els.bookingForm = document.getElementById('bookingForm');
  els.fullName = document.getElementById('fullName');
  els.email = document.getElementById('email');
  els.phone = document.getElementById('phone');
  els.guests = document.getElementById('guests');
  els.comments = document.getElementById('comments');
  els.liveSummary = document.getElementById('liveSummary');
  els.roomsGrid = document.getElementById('roomsGrid');
  els.sectionLabel = document.getElementById('sectionLabel');
  els.formErrorBanner = document.getElementById('formErrorBanner');

  els.modal = document.getElementById('summaryModal');
  els.modalName = document.getElementById('modalName');
  els.modalEmail = document.getElementById('modalEmail');
  els.modalDates = document.getElementById('modalDates');
  els.modalRoom = document.getElementById('modalRoom');
  els.modalNights = document.getElementById('modalNights');
  els.modalTotal = document.getElementById('modalTotal');
  els.confirmBtn = document.getElementById('confirmBtn');
  els.closeModalBtn = document.getElementById('closeModalBtn');

  els.success = document.getElementById('successScreen');
  els.bookingId = document.getElementById('bookingIdDisplay');
  els.successRecap = document.getElementById('successRecap');
  els.bookAnotherBtn = document.getElementById('bookAnotherBtn');

  els.payment = document.getElementById('paymentScreen');
  els.payAmountSub = document.getElementById('payAmountSub');
  els.payAmountValue = document.getElementById('payAmountValue');
  els.payNowBtn = document.getElementById('payNowBtn');
  els.cancelPayBtn = document.getElementById('cancelPayBtn');
  els.processing = document.getElementById('processingScreen');

  // Auth
  els.authModal = document.getElementById('authModal');
  els.tabLogin = document.getElementById('tabLogin');
  els.tabSignup = document.getElementById('tabSignup');
  els.loginForm = document.getElementById('loginForm');
  els.signupForm = document.getElementById('signupForm');
  els.loginBtn = document.getElementById('loginBtn');
  els.signupBtn = document.getElementById('signupBtn');
  els.authError = document.getElementById('authError');
  els.authSuccess = document.getElementById('authSuccess');
  els.userNameDisplay = document.getElementById('userNameDisplay');
  els.logoutBtn = document.getElementById('logoutBtn');
  els.myBookingsBtn = document.getElementById('myBookingsBtn');
  els.myBookingsModal = document.getElementById('myBookingsModal');
  els.myBookingsList = document.getElementById('myBookingsList');
  els.closeMyBookingsBtn = document.getElementById('closeMyBookingsBtn');
}

function init() {
  cacheEls();
  initAuth();
  bindModeToggle();
  bindCalendarToggle();

  calendar = new LedgerCalendar(document.getElementById('calendar'), {
    mode: 'range',
    onChange: onDatesChanged,
  });

  bindValidators();
  bindModal();
  els.bookingForm.addEventListener('submit', (e) => e.preventDefault());
  fetchRooms();
}

/* ============================================================
   AUTH
   ============================================================ */

function initAuth() {
  // Check if already logged in
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  if (token && userName) {
    showLoggedInState(userName);
  }

  // Tab switching
  els.tabLogin.addEventListener('click', () => {
    els.tabLogin.className = 'btn btn-primary';
    els.tabSignup.className = 'btn btn-ghost';
    els.loginForm.style.display = 'block';
    els.signupForm.style.display = 'none';
    hideAuthMessages();
  });

  els.tabSignup.addEventListener('click', () => {
    els.tabSignup.className = 'btn btn-primary';
    els.tabLogin.className = 'btn btn-ghost';
    els.signupForm.style.display = 'block';
    els.loginForm.style.display = 'none';
    hideAuthMessages();
  });

  // Login
  els.loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      showAuthError('Email aur password dono bharein');
      return;
    }

    els.loginBtn.textContent = 'Login ho raha hai...';
    els.loginBtn.disabled = true;

    const res = await login(email, password);

    els.loginBtn.textContent = 'Login';
    els.loginBtn.disabled = false;

    if (res.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('userName', res.user.name);
      showLoggedInState(res.user.name);
      closeOverlay(els.authModal);
    } else {
      showAuthError(res.message || 'Login fail hua');
    }
  });

  // Signup
  els.signupBtn.addEventListener('click', async () => {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (!name || !email || !password) {
      showAuthError('Sab fields bharein');
      return;
    }
    if (password.length < 6) {
      showAuthError('Password kam se kam 6 characters ka hona chahiye');
      return;
    }

    els.signupBtn.textContent = 'Account ban raha hai...';
    els.signupBtn.disabled = true;

    const res = await signup(name, email, password);

    els.signupBtn.textContent = 'Sign Up';
    els.signupBtn.disabled = false;

    if (res.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('userName', res.user.name);
      showLoggedInState(res.user.name);
      closeOverlay(els.authModal);
    } else {
      showAuthError(res.message || 'Signup fail hua');
    }
  });

  // Logout
  els.logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    els.userNameDisplay.style.display = 'none';
    els.logoutBtn.style.display = 'none';
    els.myBookingsBtn.style.display = 'none';
    openOverlay(els.authModal);
  });

  // My Bookings
  els.myBookingsBtn.addEventListener('click', async () => {
    openOverlay(els.myBookingsModal);
    els.myBookingsList.innerHTML = '<p style="color:var(--text-dim);">Load ho raha hai...</p>';
    const bookings = await getMyBookings();
    if (!bookings.length) {
      els.myBookingsList.innerHTML = '<p style="color:var(--text-dim);">Abhi koi booking nahi hai.</p>';
      return;
    }
    els.myBookingsList.innerHTML = bookings.map((b) => `
      <div style="border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <strong style="font-family:var(--font-display);">${b.roomTitle}</strong>
          <span style="font-family:var(--font-mono);color:var(--brass-light);font-size:0.8rem;">${b.bookingId}</span>
        </div>
        <div style="color:var(--text-dim);font-size:0.83rem;">
          ${b.checkIn ? `Check-in: ${new Date(b.checkIn).toLocaleDateString('en-IN')} → Check-out: ${new Date(b.checkOut).toLocaleDateString('en-IN')}` : `Event: ${new Date(b.eventDate).toLocaleDateString('en-IN')}`}
        </div>
        <div style="margin-top:6px;display:flex;justify-content:space-between;">
          <span style="color:var(--text-dim);font-size:0.83rem;">Guests: ${b.guests}</span>
          <span style="color:var(--brass-light);font-weight:700;">₹${b.totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>
    `).join('');
  });

  els.closeMyBookingsBtn.addEventListener('click', () => closeOverlay(els.myBookingsModal));
}

function showLoggedInState(name) {
  els.userNameDisplay.textContent = `👋 ${name}`;
  els.userNameDisplay.style.display = 'inline';
  els.logoutBtn.style.display = 'inline-block';
  els.myBookingsBtn.style.display = 'inline-block';
}

function showAuthError(msg) {
  els.authError.textContent = msg;
  els.authError.style.display = 'block';
  els.authSuccess.style.display = 'none';
}

function hideAuthMessages() {
  els.authError.style.display = 'none';
  els.authSuccess.style.display = 'none';
}

/* ============================================================
   MODE TOGGLE
   ============================================================ */

function bindModeToggle() {
  els.modeHotel.addEventListener('click', () => switchMode('hotel'));
  els.modeEvent.addEventListener('click', () => switchMode('event'));
}

function switchMode(mode) {
  if (state.mode === mode) return;
  state.mode = mode;
  state.selectedRoomId = null;

  els.modeHotel.classList.toggle('is-active', mode === 'hotel');
  els.modeEvent.classList.toggle('is-active', mode === 'event');
  els.modeHotel.setAttribute('aria-pressed', mode === 'hotel');
  els.modeEvent.setAttribute('aria-pressed', mode === 'event');
  els.sectionLabel.textContent = mode === 'hotel' ? 'Available Rooms' : 'Available Event Slots';
  document.getElementById('guestsHint').textContent = mode === 'hotel' ? 'per room' : 'attendees';

  calendar.setMode(mode === 'hotel' ? 'range' : 'single');
  updateLiveSummary();
  renderRooms();
  if (validators.guests) validators.guests();
}

function bindCalendarToggle() {
  if (!els.calendarToggle) return;
  els.calendarToggle.addEventListener('click', () => {
    const open = els.calendarWrap.classList.toggle('is-open');
    els.calendarToggle.setAttribute('aria-expanded', String(open));
    els.calendarToggle.textContent = open ? 'Hide calendar \u25B2' : 'Select dates \u25BC';
  });
}

function onDatesChanged(selection) {
  state.selection = selection;
  updateLiveSummary();
  renderRooms();
}

/* ============================================================
   VALIDATION
   ============================================================ */

function bindValidators() {
  validators.name = attachLiveValidation(els.fullName, validateName);
  validators.email = attachLiveValidation(els.email, validateEmail);
  validators.phone = attachLiveValidation(els.phone, validatePhone);
  validators.guests = attachLiveValidation(els.guests, validateGuests, () => {
    const room = state.rooms.find((r) => r.id === state.selectedRoomId);
    if (room) return room.capacity;
    return state.mode === 'hotel' ? 10 : 500;
  });
}

/* ============================================================
   ROOMS
   ============================================================ */

async function fetchRooms() {
  try {
    const res = await fetch('data/rooms.json');
    state.rooms = await res.json();
  } catch (err) {
    els.roomsGrid.innerHTML = '<p class="rooms-empty">Could not load room data. Open via Live Server.</p>';
    return;
  }
  renderRooms();
}

function nightsLabel(n) {
  return `${n} night${n === 1 ? '' : 's'}`;
}

function computeTotalFor(room) {
  if (state.mode === 'hotel') {
    if (state.selection && state.selection.complete) {
      const total = room.price * state.selection.nights;
      return `${nightsLabel(state.selection.nights)} \u2192 \u20b9${total.toLocaleString('en-IN')} total`;
    }
    return '';
  }
  if (state.selection && state.selection.date) {
    return `\u20b9${room.price.toLocaleString('en-IN')} for this date`;
  }
  return '';
}

function renderRooms() {
  if (!els.roomsGrid) return;
  const list = state.rooms.filter((r) => r.type === state.mode);
  els.roomsGrid.innerHTML = '';

  if (list.length === 0) {
    els.roomsGrid.innerHTML = '<p class="rooms-empty">No options in this mode yet.</p>';
    return;
  }

  list.forEach((room, index) => {
    const card = document.createElement('article');
    card.className = 'room-card';
    card.style.animationDelay = `${index * 70}ms`;

    const roundedRating = Math.round(room.rating);
    const stars = '\u2605'.repeat(roundedRating) + '\u2606'.repeat(5 - roundedRating);
    const liveTotal = computeTotalFor(room);
    const isSelected = state.selectedRoomId === room.id;

    card.innerHTML = `
      <div class="room-card-media">
        <img src="${room.image}" alt="${room.title}" loading="lazy" />
        <span class="room-availability">${room.availability} left</span>
      </div>
      <div class="room-card-body">
        <div class="room-card-top">
          <h3>${room.title}</h3>
          <span class="room-stars" aria-label="${room.rating} out of 5 stars">${stars}</span>
        </div>
        <p class="room-tagline">${room.tagline}</p>
        <ul class="room-amenities">
          ${room.amenities.map((a) => `<li>${a}</li>`).join('')}
        </ul>
        <div class="room-card-foot">
          <div class="room-price">
            <strong>\u20b9${room.price.toLocaleString('en-IN')}</strong>
            <span>${state.mode === 'hotel' ? '/ night' : '/ booking'}</span>
          </div>
          <button type="button" class="btn btn-select ${isSelected ? 'is-selected' : ''}" data-room-id="${room.id}">
            ${isSelected ? 'Selected \u2713' : 'Select Room'}
          </button>
        </div>
        ${liveTotal ? `<p class="room-live-total">${liveTotal}</p>` : ''}
      </div>
    `;

    card.querySelector('.btn-select').addEventListener('click', () => onSelectRoom(room.id));
    els.roomsGrid.appendChild(card);
  });
}

function updateLiveSummary() {
  if (!els.liveSummary) return;
  if (state.mode === 'hotel') {
    els.liveSummary.textContent = (state.selection && state.selection.complete)
      ? `${formatShort(state.selection.start)} \u2192 ${formatShort(state.selection.end)} \u00b7 ${nightsLabel(state.selection.nights)}`
      : 'Pick check-in and check-out to see pricing.';
  } else {
    els.liveSummary.textContent = (state.selection && state.selection.date)
      ? `Event date: ${formatShort(state.selection.date)}`
      : 'Pick a date to see pricing.';
  }
}

function onSelectRoom(roomId) {
  const dateCheck = validateDateSelection(state.mode === 'hotel' ? 'range' : 'single', state.selection);
  const nameOk = validators.name();
  const emailOk = validators.email();
  const phoneOk = validators.phone();
  const guestsOk = validators.guests();

  if (!dateCheck.valid || !nameOk || !emailOk || !phoneOk || !guestsOk) {
    els.formErrorBanner.textContent = !dateCheck.valid
      ? dateCheck.message
      : 'Please fix the highlighted fields before continuing.';
    els.formErrorBanner.classList.add('is-visible');
    els.bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  els.formErrorBanner.classList.remove('is-visible');
  state.selectedRoomId = roomId;
  renderRooms();
  openSummaryModal(roomId);
}

function openSummaryModal(roomId) {
  const room = state.rooms.find((r) => r.id === roomId);
  let datesText = '';
  let nights = 1;
  let total = room.price;

  if (state.mode === 'hotel') {
    datesText = `${formatShort(state.selection.start)} \u2192 ${formatShort(state.selection.end)}`;
    nights = state.selection.nights;
    total = room.price * nights;
  } else {
    datesText = formatShort(state.selection.date);
  }

  els.modalName.textContent = els.fullName.value.trim();
  els.modalEmail.textContent = els.email.value.trim();
  els.modalDates.textContent = datesText;
  els.modalRoom.textContent = room.title;
  els.modalNights.textContent = state.mode === 'hotel' ? nightsLabel(nights) : '1 day';
  els.modalTotal.textContent = `\u20b9${total.toLocaleString('en-IN')}`;

  openOverlay(els.modal);
}

/* ============================================================
   MODAL + PAYMENT
   ============================================================ */

function bindModal() {
  els.closeModalBtn.addEventListener('click', closeModal);
  els.modal.addEventListener('click', (e) => {
    if (e.target === els.modal) closeModal();
  });
  els.confirmBtn.addEventListener('click', confirmBooking);
  els.bookAnotherBtn.addEventListener('click', resetEverything);
  initPaymentScreen();
}

function closeModal() {
  closeOverlay(els.modal);
}

function openOverlay(el) {
  el.classList.add('is-open');
  el.setAttribute('aria-hidden', 'false');
}

function closeOverlay(el) {
  el.classList.remove('is-open');
  el.setAttribute('aria-hidden', 'true');
}

function confirmBooking() {
  closeModal();
  const amountText = els.modalTotal.textContent;
  els.payAmountSub.textContent = `Total due: ${amountText}`;
  els.payAmountValue.textContent = amountText;
  openOverlay(els.payment);
}

function initPaymentScreen() {
  // Tab switching
  document.querySelectorAll('.pay-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pay-tab').forEach((t) => t.classList.remove('is-active'));
      document.querySelectorAll('.pay-panel').forEach((p) => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      const panelId = `panel${tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)}`;
      document.getElementById(panelId).classList.add('is-active');
    });
  });

  // UPI app selection
  document.querySelectorAll('.upi-app-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.upi-app-btn').forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      document.getElementById('upiIdInput').value = '';
    });
  });

  // Bank selection
  document.querySelectorAll('.bank-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bank-btn').forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
    });
  });

  // Card number formatting
  const cardNum = document.getElementById('cardNumber');
  if (cardNum) {
    cardNum.addEventListener('input', () => {
      let v = cardNum.value.replace(/\D/g, '').slice(0, 16);
      cardNum.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    });
  }

  // Expiry formatting
  const cardExp = document.getElementById('cardExpiry');
  if (cardExp) {
    cardExp.addEventListener('input', () => {
      let v = cardExp.value.replace(/\D/g, '').slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + ' / ' + v.slice(2);
      cardExp.value = v;
    });
  }

  // Pay Now — save booking to backend
  els.payNowBtn.addEventListener('click', async () => {
    closeOverlay(els.payment);
    openOverlay(els.processing);

    // Save booking to database
    const room = state.rooms.find((r) => r.id === state.selectedRoomId);
    const totalAmount = parseInt(els.payAmountValue.textContent.replace(/[^\d]/g, ''), 10);

    const bookingData = {
      roomId: room.id,
      roomTitle: room.title,
      mode: state.mode,
      checkIn: state.mode === 'hotel' ? state.selection.start : null,
      checkOut: state.mode === 'hotel' ? state.selection.end : null,
      eventDate: state.mode === 'event' ? state.selection.date : null,
      nights: state.mode === 'hotel' ? state.selection.nights : 1,
      guests: parseInt(els.guests.value, 10),
      totalAmount,
    };

    const res = await saveBooking(bookingData);

    setTimeout(() => {
      closeOverlay(els.processing);
      const bookingId = res.bookingId || `BK${Math.floor(100000 + Math.random() * 900000)}`;
      els.bookingId.textContent = bookingId;
      els.successRecap.textContent = `${els.modalRoom.textContent} \u00b7 ${els.modalDates.textContent} \u00b7 ${els.modalTotal.textContent}`;
      openOverlay(els.success);
    }, 2000);
  });

  // Back button
  els.cancelPayBtn.addEventListener('click', () => {
    closeOverlay(els.payment);
    openOverlay(els.modal);
  });
}

/* ============================================================
   RESET
   ============================================================ */

function resetEverything() {
  closeOverlay(els.success);
  els.bookingForm.reset();
  document.querySelectorAll('.field.is-invalid').forEach((f) => f.classList.remove('is-invalid'));
  document.querySelectorAll('.field-error').forEach((f) => {
    f.textContent = '';
    f.classList.remove('is-visible');
  });
  state.selectedRoomId = null;
  state.selection = null;
  calendar.reset();
  updateLiveSummary();
}

document.addEventListener('DOMContentLoaded', init);
