# Mobile UI Improvements

## Summary

Six mobile UX issues were identified and resolved across all 10 pages of the site. Changes touch `styles.css`, `app.js`, a new shared `nav.js`, and every HTML file.

---

## 1. Hamburger Navigation Menu

**Problem:** On phones, all six nav links wrapped into a cluttered inline block below the brand logo, consuming significant vertical space before the user even saw the hero content.

**Fix:** Added a hamburger button (`☰ / ✕`) between the brand and the nav links in every HTML file. Below 640px, the nav collapses by default and reveals on tap. `nav.js` handles the toggle and closes the menu when tapping outside the topbar.

**Files changed:** All 10 HTML files, `styles.css`, `nav.js` (new)

---

## 2. Touch-Friendly Dropdown Menus

**Problem:** The Legislation, Resources, and For Offices dropdowns used CSS `:hover` to show their sub-menus. Hover doesn't exist on touch devices, so tapping the trigger just navigated away without ever showing the sub-menu.

**Fix:** On screens ≤ 768px, the CSS hover trigger is disabled and `nav.js` takes over. First tap expands the sub-menu (navigation prevented); second tap follows the link. Dropdowns render inline/static on mobile rather than as floating overlays.

**Files changed:** `styles.css`, `nav.js`

---

## 3. Senator Detail Auto-Scroll

**Problem:** On mobile, the directory grid stacks the senator card list on top and the detail panel below it. Tapping a card rendered the detail but left the viewport sitting in the middle of the card list — the user had to manually scroll down past all remaining cards to read it.

**Fix:** After a card click on viewports ≤ 980px, `app.js` calls `scrollIntoView({ behavior: "smooth", block: "start" })` on the detail panel via `requestAnimationFrame` (after the new content renders).

**Files changed:** `app.js`

---

## 4. Collapsible Filter Section

**Problem:** Four stacked full-width filter inputs plus a reset button occupied a large block of vertical space before the user reached any senator cards.

**Fix:** Below 640px, the filters section is hidden by default. A "Show filters" button appears above it. Tapping toggles the section open/closed and updates the button label. The button is hidden on tablet and desktop where filters display normally.

**Files changed:** `index.html`, `styles.css`, `nav.js`

---

## 5. Snapshot Grid — 2×2 Layout

**Problem:** The four stance-count stat cards collapsed to a single column at the 980px breakpoint, producing four tall stacked cards on mobile.

**Fix:** At the 640px breakpoint, `grid-template-columns` is overridden to `repeat(2, minmax(0, 1fr))`, giving a compact 2×2 grid that scans in a glance.

**Files changed:** `styles.css`

---

## 6. Tag and Confidence Pill Touch Targets

**Problem:** `.tag` and `.confidence` elements had `min-height: 30px`, well below the 44px minimum recommended for comfortable touch targets.

**Fix:** At the 640px breakpoint, both elements get `min-height: 44px` and slightly increased padding. Desktop sizing is unchanged.

**Files changed:** `styles.css`

---

## Files Modified

| File | Change |
|---|---|
| `nav.js` | New shared script — hamburger toggle, touch dropdowns, filter toggle |
| `styles.css` | Hamburger styles, nav collapse, touch dropdowns, filter toggle, 2×2 grid, touch targets, CTA strip padding |
| `index.html` | Hamburger button, filter toggle button, nav.js script tag |
| `bitcoin-legislation.html` | Hamburger button, nav.js script tag |
| `crypto-legislation.html` | Hamburger button, nav.js script tag |
| `for-offices.html` | Hamburger button, nav.js script tag |
| `suggest.html` | Hamburger button, nav.js script tag |
| `survey.html` | Hamburger button, nav.js script tag |
| `resources/index.html` | Hamburger button, nav.js script tag |
| `resources/bitcoin-basics.html` | Hamburger button, nav.js script tag |
| `resources/educators.html` | Hamburger button, nav.js script tag |
| `resources/self-custody.html` | Hamburger button, nav.js script tag |
| `app.js` | Auto-scroll to senator detail panel on mobile card click |
