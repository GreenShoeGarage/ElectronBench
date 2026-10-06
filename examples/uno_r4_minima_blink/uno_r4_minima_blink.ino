// ELECTRONBENCH 1.4.0-rc.1 | Arduino UNO R4 Minima
// FQBN: arduino:renesas_uno:minima | schema 2
// Canvas connections carry program signals; see the project pin map.
#include <Arduino.h>
#include <math.h>

uint32_t startedAt;
bool v1 = 0;
bool v2 = 0;

void setup() {
  pinMode(13, OUTPUT); digitalWrite(13, LOW);
  startedAt=millis();
}

void loop() {
  const uint32_t now=uint32_t(millis()-startedAt); (void)now;
  #line 1 "eb_n1"
  // Clock
  v1 = (now % 1000UL) < 500UL;
  #line 1 "eb_n2"
  // Digital output
  v2 = v1; digitalWrite(13, v2 ? HIGH : LOW);
}
