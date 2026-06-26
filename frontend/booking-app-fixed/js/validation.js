/* ============================================================
   validation.js — Step 4: real-time booking form validation
   - validateName / validateEmail / validatePhone / validateGuests
   - validateDateSelection (range or single, per booking mode)
   - attachLiveValidation: wires red borders + animated tooltips
   ============================================================ */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(value) {
  const v = (value || '').trim();
  if (!v) return { valid: false, message: 'Required' };
  if (v.length < 2) return { valid: false, message: 'Name looks too short' };
  return { valid: true, message: '' };
}

function validateEmail(value) {
  const v = (value || '').trim();
  if (!v) return { valid: false, message: 'Required' };
  if (!EMAIL_PATTERN.test(v)) return { valid: false, message: 'Enter a valid email address' };
  return { valid: true, message: '' };
}

function validatePhone(value) {
  const v = (value || '').trim();
  if (!v) return { valid: false, message: 'Required' };
  if (!/^\d{10}$/.test(v)) return { valid: false, message: '10-digit number required' };
  return { valid: true, message: '' };
}

function validateGuests(value, max) {
  const cap = max || 10;
  if (!value) return { valid: false, message: 'Required' };
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return { valid: false, message: 'Enter a valid number' };
  if (n > cap) return { valid: false, message: `Max ${cap} guests for this room` };
  return { valid: true, message: '' };
}

function validateDateSelection(mode, selection) {
  if (mode === 'single') {
    if (!selection || !selection.date) return { valid: false, message: 'Please pick a date on the calendar first' };
    return { valid: true, message: '' };
  }
  if (!selection || !selection.start) return { valid: false, message: 'Please pick a check-in date first' };
  if (!selection.end) return { valid: false, message: 'Please pick a check-out date first' };
  if (selection.end.getTime() <= selection.start.getTime()) return { valid: false, message: 'Check-out must be after check-in' };
  return { valid: true, message: '' };
}

/* Attaches live validation to one input. Shows a red border on its
   parent .field, plus a small tooltip-style error message that
   animates in (see .field-error in style.css). Returns a function
   that re-runs validation on demand (used on "Select Room" click). */
function attachLiveValidation(input, validatorFn, getArg) {
  const field = input.closest('.field');
  const errorEl = field.querySelector('.field-error');
  let touched = false;

  function run() {
    const arg = getArg ? getArg() : undefined;
    const result = validatorFn(input.value, arg);
    const showError = !result.valid && (input.value !== '' || touched);
    field.classList.toggle('is-invalid', showError);
    errorEl.textContent = result.valid ? '' : result.message;
    errorEl.classList.toggle('is-visible', showError);
    return result.valid;
  }

  input.addEventListener('input', () => { touched = true; run(); });
  input.addEventListener('blur', () => { touched = true; run(); });
  input.addEventListener('focus', () => {
    if (!touched && !input.value) {
      errorEl.textContent = '';
      errorEl.classList.remove('is-visible');
      field.classList.remove('is-invalid');
    }
  });

  return run;
}
