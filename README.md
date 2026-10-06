# ELECTRONBENCH v1.4.0-rc.1

A Green Shoe Garage visual firmware workbench for microcontrollers. **Choose a target → connect behavior → preview and check → compile → upload → observe.**

This release adds **Arduino MKR, UNO R4 Minima/WiFi, and GIGA R1 WiFi M7** support while retaining the UI cleanup. There are sixteen board profiles. Choose a model with the board button, then use a starter or create your own graph. Board-aware pins, ADC ranges, LED polarity, timers, buses, UARTs, and pinned build profiles are implemented. See [BOARDS.md](BOARDS.md) for exact models and scope, and [TEST-REPORT.md](TEST-REPORT.md) for verification. Physical hardware and rendered-browser acceptance remain open.

The interrupted, unpublished v2.0 checkout was not present when this session resumed. This cleanup is based on the durable v1.3 source and does not claim to restore or deliver v2.0 features.

ELECTRONBENCH is an independent implementation inspired by visual microcontroller programming. It does not reproduce Visuino's complete catalog, proprietary code, artwork, or project format.

## Start in a minute

1. Open `index.html` from the release ZIP, or `dist/index.html` from the source repository. A local HTTP server gives more consistent storage and browser API behavior than a file URL.
2. **Run preview** on the heartbeat starter. Use **Starters** for a dial-to-servo, timed-button, or temperature-to-OLED project.
3. Select a component to edit it. Connect output → input by clicking ports, or choose a source in the inspector.
4. **Save JSON** preserves your visual source. **Project → New project** starts an empty project; Undo can restore the prior one.
5. **Project → Download project bundle** downloads the diagram, sketch, pinned dependencies, and checks together.
6. To compile and upload from the workbench, start the included local companion as described below.

No frontend build step, Docker installation, application account, runtime CDN, or analytics service is required. This is a static folder with an optional local hardware companion.

## Self-host the editor

Copy the static files together into any static host, including a subdirectory such as `/projects/electronbench/`. In the ZIP these files are at the root; in the source repository they are in `dist/`:

`index.html`, `style.css`, `polish.css`, `polish.js`, `core.js`, `app.js`, `studio.js`, `project-tools.js`, `editor.js`, `network-core.js`, `network-ui.js`, `zip.js`, `scenario-worker.js`, `sw.js`, `icon.svg`, `manifest.webmanifest`.

For a local static server with Python 3:

```sh
# Release ZIP root:
python3 -m http.server 8080
# Source repository, instead:
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`. All editor asset paths are relative. Serve JS with a JavaScript MIME type; do not rewrite missing assets to HTML. The supplied scripts do not require an npm install.

Service-worker caching requires HTTPS or localhost. After the footer says **offline cache ready**, the implemented cache contains the editor and scenario worker. Actual offline reload remains an acceptance check. Opening the HTML directly works for basic editing but skips caching and may have browser-specific storage limitations. Clear the site cache or unregister its worker if a self-hosted deployment remains on an older version; export your project before clearing site data.

## Local compile/upload companion

The companion serves its own copy of the editor and invokes Arduino CLI on the computer connected to your board. It uses Node's standard library and binds only to `127.0.0.1`; it is not a public compilation service.

Prerequisites:

- Node.js 20 or later.
- Arduino CLI on your PATH. **1.5.1** was used for release verification. See the [official installation instructions](https://docs.arduino.cc/arduino-cli/installation/).
- A USB data cable, the appropriate operating-system USB driver, and permission to use the serial device.
- Internet access for the first pinned core/library installation. Cached profiles can subsequently compile offline if their complete toolchain is present.

Start from the extracted ZIP or repository:

```sh
node companion/server.cjs
```

Alternatively run `./start-companion.sh` on macOS/Linux, or `start-companion.cmd` on Windows. Open the **pairing link printed in the terminal**. Keep that terminal open.

1. Open/import your project in this local editor. Browser storage belongs to its origin; use JSON to transfer a project from a hosted editor.
2. Choose the board under **Target** and resolve errors in **Checks**.
3. Open **Build / Upload**, then **Compile**. The first run may download the pinned platform and libraries.
4. Review the compiler log. Errors with a component source marker can take you back to that node.
5. Refresh/select the board's detected serial port, then **Upload**. A successful, retained build is required; editing the project requires recompilation.
6. Open **Live serial**, connect, and select 115200 baud for generated telemetry.

Compilation, cancellation, errors, port restrictions, upload orchestration, and serial API operations were integration-tested. Real classic ESP32 and ESP32-S3 sensor/MQTT/HTTPS builds also passed through the companion with pinned profiles. The preceding release separately verified Uno and classic ESP32 sensor/OLED builds. **No physical firmware upload or serial device test was performed.**

Configuration environment variables:

| Variable | Purpose |
|---|---|
| `ELECTRONBENCH_PORT` | Local HTTP port; default 8787 |
| `ELECTRONBENCH_ARDUINO_CLI` | Full Arduino CLI executable path when not on PATH |
| `ELECTRONBENCH_ARDUINO_CONFIG` | Optional Arduino CLI YAML configuration path |
| `ARDUINO_NETWORK_PROXY` | Arduino CLI proxy URL, when your network requires one |

The pairing token is kept in the tab session, not exported in project data. A restarted companion prints a new token/link. The API rejects requests without the token, unexpected Host headers, and other origins. Do not reverse-proxy or expose the companion publicly. Build files are temporary and removed on clean exit. Build logs are limited to 2 MB, jobs time out after 15 minutes, and up to about 20 recent jobs are retained. Cancel or restart if a task stalls.

Custom C++ is compiled locally only after explicit review in the build dialog. Compilation is not sandboxed. Review imported custom source before allowing it; custom functions can use Arduino APIs and are not restricted to the graphical resource model.

## Targets and verification status

The five previous profiles remain: Uno R3, classic Nano, Mega 2560, classic ESP32 WROOM-32, and ESP32-S3 DevKitC-1 N8/N8R8. Their previous compiler evidence is retained. This release adds:

| Family | Models | Pinned core | Configured ADC range |
|---|---|---|---|
| MKR | Zero, 1000 WiFi, WiFi 1010, GSM 1400, NB 1500, WAN 1300, WAN 1310, Vidor 4000 | `arduino:samd` 1.8.14 | 0–4095 |
| UNO R4 | Minima, WiFi | `arduino:renesas_uno` 1.6.0 | 0–16383 |
| GIGA | R1 WiFi, main M7 core | `arduino:mbed_giga` 4.6.0 | 0–65535 |

**All boards remain hardware-unverified.** Added profiles support the existing external I/O/peripheral workflow. Onboard radios, FPGA, GIGA M4/RPC and board-specific multimedia/DAC/CAN features are outside this release. MQTT/HTTP nodes still require ESP32. See [BOARDS.md](BOARDS.md) for exact pins, compiler targets, limits, and source references.

Pin map includes individual pins, shared I²C/SPI pins, device addresses, and UART assignments. Validation covers duplicate pins, I²C address collisions, bus-pin use, board-specific Servo/PWM timer conflicts and GIGA PWM channel aliases, and unsupported UARTs. Memory warnings are estimates; inspect compiler output and allow for heap, stack, and runtime buffers. OLED's 512-byte framebuffer is allocated at runtime and is not part of the compiler's static RAM figure.

## Components and project tools

44 components are included:

| Category | Components |
|---|---|
| Inputs | Clock, Button, Analog input, Constant, Boolean constant |
| Processing | Map range, Threshold, Debounce, Boolean → number, Arithmetic, Clamp, Smooth, Hysteresis, Is valid, Select value, Custom C++ |
| Logic/state | NOT, AND, OR, Timed pulse, Toggle, Rising edge, Falling edge, Counter, Set/reset latch, Sample delay, Boolean delay, Stage sequence |
| Outputs | Digital output, PWM output, Servo, Serial value |
| Sensors/buses | MCP9808 temperature, BH1750 light, MAX31855 thermocouple, SSD1306 128×32 numeric OLED, secondary UART numeric input, BME280 temperature/humidity/pressure, INA219 voltage/current/power |
| Networking (ESP32) | Wi-Fi/MQTT connection status, MQTT numeric input/output, HTTP numeric GET/POST |

Easy mode supports the basic input/behavior/output workflow. Advanced mode additionally exposes memory, custom C++, secondary UART, and networking controls. This is a specific sensor collection, not a generic electrical simulator or universal component marketplace.

Project tools provides:

- Multi-selection, alignment, automatic layout, and component search.
- Project navigator with name/type/pin/subdiagram search and error-first sorting; filtered findings with repair guidance; previous-autosave download/restore with Undo.
- Reusable modules from selections, portable module JSON, and subdiagram groups. Instances are flattened editable copies; changing a template does not update existing instances. Connect exposed inputs through the inspector and reassign pins after insertion.
- Timestamped scenarios with virtual input events, numeric tolerances, expected outputs, and downloadable results. Record input gestures, then add expectations. A test with no expectations does not pass.
- Up to ten named revision snapshots and comparison of components, wiring, notes, and settings. Layout-only moves are omitted. Undo also works after restoring a revision.
- Separate evidence and assumptions registers. Observations are user-recorded; they do not certify hardware automatically.
- A printable project report with wiring, notes, checks, evidence, assumptions, pinned profile, and generated source.

## Program and preview semantics

- Connections carry Boolean or numeric program signals. They are not electrical wires.
- Acyclic dependencies execute in order. Feedback must contain a **Sample delay** or **Boolean delay**. Such a project updates at 10 ms intervals, with delays exposing the previous tick's value. Other firmware graphs evaluate each loop; preview advances in 10 ms steps.
- Clock starts HIGH. Button uses `INPUT_PULLUP`, with a normally-open switch to GND; pressed means true. Debounce begins false. Pulse retriggers on a new rising edge, not a held input. Toggle also responds only to rising edges.
- Counter resets before counting and saturates at its limit. Reset wins in a set/reset latch. Stage sequence starts on a rising edge, yields zero-based stage numbers, and yields −1 when idle.
- Smooth is a time-based first-order filter. Hysteresis switches on/off at inclusive high/low boundaries. Division by zero produces NaN; **Is valid** can guard an output.
- PWM clamps/rounds to 0–255 and outputs zero for non-finite input. Servo clamps/rounds to 0–180 and holds the previous command (initially 90) for invalid input. These are software commands, not measured actuator positions.
- Sensors are sampled at their configured interval. Failed target reads become NaN, and OLED shows ERR. Initialization is attempted once at startup; reconnecting a failed sensor may require resetting the board. Preview sensors are virtual values; a scenario's `null` models a failed reading.
- UART numeric input accepts newline-terminated numbers (optional CR), with a 31-character line limit and a bounded read budget. Malformed/overflowed lines produce NaN. No secondary UART input is offered on Uno/Nano.
- Custom C++ gets `input` and elapsed `now`, and must return a number. Preview uses the node's explicit **stub value**; a passing preview cannot test custom code.
- Generated code avoids `delay()` for its own timers. Sensor libraries, serial writes, and display transfers can still block briefly. Elapsed timer arithmetic uses unsigned 32-bit differences; clock phase wraps after roughly 49.7 days. Preview does not model wraparound, interrupts, analog noise, peripheral latency, or exact floating-point arithmetic.
- Editing resets preview. Hidden tabs pause it. Firmware runs independently once uploaded. Exported C++ edits cannot reconstruct the visual graph.

## Builds and live instruments

**Export Arduino** downloads the sketch. Networking sketches also require `electronbench_secrets.h`, available from Network settings. **Export project bundle** is the preferred handoff because it includes `sketch.yaml` with pinned platforms and libraries. From the extracted bundle:

```sh
arduino-cli compile --profile electronbench electronbench_project
arduino-cli board list
# Substitute your board's actual port:
arduino-cli upload --profile electronbench --port PORT electronbench_project
```

The profile resolves a separate reproducible dependency set. Arduino IDE users can open the sketch folder and install the versions listed in `dependencies.json`. Toolchains and libraries are downloaded separately and retain their original licenses. The app needs no network to edit, preview, validate, or export a project.

Generated serial output is JSON at 115200 baud, with `ms` and node IDs. Serial value nodes are reported by default; Target settings can enable all-node telemetry and change its interval (minimum 100 ms). Large graphs may produce more data than the serial link can sustain, so increase the interval or use a few Serial value nodes.

Live serial accepts these frames and `name:number` lines. It supports up to 16 channels, 120 recent readings per plot, 10,000 readings in CSV, and a bounded serial console. Channels scale independently. CSV retains receive time and source `ms` when available. It is not a calibrated oscilloscope. Incoming data remains local and is not autosaved; export CSV before leaving.

Use Web Serial in a compatible secure browser, or use the companion's CLI-backed monitor. Unsupported browsers are directed to the companion. Compile/upload stops the companion monitor to release the port; reconnect afterward. Unplug/reconnect and browser serial permission flows still require device/browser acceptance testing.

## ESP32 networking and additional sensors

See [NETWORKING.md](NETWORKING.md) for setup, credentials, TLS, preview behavior, and failure codes. Start with **Starters → ESP32 MQTT exchange** or **ESP32 HTTP exchange**, then configure **Project tools → Network settings**. The firmware uses a separate network task; browser preview uses virtual inputs and sends no broker or HTTP requests. Network components are unavailable on AVR targets.

**BME280** nodes expose temperature in °C, humidity in %, or pressure in hPa. **INA219** nodes expose bus voltage in V, current in mA, or power in mW. Nodes of the same type/address share a driver; individual measurements keep their own polling interval. BME280 is not BMP280. The INA219 profile uses the library’s 32 V / 2 A calibration for a 0.1 Ω shunt; the device input limit remains 26 V. Check breakout and shunt ratings. These profiles have compiler evidence, not physical measurement evidence.

The ESP32-S3 profile uses I²C GPIO8/9, SPI GPIO12/13/11 (clock/MISO/MOSI), and UART2 RX16/TX17. Its conservative selectable pins exclude the flash/PSRAM, USB, strapping, and onboard RGB connections.

## Data, recovery, and keyboard controls

Autosave stores one active project plus the previous save in browser localStorage. **Project tools → Recover previous autosave** can download or restore the previous copy. Ctrl/Cmd+K opens the navigator; Alt+Up/Down selects components, and Alt+Left/Right follows the first incoming/outgoing connection. Its visible indicator reports saving, saved, unsaved, and failure. Storage quota failures preserve the in-memory project and direct you to export JSON. Keep portable backups; origin storage can be cleared by the browser.

Schema 1 projects migrate to schema 2. Imports are limited to 4 MB, 500 nodes, 1,000 edges, 30 scenarios, 20 module templates, ten revisions, and 100 entries per register. Nested revision/module collections are deliberately flattened to avoid recursive snapshot growth. Unknown schemas are rejected with the original project unchanged. Corrupt autosave data exposes raw download, previous-save recovery, and fresh start.

Undo/redo retains up to 60 in-memory snapshots and resets after reload. Theme, panels, dock height, mode, and view are persisted. Virtual input positions, preview time, serial data, and undo history are not permanent records.

- Shift/Ctrl-click adds components to the selection. Duplicate preserves internal wires.
- Tab reaches nodes and ports; inspector dropdowns are alternatives to connection gestures.
- Arrow keys move a focused node; Shift increases the step. Ctrl/Command Z undoes; Shift Z redoes; Ctrl/Command D duplicates. Delete removes the selection.
- Select/Pan are explicit modes. Space temporarily pans; scroll zooms; Fit restores the overview.
- Escape cancels connection selection; dialogs provide a close control. Dark, light, and high-contrast themes and reduced-motion handling are included.
- Small-screen layouts prioritize viewing/simple edits, with collapsible overlay panels. Rendered accessibility, touch, print, zoom, and mobile acceptance remain pending.

The application sends no project data to an application service and loads no remote fonts or scripts. The local companion invokes Arduino tools, whose first dependency resolution accesses package servers. Your static host may keep ordinary HTTP request logs.

## Development and verification

```sh
npm run check
npm test
# Optional DOM event checks; install jsdom 26 in your development environment:
node tests/dom-integration.cjs
# Requires installed target toolchains/libraries or ELECTRONBENCH_PINNED=1:
node tests/compiler-matrix.cjs
# Real pinned Uno/ESP32 compilation through the companion API; no upload:
node tests/real-companion-build.cjs
# Real classic ESP32 / ESP32-S3 networking and TLS builds:
ELECTRONBENCH_NETWORK_BUILD=1 node tests/real-companion-build.cjs
```

`npm test` requires Node, `g++`, and Python 3. Test doubles under `tests/` are never firmware dependencies. Optional tests can use `ELECTRONBENCH_JSDOM` to locate a separate jsdom installation, plus the CLI/config variables above. No package installation is necessary for the shipped editor or companion.

`verification/` contains current compiler results and preserved historical evidence, with toolchain versions identified in TEST-REPORT.md. Remaining manual acceptance procedures are in [ACCEPTANCE.md](ACCEPTANCE.md). The test report makes no physical hardware or rendered-browser claim.

## License

Application source: GNU GPL v3 (`GPL-3.0-only`), included as `LICENSE`. External Arduino platforms and libraries retain their own licenses and are not bundled. No Visuino source or assets are included. Product names identify compatible target profiles; they do not imply affiliation.

## Workspace controls

- **Project** holds new/open, project bundle, printable report, and previous-autosave recovery. **Save JSON** remains visible and works even when a graph has errors; Ctrl/Cmd+S downloads it.
- **Project tools** groups diagram arrangement, tests/reuse, and configuration. **Run preview** is the main workbench action; blocked previews explain how to proceed.
- Component groups collapse and remember their state. Search offers Advanced mode when matching components are hidden by Easy mode.
- Drag side-panel and lower-panel dividers, or focus a divider and use arrows, Home, and End. Double-click restores its default size. Preferences persist locally.
- Narrow screens use one side drawer at a time. Escape closes it and returns focus to its toggle. Adding a component returns to the canvas.
- Arrow keys navigate the lower-panel tabs. Shift+F10 opens a focused component's actions. Alt+arrows navigate components/connections. Shift-click builds a multi-selection with visible Duplicate/Delete actions.
- Starters retain the selected board. ESP32 networking starters use a supported ESP32 profile; inspect pin assignments before connecting hardware.
