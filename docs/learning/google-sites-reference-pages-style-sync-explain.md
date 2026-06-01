# Google Sites Reference Pages Style Sync

## Freshman Summary

The peer-reviewed evidence, dissemination, and community workshops pages were restyled to match the Google Sites source pages more closely. The main change was replacing the old custom yellow title banner with Google Sites-like white content sections, grid alignment, typography, and spacing.

## System Overview

These pages are static HTML pages that share global styling from `animations.css`. Each page now uses a reusable Google Sites-style 12-column grid so titles, body text, links, and poster images can align like the original Google Sites layout.

## Mental Model

Think of the page as rows. Each row has 12 invisible columns. Some rows leave empty columns on the left or right to match Google Sites alignment, while the text sits in the same column span as the reference site.

## Key Concepts Used

- CSS Grid creates the 12-column layout.
- Shared CSS classes keep the three pages consistent.
- Typography is matched by using the same font families and point sizes: Oswald for headings, Times New Roman for citations, and Lora for event rows.
- Responsive rules collapse the 12 columns into one column on mobile.

## Why This Architecture

The site is static, so a shared CSS/HTML approach is simpler and more reliable than adding JavaScript or a framework. It also fits Hostinger Business static hosting well because the files can be uploaded or deployed as plain HTML/CSS.

## Files We Changed

- `peer-reviewed-evidence/index.html`: rebuilt the main content into Google Sites-like title and citation sections.
- `dissemination/index.html`: split conference entries into separate Google Sites-like rows.
- `community-workshopslectures/index.html`: split workshop entries into rows, added Google Sites-style link buttons, and aligned poster images in the source order.
- `animations.css`: added the shared reference-page grid, typography, button, poster, and mobile styles.

## Execution Flow

1. The browser loads each HTML page.
2. The page uses `google-reference-page` and `google-reference-section` classes for the main content.
3. `animations.css` turns each section into the Google Sites-style grid and applies the correct fonts.
4. On mobile, the grid collapses into a single column so text and images stay readable.

## How To Test It

Open these pages locally and compare them against the downloaded Google Sites HTML reference:

- `/peer-reviewed-evidence/`
- `/dissemination/`
- `/community-workshopslectures/`

Check desktop and mobile widths. Confirm headings, paragraph fonts, indentation, link buttons, and poster image order match the Google Sites version.

## Common Failure Points

- Missing poster image files will show broken images on the community page.
- Long URLs or conference titles can overflow if responsive wrapping breaks.
- Header spacing can make the main content appear lower on mobile because the site has stacked top bars.

## Performance + Security Notes

The change is static HTML/CSS only, so it adds almost no runtime cost. External links use `target="_blank"` with `rel="noopener"` to avoid giving opened pages access to the original window.

## Freelance Insight

When a client says “make it match this reference,” matching typography, spacing, and alignment matters as much as copying content. A reusable grid also makes later reference-page updates faster and more consistent.

## What To Learn Next

- CSS Grid column systems
- Responsive typography
- Visual QA using screenshots
- Static site deployment on Hostinger Business
