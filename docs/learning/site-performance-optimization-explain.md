# Site Performance Optimization

## Freshman Summary

The site felt slow mainly because decorative animations kept the phone's CPU and GPU busy, and internal links intentionally waited 1.85 seconds before navigating. The mobile/low-power path now preserves the animations in lighter forms and loads non-critical images lazily.

## System Overview

All public pages share `animations.js` and `animations.css`. Device capability checks in the shared JavaScript choose a lighter animation profile for touch and lower-power hardware. Reduced-motion and Data Saver preferences still disable optional effects. Hostinger can also compress and cache static assets through `.htaccess`.

## Mental Model

Treat animation as a scalable enhancement. The same visual language can remain across devices while mobile uses fewer simultaneous effects and shorter transitions.

## Key Concepts Used

- Progressive enhancement: core content works without expensive effects.
- Lazy loading: below-the-fold images wait until they are needed.
- `content-visibility`: browsers may skip rendering distant sections initially.
- Cache busting: a new query-string version forces browsers to request changed CSS and JavaScript.
- Compression and browser caching: repeat visits transfer fewer bytes.

## Why This Architecture

A shared capability check fixes every public page without duplicating device rules. It preserves the current desktop design while prioritizing responsiveness on phones and constrained devices.

## Files We Changed

- `animations.js`: device checks, image hints, lightweight mobile behavior, and a shorter mobile plane transition.
- `animations.css`: releases compositor layers and defers rendering of lower sections.
- `.htaccess`: compression and static-asset cache rules.
- Public HTML pages: updated shared-asset version strings.

## Execution Flow

1. The page HTML loads.
2. Images receive decoding/loading hints.
3. The browser capability check runs.
4. Touch and lower-power devices render fewer simultaneous circuit pulses, lighter parallax, and a shorter plane transition.
5. Capable desktop devices keep the full presentation.

## How To Test It

1. Open the home page on a phone in portrait mode.
2. Scroll through multiple sections and confirm content is visible.
3. Tap several internal links and confirm navigation starts immediately.
4. Test a desktop browser and confirm the decorative desktop effects remain.
5. After deployment, run Lighthouse mobile and compare Performance, LCP, INP, and TBT with a saved pre-change report.

## Common Failure Points

- An old CSS/JavaScript response may remain in a CDN cache; confirm the URL contains `google-sites-20260831-performance1`.
- LiteSpeed settings may override `.htaccess`; inspect production response headers after deployment.
- Very large source images still affect first visits and should be converted to WebP/AVIF in a separate visually verified pass.

## Performance + Security Notes

The changes do not alter forms, authentication, or stored data. Long-lived caching is limited to static assets; HTML is intentionally excluded.

## Freelance Insight

Performance evidence should be shown with before/after measurements on the same device and network profile. This converts “feels faster” into client-verifiable proof.

## What To Learn Next

Study Core Web Vitals, responsive image formats (`srcset`, WebP, AVIF), critical CSS, and production asset pipelines that replace Tailwind's browser CDN compiler.
