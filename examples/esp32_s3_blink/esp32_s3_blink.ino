// ELECTRONBENCH 1.3.1-rc.1 | ESP32-S3 DevKitC-1 · N8/N8R8
// FQBN: esp32:esp32:esp32s3:FlashSize=8M,PSRAM=disabled,CDCOnBoot=default | schema 2
// Canvas connections carry program signals; see the project pin map.
#include <Arduino.h>
#include <math.h>

uint32_t startedAt;
bool v1 = 0;
bool v2 = 0;

void setup() {
  pinMode(4, OUTPUT); digitalWrite(4, LOW);
  startedAt=millis();
}

void loop() {
  const uint32_t now=uint32_t(millis()-startedAt); (void)now;
  #line 1 "eb_n1"
  // Clock
  v1 = (now % 1000UL) < 500UL;
  #line 1 "eb_n2"
  // Digital output
  v2 = v1; digitalWrite(4, v2 ? HIGH : LOW);
}
