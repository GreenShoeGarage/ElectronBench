# ESP32 networking — v1.3.1-rc.1

Networking is generated firmware for classic ESP32 WROOM-32 and ESP32-S3 DevKitC-1. The editor and preview do not contact a broker or HTTP endpoint. All live-network and hardware acceptance remains open; successful compilation is not evidence of successful connection or real-time performance.

## First project

1. Choose an ESP32 target. Open the MQTT or HTTP starter.
2. Open **Project tools → Network settings**. Enter SSID and, for MQTT, the broker hostname/IPv4, port, and client ID prefix. A chip identifier is appended to the prefix.
3. Enter private credentials in the same dialog and click **Save settings for this project**. These credentials last in page memory until cleared or the page closes; opening another project in the same page retains them. Review them before building a different project.
4. Use exact MQTT topics with plain numeric payloads, or HTTP endpoints returning a plain number. Replace the starter's example LAN addresses. Resolve errors under **Checks**.
5. Run preview and use virtual sliders. The Network connected nodes simulate Wi-Fi/MQTT connection state; changing an MQTT slider, even to the same value, represents a new message.
6. Compile with the local companion. It supplies the private header automatically. Upload to a real board only after reviewing its pin map and network configuration. Use Live serial for telemetry and `NET` status messages.

For manual builds, download `electronbench_secrets.h` from Network settings and place it beside the `.ino`. **Export project bundle** contains a blank header template; it never inserts session credentials. The repository's network examples instead include `electronbench_secrets.example.h`: copy this to `electronbench_secrets.h` and fill it locally. Keep filled headers and firmware binaries private. `.gitignore` excludes the private filename and firmware binaries.

Project JSON, autosave, revision snapshots, reports, and portable bundles exclude the private credential fields. SSID, broker, URLs, CA certificate, and other non-secret settings are saved. Do not put passwords or tokens in URL query strings, labels, notes, or custom C++; those are ordinary project data and will be exported. Embedded URL username/password is rejected.

The companion writes its header with owner-only permissions on POSIX, masks literal credential strings in job logs, and removes temporary build directories on clean shutdown. Force termination may leave temporary files for manual cleanup. Credentials are compiled into firmware; this is not a device secret vault or encrypted storage system.

## Component behavior

| Component | Input / output | Rules |
|---|---|---|
| Network connected | Numeric 1 or 0 | One per service (Wi-Fi or MQTT); preview sliders also control virtual connection state |
| MQTT number input | Numeric received value | Exact topic, no wildcards; 64-byte numeric payload limit; malformed, disconnected, unseen, or stale data becomes NaN |
| MQTT number output | Numeric input; last-send success 1/0 | QoS 0, interval at least 500 ms, optional retained message; non-finite input is not sent |
| HTTP GET number | Numeric body or HTTP status | Interval at least 1 second; number mode accepts finite plain-text values from 2xx responses, at most 64 bytes |
| HTTP POST number | Numeric input; HTTP status | Sends `text/plain` with six decimal places; interval at least 1 second; invalid input skips the request; no extra retry inside the interval |

Numeric inputs accept surrounding whitespace and standard finite numeric forms; they do not parse JSON, units, CSV, or arbitrary text. GET status mode reports the status without interpreting the response body. Redirects are disabled. HTTP URLs must start with lowercase `http://` or `https://`, without embedded credentials or fragments. MQTT uses a hostname or IPv4 address, not a URL.

Use **Is valid**, **Select value**, and connection status to define application behavior. A stale MQTT command yields NaN: PWM goes to zero while Servo holds its last command. Decide whether that is appropriate for the attached mechanism. This software is not a safety controller.

The preview models successful requests, intervals, disconnection, invalid values, and MQTT expiry. It defaults to a virtual initial MQTT message and successful HTTP 200, while real firmware starts without a received message. It does not emulate TLS, credentials, latency, server response bodies, or arbitrary HTTP status codes. Scenario `null` models an invalid numeric reading.

## TLS and private requests

Enable MQTT TLS and choose the broker's TLS port (often 8883), or use an HTTPS URL. Paste the correct PEM root CA for the server into Network settings. One CA configuration is shared by these clients; the field can contain a PEM CA bundle. Configure a reachable NTP hostname. Generated firmware waits for a plausible synchronized clock before initiating TLS, validates against the configured CA, and does not use an insecure certificate bypass.

The validation screen checks PEM delimiters, not certificate validity. The test fixtures use an intentionally invalid placeholder certificate solely for compiler coverage. Supply your own real CA for runtime use and complete wrong-CA, hostname, expiry, and clock-failure checks in ACCEPTANCE.md.

MQTT username/password are optional. HTTP Bearer credentials are sent only to HTTPS endpoints. Plain HTTP/MQTT are unencrypted; the UI flags them for use only on a trusted network. A single HTTP Bearer value is shared by all HTTPS nodes in a project, so use only endpoints intended to receive that credential.

## Scheduling and limits

- Graph evaluation stays on the main task. A separate FreeRTOS task runs network operations and exchanges numeric values under a lock. MQTT expiry is also enforced when the main graph reads a value, independently of a blocked network task.
- HTTP requests are sequential in that worker. Four HTTP nodes, slow DNS, connection failures, and TLS handshakes can delay MQTT polling and status updates. A configured interval is a minimum scheduling interval, not a hard deadline. Retry applies to connections; failed POSTs wait until their next interval.
- Up to 32 network nodes, four HTTP nodes, 160 UTF-8 bytes per exact MQTT topic, and a 512-byte MQTT packet buffer. QoS 0 only. No last-will configuration, MQTT wildcards, JSON parsing, request editor, or browser broker client.
- Socket/connect timeout setting: 500–5,000 ms. TLS handshake timeout is five seconds; underlying DNS/library behavior can add delay. Reconnection interval: 1–60 seconds.
- Network task requests a 12,288-byte stack plus an 8 × 96-byte log queue. Wi-Fi/TLS/library buffers use additional heap. Compiler static RAM totals exclude these runtime allocations. Runtime capacity must be measured on the target.
- Sensor initialization occurs on the main task; measurements of the same BME280/INA219 device share a driver but are polled separately, not an atomic sample set.

| Code | Meaning |
|---|---|
| `-1000` | Wi-Fi disconnected |
| `-1001` | Invalid POST input or invalid numeric GET body |
| `-1002` | Oversized response or body read failure |
| `-1003` | HTTP client could not initialize the request |
| `-1004` | HTTPS waiting for synchronized time |
| Other negative value | Underlying Arduino HTTP client error |
| Positive HTTP status | Actual response status for status-mode GET / POST |

GET number mode returns NaN for failure; its diagnostic code is in `NET HTTP <node> status` logs. Logs are queued and printed by the graph task so network threads do not interleave bytes with JSON telemetry. A full log queue drops messages instead of blocking.

## References

- [ESP32-S3 DevKitC-1 board guide](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide_v1.1.html)
- [Arduino-ESP32 core](https://github.com/espressif/arduino-esp32/tree/3.3.2)
- [PubSubClient API](https://pubsubclient.knolleary.net/api)
- [Adafruit BME280 library](https://github.com/adafruit/Adafruit_BME280_Library)
- [Adafruit INA219 library](https://github.com/adafruit/Adafruit_INA219)

The generated `sketch.yaml` pins platform and library versions. Original upstream licenses remain applicable; toolchains and libraries are downloaded separately.
