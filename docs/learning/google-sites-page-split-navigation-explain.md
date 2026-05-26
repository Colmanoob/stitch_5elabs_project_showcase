# Google Sites Page Split And Navigation Explain

## Freshman Summary

This task changed the site from a mostly single-page structure into a Google Sites-style structure. The top navigation now has separate dropdown groups for `Home` and `5E Labs`, and the major top-level sections now have their own pages.

## System Overview

The site is still a static/PHP-friendly website. Shared behavior lives in `animations.js`, shared styling lives in `animations.css`, and each public page has its own HTML file. The admin page remains `admin.php` so it can still run the existing PHP login and file-management logic.

## Mental Model

Think of the site as a folder-based map:

- `index.html` is the homepage.
- `home/.../index.html` pages are the dropdown pages under Home.
- `5e-labs/.../index.html` pages are the dropdown pages under 5E Labs.
- `peer-reviewed-evidence/`, `dissemination/`, `impact/`, and `contact-us/` are top-level pages.

## Key Concepts Used

- Static routing: a folder with `index.html` can be visited as `/folder/`.
- Shared CSS: the same class names make separate pages look like one system.
- Relative paths: nested pages use `../` or `../../` to reach shared assets and scripts.
- Progressive enhancement: the pages still show content without JavaScript, while `animations.js` adds search and interaction.

## Why This Architecture

This matches Hostinger Business/shared hosting well because it does not require a custom server. Static pages, PHP admin routes, assets, and CSS can all run from `public_html` or hPanel Git deployment.

## Files We Changed

- `index.html`: updated primary navigation and footer links.
- `downloads.html`: moved Downloads under the 5E Labs dropdown and kept the page style consistent.
- `admin.php`: removed Admin from public navigation while keeping direct URL access.
- `animations.css`: added active dropdown styling, standalone section page styles, contact page styles, and mobile header spacing.
- `animations.js`: updated search destinations and nested-page root path logic.
- `home/*/index.html`: new Home dropdown pages.
- `5e-labs/index.html`: new 5E Labs overview page.
- `peer-reviewed-evidence/index.html`, `dissemination/index.html`, `impact/index.html`, `contact-us/index.html`: new separated top-level pages.
- `assets/google-contact-leadership.png`: local copy of the Google Sites-style contact image crop so the image does not fail outside Google Sites.

## Execution Flow

1. The user opens a page.
2. The fixed header loads with Home and 5E Labs dropdowns.
3. A dropdown link navigates to a folder route such as `/home/objectives/`.
4. The browser loads that folder's `index.html`.
5. `animations.css` applies the Google Sites visual style.
6. `animations.js` enables search and resolves links correctly based on page depth.

## How To Test It

- Run a local static server.
- Visit `/index.html`, `/5e-labs/`, `/peer-reviewed-evidence/`, `/dissemination/`, `/impact/`, `/contact-us/`, and each `/home/.../` page.
- Check that desktop navigation shows Home and 5E Labs as dropdowns.
- Check that mobile navigation shows the top page bar plus Home and 5E Labs dropdown rows.
- Search for a word such as `virtual` and confirm results link to the correct separated pages.

## Common Failure Points

- Broken relative paths on nested pages usually mean the page needs `../` or `../../`.
- If a page looks unstyled, check the `animations.css` path.
- If search links go to the wrong place, check `getRootPrefix()` in `animations.js`.
- If Google-hosted images fail, use local assets instead of hotlinking restricted URLs.

## Performance + Security Notes

The change keeps the site lightweight because it uses static HTML and CSS. The admin page remains reachable directly by URL, but access is still controlled by the existing PHP session login, captcha, and database checks.

## Freelance Insight

Clients often compare against a reference site visually, but the professional delivery step is making the structure maintainable. Folder routes, shared CSS, and QA screenshots make the result easier to explain, edit, and deploy on shared hosting.

## What To Learn Next

- Static routing and relative paths.
- How headers can be shared with templates in PHP or a framework.
- Accessibility patterns for dropdown navigation.
- Hostinger static deployment through hPanel Git.
