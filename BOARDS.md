# Arduino board support — ELECTRONBENCH v1.4.0-rc.1

Select the exact model with the board button above the canvas. This release adds eleven profiles: eight MKR models, both UNO R4 models, and GIGA R1 WiFi's main Cortex-M7. The five previous profiles remain available, for sixteen total.

Board support covers the existing digital/analog I/O, PWM, Servo, logic/state, external supported sensors/displays, hardware UART, USB telemetry, generated Arduino sketches, and companion build profiles. It does not imply support for every onboard peripheral. Firmware compilation and physical hardware testing are separate; see TEST-REPORT.md for recorded results.

## New profiles

| Model | Arduino CLI FQBN | Core |
|---|---|---|
| MKR Zero | `arduino:samd:mkrzero` | SAMD 1.8.14 |
| MKR1000 WiFi | `arduino:samd:mkr1000` | SAMD 1.8.14 |
| MKR WiFi 1010 | `arduino:samd:mkrwifi1010` | SAMD 1.8.14 |
| MKR GSM 1400 | `arduino:samd:mkrgsm1400` | SAMD 1.8.14 |
| MKR NB 1500 | `arduino:samd:mkrnb1500` | SAMD 1.8.14 |
| MKR WAN 1300 | `arduino:samd:mkrwan1300` | SAMD 1.8.14 |
| MKR WAN 1310 | `arduino:samd:mkrwan1310` | SAMD 1.8.14 |
| MKR Vidor 4000 | `arduino:samd:mkrvidor4000` | SAMD 1.8.14 |
| UNO R4 Minima | `arduino:renesas_uno:minima` | Renesas UNO 1.6.0 |
| UNO R4 WiFi | `arduino:renesas_uno:unor4wifi` | Renesas UNO 1.6.0 |
| GIGA R1 WiFi · M7 | `arduino:mbed_giga:giga:target_core=cm7,split=100_0` | Mbed GIGA 4.6.0 |

GIGA uses the main M7 with the 2 MB M7 flash layout and default security setting. No M4 program or RPC service is emitted. UNO R4 WiFi generates RA4M1 firmware; its ESP32 coprocessor does not turn it into an ESP32 Arduino target.

## Pin and signal model

These are the pins this application exposes, a conservative subset where boards have additional internal connectors or alternate functions.

| Resource | MKR family | UNO R4 Minima / WiFi | GIGA R1 WiFi · M7 |
|---|---|---|---|
| Logic level | 3.3 V | 5 V headers | 3.3 V |
| Digital selector | D0–D14 | D0–D13 | D0–D53 |
| ADC selector | A0–A6 | A0–A5 | A0–A13; A12/A13 are also DAC-capable pads |
| Generated ADC resolution | 12 bits, 0–4095 | 14 bits, 0–16383 | 16-bit API output, 0–65535 |
| PWM selector | D0–D8, D10, A3, A4 | D3, D5, D6, D9, D10, D11 | D2–D13 |
| PWM command range | 0–255 | 0–255 | 0–255 |
| Default I²C | SDA D11 / SCL D12 | SDA A4 / SCL A5 | SDA D20 / SCL D21 |
| Default SPI, SCK/CIPO/COPI | D9 / D10 / D8 | D13 / D12 / D11 | Dedicated SPI header: 91 / 89 / 90 |
| Hardware UART | Serial1: RX13 / TX14 | Serial1: RX0 / TX1 | Serial1: RX0/TX1; Serial2: RX19/TX18; Serial3: RX17/TX16; Serial4: RX15/TX14 |
| Built-in LED | D32 on Zero/Vidor; D6 on the others | D13 | Green LED87, active LOW |

ADC range is explicitly configured in generated firmware; previews, sliders, mapping defaults, and starter notes use that same range. It is a code/output range, not a measurement-accuracy claim. Existing projects retain their component parameters when switching boards: review ADC mapping ranges as well as pins. Fresh projects and starters retain the chosen target.

Internal LED pins are available to the LED/digital-output component only. GIGA A8–A11 are analog-only core objects and are emitted directly in `analogRead(A8)`-style calls; they are not offered as GPIO or Servo pins. Analog pins are not offered as general digital pins by these conservative profiles, except MKR A3/A4 in PWM. GIGA's default SPI bus is not the Mega's D50–D52 mapping, nor the optional SPI1 bus on D11–D13.

## Resource checks

- Duplicate pin assignments, shared I²C/SPI pin use, UART RX/TX conflicts, and unsupported pins/channels block firmware export.
- MKR Servo uses TC4. PWM on D0 or D1 is blocked while a Servo exists. Other selected MKR PWM pins use distinct compare channels. D9 and D12 are deliberately absent from the common PWM selector; extra MKR1000 D11 PWM is omitted to avoid its A3 channel alias.
- GIGA PWM D5+D10 and D11+D12 share compare channels. Each pair is blocked when requested as independent PWM outputs. Frequency is fixed by the core; timer-sharing pins cannot be given independent frequencies by this app.
- UNO R4 and GIGA do not receive AVR-specific D9/D10 Servo exclusions. Their Servo backends still depend on available runtime resources and interrupt timing; real actuator tests remain necessary.
- New profiles conservatively allow twelve Servo components, each on an exposed digital pin. An exported sketch is not proof that a power supply or timing budget supports all connected servos.

## Explicit boundaries

The current MQTT/HTTP/Wi-Fi nodes remain **ESP32-only**. Selecting an MKR WiFi, UNO R4 WiFi, or GIGA WiFi board does not enable them; validation explains the unsupported target. MKR cellular/LoRa/BLE stacks, Vidor FPGA functions, and the MKR Zero onboard SPI1 SD socket are not generated.

UNO R4 LED matrix, Qwiic Wire1, DAC, CAN, and op-amp components are not implemented. GIGA M4/RPC, external SDRAM management, camera, display shield/DSI, USB host, audio, DAC, CAN, and additional Wire/SPI buses are not implemented. The generated default `Wire`, `SPI`, and named header UARTs are supported; board documentation may describe more hardware than this app exposes.

MKR and GIGA GPIO use 3.3 V logic. The UNO R4 WiFi's Qwiic connector uses 3.3 V even though the supported main headers use 5 V. Check module voltage and I²C pull-ups before wiring; use a suitable servo supply and common ground.

## Reproducible source references

Pin choices and backend behavior were checked against the pinned core/library sources, not inferred from board shape or product name:

- [Official Arduino package index](https://downloads.arduino.cc/packages/package_index.json)
- [SAMD 1.8.14 boards](https://github.com/arduino/ArduinoCore-samd/blob/1.8.14/boards.txt), [MKR Zero variant](https://github.com/arduino/ArduinoCore-samd/blob/1.8.14/variants/mkrzero/variant.cpp), [MKR WiFi 1010 variant](https://github.com/arduino/ArduinoCore-samd/blob/1.8.14/variants/mkrwifi1010/variant.cpp), [SAMD analog implementation](https://github.com/arduino/ArduinoCore-samd/blob/1.8.14/cores/arduino/wiring_analog.c)
- [UNO R4 1.6.0 boards](https://github.com/arduino/ArduinoCore-renesas/blob/1.6.0/boards.txt), [Minima pin definitions](https://github.com/arduino/ArduinoCore-renesas/blob/1.6.0/variants/MINIMA/pins_arduino.h), [WiFi pin definitions](https://github.com/arduino/ArduinoCore-renesas/blob/1.6.0/variants/UNOWIFIR4/pins_arduino.h), [R4 ADC implementation](https://github.com/arduino/ArduinoCore-renesas/blob/1.6.0/cores/arduino/analog.cpp)
- [GIGA 4.6.0 boards](https://github.com/arduino/ArduinoCore-mbed/blob/4.6.0/boards.txt), [pin definitions](https://github.com/arduino/ArduinoCore-mbed/blob/4.6.0/variants/GIGA/pins_arduino.h), [variant mapping](https://github.com/arduino/ArduinoCore-mbed/blob/4.6.0/variants/GIGA/variant.cpp), [analog-only pin types](https://github.com/arduino/ArduinoCore-mbed/blob/4.6.0/variants/GIGA/pure_analog_pins.h), [ADC implementation](https://github.com/arduino/ArduinoCore-mbed/blob/4.6.0/cores/arduino/wiring_analog.cpp)
- [Servo 1.2.2 SAMD timer allocation](https://github.com/arduino-libraries/Servo/blob/1.2.2/src/samd/ServoTimers.h), [Renesas backend](https://github.com/arduino-libraries/Servo/blob/1.2.2/src/renesas/Servo.cpp), [Mbed backend](https://github.com/arduino-libraries/Servo/blob/1.2.2/src/mbed/Servo.cpp)
- [MKR WiFi 1010 pinout](https://docs.arduino.cc/resources/pinouts/ABX00023-full-pinout.pdf), [UNO R4 Minima pinout](https://docs.arduino.cc/resources/pinouts/ABX00080-full-pinout.pdf), [GIGA R1 pinout](https://docs.arduino.cc/resources/pinouts/ABX00063-full-pinout.pdf)

Official pinout sheets and core definitions sometimes differ in optional mux capabilities. This profile follows the pinned core's implemented behavior. A future core upgrade needs renewed compatibility and timer checks.
