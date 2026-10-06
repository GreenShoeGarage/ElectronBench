# ELECTRONBENCH UI/UX cleanup — v1.3.1-rc.1

## Problems addressed

The saved workbench presented too many equal-weight actions, small labels and controls, weak pending-connection guidance, and fixed-width panels. Selection could revert to a previously focused component; live telemetry rebuilt focused controls. Phone-sized panels did not provide a consistent modal focus path.

## Delivered changes

| Workflow | Change | Evidence |
|---|---|---|
| First minute | Compact masthead, clear Run preview action, board-aware starter cards | DOM starter/validation checks on five board profiles; visual review open |
| Project management | Project menu for new/open/bundle/report/recovery; visible Save JSON | Existing save/recovery/report tests plus Escape/focus tests |
| Find and add | Collapsible catalog, improved search, Advanced-mode reveal | Search and persisted collapse DOM checks |
| Connect | Source/type prompt, compatible-port cue, cancel control; inspector dropdowns retained | Pending/cancel DOM tests; rendered wire/touch review open |
| Edit | Correct selection and visible multi-selection actions; Fit uses visible actual-size nodes | Pointer/focus/duplicate/fit DOM checks with mocked geometry |
| Panels | Persisted dividers; one narrow-screen drawer with backdrop and focus return | Keyboard resize and drawer DOM checks; actual geometry and touch unverified |
| Keyboard | Roving tabs, Shift+F10 menu, Ctrl/Cmd+S, safer Delete scope | Event/focus tests; screen-reader review open |
| Diagnose | Blocked preview states link to checks or starters | Empty/error workflow tests |
| Observe | Live checkbox focus retained; theme-specific plots; missing preview readings draw gaps | Stream focus and invalid-reading path checks; rendered contrast review open |

## Verification scope

82 automated groups passed: 25 original logic/host C++, 10 expanded logic/network, 35 DOM workflows, 3 mocked-cache, and 9 companion API groups with a CLI double. Syntax/version consistency passed. The DOM runner loads the actual script order from index.html, including the cleanup module; cache coverage follows all linked CSS/JS assets.

There is no rendered browser, screenshot, screen-reader, real service-worker, touch-device, print-layout, or physical-board signoff. The Sites workflow does not provide its required browser QA capability in this environment, so no alternate preview/browser path was used. This is an implemented cleanup with automated behavior coverage, not a visual certification.

## Manual review matrix — all open

| Environment | Review |
|---|---|
| Desktop 1440×900 and 1280×720 | Full editor; resizing; target names; long labels; multiple selections; project/tool dialogs |
| Tablet 900×700 and phone 390×844 / 360×640 | Drawer geometry and backdrop; no clipping; reachable canvas, tabs, and export actions; touch wiring |
| Short landscape 844×390 | Panel scrolling, canvas visibility, collapsed dock, modal close access |
| Dark, light, high contrast, forced colors | Label/control/focus contrast; Boolean/number shape distinction; plot colors and missing samples |
| Keyboard and 200% zoom | Skip link; native Project menu; modal return focus; drawer Tab containment; tab/menu navigation; graph traversal |
| Chromium, Firefox, Safari where available | Fresh/reloaded preferences; JSON/recovery; local static subdirectory; print; offline reload; serial permissions |

Record browser version, OS, viewport, observations, and screenshots when these checks can run. Repair observed failures before stable promotion.

## Source boundary

This release starts from the saved v1.3.0-rc.1 source. The interrupted session's unpublished v2.0 checkout was absent on resume. It was not reconstructed as part of this UI cleanup.
