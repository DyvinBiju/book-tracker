# Book Tracker — AI Development Prompt Log

This file documents the five most significant AI prompts used during development,
one genuine AI mistake, and how it was identified and corrected.  
Required for the **Globocon Internship 2026** mini-product assessment.

---

## Prompt 1 — Planning and Project Setup

**Prompt used:**

> "Act as my AI software development partner, coding assistant, and mentor. Help me build a complete, professional Book Tracker web application for my Globocon Internship 2026 mini-product assessment. […] Start by inspecting the workspace and Git status. Then report what exists, whether Git is installed, the proposed file structure, the feature roadmap, and the first feature you recommend. Do not initialize Git, modify files, or create commits in your first response. Wait for my approval."

**Expected outcome:**  
A clear inspection of the workspace, a proposed file structure, a feature roadmap, and a Git initialization plan — all without touching any files.

**Actual result:**  
The AI inspected the workspace (confirmed it was an empty directory), verified Git was installed, confirmed the folder was not yet a repository, and produced a detailed plan covering file structure, a nine-stage feature roadmap, commit messages, and a separate Git initialization plan. No files were created or modified.

**Verification:**  
Confirmed by running `git rev-parse --is-inside-work-tree` (returned `NOT_A_GIT_REPO`) and listing the directory (confirmed empty). The AI's report matched reality.

---

## Prompt 2 — Add and Display Books

**Prompt used:**

> "approved" (in response to the Stage 2 plan, which the AI had already presented with full details: files to create, validation rules, rendering logic, and manual tests)

**What the AI had planned:**  
Create `index.html` (semantic form + book list), `style.css` (full design system with CSS variables, status badges, responsive layout), and `app.js` (form validation, newest-first rendering, XSS-safe HTML building using `escapeHTML()`).

**Actual result:**  
All three files were created. The form validated empty and whitespace-only fields independently, showing `"Please enter a title"` and `"Please enter an author"` beneath the relevant fields. Books were rendered newest-first using an `addedAt` timestamp. Long titles and author names wrapped cleanly with no horizontal overflow.

**Verification:**  
Manually tested by opening `index.html` directly in the browser:
- Added two books → second appeared above the first ✅
- Submitted with empty title → correct error shown, author field preserved ✅
- Submitted with whitespace-only author → treated as empty ✅
- Browser console → no errors ✅

---

## Prompt 3 — localStorage Persistence

**Prompt used:**

> "approve" (in response to the Stage 3 plan, which described adding `saveBooks()`, `loadBooks()`, a `STORAGE_KEY` constant, graceful fallback for corrupt data, and recommending use of `http://localhost:3000` instead of `file://`)

**Expected outcome:**  
Books added before a page refresh should still be present after the refresh. The app should start with an empty collection if no data is saved, and should not crash or overwrite data if `localStorage` contains corrupt JSON.

**Actual result:**  
`saveBooks()` serialised `books[]` to JSON and stored it under `booktracker_books`. `loadBooks()` read and validated the array on startup — filtering out any entries missing required fields. A `try/catch` block handled corrupt JSON gracefully. The Python development server was started (`python -m http.server 3000`) to ensure `localStorage` worked reliably.

**Verification:**  
- Added three books at `http://localhost:3000` → refreshed the page → all three books present ✅
- Closed the tab, reopened `http://localhost:3000` → books still present ✅
- Inspected `localStorage` in DevTools (Application → Local Storage) → saw `booktracker_books` key with valid JSON ✅

---

## Prompt 4 — Case-Insensitive Search

**Prompt used:**

> "approve" (in response to the Stage 4 plan, which described adding `searchQuery` state, `getFilteredBooks()` using `.toLowerCase().includes()`, an updated `render()` function, a no-results message distinct from the empty-collection state, and unhiding the search input already present in the HTML)

**Expected outcome:**  
Typing in the search box should filter the visible list in real time. Partial matches on title or author should work regardless of capitalisation. The underlying `books[]` array should never be modified.

**Actual result:**  
`getFilteredBooks()` returned a filtered view of `books[]` without mutating it. `render()` used this filtered list for display. The search input listener updated `searchQuery` (stored as lowercase) on every keystroke. A separate `#no-results` element was shown when books existed but none matched.

**Verification:**  
- Typed `alch` → only "The Alchemist" shown ✅
- Typed `BEN` → matched author "Benyamin" ✅
- Typed `zzz` → "No books match your search" shown ✅
- Cleared the search → full list restored ✅
- Added a new book while a search was active → new book became searchable immediately ✅

---

## Prompt 5 — Status Changes and Optional Features

**Prompt used:**

> "approved" (in response to the Stage 5 + Stage 6 plans, covering: a per-book status `<select>` dropdown with event delegation on `#book-list`, `handleStatusChange()`, `handleDeleteBook()` with a confirmation dialog, a live reading statistics bar, and comprehensive responsive CSS improvements)

**Expected outcome:**  
Each book card should have a dropdown to change its status, a × button to delete it (with confirmation), a statistics bar showing counts per status, and the layout should work at 320 px without horizontal overflow.

**Actual result:**  
All features implemented. Event delegation was used for both the status `change` and delete `click` listeners, so they survived re-renders without needing to be re-attached. The stats bar was hidden when no books existed and shown automatically as soon as the first book was added. The responsive CSS added touch-friendly minimum heights and stacked the book-meta controls on narrow screens.

**Verification:**  
- Changed a book from "To Read" → "Finished" → badge updated immediately → refreshed → status persisted ✅
- Deleted a book → confirmed dialog → book removed → stats updated ✅
- Cancelled delete dialog → book unchanged ✅
- Stats bar showed correct counts across all three statuses ✅
- Narrowed browser to ~320 px → no horizontal scrollbar, all controls usable ✅

---

## AI Mistake and Correction

**What went wrong:**

During Stage 4 (Search), the AI attempted to apply five replacement chunks to `app.js` in a single tool call. Two of the five chunks failed silently:

- **Chunk 3** — intended to add the `searchQuery` state variable.
- **Chunk 5** — intended to add the search input event listener.

The error message returned was:

> `chunk 3: target content not found in file`  
> `chunk 5: target content not found in file`

The root cause was that the target strings in those two chunks did not exactly match the actual file content at the time — likely due to earlier chunks in the same call having already modified the file, shifting line positions or changing surrounding text.

**How it was identified:**

After the multi-chunk edit completed, the AI ran a `grep` search for `getFilteredBooks` in `app.js`. The search confirmed that `getFilteredBooks()` was being *called* inside `render()` but was not *defined* anywhere in the file — a clear sign that the function definition chunk had not been applied. A second grep for the search input event listener confirmed it was also missing.

**Prompt used to fix it:**

The AI reviewed the current file content using `view_file` to get exact line numbers, then applied two separate, targeted replacement calls — one to add `getFilteredBooks()` and one to add the search input event listener — each with the correct target content verified against the live file.

**Verified result:**

After the correction:
- `grep getFilteredBooks app.js` returned both the function definition and the call site ✅
- The search input listener was present in the event listeners section ✅
- Opening `http://localhost:3000` and typing in the search box filtered results correctly ✅
- Browser console showed no errors ✅

This is a genuine example of an AI tool making an error, detecting it through systematic inspection, and correcting it without data loss or user confusion.

---

## Five Most Useful Prompts for the Assessment Form

For the Globocon submission form, these are the five prompts that best represent the development process:

| # | Prompt summary | Stage |
|---|---|---|
| 1 | Full project brief requesting planning-only first response, Git inspection, and step-by-step approval workflow | Planning |
| 2 | Approval of the add-and-display-books plan (form, validation, newest-first rendering) | Stage 2 |
| 3 | Approval of the localStorage persistence plan | Stage 3 |
| 4 | Approval of the case-insensitive search plan | Stage 4 |
| 5 | Approval of status changes and optional features (delete, statistics, responsive) | Stages 5–6 |

---

*PROMPTS.md — Globocon Internship 2026 — Book Tracker*
