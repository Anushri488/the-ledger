/* ============================================================
   calendar.js — "The Ledger" custom calendar widget
   Covers Step 2 (calendar grid) and Step 3 (date range rules):
   - dynamic month rendering, prev/next navigation
   - disables past dates, highlights today
   - range mode (check-in -> check-out) for hotel bookings
   - single-date mode for event bookings
   - hover preview of the range being selected
   ============================================================ */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function startOfDay(d) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function isSameDay(a, b) {
  return !!a && !!b
    && a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function isBeforeDay(a, b) {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

function daysBetween(a, b) {
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(b) - startOfDay(a)) / MS);
}

function formatShort(date) {
  return `${String(date.getDate()).padStart(2, '0')} ${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}

class LedgerCalendar {
  constructor(container, options = {}) {
    this.container = container;
    this.mode = options.mode || 'range'; // 'range' | 'single'
    this.onChange = options.onChange || function () {};
    this.today = startOfDay(new Date());
    this.viewMonth = this.today.getMonth();
    this.viewYear = this.today.getFullYear();
    this.selection = { start: null, end: null, date: null };
    this.hoverDate = null;

    this.container.innerHTML = `
      <div class="ledger-head">
        <button type="button" class="ledger-nav" data-dir="-1" aria-label="Previous month">&#8249;</button>
        <div class="ledger-month" aria-live="polite"></div>
        <button type="button" class="ledger-nav" data-dir="1" aria-label="Next month">&#8250;</button>
      </div>
      <div class="ledger-weekdays"></div>
      <div class="ledger-grid"></div>
      <p class="ledger-hint"></p>
    `;

    this.monthEl = this.container.querySelector('.ledger-month');
    this.weekdaysEl = this.container.querySelector('.ledger-weekdays');
    this.gridEl = this.container.querySelector('.ledger-grid');
    this.hintEl = this.container.querySelector('.ledger-hint');

    this.container.querySelectorAll('.ledger-nav').forEach((btn) => {
      btn.addEventListener('click', () => this.navigate(parseInt(btn.dataset.dir, 10)));
    });

    WEEKDAY_LABELS.forEach((label) => {
      const span = document.createElement('span');
      span.textContent = label;
      this.weekdaysEl.appendChild(span);
    });

    this.render();
  }

  setMode(mode) {
    this.mode = mode;
    this.reset();
  }

  reset() {
    this.selection = { start: null, end: null, date: null };
    this.hoverDate = null;
    this.viewMonth = this.today.getMonth();
    this.viewYear = this.today.getFullYear();
    this.render();
    this.onChange(this.getSelection());
  }

  navigate(direction) {
    this.viewMonth += direction;
    if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear += 1; }
    if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear -= 1; }
    this.render();
  }

  canGoPrev() {
    return !(this.viewYear === this.today.getFullYear() && this.viewMonth === this.today.getMonth());
  }

  render() {
    this.monthEl.textContent = `${MONTH_NAMES[this.viewMonth]} ${this.viewYear}`;
    const prevBtn = this.container.querySelector('[data-dir="-1"]');
    prevBtn.disabled = !this.canGoPrev();

    this.gridEl.innerHTML = '';
    const firstOfMonth = new Date(this.viewYear, this.viewMonth, 1);
    const startOffset = firstOfMonth.getDay();
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const totalCells = 42;

    for (let i = 0; i < totalCells; i += 1) {
      const dayNum = i - startOffset + 1;
      const cellDate = new Date(this.viewYear, this.viewMonth, dayNum);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'ledger-cell';

      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
      if (!inMonth) cell.classList.add('is-outside');

      const isPast = isBeforeDay(cellDate, this.today);
      const isToday = isSameDay(cellDate, this.today);

      cell.textContent = String(cellDate.getDate());
      cell.dataset.date = cellDate.toISOString();

      if (isPast) {
        cell.classList.add('is-disabled');
        cell.disabled = true;
      }
      if (isToday) cell.classList.add('is-today');

      this.applySelectionClasses(cell, cellDate);

      if (!isPast) {
        cell.addEventListener('click', () => this.selectDate(cellDate));
        cell.addEventListener('mouseenter', () => this.previewHover(cellDate));
        cell.addEventListener('mouseleave', () => this.previewHover(null));
      }

      this.gridEl.appendChild(cell);
    }

    this.updateHint();
  }

  applySelectionClasses(cell, cellDate) {
    if (this.mode === 'single') {
      if (isSameDay(cellDate, this.selection.date)) cell.classList.add('is-selected');
      return;
    }
    const { start, end } = this.selection;
    if (start && isSameDay(cellDate, start)) cell.classList.add('is-start');
    if (end && isSameDay(cellDate, end)) cell.classList.add('is-end');
    if (start && end && cellDate > start && cellDate < end) cell.classList.add('is-in-range');
    if (start && !end && this.hoverDate && cellDate >= start && cellDate <= this.hoverDate && !isSameDay(cellDate, start)) {
      cell.classList.add('is-preview');
    }
  }

  /* Live preview of the range while hovering — only updates CSS classes,
     never re-renders the grid (re-rendering destroys buttons mid-click). */
  previewHover(date) {
    if (this.mode !== 'range' || !this.selection.start || this.selection.end) return;
    this.hoverDate = date;
    this.gridEl.querySelectorAll('.ledger-cell').forEach((cell) => {
      const cellDate = new Date(cell.dataset.date);
      const inPreview = date
        && cellDate >= this.selection.start
        && cellDate <= date
        && !isSameDay(cellDate, this.selection.start);
      cell.classList.toggle('is-preview', inPreview);
    });
  }

  selectDate(date) {
    if (this.mode === 'single') {
      this.selection.date = date;
    } else {
      const { start, end } = this.selection;
      if (!start || (start && end) || isSameDay(date, start)) {
        this.selection = { start: date, end: null };
      } else if (date < start) {
        this.selection = { start: date, end: null };
      } else {
        this.selection.end = date;
      }
      this.hoverDate = null;
    }
    this.render();
    this.onChange(this.getSelection());
  }

  updateHint() {
    if (this.mode === 'single') {
      this.hintEl.textContent = this.selection.date
        ? `Selected: ${formatShort(this.selection.date)}`
        : 'Tap a date to select your event day.';
      return;
    }
    const { start, end } = this.selection;
    if (start && end) {
      const nights = daysBetween(start, end);
      this.hintEl.textContent = `${formatShort(start)} \u2192 ${formatShort(end)} \u00b7 ${nights} night${nights === 1 ? '' : 's'}`;
    } else if (start) {
      this.hintEl.textContent = `Check-in set: ${formatShort(start)} — now pick check-out.`;
    } else {
      this.hintEl.textContent = 'Tap a date to set check-in.';
    }
  }

  getSelection() {
    if (this.mode === 'single') {
      return { mode: 'single', date: this.selection.date };
    }
    const { start, end } = this.selection;
    return {
      mode: 'range',
      start,
      end,
      nights: start && end ? daysBetween(start, end) : 0,
      complete: Boolean(start && end),
    };
  }
}
