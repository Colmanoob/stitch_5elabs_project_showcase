# Platform Pages Navigation Split Explain

## Freshman Summary

The five 5E Labs platforms were moved back into dedicated pages instead of only being home-page sections. This matches the Google Sites structure more closely because the top navigation now treats each platform as its own page under the 5E Labs dropdown.

## System Overview

The home page still introduces the platform collection, but the detailed platform content now lives under `5e-labs/`. The old one-level platform folders remain as redirects, so older links do not break.

## Mental Model

Think of the home page as the project overview and the platform pages as individual product pages. The dropdown is the table of contents for the 5E Labs platform family.

## Key Concepts Used

- Static page routing: folder-based `index.html` files create clean URLs such as `5e-labs/math-city-1-0/`.
- Redirect compatibility: old paths like `math-city/` forward users to the new page.
- Relative paths: nested pages use `../../` to load shared assets, CSS, JavaScript, downloads, and home-page anchors.
- Responsive CSS: platform page headings and copy widths are tightened on mobile so text wraps instead of clipping.

## Why This Architecture

The project is a static/PHP-style site, so folder-based pages are the simplest reliable approach. A routing framework would be unnecessary here, and the client specifically wants the structure to resemble Google Sites.

## Files We Changed

- `index.html`: updated the 5E Labs dropdown and platform overview links to point to the new pages.
- `downloads.html`: moved platform/download navigation into the same dropdown structure.
- `admin.php`: kept admin direct-access behavior while matching the shared navigation.
- `animations.css`: added platform detail page styling and mobile fixes.
- `animations.js`: updated search paths so results open platform pages.
- `5e-labs/*/index.html`: added the five dedicated platform pages.
- `math-city/`, `math-city-2/`, `cardium/`, `atomic-shadows/`, `vtts/`: changed old pages into redirects to the new structure.

## Execution Flow

1. A visitor opens the home page.
2. They open the 5E Labs dropdown.
3. They select a platform such as Math City 1.0.
4. The browser loads `5e-labs/math-city-1-0/`.
5. Search results also route to the matching platform page instead of home-page anchors.

## How To Test It

- Open `index.html` and confirm the 5E Labs dropdown lists the five platform pages and Downloads.
- Open `5e-labs/math-city-1-0/` on desktop and mobile widths.
- Search for a platform keyword such as `virtual`, `heart`, or `atomic` and confirm the result opens the dedicated page.
- Open old paths such as `math-city/` and confirm they redirect to the new path.

## Common Failure Points

- Wrong relative paths can break CSS, JavaScript, or images on nested pages.
- Mobile headings can overflow if desktop typography is reused without constraints.
- Search results can point to stale anchors if the search index is not updated.

## Performance + Security Notes

The new pages reuse the existing static CSS and JavaScript, so there is no new backend risk. External platform links use `rel="noopener"` when opening in a new tab.

## Freelance Insight

This change makes the site easier for a client to discuss and review because each platform has its own URL. That is useful for proposals, QR codes, presentations, analytics, and future SEO.

## What To Learn Next

- Static routing and URL design.
- Redirects and backward compatibility.
- Mobile typography and overflow debugging.
- How search indexes map content to URLs.
