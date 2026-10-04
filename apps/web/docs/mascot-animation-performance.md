# OSINT Hub mascot animation performance · 2026-10-04

## Implementation

- Two cropped HTML transform layers replace animated groups in a body-sized SVG. Eye geometry, theme, 5.2s blink and 120ms phase remain unchanged.
- Small core/sprout/eye compositing hints; layout/style containment does not clip attachments. Existing drop shadow and blush appearance retained; no fullscreen layer promotion added.
- Pointer sampling limited to 100ms with one bounds read shared by activity/proximity detection. Existing travel uses translate3d.
- Background stops the scheduler. Offscreen, guarded and fully shy-hidden states pause CSS animation. Foreground recovery still ticks so hiding cannot deadlock.
- Shy/shy_hide own their complete recovery phase; generic interrupt completion cannot prematurely restore rest. Intermediate hiding regression added.
- Original PNGs preserved. Transparent WebP display derivatives: plate 396px, sprout 64px, magnifier 112px, trail 80px; >=3x displayed width. Lossless encoding after downsampling.
- Shared stage sizes, half-eye rest, sprout, slot anchors, lens scan/trail reveal, timing and existing input/modal/fullscreen guards preserved.

Actual GPU utilization remains unmeasured; these changes do not establish a numerical CPU reduction.

## Verification

- TypeScript `tsc --noEmit`: passed.
- Existing mascot verification script: all 9 checks passed, including added mid-hide interruption.
- Search data generator + Next production build: passed; 23 static pages generated/exported.
- Browser: all four dark WebP layers loaded; desktop 132×145px, HTML eye layers at 5.2s; mascot click accepted.
- `git diff --check`: passed.
