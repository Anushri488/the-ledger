# The Ledger — Hotel & Event Booking UI

An interactive hotel/event booking web app with a custom calendar widget
and real-time form validation, built with **HTML5, CSS3, and Vanilla
JavaScript (ES6+)** — no frameworks, no build tools.

## Objective

Build an interactive hotel/event booking web UI featuring a custom
calendar widget and form validation for seamless reservations, exactly
as specified in the project brief.

## Live demo without a server

Because room data is loaded with `fetch('data/rooms.json')`, opening
`index.html` by double-clicking it (the `file://` protocol) will be
blocked by the browser's CORS policy and the room cards will not
appear. **Run it through a local server.**

## Environment setup

1. Install [VS Code](https://code.visualstudio.com/).
2. Install the **Live Server** extension (Ritwick Dey) from the VS Code
   marketplace.
3. (Optional) Initialise Git for version tracking.

## How to run

1. Open the `booking-app` folder in VS Code.
2. Right-click `index.html` → **Open with Live Server**.
3. The app opens at `http://127.0.0.1:5500` (or similar) in your browser.

## Project structure

```
booking-app/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── calendar.js      → custom calendar widget (range + single mode)
│   ├── validation.js    → real-time field validation
│   └── app.js           → state, dynamic rendering, modal, booking flow
├── data/
│   └── rooms.json       → room & event slot data (id, title, price, capacity…)
├── assets/
│   └── images/          → hand-drawn SVG room/hall illustrations
└── README.md
```

## Features implemented

**Custom calendar widget**
- Dynamically generates the days of the current month, with Next/Previous
  navigation.
- Highlights today and disables every past date (cannot be clicked).
- **Hotel mode** → range selection (check-in → check-out), with a live
  hover preview of the range before check-out is confirmed.
- **Event mode** → single date selection.
- Enforces check-out > check-in automatically.

**Booking form & real-time validation**
- Full Name (required), Email (regex format check), Phone (10-digit
  numeric), Number of Guests (capped to the selected room's capacity),
  Special Requests (optional).
- Invalid fields get a red border immediately as you type, plus an
  animated tooltip-style error message. Empty required fields show a
  "Required" tooltip on focus.
- The "Select Room" action re-validates everything (including the
  calendar) and blocks progress with a clear banner if anything is
  missing.

**Dynamic room / event slot rendering**
- Cards are built from `data/rooms.json` using arrays, objects, and DOM
  manipulation — no hardcoded HTML.
- Each card shows image, title, capacity, price, availability, amenities,
  a star rating, and a live per-stay price calculated from your selected
  dates.
- Switching between Hotel Stay and Event Booking filters the list and
  re-animates the cards.

**Booking summary modal & confirmation**
- Clicking "Select Room" opens a modal recapping name, email, dates,
  room/slot, duration, and total cost.
- Confirming generates a booking ID in the `BK######` format, shown on a
  success screen along with a short recap.
- "Make another booking" clears the form and resets the calendar.

**Responsive design**
- Desktop (≥1024px): two-column layout — booking panel + room grid.
- Tablet (641–1023px): stacked layout, two-column room grid.
- Mobile (≤640px): single column, and the calendar collapses behind a
  "Select dates" toggle to save vertical space.

**Optional enhancements — all included**
- Live date-range hover preview on the calendar.
- Animated (fade + slide) validation tooltips.
- Smooth fade/scale-in transitions when room cards re-render or the
  booking mode is switched.
- Star ratings on every room/event card.
- Real-time running price summary as dates and rooms are selected.

## Design notes

The visual direction ("The Ledger") imagines the booking flow as writing
into a boutique hotel's guest ledger: a dark, concierge-desk interface in
ink/charcoal with brass accents, and a calendar styled like a paper
ledger page with a spiral-bound left edge. Selected dates are "stamped"
with a brass circular highlight. Room imagery is original line-art SVG
(no stock photography), kept consistent with the palette.

## What an intern would still extend

- Persisting bookings to a backend or `localStorage`-backed mock API.
- Multi-night discounts or seasonal pricing rules.
- Internationalisation / multi-currency support.
