# AGENTS.md — Voters For Bitcoin

This file is the authoritative guide for any AI agent working on this codebase. Read it fully before making changes.

---

## What This Site Is

Voters For Bitcoin is a static civic-research site that tracks federal lawmakers' public positions on Bitcoin. It has no backend, no build step, and no framework. Everything runs in the browser from plain HTML, CSS, and vanilla JavaScript files served directly from the filesystem or a static host.

---

## File Structure

```
/
├── index.html                  # Home page — senator directory, resources, methodology
├── bitcoin-legislation.html    # Bitcoin-specific bills and executive actions tracker
├── crypto-legislation.html     # Broader crypto/digital asset legislation tracker
├── for-offices.html            # Info page for congressional offices and campaigns
├── suggest.html                # Public suggestion form for adding/correcting records
├── survey.html                 # Bitcoin policy survey for official office responses
├── styles.css                  # Single global stylesheet for the entire site
├── app.js                      # JS for index.html — renders directory, filters, detail
├── legislation.js              # JS for bitcoin-legislation and crypto-legislation pages
├── suggest.js                  # JS for suggest.html
├── survey.js                   # JS for survey.html
├── nav.js                      # Shared JS for hamburger menu and mobile nav behavior
├── data/
│   └── content.js              # All site data — senators, resources, methodology
└── resources/
    ├── index.html              # Resource hub landing page
    ├── bitcoin-basics.html     # Bitcoin basics educational page
    ├── self-custody.html       # Self-custody guide
    └── educators.html          # Educators and content creators resource page
```

---

## Data Architecture

All content lives in `data/content.js`. It assigns a single global object `window.VFB_CONTENT` with the following top-level keys:

- `stanceLabels` — ordered array of stance strings used for filtering and display
- `senators` — array of fully reviewed lawmaker objects (see schema below)
- `resources` — array of resource card objects rendered on the home page
- `methodology` — array of methodology section objects rendered on the home page

At the bottom of `content.js`, a `VFB_SENATE_ROSTER` array holds stub entries for every senator not yet fully reviewed. These are merged into `senators` automatically — no standalone stub objects exist in the fully reviewed array.

### Fully Reviewed Lawmaker Schema

```js
{
  slug: "first-last",              // kebab-case, used as DOM ID and filter anchor
  name: "Full Name",
  chamber: "Senate" | "House",
  state: "Full state name",        // e.g. "North Carolina", not abbreviation
  party: "Republican" | "Democrat" | "Independent",
  stance: "Pro-Bitcoin" | "Leaning Pro-Bitcoin" | "Mixed / Evolving" |
          "Leaning Anti-Bitcoin" | "Anti-Bitcoin" | "No Clear Public Position",
  tone: "pro" | "caution" | "anti" | "neutral",  // drives CSS tag color
  confidence: "High" | "Medium" | "Low",
  lastReviewed: "Month D, YYYY",
  responseStatus: "No response received" | "Response received — [detail]",
  summary: "Plain-language paragraph.",
  policySignals: ["Signal sentence.", ...],      // 2–4 bullet-style strings
  evidence: [
    {
      title: "Source title",
      date: "Month D, YYYY",
      sourceType: "Official press release | Floor speech | Interview | Vote record | ...",
      url: "https://...",
      note: "One sentence describing what this source shows."
    }
  ]
}
```

**Rules:**
- `tone` must match `stance`. Pro-Bitcoin → `"pro"`, Leaning Pro → `"pro"`, Mixed/Evolving → `"caution"`, Leaning Anti → `"anti"`, Anti-Bitcoin → `"anti"`, No Clear → `"neutral"`.
- `slug` must be unique. It is used in URL params and DOM attributes.
- If a lawmaker has no sourced evidence yet, `evidence` is an empty array `[]` and `policySignals` contains only the two pending-review strings.

---

## Rendering Architecture

`app.js` is an IIFE. It reads `window.VFB_CONTENT` (set by `data/content.js` which is loaded first) and renders everything into pre-existing DOM containers. The key containers and their IDs are:

| ID | What renders there |
|---|---|
| `#senator-list` | Senator cards (buttons), re-rendered on every filter change |
| `#senator-detail` | Active senator detail panel, re-rendered on card click |
| `#directory-summary` | Plain-text count summary ("Showing X profiles for...") |
| `#stance-summary` | Snapshot cards (count per stance label) |
| `#resource-list` | Resource cards from `content.resources` |
| `#methodology-list` | Methodology cards from `content.methodology` |

State is tracked via a module-scoped `activeSlug` variable. Filter state lives in the DOM (native `<select>` and `<input>` values). URL search params mirror the active chamber, state, and stance filters so links are shareable.

---

## CSS Architecture

Single stylesheet: `styles.css`. No preprocessor, no utility framework.

**Design tokens** are CSS custom properties on `:root`:
- `--bg`, `--bg-strong`, `--surface`, `--surface-strong` — background tones
- `--text`, `--muted` — foreground tones
- `--accent`, `--accent-deep` — orange brand color
- `--good`, `--warn`, `--bad` — stance signal colors
- `--line` — border/divider color
- `--shadow` — box shadow
- `--serif`, `--sans` — font stacks

**Responsive breakpoints:**
- `max-width: 980px` — grids collapse to single column, topbar becomes column layout
- `max-width: 640px` — mobile-specific: hamburger nav, filter toggle, 2×2 snapshot grid, 44px touch targets, tighter padding

**Stance tone colors** are applied via `data-tone` attribute on `.tag` elements:
- `data-tone="pro"` → green
- `data-tone="caution"` → amber
- `data-tone="anti"` → red
- `data-tone="neutral"` → grey

---

## Navigation and Mobile Behavior

`nav.js` is a shared IIFE loaded by every page. It manages three behaviors:

1. **Hamburger toggle** — below 640px, tapping the `.nav-toggle` button shows/hides `.nav-links` via the `.is-open` class. Tapping outside the topbar closes the menu.

2. **Touch dropdowns** — below 768px, CSS `:hover` on `.nav-dropdown` is overridden. `nav.js` handles tap-to-open (first tap prevents navigation and shows the sub-menu; second tap follows the link). The open state is tracked with `.is-open` on `.nav-dropdown`.

3. **Filter collapse** — on `index.html` only, the `.filters` section is hidden on mobile by default. A `#filters-toggle` button reveals/hides it via `.is-open` on the `.filters` element.

**When adding a new page:**
- Include the hamburger button immediately after the `.brand` anchor inside `.topbar`
- Add `<script src="./nav.js"></script>` (or `../nav.js` from inside `resources/`) before `</body>`

---

## Adding or Updating Lawmaker Profiles

All edits go in `data/content.js`.

To add a fully reviewed profile, add a complete lawmaker object to the `senators` array. Ensure the slug matches any existing entry in `VFB_SENATE_ROSTER` — the roster merger at the bottom of the file filters by slug, so a reviewed entry will automatically replace the stub.

To update an existing profile, find it in the `senators` array by slug and edit in place. Always update `lastReviewed` to today's date.

To add evidence to a stub-only lawmaker, move them from the roster merge logic into the main `senators` array with a full object.

---

## Adding Pages

Static HTML only. Follow the existing page structure:

1. Copy the `<head>` block from an existing page and update `<title>` and `<meta name="description">`.
2. Use `.site-shell > .hero > nav.topbar` for the nav (include the hamburger button).
3. Reference `./styles.css` from root pages or `../styles.css` from inside `resources/`.
4. Add `./nav.js` (or `../nav.js`) as the last `<script>` before `</body>`.
5. Add the new page to the nav dropdown menus in all existing HTML files.

---

## What Not to Do

- Do not introduce a build step, bundler, or framework. The entire site must remain zero-dependency static HTML.
- Do not add new global variables. `app.js`, `legislation.js`, `suggest.js`, and `survey.js` are all IIFEs for a reason.
- Do not modify `VFB_CONTENT` outside of `data/content.js`. All page scripts read it as a static input.
- Do not split `styles.css` into multiple files. One stylesheet, one HTTP request.
- Do not use `localStorage` or `sessionStorage`. Filter state is URL-param driven; no persistent client state is needed.
- Do not add hover-only interactions without a touch fallback. See the dropdown pattern in `nav.js` for the right approach.
