/**
 * Book Tracker — app.js
 *
 * Stage 2: Add books + display (newest first) + validation
 *
 * Architecture:
 *  - books[]  : in-memory array, source of truth
 *  - render() : re-draws the entire list from books[]
 *  - All DOM queries cached in `el` object at startup
 */

'use strict';

/* ── DOM References ───────────────────────────────────────── */
const el = {
  form:        document.getElementById('add-book-form'),
  titleInput:  document.getElementById('book-title'),
  authorInput: document.getElementById('book-author'),
  statusSelect:document.getElementById('book-status'),
  titleError:  document.getElementById('title-error'),
  authorError: document.getElementById('author-error'),
  bookList:    document.getElementById('book-list'),
  emptyState:  document.getElementById('empty-state'),
  bookCount:   document.getElementById('book-count'),
};

/* ── State ─────────────────────────────────────────────────── */
let books = []; // Array of { id, title, author, status, addedAt }

/* ── Utilities ─────────────────────────────────────────────── */

/**
 * Generate a simple unique ID based on timestamp + random suffix.
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Return the human-readable label for a status key.
 * @param {string} status
 * @returns {string}
 */
function statusLabel(status) {
  const labels = {
    'to-read':  'To Read',
    'reading':  'Reading',
    'finished': 'Finished',
  };
  return labels[status] || status;
}

/* ── Validation ────────────────────────────────────────────── */

/**
 * Show or clear a field's validation error.
 * @param {HTMLElement} input   - the input element
 * @param {HTMLElement} errorEl - the error <span>
 * @param {string} message      - error text, or '' to clear
 */
function setFieldError(input, errorEl, message) {
  errorEl.textContent = message;
  if (message) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
  } else {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
  }
}

/**
 * Validate the add-book form.
 * Returns { valid: boolean, title: string, author: string, status: string }.
 */
function validateForm() {
  const title  = el.titleInput.value.trim();
  const author = el.authorInput.value.trim();
  const status = el.statusSelect.value;

  let valid = true;

  if (!title) {
    setFieldError(el.titleInput, el.titleError, 'Please enter a title');
    valid = false;
  } else {
    setFieldError(el.titleInput, el.titleError, '');
  }

  if (!author) {
    setFieldError(el.authorInput, el.authorError, 'Please enter an author');
    valid = false;
  } else {
    setFieldError(el.authorInput, el.authorError, '');
  }

  return { valid, title, author, status };
}

/* ── Rendering ─────────────────────────────────────────────── */

/**
 * Build the HTML for a single book item.
 * @param {{ id: string, title: string, author: string, status: string }} book
 * @returns {string} HTML string
 */
function buildBookHTML(book) {
  const label = statusLabel(book.status);
  // Escape user-supplied text to prevent XSS
  const safeTitle  = escapeHTML(book.title);
  const safeAuthor = escapeHTML(book.author);

  return `
    <li class="book-item" data-id="${book.id}">
      <div class="book-info">
        <p class="book-title-text">${safeTitle}</p>
        <p class="book-author-text">by ${safeAuthor}</p>
      </div>
      <div class="book-meta">
        <span class="status-badge ${book.status}" aria-label="Status: ${label}">
          ${label}
        </span>
      </div>
    </li>
  `;
}

/**
 * Escape HTML special characters to prevent XSS injection.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Re-render the book list from the current books[] array.
 * Newest first (highest addedAt timestamp first).
 */
function render() {
  // Sort newest first
  const sorted = [...books].sort((a, b) => b.addedAt - a.addedAt);

  if (sorted.length === 0) {
    el.bookList.innerHTML  = '';
    el.emptyState.hidden   = false;
    el.bookCount.textContent = '';
  } else {
    el.emptyState.hidden   = true;
    el.bookList.innerHTML  = sorted.map(buildBookHTML).join('');
    const count = sorted.length;
    el.bookCount.textContent = `${count} book${count !== 1 ? 's' : ''}`;
  }
}

/* ── Add Book ──────────────────────────────────────────────── */

/**
 * Handle form submission: validate → create book → render.
 * @param {SubmitEvent} event
 */
function handleAddBook(event) {
  event.preventDefault();

  const { valid, title, author, status } = validateForm();
  if (!valid) return;

  const newBook = {
    id:      generateId(),
    title,
    author,
    status,
    addedAt: Date.now(),
  };

  books.push(newBook);
  render();

  // Reset form — status returns to default 'to-read'
  el.form.reset();
  // Clear any lingering error states after reset
  setFieldError(el.titleInput,  el.titleError,  '');
  setFieldError(el.authorInput, el.authorError, '');

  // Move focus to the title field for quick follow-up entry
  el.titleInput.focus();
}

/* ── Clear errors on input (live feedback) ─────────────────── */
el.titleInput.addEventListener('input', () => {
  if (el.titleInput.value.trim()) {
    setFieldError(el.titleInput, el.titleError, '');
  }
});

el.authorInput.addEventListener('input', () => {
  if (el.authorInput.value.trim()) {
    setFieldError(el.authorInput, el.authorError, '');
  }
});

/* ── Event Listeners ───────────────────────────────────────── */
el.form.addEventListener('submit', handleAddBook);

/* ── Initialise ────────────────────────────────────────────── */
render(); // Show empty state on first load
