# CPU Pulse Background Animation Explain

## Freshman Summary

We added a sitewide decorative background animation based on the provided CPU architecture SVG, but removed the CPU core, text, and connection blocks. The final effect is only the moving signal pulses and faint circuit paths.

## System Overview

The site is mostly static HTML pages that all load the shared `animations.css` and `animations.js` files. Instead of copying SVG markup into every page, `animations.js` injects one background SVG into the page at runtime.

## Mental Model

Think of this as a transparent animated sheet placed behind the website content. The sheet contains invisible SVG paths, and colored circles move along those paths to create the pulse effect.

## Key Concepts Used

- SVG paths define the pulse routes.
- SVG masks keep each glowing circle clipped to its route.
- `animateMotion` moves each pulse along a path without needing a JavaScript animation loop.
- CSS controls opacity, fixed positioning, layering, mobile sizing, and reduced-motion behavior.

## Why This Architecture

The original code was a React component, but this project is a static HTML/PHP site. Converting the component into injected SVG keeps the feature reusable across pages without adding React or a build step.

## Files We Changed

- `animations.js`: injects the CPU pulse background on normal website pages.
- `animations.css`: styles the background layer, pulse paths, section transparency, responsive sizing, and reduced-motion fallback.
- HTML/PHP pages: cache-busted the shared animation assets to `google-sites-20260528b`.

## Execution Flow

1. The page loads.
2. `animations.js` runs on `DOMContentLoaded`.
3. `initCpuPulseBackground()` checks that this is a normal Google Sites-style page.
4. It creates a fixed background `<div>` and injects the SVG pulse paths.
5. CSS positions the layer behind the main content and makes page sections slightly translucent.

## How To Test It

- Open `index.html` through a local server.
- Confirm the body has `has-cpu-pulse-background`.
- Confirm a `.site-cpu-pulse-background` element exists near the top of the body.
- Watch for colored pulses moving subtly behind the page sections.
- Check mobile width to make sure the animation does not cover navigation or text.

## Common Failure Points

- If the animation does not appear, the browser may be using cached `animations.js` or `animations.css`.
- If the animation is too strong, lower `.site-cpu-pulse-background` opacity.
- If it distracts from text, increase section background opacity.
- If motion should be disabled, use the system reduced-motion setting.

## Performance + Security Notes

The animation uses native SVG animation, not a JavaScript loop, so runtime cost stays low. No external scripts or user data are involved.

## Freelance Insight

This is a good example of adapting a client-provided design snippet to the actual project architecture. The client gets the visual idea they asked for, but the implementation stays maintainable for a static Hostinger-friendly site.

## What To Learn Next

- SVG `viewBox` and coordinate systems
- SVG masks and gradients
- CSS stacking contexts and `z-index`
- `prefers-reduced-motion` accessibility handling
