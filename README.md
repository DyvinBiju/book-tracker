# 📚 Book Tracker

A personal reading-list manager built with plain HTML, CSS, and JavaScript.  
Add books, track your reading progress, search your collection, and keep everything saved across sessions — no account or internet connection required.

---

## Live Demo

> Link will be added after GitHub Pages deployment.

---

## Features

| Feature | Description |
|---|---|
| **Add books** | Title, author, and status (To Read / Reading / Finished) with required-field validation |
| **Newest first** | New books always appear at the top of the list |
| **Search** | Case-insensitive partial match on title or author, updates as you type |
| **Change status** | Per-book dropdown — updates the badge immediately |
| **Delete books** | × button with a confirmation dialog before removal |
| **Reading statistics** | Live counts of books in each status |
| **Persistence** | All data saved to `localStorage` — survives page refresh and browser restarts |
| **Responsive** | Works on desktop, tablet, and mobile (320 px and up) |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 (semantic elements, ARIA attributes) |
| Styling | Vanilla CSS (custom properties, flexbox, media queries) |
| Logic | Vanilla JavaScript (ES6+, `'use strict'`) |
| Persistence | Browser `localStorage` |
| Version control | Git |
| Hosting | GitHub Pages |

No frameworks, no build tools, no external dependencies.

---

## Project Structure

```
book-tracker/
├── index.html   — Page structure, form, search, stats bar, book list
├── style.css    — Design system, layout, components, responsive rules
├── app.js       — Validation, storage, rendering, search, status, delete
├── README.md    — This file
├── PROMPTS.md   — AI prompt log (Globocon assessment requirement)
└── .gitignore   — Excludes OS, editor, and temporary files
```

---

## Getting Started

### Option 1 — Open directly (no server needed)

1. Clone or download this repository.
2. Open `index.html` in any modern browser.

```bash
git clone https://github.com/<your-username>/book-tracker.git
cd book-tracker
# Double-click index.html, or:
start index.html        # Windows
open index.html         # macOS
```

> **Note:** `localStorage` works on `file://` URLs in most browsers, but a local server is more reliable.

### Option 2 — Local development server (recommended)

If Python is installed:

```bash
python -m http.server 3000
```

Then open **http://localhost:3000** in your browser.

---

## Usage

### Adding a book
1. Enter a **Title** (required) and **Author** (required).
2. Select a **Status** (default: To Read).
3. Click **Add Book**.
4. The book appears at the top of the list.

### Searching
- Type in the search box above the list.
- Results filter in real time — partial matches, any case.
- Clear the search field to restore the full list.

### Changing status
- Use the small dropdown on each book card.
- The coloured badge updates immediately.
- The change is saved automatically.

### Deleting a book
- Click the **×** button on a book card.
- Confirm the dialog that appears.
- The book is permanently removed from the list and storage.

---

## Data Persistence

Books are stored in the browser's `localStorage` under the key `booktracker_books`.

### Important limitations

| Limitation | Detail |
|---|---|
| **Browser-specific** | Data is stored per browser. Switching browsers shows an empty list. |
| **Origin-specific** | Data saved on `localhost` is separate from the GitHub Pages URL. You will need to re-add your books after visiting the live site. |
| **Device-specific** | Data does not sync between devices or users. |
| **Storage quota** | Browsers typically allow 5–10 MB of `localStorage`. Thousands of books would be required to approach this limit. |
| **Private/incognito** | Data saved in a private window is deleted when the window is closed. |

If `localStorage` is unavailable or the stored data is corrupt, the application starts with an empty collection and logs a warning to the browser console. No data from a working session is ever overwritten on startup.

---

## Validation Rules

| Field | Rule |
|---|---|
| Title | Required. Whitespace-only values are rejected. Error: *"Please enter a title"* |
| Author | Required. Whitespace-only values are rejected. Error: *"Please enter an author"* |
| Status | Optional selection. Defaults to *To Read*. |

Both fields are validated independently. A valid field preserves its value when the other field has an error.

---

## Browser Support

Requires a browser that supports ES6 (`const`, `let`, arrow functions, template literals, `Array.prototype.includes`). All evergreen browsers qualify.

---

## Known Limitations

- No cloud sync — data lives only in the browser it was entered in.
- No export/import — there is no way to back up or transfer the book list.
- No offline service worker — the page must be loaded from a server or file system.
- `localStorage` is cleared if the user clears their browser data.

---

## Development Process

This project was built incrementally using a feature-branch Git workflow:

```
main
 ├── feature/add-display-books   → feat: add and display books
 ├── feature/persistence         → feat: persist books in local storage
 ├── feature/search              → feat: add case-insensitive book search
 ├── feature/status-changes      → feat: update book reading status
 ├── feature/delete-books        → feat: add book deletion
 ├── feature/statistics          → feat: display reading statistics
 ├── feature/responsive          → style: improve responsive layout
 └── feature/docs                → docs: document setup and development prompts
```

Each branch was reviewed and merged with `--no-ff` before deletion.  
AI assistance was used throughout development and is documented in [PROMPTS.md](PROMPTS.md).

---

## Assessment

Built for the **Globocon Internship 2026** mini-product assessment.  
Deadline: 10:00 AM IST, 15 October 2026.

---

*Book Tracker — Globocon Internship 2026*
