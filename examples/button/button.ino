// ELECTRONBENCH 1.4.0-rc.1 | Arduino Uno R3
// FQBN: arduino:avr:uno | schema 2
// Canvas connections carry program signals; see the project pin map.
#include <Arduino.h>
#include <math.h>

uint32_t startedAt;
bool v1 = 0;
bool v2 = 0;
bool raw2=false, stable2=false, prev2=false, active2=false; uint32_t since2=0;
bool v3 = 0;
bool raw3=false, stable3=false, prev3=false, active3=false; uint32_t since3=0;
bool v4 = 0;

void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT); digitalWrite(13, LOW);
  startedAt=millis();
}

void loop() {
  const uint32_t now=uint32_t(millis()-startedAt); (void)now;
  #line 1 "eb_n1"
  // Button
  v1 = digitalRead(2) == LOW;
  #line 1 "eb_n2"
  // Debounce
  if (v1 != raw2) { raw2 = v1; since2 = now; }
  if (uint32_t(now - since2) >= 35UL) stable2 = raw2;
  v2 = stable2;
  #line 1 "eb_n3"
  // Timed pulse
  if (v2 && !prev3) { since3 = now; active3 = true; }
  prev3 = v2;
  if (active3 && uint32_t(now - since3) >= 1500UL) active3 = false;
  v3 = active3;
  #line 1 "eb_n4"
  // Digital output
  v4 = v3; digitalWrite(13, v4 ? HIGH : LOW);
}
