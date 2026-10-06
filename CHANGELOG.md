# Changelog

## 1.4.0-rc.1 — 2026-10-06

- Added eight MKR SAMD profiles, UNO R4 Minima/WiFi, and GIGA R1 WiFi M7; retained the five existing boards.
- Pinned SAMD 1.8.14, Renesas UNO 1.6.0, and Mbed GIGA 4.6.0 build profiles.
- Made starters/defaults board-aware in the core shared by browser, exports, tests and companion; fresh projects retain the selected target.
- Matched generated ADC resolution to preview ranges, corrected built-in LED pins/polarity, and centralized SPI/UART pin reporting and validation.
- Added GIGA UART4 import/export, MKR Servo/TC4 checks, and GIGA complementary PWM channel conflicts.
- Grouped the board chooser by family with explicit voltage, ADC, core and support boundaries. Added 19 examples and BOARDS.md.
- New boards support the existing external I/O/peripheral workflow. Their radio stacks, FPGA, GIGA M4/RPC and specialized peripherals remain outside this release. Hardware and rendered-browser acceptance remain open.

## 1.3.1-rc.1 — 2026-10-05

UI/UX cleanup of the saved v1.3 source. The interrupted v2.0 checkout was unavailable; this release does not include that unpublished work.

- Consolidated Project actions and grouped Project tools; one Live serial tab and a clear primary Run preview action.
- Increased control and text sizes, tightened header space, improved dialogs and starter cards, added theme-aware live plot colors, and responsive drawers.
- Persisted panel resizing with pointer/keyboard controls; collapsible component groups and an Advanced-mode search escape hatch.
- Visible connection guidance, compatible-port cues, cancellation, multi-selection actions, and actionable blocked-preview messages.
- Keyboard tab navigation, mobile focus containment, context-menu keys, Ctrl/Cmd+S backup, and a skip link.
- Fixed stale selection after add/select/duplicate, focus disruption during live updates, accidental Delete outside the canvas, and Fit's visible-diagram bounds.
- Starters retain the target board and adapt ESP32 pins/ADC ranges. Missing preview samples create gaps instead of false zero readings.
- 82 automated groups pass, including 35 DOM workflow groups. Rendered-browser and physical-device acceptance remain open.

## 1.3.0-rc.1 — 2026-10-05

Combined delivery of the user-authorized v1.1, v1.2, and v1.3 batches. Browser, device, and live-network acceptance remain open.

### v1.1 — navigation and recovery

- Searchable project navigator with error-first sorting and keyboard connection traversal.
- Filtered findings, repair guidance, roving node focus, and dialog focus restoration.
- Download/restore previous autosave, preserve working history on failed edits, and attempt the primary save even when backup storage fails.

### v1.2 — board and sensor expansion

- ESP32-S3 DevKitC-1 N8/N8R8 profile with PSRAM disabled and conservative pins.
- BME280 temperature/humidity/pressure and INA219 voltage/current/power nodes, shared device drivers, explicit virtual units, and pinned libraries.
- Environment and power starters; five supported board profiles and 39 components before networking.

### v1.3 — ESP32 networking

- Five networking components: connection status, numeric MQTT input/output, HTTP GET/POST. Total catalog: 44 components.
- Separate firmware network task, retry/timeouts, strict numeric payload parsing, bounded HTTP responses, main-loop MQTT stale-value expiry, and status logging.
- TLS root-CA validation with NTP time readiness; HTTPS-only optional Bearer header.
- Private credentials stay in page memory and a separate local build header; portable project exports contain no filled credential header.
- Virtual disconnect/recovery/message scenarios, MQTT/HTTP starters, network settings in revision comparisons, and complete offline asset list.
- Fixed companion cancellation/serial handoff race; redacted credential strings across CLI output chunks.
- 47 real target compiles, including combined sensor/network/TLS fixtures, plus pinned networking builds through the companion. Hardware and real network acceptance are still required.

## 1.0.0-rc.1 — 2026-10-05

Completed the planned software batches from v0.2 through v0.9 and packaged the v1.0 release candidate. Final browser and physical-board gates remain open.

- Expanded from 17 to 37 components and from Uno to Uno, classic Nano, Mega, and classic ESP32 profiles.
- Added multi-selection, alignment, arrangement, search, grouped subdiagrams, and reusable modules.
- Added the local Node/Arduino CLI companion with pinned profiles, compiler diagnostics, compile/upload jobs, cancellation, and serial monitor.
- Added arithmetic, state, filtering, explicit delayed feedback, sensors, OLED output, secondary UART input, and reviewed custom C++.
- Added scenarios, input recording, numeric tolerances, result export, live multichannel serial plots/readouts, and CSV.
- Added revision snapshots, behavioral comparison, separate evidence/assumptions, and richer printable wiring reports.
- Added schema 1 migration, complete project ZIP export, recovery/error refinements, and all-assets offline caching implementation.
- Fixed AVR UART parsing after a real Mega compiler failure; added executed parser regression coverage.
- Passed real target compilation across 30 representative programs and real pinned Uno/ESP32 builds through the companion. Expanded logic, DOM, and API checks. No physical upload or rendered-browser test is claimed.

## 0.1.0 — 2026-10-05

Initial visual editor, Uno firmware generation, 17 components, three starters, behavioral preview, autosave/JSON recovery, pin map, printable report, themes, and generated-code host tests.
