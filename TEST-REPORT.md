# ELECTRONBENCH v1.4.0-rc.1 — verification report

Date: 2026-10-06. Status: **release candidate; physical hardware and rendered-browser acceptance incomplete**. This release adds eleven Arduino profiles while preserving the previous five and the UI cleanup.

## Current automated results

| Check | Result | Scope |
|---|---|---|
| JavaScript and release consistency | Pass | JS parses; package, visible UI and service-worker version agree |
| Existing logic / generated host code | 25 groups pass | Validation, import, timing/state, host-compiled generated C++, ZIP decoding and UART parsing |
| Expanded sensor/network logic | 10 groups pass | Existing S3/sensor/network validation and parser behavior |
| New Arduino board profiles | 12 groups pass | Exact targets, round trips, ADC/Servo endpoints, physical resource maps, LED polarity, GIGA channel aliases, UART4, and unsupported networking/pins |
| DOM workflows | 40 groups pass | Prior 35 workflows plus grouped board selection, fresh-target persistence, physical pin maps, R4 ADC preview, and repair of a GIGA PWM conflict |
| Service-worker cache double | 3 groups pass | Complete linked asset list, cache cleanup and subdirectory behavior |
| Companion API with CLI double | 9 groups pass | Existing API/security/build/serial/recovery orchestration |
| Real target compilation | **121 / 121 pass** | Eleven fixture classes on each of eleven new profiles |
| Real companion pinned-profile builds | **3 / 3 pass** | Sensor/OLED projects on MKR WiFi 1010, UNO R4 WiFi and GIGA M7 through the actual local API |

**99 automated groups passed**, plus 121 real target compilations and 3 actual companion builds. No physical firmware upload occurred.

The eleven compiler fixtures per target cover all exposed ADC pins, independent PWM pins, blink, ADC-to-Servo, button/debounce/pulse, sensor/OLED, arithmetic/state/custom code, delayed feedback, MCP9808/BH1750/MAX31855, BME280/INA219 shared measurements, and all exposed UART channels. GIGA ADC compilation includes A8–A11's special analog-only types and A12/A13's ADC paths; UART compilation includes Serial4. Disallowed channel combinations are tested as validation failures rather than submitted to the compiler.

## Toolchains and evidence

Arduino CLI 1.5.1; Arduino SAMD 1.8.14; Renesas UNO 1.6.0; Mbed GIGA 4.6.0; Servo 1.2.2 and the other exact dependency versions emitted by the build profile. The matrix used installed versions matching these pins. The three companion builds used `compile --profile electronbench`, including profile dependency resolution, and produced retained firmware artifacts.

`verification/target-compiles.json` has each result, compiler output and memory figures. `verification/pinned-companion-builds.json` has the three actual API jobs. `verification/board-source-evidence.json` records core archive checksums and hashes of inspected official source. `verification/release-evidence.json` records application source hashes.

The first compiler attempt exposed a truncated local `cc1` executable after tool installation. Its archive matched Arduino's published checksum. The incomplete extracted file was restored byte-for-byte from that verified archive; the compiler probe and complete matrix then passed. Compiler source, generated firmware and pinned toolchain versions were not changed to bypass the failure.

The previous five targets were not recompiled with real toolchains in this batch. Their v1.3.0 results remain under `verification/v1.3.0-rc.1/`; UI-only v1.3.1 evidence remains under `verification/v1.3.1-rc.1/`. Current host/logic/DOM regression tests cover the retained behavior. Historical compiler runs are not counted in the 121 results above.

## Open acceptance and boundaries

No physical board, upload, electrical measurement, bootloader/reconnect, sensor accuracy, Servo timing, or live USB/UART observation was performed. Compilation establishes compatibility with the selected core and libraries, not working hardware or a safe runtime memory/timing margin. Read BOARDS.md and ACCEPTANCE.md before physical tests.

MKR/UNO R4/GIGA radios and board-specific FPGA, M4/RPC, multimedia, DAC, CAN, and extra-bus components are not implemented. Existing MQTT/HTTP nodes remain ESP32-only and are blocked on the new profiles.

Rendered-browser QA is unavailable under this environment's Sites workflow. No alternate preview/browser path was used. Layout, touch, actual keyboard/screen-reader behavior, printing, service-worker installation/offline reload, and browser serial permissions remain open. jsdom 26.1.0 exercises events and state, not layout or device APIs. UI-REVIEW.md preserves the cleanup review and open visual matrix.

The interrupted unpublished v2.0 source remains unavailable; this board expansion does not claim to restore it.

## Reproduce

```sh
npm run check
npm test
ELECTRONBENCH_JSDOM=/absolute/path/to/node_modules/jsdom npm run test:dom
# Install the exact cores/dependencies from the generated sketch.yaml profiles.
# Use the same Arduino CLI data/config for compiler runs:
ELECTRONBENCH_ARDUINO_CLI=/absolute/path/arduino-cli \
ELECTRONBENCH_ARDUINO_CONFIG=/absolute/path/arduino-cli.yaml \
node tests/compiler-matrix.cjs mkr-zero mkr-1000 mkr-wifi-1010 mkr-gsm-1400 mkr-nb-1500 mkr-wan-1300 mkr-wan-1310 mkr-vidor-4000 uno-r4-minima uno-r4-wifi giga-r1-wifi
# Optional fixture filter: ELECTRONBENCH_FIXTURE=adc,pwm,servo,uart
ELECTRONBENCH_TARGETS=mkr-wifi-1010,uno-r4-wifi,giga-r1-wifi npm run test:real-companion
node scripts/export-examples.cjs
python3 scripts/package-release.py /absolute/path/ELECTRONBENCH-v1.4.0-rc.1.zip
```

Set the CLI/config environment variables for companion tests as well. The frontend remains dependency-free and requires no npm install or build step. The release ZIP contains 31 example projects and per-file SHA256SUMS.
