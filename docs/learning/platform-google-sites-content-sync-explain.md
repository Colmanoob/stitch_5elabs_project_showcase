# Platform Google Sites Content Sync Explain

## Freshman Summary

We updated the Math City 1.0 and The Cardium pages so their local website versions include the same major sections, descriptions, media, and entry links shown on the current Google Sites pages. The platform pages also moved away from the old black hero banner toward the image-led Google Sites page structure.

## System Overview

This project is a mostly static HTML/PHP website. The platform pages live under `5e-labs/`, and all pages share the same navigation, search, transition animation, and background styling through `animations.css` and `animations.js`.

## Mental Model

Think of each platform page as a local recreation of a Google Sites page. The page-specific HTML contains the actual content, while the shared CSS and JavaScript keep the layout, navigation, search behavior, and animation consistent across the site.

## Key Concepts Used

- Static HTML sections for platform-specific content.
- Image-led page openings that use the Google Sites cover images instead of a generic black hero banner.
- CSS background images for Google Sites cover art, because some cover images are stored as section backgrounds rather than normal `<img>` tags.
- Local page images imported from the downloaded Google Sites asset package, because Google Sites `lh3.googleusercontent.com/sitesv/...` assets can return `403 Forbidden` when hotlinked outside Google Sites.
- Reusable CSS grid rules for image galleries.
- Embedded media for the Math City walkthrough video.
- External links for the Spatial platform entry buttons.
- Search indexing in JavaScript so page content can appear in the site search overlay.
- Cache-busting query strings so browsers load the newest shared assets.

## Why This Architecture

The client wants the custom website to match the Google Sites content while still keeping the current static-site structure. Editing the static platform pages is the simplest reliable approach because there is no CMS or build pipeline in this project.

## Files We Changed

- `5e-labs/math-city-1-0/index.html`: refreshed Math City 1.0 with a local cover asset, local gallery images, local Human-AI image, skills heading, video, local walkthrough image, and Spatial entry link.
- `5e-labs/the-cardium/index.html`: added The Cardium local cover image, local pedagogical alignment image, local museum gallery, local souvenir quest image, and Spatial entry link.
- `assets/platform-pages/`: stores the renamed local image files imported from the downloaded asset package.
- `assets/math-city-1-cover.svg`: local Math City title-cover artwork used because the exact title-cover image from the Google Sites hero was not present in the downloaded package.
- `5e-labs/math-city-2-0/index.html`, `5e-labs/atomic-shadows/index.html`, and `5e-labs/virtual-school-of-teachers-training/index.html`: removed the black hero banner in favor of a plain Google Sites-style title opening.
- `animations.css`: added reusable cover/title styling, gallery styles, and step-list styles for the platform pages.
- `animations.js`: expanded the search index so the new platform content can be found by keyword and sentence search.
- Site HTML/PHP files: cache-busted shared CSS and JS references so the new assets load consistently.

## Execution Flow

1. A visitor opens a platform page.
2. The page loads its static content and shared Google Sites-style layout.
3. `animations.css` formats the page sections, galleries, and responsive layout.
4. `animations.js` initializes navigation, search, transition animation, and background pulses.
5. When the visitor searches for terms from the platform content, matching pages and sentences appear in the search dropdown.

## How To Test It

- Open `/5e-labs/math-city-1-0/` and confirm the cover image, virtual spaces, Human-AI section, skills heading, walkthrough video, walkthrough image, and Spatial entry link are present.
- Open `/5e-labs/the-cardium/` and confirm the pedagogical alignment, virtual spaces, souvenir quest, and Spatial entry link are present.
- Open the other platform detail pages and confirm they no longer show the black hero banner.
- Search for words like `GenAI`, `souvenir`, `Assessment`, and `walkthrough`.
- Check the pages on mobile width to make sure galleries collapse to one column.
- Run `node --check animations.js` and `git diff --check` before delivery.

## Common Failure Points

- Google Sites cover images may be CSS backgrounds in the source page. If you only scrape normal image tags, you can accidentally choose the wrong image as the cover.
- External Googleusercontent images may fail if the source image URLs change or if Google rejects hotlink requests outside Google Sites, so platform pages should prefer local assets for client delivery.
- The YouTube embed may not show if a browser blocks embedded media.
- Search results may feel incomplete if new visible page text is added but the search index is not updated.
- Old browser cache may keep loading previous CSS or JavaScript unless the cache-bust token changes.

## Performance + Security Notes

The pages still use static HTML and native browser rendering, so the added content does not require a server runtime. External media should be monitored because third-party images and embeds can affect page speed and availability.

## Freelance Insight

This task is a client-content parity pass. It matters because clients often compare the new site against an existing reference page. A professional delivery should preserve the content they expect while improving maintainability, search behavior, responsive layout, and deployment readiness.

## What To Learn Next

- Static-site content organization
- Responsive image gallery layout
- Search indexing for static websites
- Cache busting for client-side assets
- QA evidence collection for content parity
