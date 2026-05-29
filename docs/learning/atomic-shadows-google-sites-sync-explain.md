# Atomic Shadows Google Sites Sync Explain

## Freshman Summary

The Atomic Shadows page was updated from a placeholder-style platform page into a content-complete platform page based on the client's Google Sites version. The page now uses local image assets, source-matched platform text, a screenshot-based walkthrough, an inquiry journal section, and the real external Enter link.

## System Overview

The site is a static HTML/CSS/JavaScript project. The Atomic Shadows page lives at `5e-labs/atomic-shadows/index.html`, shared visual rules live in `animations.css`, and the site search index lives in `animations.js`.

## Mental Model

Think of each platform page as a static content template: header, hero image, title, content sections, gallery, access button, footer. The page-specific work is mostly choosing the right text, local images, section order, and CSS classes.

## Key Concepts Used

- Static assets: copied downloaded screenshots into `assets/platform-pages/` so the page does not depend on remote Google image URLs.
- Responsive grids: used CSS grid to show multiple platform screenshots on desktop and stack them on mobile.
- Semantic HTML: used sections, figures, figcaptions, descriptive alt text, and a clear external link.
- Search indexing: updated `animations.js` so site search can find Atomic Shadows-specific terms like wizard, spirits, quest, and inquiry journal.

## Why This Architecture

The existing project is a static site that matches Google Sites styling. Keeping Atomic Shadows as static HTML is the simplest reliable solution for Hostinger Business shared hosting: it requires no backend, no database, and no runtime server.

## Files We Changed

- `5e-labs/atomic-shadows/index.html`: replaced placeholder sections with Google Sites-aligned Atomic Shadows content.
- `index.html` and `5e-labs/index.html`: replaced the Atomic Shadows placeholder listing with the new local Atomic Shadows image and source-aligned summary.
- `animations.css`: added natural image frames and Atomic Shadows screenshot grid styles.
- `animations.js`: updated the Atomic Shadows search result text and keywords.
- `assets/platform-pages/atomic-shadows-*.png`: local copies of the provided Atomic Shadows screenshots.

## Execution Flow

1. A visitor opens `/5e-labs/atomic-shadows/`.
2. The fixed shared header loads.
3. The page shows the local Atomic Shadows village cover image.
4. The visitor scrolls through the mission overview, screenshots, NPC interaction, pedagogical alignment, virtual spaces, and inquiry journal.
5. The Enter button opens `https://edumeta.itch.io/atomic-shadows` in a new tab.

## How To Test It

- Open `http://127.0.0.1:4292/5e-labs/atomic-shadows/` from a local static server.
- Confirm all Atomic Shadows images load.
- Resize to mobile width and confirm the screenshot grids stack cleanly.
- Use search terms like `wizard`, `spirits`, `quest`, and `inquiry journal`.
- Click Enter and confirm it opens the external Atomic Shadows page.

## Common Failure Points

- Broken local image paths if assets are renamed or moved.
- Tall screenshots being cropped if they use the default 16:9 media frame instead of the natural image frame.
- Search results becoming stale if page content changes but `animations.js` is not updated.
- External Enter link changing on the client's side.

## Performance + Security Notes

The page uses static PNG files, so there is no API or secret exposure risk. The external Enter link uses `target="_blank"` with `rel="noopener"` to avoid giving the opened tab access to the original page.

## Freelance Insight

For client work, localizing Google Sites images is useful because it removes dependency on Google-hosted image URLs that may expire or change. It also makes handoff and deployment more predictable on Hostinger.

## What To Learn Next

- Image optimization for static sites.
- Responsive CSS grid patterns.
- How static sites deploy to Hostinger `public_html`.
- How to write a small QA report with screenshots and verified checks.
