# ELECTRONBENCH v1.4 acceptance

Status: **open**. This file records the missing verification from v1.0.0-rc.1 and v1.3.0-rc.1 and v1.3.1-rc.1; it must not be interpreted as completed tests.

## Browser workflow

Use current Chromium and Firefox; include Safari where available. Record exact versions, OS, viewport, outcome, and screenshots of observed defects.

1. Cold-open the static subdirectory route. Run heartbeat. Create an empty project, add/connect components using ports and inspector dropdowns, edit pins, duplicate/align a selection, undo, redo, pan, zoom, and fit.
2. Import an original schema 1 project and a current schema 2 project. Save, reload, export, and reopen. Confirm graph, labels, notes, settings, scenarios, modules, revisions, assumptions, and evidence survive.
3. Create a recoverable invalid graph. Check errors, disabled firmware actions, import/export, repair, and recovery. Test corrupt autosave, blocked/full storage, previous-save restoration, and a fresh start.
4. Save/insert/export/import a module; inspect a grouped subdiagram and connect an external input. Save a baseline, change wiring, compare, restore, and undo the restoration.
5. Create/run a passing scenario and a deliberately failing one. Record virtual inputs. Confirm missing node references report errors. Test worker failure and larger scenarios without freezing the editor.
6. Exercise every keyboard path, dialog focus/close behavior, visible focus, labels, screen-reader announcements, 200% zoom, and reduced-motion mode.
7. Review dark/light/high-contrast at desktop and 390-pixel width. Confirm panels, canvas, toolbars, modal tables, dock, and touch gestures remain usable without unreachable controls.
8. Print a report and save as PDF; inspect all pages for clipping, readable wiring, assumptions/evidence, code wrapping, and complete tables.
9. On HTTPS/localhost, wait for cache ready, reload, disable the network, reload again, and run the editor/scenario tools. Check a cache update from v0.1. API calls must not be satisfied by cache.

## Hardware workflow

Record board/module model, wiring, supply voltages, CLI/core/library versions, firmware/project checksum, and actual outcome. Use the generated pin map and suitable current limits/supplies. All listed profiles currently have compile evidence only.

For Uno R3, classic Nano, Mega 2560, classic ESP32 WROOM-32, and ESP32-S3 DevKitC-1:

- Compile and upload heartbeat, dial-to-servo, and debounced-button starters. Verify actual pin levels, PWM/servo behavior, reset, power-cycle, and concurrent timing.
- Compile and upload sensor/OLED and peripheral fixtures. Check MCP9808 temperature, BH1750 light, MAX31855 thermocouple, and SSD1306 128×32 display. Exercise missing/failed sensors and output validity handling.
- Check feedback/state programs at the documented 10 ms update cadence; check counters, reset precedence, sequence restart, and edge timing.
- Verify secondary UART numeric input on Mega and ESP32 with valid, invalid, CRLF, and oversized lines. Verify the Nano old-bootloader upload option on a matching board.
- Use companion port discovery, compile, upload, cancellation, mapped compiler errors, and serial handoff. Deliberately disconnect the board, recover the connection, and repeat.
- Chart multiple live values, send a line, export/reopen CSV, clear logs, change baud, disconnect, and reconnect. Exercise both companion serial and Web Serial where the browser exposes it.

## New board, sensor, and networking acceptance

- On the S3, verify N8 and N8R8 module identities, flash/PSRAM settings, USB-to-UART upload/serial, ADC, PWM/servo allocation, and I²C/SPI/UART pin maps. Other flash or PSRAM variants need separate profiles.
- Compare BME280 temperature/humidity/pressure and INA219 voltage/current/power against references. Exercise shared address nodes, alternate addresses, missing devices, runtime disconnect, and startup failure/reset. Record calibration, shunt, voltage, and current limits.
- Use controlled MQTT and HTTP/HTTPS services on both ESP32 variants. Check successful publishes/subscriptions, exact topics, retained values, repeated identical messages, malformed/oversized payloads, stale deadlines, invalid-input output behavior, and broker restart.
- Verify TLS with a real root CA, valid clock, wrong CA, expired/server-name mismatch, unavailable NTP, and unavailable broker. Verify authentication failure, HTTPS Bearer delivery, and its absence on plain HTTP. Compiler placeholder certificates are not valid test certificates.
- Exercise GET/POST 2xx/4xx/5xx, slow DNS, stalled body, oversized/empty/malformed body, redirects, server disconnect, and Wi-Fi loss/recovery. Check negative status codes and logs. POSTs must not be retried within the same interval.
- Measure heap and task-stack margin under simultaneous TLS, MQTT, four HTTP nodes, sensors, telemetry, and outputs. Observe graph timing and MQTT service delays while HTTP or TLS blocks the network task. Compilation alone cannot establish a runtime margin.
- Confirm credential fields are empty after reload, project changes have intentional credentials, exports/autosave/revisions contain no private fields, a saved private header is handled separately, and a credential edit requires recompilation before UI upload.
- In real browsers, verify Ctrl/Cmd+K, Alt navigation, focused port activation, finding filters, dialog return focus, previous-save restore plus Undo, and recovery after quota errors.

## Promotion

Attach the observations or summarize them in TEST-REPORT.md. Fix release-blocking findings and rerun the relevant checks. Promote the version to 1.4.0, refresh service-worker cache/version, regenerate examples/package, and deploy the exact tested source. Do not mark these steps passed based on compilation, mocked APIs, or DOM events alone.

## Cleanup-specific browser checks — open

Follow UI-REVIEW.md for the viewport/theme matrix. Confirm Project and starter dialogs, panel resizing by pointer/keys, mobile drawer Tab/Escape behavior, focus after adding/duplicating, visible connection cues, tab arrow keys, context-menu keys, live channel focus under streaming data, touch targets, 200% zoom, and offline reload of polish.js/polish.css. DOM assertions are evidence for event logic only.

## New Arduino board acceptance — open

- Use the exact eight MKR variants, both UNO R4 variants, and GIGA R1 main-M7 profile. Confirm USB discovery, reset/bootloader entry, companion upload, serial reconnect, and a power cycle. Record the specific board/firmware revisions.
- Confirm built-in LEDs: MKR Zero/Vidor D32, other MKRs D6, UNO R4 D13, and GIGA green LED87 active LOW. Check physical pin labels against the generated report.
- Measure ADC endpoints and mapping (MKR 12-bit, R4 14-bit, GIGA 16-bit output), including GIGA analog-only A8–A11 and the core-supported A12/A13 ADC paths. These ranges do not establish effective precision or accuracy.
- Measure PWM on all exposed pins and concurrent independent channels; confirm rejected GIGA channel aliases and MKR Servo/TC4 combinations. Exercise multiple servos with an adequate external supply; check resource exhaustion and timing under sensor/serial load.
- Wire the default I²C/SPI buses shown in BOARDS.md, including GIGA's dedicated SPI header. Exercise supported sensors and the OLED, missing devices, and bus recovery.
- Loop back every exposed UART, including GIGA Serial4, while USB telemetry is active. Confirm 3.3 V/5 V level compatibility and runtime behavior.
- Confirm board-change notices, starter/default adaptation, invalid pins, saved/imported UART4, and capability exclusions in a rendered browser. Existing networking nodes must remain blocked on non-ESP32 boards.
