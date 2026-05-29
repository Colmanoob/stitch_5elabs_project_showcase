# Evidence, Dissemination, And Community Page Sync

## Freshman Summary

We replaced placeholder FAQ content with the live Google Sites content for Peer Reviewed Evidence, Dissemination, and Community Workshops/Lectures. The Community Workshops/Lectures page now also uses the local poster images supplied by the client and places them in a bottom gallery matching the Google Sites page structure.

## System Overview

The site is a static HTML/CSS/JavaScript build. Each top-level page owns its own HTML file, while shared navigation, search data, and visual styling are repeated or centralized in `animations.css` and `animations.js`.

## Mental Model

Think of each static page as a printed handout. Updating Google Sites content means copying the approved text into the matching handout, then checking that every menu points to the right handout.

## Key Concepts Used

- Static routes: `peer-reviewed-evidence/`, `dissemination/`, and `community-workshopslectures/` each resolve to an `index.html` file.
- Sitewide navigation: every page has a local copy of the top navigation, so the old top-level `impact/` link had to be replaced across pages.
- Search index: `animations.js` contains page summaries used by the custom search overlay.
- External links: DOI, conference, and workshop links open in a new tab using `target="_blank"` and `rel="noopener"`.

## Why This Architecture

The current project is already a static Google Sites-style site. Keeping the update as static HTML avoids adding a CMS or backend just for a few content pages.

## Files We Changed

- `peer-reviewed-evidence/index.html`: added the three peer-reviewed publication citations in the same simple Google Sites text-page style.
- `dissemination/index.html`: added the international conference dissemination entries in the same simple Google Sites text-page style.
- `community-workshopslectures/index.html`: added the workshops and lectures page copied from the live Google Sites page, plus the bottom poster gallery.
- `assets/community-workshops/`: stores the local community workshop poster images so the page does not depend on remote Google image URLs.
- `animations.css`: added reusable styling for live Google Sites-style text pages and the poster gallery.
- `animations.js`: updated route detection and search metadata.
- Site HTML/PHP pages: updated the top-level navigation from Impact to Community Workshops/Lectures.

## Execution Flow

1. A visitor uses the top navigation.
2. The Community Workshops/Lectures link opens `community-workshopslectures/index.html`.
3. The page renders copied Google Sites content using the shared Google Sites-style reference layout.
4. If the visitor uses search, the updated search index returns the new page and copied content summaries.

## How To Test It

- Open `/peer-reviewed-evidence/`, `/dissemination/`, and `/community-workshopslectures/`.
- Confirm the copied content appears and external links open correctly.
- Check desktop and mobile navigation for the Community Workshops/Lectures link.
- Run `node --check animations.js`.

## Common Failure Points

- A page can still point to the old top-level `impact/` path if its copied nav was missed.
- Long DOI or PDF URLs can overflow on mobile if link wrapping is not styled.
- Google redirect URLs can be harder to maintain than direct destination URLs.

## Performance + Security Notes

This update adds no heavy JavaScript. External links use `rel="noopener"` to prevent the opened tab from controlling the original page.

## Freelance Insight

For client work, content sync should include both the visible page text and the navigation/search behavior. Otherwise the page may look updated but still feel broken in normal user flows.

## What To Learn Next

- How static site generators reduce repeated navigation edits.
- How to store page content as structured data.
- How to write smoke tests that verify important navigation links.
