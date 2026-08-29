# Footer-First Navigation

## Freshman Summary

The site no longer shows its navigation bar at the top. Instead, one shared script builds the same navigation in every page footer, so visitors can focus on page content first while still having access to every page link at the bottom.

## System Overview

Every public page loads `animations.css` and `animations.js`. The CSS hides the former header and styles the footer. The JavaScript detects how far the current page is from the site root, then creates links with the correct relative paths.

## Mental Model

Think of the JavaScript as a single reusable footer component for a static HTML site. Rather than maintaining a copy of the navigation in every HTML file, the browser creates it from one source of truth.

## Key Concepts Used

- **DOM manipulation:** JavaScript replaces the small existing footer with the complete navigation.
- **Relative URLs:** A page nested two folders deep needs `../../` before a root-level link; the script calculates that prefix.
- **CSS Grid:** The footer uses three columns on larger screens and one column on small screens.
- **Progressive layout:** The header is hidden with CSS immediately, avoiding a visible top bar while JavaScript starts.

## Why This Architecture

The alternative would be editing the header and footer in every public HTML page. A shared implementation reduces duplication and makes future menu changes much less error-prone.

## Files We Changed

- `animations.js` — defines the footer groups and builds the navigation.
- `animations.css` — removes the header from the layout and styles the accessible footer grid.

## Execution Flow

1. The browser loads a page and the shared CSS hides the header.
2. When the HTML is ready, the shared script identifies the current page depth.
3. It inserts Home, 5E Labs, and Resources & Contact footer columns.
4. The links work from root, section, and nested platform pages.

## How To Test It

1. Open the homepage, a section page, and a nested platform page.
2. Confirm there is no header or empty top spacing.
3. Scroll to the footer and check that the three columns are present.
4. Test a link from each column, especially from a nested platform page.
5. Check the footer at desktop and mobile widths; it should stack to one column on mobile.

## Common Failure Points

- A new page at a different folder depth may need an update to `getSiteRootPrefix()`.
- A browser may retain an older cached `animations.css` or `animations.js`; perform a hard refresh after deployment.
- JavaScript must remain enabled for the full footer navigation to be generated.

## Performance + Security Notes

The footer is small, has no external dependency, and does not handle user input or sensitive data. Its links are all internal site paths.

## Freelance Insight

A centrally maintained footer menu makes the site cheaper to maintain: a future link or platform can be added once rather than across every page.

## What To Learn Next

Learn about static-site templating or a component-based framework. Both solve the same duplication problem at build time instead of in the browser.
