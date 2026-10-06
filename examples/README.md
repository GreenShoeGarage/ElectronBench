# Runnable project examples

Import any `.electronbench.json` through **Open JSON**. Each folder also has the matching generated `.ino` and pinned `sketch.yaml`. All twelve projects validate. Representative programs compile across the five profiles; physical behavior remains unverified.

From the release root, for example:

```sh
arduino-cli compile --profile electronbench examples/blink
```

`bme280_environment` uses three measurements from one BME280; `ina219_power` uses three from one INA219. Select the correct board before export and check supply voltages, pull-ups, addresses, and the generated pin map.

`esp32_mqtt` and `esp32_s3_http` need your SSID, endpoints, and credentials. Import into the editor and use Network settings, then export a new bundle or compile through the local companion. For the included sketches, copy `electronbench_secrets.example.h` to `electronbench_secrets.h` and fill it privately; the example SSID/endpoints also need replacement in the generated source. No real credentials are supplied. See NETWORKING.md in the release root.

The S3 heartbeat uses an external LED on GPIO4; the classic ESP32 heartbeat uses GPIO25. Both require a suitable current-limiting resistor. They do not assume an onboard LED.
