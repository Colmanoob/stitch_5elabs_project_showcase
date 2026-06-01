# Google Sites Reference Pages Text Sync

## Freshman Summary

The peer-reviewed evidence, dissemination, and community workshops pages now keep the site's own page structure while borrowing only the text treatment from the Google Sites references.

## System Overview

These pages are static HTML pages that share global styling from `animations.css`. The layout remains the existing banner, content column, and poster gallery pattern. The matched part is the typography: heading font, citation font, event font, date weight, italics, link underlines, and event indentation.

## Mental Model

Separate layout from typography. Layout decides where blocks sit on the page. Typography decides how text looks inside those blocks. This task keeps the layout stable and changes only the typography layer.

## Key Concepts Used

- `Oswald` matches the Google Sites heading style.
- `Times New Roman` matches the peer-reviewed citation style.
- `Lora` matches dissemination and workshop event rows.
- Hanging indents make event dates sit like labels at the start of each row.
- Responsive wrapping keeps long citations and URLs readable on phones.

## Why This Architecture

The client wanted the text to resemble Google Sites without replacing the rest of the website's layout. Keeping the existing HTML structure avoids unnecessary churn and makes the pages easier to maintain.

## Files We Changed

- `peer-reviewed-evidence/index.html`: restored the existing banner/content structure for citations.
- `dissemination/index.html`: restored the existing single content section for conference entries.
- `community-workshopslectures/index.html`: restored the existing content section and poster gallery; links are inline text again.
- `animations.css`: keeps the existing layout rules and applies Google Sites-style typography to the text.

## Execution Flow

1. The browser loads each HTML page.
2. The page renders the existing banner/content/gallery layout.
3. `animations.css` applies the Google Sites-like font and text rules to headings, citations, event rows, and links.
4. Mobile rules reduce heading size, content width, and event indentation so text stays readable.

## How To Test It

Open these pages locally:

- `/peer-reviewed-evidence/`
- `/dissemination/`
- `/community-workshopslectures/`

Compare only text appearance against the Google Sites references. The surrounding layout should remain the website's own design.

## Common Failure Points

- Long DOI URLs can overflow if wrapping rules are removed.
- Event rows can become hard to read on mobile if the hanging indent is too wide.
- Poster images depend on the local files in `assets/community-workshops`.

## Performance + Security Notes

The change is static HTML/CSS only, so it adds no runtime JavaScript cost. External links use `target="_blank"` with `rel="noopener"` to avoid giving opened pages access to the original window.

## Freelance Insight

Client feedback often means "match this specific detail," not "rebuild the whole section." Confirming whether they mean layout, content, or typography prevents unnecessary redesign.

## What To Learn Next

- Typography systems
- Hanging indents in CSS
- Responsive text wrapping
- Visual QA using screenshots
