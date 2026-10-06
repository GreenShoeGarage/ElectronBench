// ELECTRONBENCH 1.3.1-rc.1 | Arduino Uno R3
// FQBN: arduino:avr:uno | schema 2
// Canvas connections carry program signals; see the project pin map.
#include <Arduino.h>
#include <math.h>

uint32_t startedAt;
uint32_t lastReport = 0;
uint32_t lastTick = 0; bool firstTick = true;
float v1 = 0.0f;
float memory1 = 0.0f;
float v2 = 0;
float v3 = 0;
float v4 = 0;

void setup() {
  Serial.begin(115200);
  startedAt=millis();
}

void loop() {
  const uint32_t now=uint32_t(millis()-startedAt); (void)now;
  if(!firstTick && uint32_t(now-lastTick)<10UL) { return; } firstTick=false; lastTick=now;
  v1=memory1;
  #line 1 "eb_n1"
  // Sample delay
  #line 1 "eb_n2"
  // Constant
  v2 = 1.0f;
  #line 1 "eb_n4"
  // Serial value
  v4 = v1;
  #line 1 "eb_n3"
  // Arithmetic
  v3=isfinite(v1)&&isfinite(v2) ? (v1+v2) : NAN;
  #line 1 "electronbench_project.ino"
  if(uint32_t(now-lastReport)>=100UL) { lastReport=now; Serial.print(F("{\"ms\":")); Serial.print(now);
  Serial.print(F(",\"n4\":")); if(isfinite(float(v4))) Serial.print(float(v4)); else Serial.print(F("null"));
  Serial.println(F("}")); }
  memory1=v3;
}
