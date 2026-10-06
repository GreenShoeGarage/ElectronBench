# ELECTRONBENCH v1.3.0-rc.1 — verification report

Date: 2026-10-05. Status: **release candidate; browser, hardware, and live-network acceptance incomplete**. This delivery implements the authorized v1.1, v1.2, and v1.3 feature batches.

## Completed checks

| Check | Result | Evidence scope |
|---|---|---|
| Syntax and release consistency | Pass | Shipped JS parses; package, visible UI, and cache agree on version |
| Original logic and generated-code suite | 25 groups passed | Validation, migration, scenarios, independent ZIP decoding, UART parsing, and generated C++ behavior; includes 12 host C++ fixtures |
| Expanded board/sensor/network suite | 10 groups passed | Shared sensor drivers, S3 pin rules, configuration validation, message expiry, repeated messages, virtual disconnect/recovery, HTTP intervals/failures, credential separation, executed numeric parser and bounded response buffer |
| DOM workflows | 20 groups passed | Original editor paths plus navigator/focus events, repair guidance, previous-save recovery, private-credential exclusion, and new starters |
| Companion API with CLI double | 9 groups passed | Token/origin rejection, discovery, retained builds, upload eligibility, custom-code review, diagnostics, cancellation, serial handoff, malformed imports, private-header permissions, and log redaction across chunks |
| Service-worker cache double | 3 groups passed | Complete asset list, old-cache cleanup, relative subdirectory paths, and API/origin exclusion |
| Real target compilation | 47 of 47 passed | Eight fixtures on Uno and Nano, nine on Mega, eleven on classic ESP32 and ESP32-S3, including new sensors and network/TLS programs |
| Real companion pinned builds | 2 of 2 passed | Combined BME280/MQTT/HTTPS programs on classic ESP32 and S3 compiled through the actual HTTP API, pinned-profile resolver, and private header into retained firmware artifacts |

**67 automated test groups passed**, plus the real compiler checks above. Host execution uses `g++ -std=c++17 -Wall -Wextra -Werror` with explicit API doubles. jsdom 26 exercises DOM events, not rendered-browser behavior. API orchestration and real companion compilation are separate checks. Cache tests do not install a real service worker.

The target matrix used Arduino CLI **1.5.1**, AVR core **1.8.6**, and ESP32 core **3.3.2**. It covers heartbeat, servo mapping, debounced button, sensor/OLED, arithmetic/state/custom C++, delayed feedback, peripherals, six BME280/INA219 measurements, secondary UART where supported, and combined BME280/MQTT/HTTP with plain and TLS transports. New pinned libraries include BME280 **2.3.0**, INA219 **1.2.3**, and PubSubClient **2.8.0**; dependency profiles record transitive versions.

The network TLS fixtures deliberately contain an invalid placeholder PEM certificate. They establish successful compilation and linking only. No broker/server connection, credential acceptance, CA/hostname verification, time synchronization, or TLS handshake was performed.

The final firmware generator was used for all 47 matrix builds. A subsequent validation-only restriction requires lowercase HTTP URL schemes; it does not change generated code for the compiled fixtures. Final source hashes are in `verification/release-evidence.json`. Current compiler results are in `verification/target-compiles.json` and `verification/pinned-companion-builds.json`; prior release evidence is preserved under `verification/v1.0.0-rc.1/`.

Example compiler observations for the combined TLS fixture: classic ESP32 uses **1,075,787 bytes flash / 48,408 bytes static RAM**, and S3 uses **1,060,415 bytes flash / 46,680 bytes static RAM**. These exclude the network task stack, TLS/Wi-Fi heap, and other runtime allocations. They do not establish a safe runtime memory margin.

## Findings resolved in this delivery

- Shared measurements use one physical sensor driver; INA219 read errors use the library's success flag.
- Main-loop MQTT reads enforce stale deadlines even if the separate network task is blocked.
- Bounded HTTP responses and strict numeric payload parsing reject malformed and oversized readings.
- Credentials remain outside project serialization and exported bundles; filled companion headers use owner-only permissions on POSIX and literal credentials are masked even across CLI log chunks.
- Cancellation remains a running job until the compiler process closes, preventing a serial handoff race.
- Primary autosave is still attempted when previous-copy backup fails; failed edits preserve prior graph/history.
- HTTP URL validation cannot silently select the wrong TLS transport through an uppercase scheme.

## Open acceptance

No physical board was attached and no firmware upload occurred. Sensor accuracy, display operation, actuator behavior, UART/USB, power-cycle, unplug/reconnect, and task timing remain unverified on all five profiles. No live MQTT/HTTP service was contacted by generated firmware. Retry, certificate validation, outage recovery, status latency, runtime heap, and task-stack margins need device evidence.

The supported rendered-browser QA capability is unavailable in this managed environment. No preview browser was started. Layout, screenshots, actual keyboard/screen-reader behavior, mobile/touch, print pagination, browser serial permissions, real worker execution, and offline reload remain unverified. DOM/cache doubles do not close these gaps.

These open procedures are listed in [ACCEPTANCE.md](ACCEPTANCE.md). The package remains **v1.3.0-rc.1** until the applicable evidence is recorded and defects resolved.

## Reproduce

```sh
npm run check
npm test
node tests/dom-integration.cjs
node tests/compiler-matrix.cjs
ELECTRONBENCH_NETWORK_BUILD=1 node tests/real-companion-build.cjs
```

The optional DOM test requires jsdom 26, and real builds require Arduino CLI and the pinned toolchains/libraries. Set `ELECTRONBENCH_JSDOM`, `ELECTRONBENCH_ARDUINO_CLI`, and `ELECTRONBENCH_ARDUINO_CONFIG` to external installations when needed. `ELECTRONBENCH_PINNED=1` makes the matrix resolve pinned profiles. `ELECTRONBENCH_MATRIX_REPORT` and `ELECTRONBENCH_COMPANION_REPORT` select JSON output paths. Omitting the networking flag selects the original Uno/classic ESP32 sensor companion smoke builds. No npm dependencies are required by the shipped editor or companion.
