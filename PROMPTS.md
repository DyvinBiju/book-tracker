# Book Tracker — AI Development Prompt Log

This file documents the five most significant AI prompts used during development,
one AI mistake, and how it was identified and corrected.  
---

## Prompt 1 — Planning and Project Setup

**Prompt used:**

> "I need to build a Book Tracker web application for my Globocon Internship 2026 assessment using HTML, CSS and JavaScript. It should let users add books, search for them and track their reading status. Help me plan the project structure and explain how I can implement the required features step by step."

**Actual result:**  
The AI helped me plan the application structure and divide the work into smaller features. I used this plan to start building the application.

---

## Prompt 2 — Add and Display Books

**Prompt used:**

> "Help me implement the feature for adding books. I want a form with title and author fields, and both fields should be required. After adding a book, it should appear in the list, with the newest book displayed first. Show a suitable validation message if either field is empty, and keep the code simple enough for me to understand."

**Actual result:**  
All three files were created. The form validated empty and whitespace-only fields independently, showing `"Please enter a title"` and `"Please enter an author"` beneath the relevant fields. Books were rendered newest-first using an `addedAt` timestamp. Long titles and author names wrapped cleanly with no horizontal overflow.

**Verification:**  
Manually tested by opening `index.html` directly in the browser:
- Added two books → second appeared above the first 
- Submitted with empty title → correct error shown, author field preserved 
- Submitted with whitespace-only author → treated as empty 
- Browser console → no errors 

---

## Prompt 3 — localStorage Persistence

**Prompt used:**

> "Now I want the books to remain saved even after refreshing the page. Help me use localStorage to save the book list and load it when the page opens. Please keep the existing add-book functionality working and handle missing or invalid saved data safely."

**Actual result:**  
The application was updated to save and load books using localStorage. I tested the feature by adding books and refreshing the page, then checked that the books were still displayed.

**Verification:**  
- Added three books at `http://localhost:3000` → refreshed the page → all three books present 
- Closed the tab, reopened `http://localhost:3000` → books still present 

---

## Prompt 4 — Case-Insensitive Search

**Prompt used:**

> "Add a search box that lets users find books by title or author. It should filter the list while typing and work regardless of uppercase or lowercase letters. Show a message when no books match, and make sure searching does not remove books from the saved list."

**Actual result:**  
The search feature was added. During implementation, an attempted code edit failed because some of the expected text did not match the file. I checked the JavaScript, identified the missing search-related code, and corrected it. I then tested searching by title and author.

**Verification:**  
- Typed `alch` → only "The Alchemist" shown 
- Typed `BEN` → matched author "Benyamin" 
- Typed `zzz` → "No books match your search" shown 
- Cleared the search → full list restored 
- Added a new book while a search was active → new book became searchable immediately 

---

## Prompt 5 — Changing reading status

**Prompt used:**

> "I want users to change a book's status between To Read, Reading and Finished. Add a dropdown to each book card, update the displayed status when it changes, and save the new status in localStorage so it remains after refreshing the page. Make sure the correct book is updated."

**Actual result:**  
The status dropdown was added to the book cards. I tested changing statuses and refreshing the page to check that the updated statuses were preserved.

**Verification:**  
- Changed a book from "To Read" → "Finished" → badge updated immediately → refreshed → status persisted 

---

## AI Mistake and Correction 

**Issue: Reading statistics remained at zero**

**What went wrong:**

After adding the reading statistics feature, I noticed that the counts for To Read, Reading and Finished were always showing 0, even after I added books to the application. The statistics were not reflecting the actual number of books in each status.

**How it was identified:**

I added books with different reading statuses and checked the statistics bar. Although the books appeared in the list, all three counts stayed at 0.

**Prompt used to fix it:**

"The reading statistics in my Book Tracker are always showing zero, even after I add books and change their statuses. The book list itself is working. Help me fix this so the counts are calculated correctly based on each book's status and update whenever I add a book, change its status or delete a book"

**Verified result:**

The AI helped me fix how to calculate the reading statistics using the existing books array. I updated the JavaScript so that the To Read, Reading and Finished counts were calculated separately and displayed in their corresponding HTML elements. I also made sure the statistics update whenever the book list is rendered.

---

*PROMPTS.md — Globocon Internship 2026 — Book Tracker*
