# ELECTRONBENCH v1.3.1-rc.1 — verification report

Date: 2026-10-05. Status: **release candidate; rendered-browser and device acceptance incomplete**. This delivery is a UI/UX cleanup of the saved v1.3 line.

## Checks run for this release

| Check | Result | Scope |
|---|---|---|
| Syntax and version consistency | Pass | All shipped JS parses; UI/package/cache version agrees |
| Logic and generated host code | 25 groups pass | Existing validation, migration, timing, generated C++ behavior, independent ZIP decoding |
| Expanded board/sensor/network logic | 10 groups pass | Sensor sharing, S3 pins, configuration, message expiry, parsing, credential separation |
| DOM event workflows | 35 groups pass | Existing 20 workflows plus selection/focus, pointer selection, connection guidance, tabs, menu, catalog, resize, mobile drawer, blocked preview, target-aware starters, Fit, stream focus, safe Delete, and missing-data gaps |
| Cache API double | 3 groups pass | Every linked JS/CSS asset plus worker present; old-cache cleanup; relative subdirectory paths and API exclusion |
| Companion API with CLI double | 9 groups pass | Pairing/origin gates, discovery, builds/uploads, custom-code review, cancellation, serial handoff, malformed import, private headers/redaction |

**82 automated groups passed.** The DOM runner uses jsdom 26.1.0 and loads the script list from index.html. Pointer/layout tests use mocked dimensions; they do not render the app. Host C++ execution uses g++ and explicit MCU API doubles.

## Prior compiler evidence

The v1.3.0-rc.1 report, 47 target compile results, 2 real pinned companion builds, and source hashes are preserved under `verification/v1.3.0-rc.1/`. Top-level compiler result files retain that same historical data. They were **not rerun** for this UI cleanup. The firmware generator changes only its version string; generated example sketches change the release comment. No physical board or live firmware network check was performed.

## Remaining verification

Rendered layout, theme contrast, real browser keyboard/screen-reader behavior, mobile/touch, print pagination, serial permissions, service-worker lifecycle, offline reload, physical devices, and real MQTT/HTTP/TLS acceptance remain open. Follow `UI-REVIEW.md` and `ACCEPTANCE.md`. The required browser QA capability is unavailable in this managed environment; no preview/browser workaround was used.

The interrupted, unpublished v2.0 checkout was unavailable. This report does not claim that v2.0 was restored, implemented, or tested.

## Reproduce

```sh
npm run check
npm test
# Install jsdom 26.1.0 in a separate development directory, then:
ELECTRONBENCH_JSDOM=/absolute/path/to/node_modules/jsdom npm run test:dom
node scripts/export-examples.cjs
python3 scripts/package-release.py /absolute/path/ELECTRONBENCH-v1.3.1-rc.1.zip
```

The frontend itself remains dependency-free and needs no npm install or build step. `verification/release-evidence.json` records source hashes for this release; the ZIP contains per-file SHA256SUMS.
