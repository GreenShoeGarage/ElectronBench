# ELECTRONBENCH development roadmap

Current delivery: **v1.3.1-rc.1**, incorporating v1.1–v1.3. The earlier v1.0 release gates remain open and the network features add live-service acceptance requirements. Implementation status and verification status are separate.

| Batch | Delivered outcome | Verification |
|---|---|---|
| v0.1 | Visual editor, typed wiring, Uno generation, preview, JSON recovery, printable report | Original logic and generated-code execution checks pass |
| v0.2 | Multi-select, group move, duplicate, align, arrange, search, focus restoration | DOM workflows pass; rendered/keyboard/mobile acceptance remains open |
| v0.3 | Local Arduino CLI companion, pinned profiles, compile/upload jobs, cancellation, node diagnostics | API tests pass; real pinned Uno/ESP32 compilation passes; physical upload remains open |
| v0.4 | Arithmetic, filtering, hysteresis, validity, edges, counter, latch, stage sequence | Compiled host/preview comparisons and real target compilation pass |
| v0.5 | Classic Nano, Mega 2560, classic ESP32 WROOM-32 profiles | Four-target compilation matrix passes; physical board evidence remains open |
| v0.6 | MCP9808, BH1750, MAX31855, SSD1306 OLED, I²C/SPI/UART checks | Representative sensor/display firmware compiles on all targets; sensor wiring and runtime behavior remain open |
| v0.7 | Explicit numeric/Boolean delay feedback, scenarios, virtual-input recording | Host/preview timing comparisons and scenario success/failure checks pass |
| v0.8 | Live serial console, multiple plots/readouts, CSV, send/disconnect | Parsing and companion serial orchestration pass with doubles; real serial/unplug tests remain open |
| v0.9 | Reusable modules, subdiagrams, custom C++, revisions, evidence/assumptions | DOM import/insertion/restore and schema checks pass |
| v1.0 RC | Integrated documentation, examples, self-hosting package, security/recovery review, release checks | Automated software checks pass; manual gates below remain open |
| v1.0 final | Complete workflow release under the original acceptance criteria | Pending the browser, accessibility, offline, and physical hardware checks in ACCEPTANCE.md |

The release candidate contains functioning implementations, including actual compiler invocation. It is not a claim that Visuino's complete component/board catalog is reproduced.

## v1.1–v1.3 — implemented in this delivery

| Batch | Implemented outcome | Verification status |
|---|---|---|
| v1.1 | Searchable project navigator; keyboard graph traversal; error filtering and repair guidance; previous-autosave recovery; focus and failed-edit handling | DOM event checks pass; rendered keyboard/screen-reader acceptance remains open |
| v1.2 | Conservative ESP32-S3 DevKitC-1 profile; BME280 and INA219 measurement nodes; shared sensor drivers; virtual units; pinned dependencies and examples | Five-board sensor compilation passes; physical boards and measurements remain unverified |
| v1.3 | ESP32 Wi-Fi/MQTT status, numeric MQTT publish/subscribe, numeric HTTP GET/POST, TLS/CA configuration, session-only credentials, companion private header, deterministic virtual network scenarios | Logic/DOM/API checks and classic ESP32/S3 network/TLS compilation pass; live broker/server, outage, and TLS acceptance remain open |
| v1.3 final | Promote this combined feature release after all relevant acceptance procedures pass | Pending browser, accessibility, offline, physical hardware, and live-network evidence in ACCEPTANCE.md |

Current package: **v1.3.1-rc.1**. The user explicitly authorized feature advancement beyond the v1.0 release candidate. This does not retroactively close the original release gates or represent three separately certified stable releases.

## UI cleanup and v2.0 recovery

| Milestone | Status | Completion condition |
|---|---|---|
| v1.3.1 RC — UI cleanup | Implemented; 82 automated groups pass | Rendered responsive/theme/keyboard checks remain open in UI-REVIEW.md |
| Recover the interrupted v2.0 work | Open | Locate a durable source/package or reimplement the previously agreed gap-closing roadmap against this saved baseline |
| v2.0 integration | Open | Preserve this UI cleanup while integrating and verifying the recovered beginner/intermediate features |
| Stable promotion | Open | Complete the browser, offline, accessibility, device, and network acceptance gates on the exact integrated source |

The prior session's unpublished v2.0 checkout was missing on resume. No v2.0 implementation or verification is claimed in this package. The v1.1–v1.3 features below remain available in the saved source.

## Remaining release work

1. Run the first-minute workflow, navigator, keyboard paths, themes, narrow screens, print, recovery, and offline checks in real browsers.
2. Upload starters on all five profiles; record exact modules, voltages, versions, wiring, measurements, and reset/power-cycle behavior.
3. Exercise new and original sensors, UART/USB serial, output validity, unplug/reconnect, and long-running state/timing behavior.
4. Connect both ESP32 variants to controlled MQTT and HTTP/HTTPS services. Verify authentication, CA/time validation, malformed/stale data, outages, reconnect, and worst-case heap/task timing.
5. Fix observed defects, retain evidence, and promote the exact tested release only when these gates pass.

## Later candidates

Prioritize measured defects and proven board/sensor compatibility. Industrial protocols, FFT, richer state machines, custom component packages, and coordinated multi-board deployment remain future candidates. The current implementation does not claim Visuino’s full catalog or project-format compatibility.
