# Site Search Dropdown Explain

## Freshman Summary

This task turned the decorative search icon into a real site search. Hovering the search icon opens a rounded search box, and clicking into it opens a dropdown list of matching pages. Typed searches now look through page content and show matching sentence snippets under each result.

## System Overview

The site is mostly static HTML pages that all load the shared `animations.js` and `animations.css` files. Instead of editing every header with custom search markup, the shared JavaScript finds each header search icon and turns it into an interactive control.

The search flow is:

1. User hovers the search icon.
2. JavaScript creates the search popover at the original search icon position.
3. User clicks/focuses the search box.
4. JavaScript shows suggested searches and filters page-content sentences as the user types.
5. User clicks a result or presses Enter to visit the first result.

## Key Concepts Used

- Event listeners: JavaScript listens for click, keyboard, input, submit, and Escape events.
- Static search index: The searchable pages are stored as an array of titles, descriptions, paths, keywords, and fallback sentences.
- Content enrichment: When served from the website, JavaScript fetches each public page, reads its `<main>` content, and turns that text into searchable sentences.
- Highlighted snippets: Matching sentences are rendered under each bold result title, with the searched word highlighted using a `<mark>` element.
- Search popover: The overlay is positioned from the search icon and styled as a rounded input with an attached results dropdown.
- Relative paths: The script adjusts result URLs depending on whether the user is on the root page or inside a platform folder.
- Accessibility basics: The search icon gets `role="button"`, `tabindex`, and an accessible label.

## Why This Architecture

The site does not have a component framework or build step, so a shared JavaScript enhancement is the fastest reliable approach. It avoids copying the search dropdown markup into every HTML file.

This works well for Hostinger shared hosting because it uses plain HTML, CSS, and JavaScript with no backend search service or Node runtime requirement.

## Files We Changed

- `animations.js`: Adds the search popover, search index, page-content sentence enrichment, filtering, snippet highlighting, keyboard handling, and navigation.
- `animations.css`: Adds styling for the search trigger, rounded input, scrollable dropdown results, highlighted snippets, focus states, and mobile layout.

## Execution Flow

1. Page loads.
2. `initSiteSearch()` finds `header [data-icon="search"]`.
3. Each icon becomes clickable and keyboard-accessible.
4. On hover, the script creates the popover once, measures the search icon and nav tabs, then opens only the rounded input.
5. Clicking or focusing the input shows suggested searches.
6. Typing filters the index by title, description, keywords, and page-content sentences.
7. Matching sentences appear under each result title with the searched terms highlighted.
8. If the result list is longer than the visible area, the dropdown scrolls instead of growing over the page.
9. Clicking a result navigates to that page or section.

## How To Test It

Manual testing:

- Open any public page.
- Hover the search icon.
- Click inside the rounded search box.
- Type `virtual`, `math`, `downloads`, `cardium`, `atomic`, or `teacher`.
- Confirm that matching results show a bold title and one or more normal-weight sentence snippets below it.
- Confirm that long result lists scroll inside the dropdown.
- Click a result.
- Press Escape and confirm the dropdown closes.
- Use Tab and Enter to confirm keyboard access.

Automated checks run:

- `node --check animations.js`

## Common Failure Points

- If a new page is added, it will not appear in search until it is added to the `searchItems` array.
- If a page path changes, update the matching `path` value in `animations.js`.
- If the site is opened directly from the filesystem, browser security may block page fetching; the fallback sentence index still keeps search usable.
- If the site later moves to a template/component framework, this search can become a reusable component.

## Performance + Security Notes

The search index is small and local, so filtering is instant. The page-content enrichment only fetches same-site HTML pages and does not send user input anywhere. Result HTML is escaped before rendering to avoid unsafe HTML injection.

## What To Learn Next

- Learn how client-side search differs from backend/database search.
- Study event handling and keyboard accessibility.
- Learn how static site paths work when pages live in nested folders.
- Explore fuzzy search libraries if the site grows larger.

## Real Freelance Insight

Clients often ask for search after content grows. For a small static Hostinger site, this lightweight approach gives users quick navigation without adding hosting complexity. A future upsell would be a CMS-backed search if the platform list or resource archive becomes much larger.
