/**
 * Book Tracker — app.js
 *
 * Stage 2: Add books + display (newest first) + validation
 * Stage 3: localStorage persistence
 * Stage 4: Case-insensitive partial-match search
 * Stage 5: Change reading status
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
  noResults:   document.getElementById('no-results'),
  bookCount:   document.getElementById('book-count'),
  searchInput: document.getElementById('search-input'),
};

/* ── Storage ──────────────────────────────────────────────── */
const STORAGE_KEY = 'booktracker_books';

/**
 * Persist the current books[] array to localStorage.
 */
function saveBooks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (err) {
    // localStorage may be unavailable (private mode quota, etc.)
    console.warn('Book Tracker: could not save to localStorage.', err);
  }
}

/**
 * Load books from localStorage into books[].
 * If data is missing or malformed, books[] stays empty.
 */
function loadBooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return; // nothing saved yet
    const parsed = JSON.parse(raw);
    // Validate: must be an array of objects with required fields
    if (!Array.isArray(parsed)) return;
    books = parsed.filter(
      (b) =>
        b &&
        typeof b.id      === 'string' &&
        typeof b.title   === 'string' &&
        typeof b.author  === 'string' &&
        typeof b.status  === 'string' &&
        typeof b.addedAt === 'number'
    );
  } catch (err) {
    // Corrupt JSON — start fresh
    console.warn('Book Tracker: saved data was unreadable. Starting fresh.', err);
    books = [];
  }
}

/* ── State ─────────────────────────────────────────────────── */
let books = [];       // Array of { id, title, author, status, addedAt }
let searchQuery = ''; // Current search string (lowercase)

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

/* ── Search ───────────────────────────────────────────────── */

/**
 * Return the subset of books[] that match the current searchQuery.
 * Matches title OR author, case-insensitive, partial string.
 * Returns all books when searchQuery is empty.
 * Never modifies books[].
 * @returns {Array}
 */
function getFilteredBooks() {
  if (!searchQuery) return books;
  return books.filter((b) => {
    const q = searchQuery; // already lowercase
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q)
    );
  });
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
        <span class="status-badge ${book.status}" aria-label="Current status: ${label}">
          ${label}
        </span>
        <select
          class="status-select"
          aria-label="Change status for ${safeTitle}"
          data-action="change-status"
        >
          <option value="to-read"  ${book.status === 'to-read'  ? 'selected' : ''}>To Read</option>
          <option value="reading"  ${book.status === 'reading'  ? 'selected' : ''}>Reading</option>
          <option value="finished" ${book.status === 'finished' ? 'selected' : ''}>Finished</option>
        </select>
        <button
          class="btn-delete"
          aria-label="Delete ${safeTitle}"
          data-action="delete-book"
          title="Delete this book"
        >&times;</button>
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
 * Re-render the book list.
 * Uses getFilteredBooks() so search never mutates books[].
 * Newest first (highest addedAt timestamp first).
 */
function render() {
  const filtered = getFilteredBooks();
  const sorted   = [...filtered].sort((a, b) => b.addedAt - a.addedAt);

  // Always hide no-results first; show selectively below
  if (el.noResults) el.noResults.hidden = true;

  if (books.length === 0) {
    // Collection is empty — show empty state
    el.bookList.innerHTML    = '';
    el.emptyState.hidden     = false;
    el.bookCount.textContent = '';
  } else if (sorted.length === 0) {
    // Books exist but none match the search
    el.bookList.innerHTML    = '';
    el.emptyState.hidden     = true;
    if (el.noResults) el.noResults.hidden = false;
    el.bookCount.textContent = `0 of ${books.length} book${books.length !== 1 ? 's' : ''}`;
  } else {
    el.emptyState.hidden     = true;
    el.bookList.innerHTML    = sorted.map(buildBookHTML).join('');
    const total = books.length;
    const shown = sorted.length;
    el.bookCount.textContent = searchQuery
      ? `${shown} of ${total} book${total !== 1 ? 's' : ''}`
      : `${total} book${total !== 1 ? 's' : ''}`;
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
  saveBooks();
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

/* ── Delete Book ───────────────────────────────────────────── */

/**
 * Delete a book by ID after user confirmation.
 * @param {string} id - book ID
 * @param {string} title - book title (used in confirmation message)
 */
function handleDeleteBook(id, title) {
  const confirmed = window.confirm(`Delete "${title}"?\nThis cannot be undone.`);
  if (!confirmed) return;
  books = books.filter((b) => b.id !== id);
  saveBooks();
  render();
}

/* ── Status Change ─────────────────────────────────────────── */

/**
 * Update a book's status, persist it, and re-render.
 * @param {string} id        - book ID from data-id attribute
 * @param {string} newStatus - new status value from the select
 */
function handleStatusChange(id, newStatus) {
  const book = books.find((b) => b.id === id);
  if (!book) return;
  book.status = newStatus;
  saveBooks();
  render();
}

/* ── Event Listeners ───────────────────────────────────────── */
el.form.addEventListener('submit', handleAddBook);

// Search — update query and re-render on every keystroke
el.searchInput.addEventListener('input', () => {
  searchQuery = el.searchInput.value.trim().toLowerCase();
  render();
});

// Status change — delegated to #book-list so it survives re-renders
el.bookList.addEventListener('change', (event) => {
  const select = event.target.closest('[data-action="change-status"]');
  if (!select) return;
  const li = select.closest('[data-id]');
  if (!li) return;
  handleStatusChange(li.dataset.id, select.value);
});

// Delete — delegated click listener
el.bookList.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-action="delete-book"]');
  if (!btn) return;
  const li = btn.closest('[data-id]');
  if (!li) return;
  const book = books.find((b) => b.id === li.dataset.id);
  if (!book) return;
  handleDeleteBook(li.dataset.id, book.title);
});

/* ── Initialise ────────────────────────────────────────────── */
loadBooks(); // Restore saved books before first render
render();
