// ELECTRONBENCH 1.3.1-rc.1 | Arduino Uno R3
// FQBN: arduino:avr:uno | schema 2
// Canvas connections carry program signals; see the project pin map.
#include <Arduino.h>
#include <math.h>
#include <Servo.h>

uint32_t startedAt;
float v1 = 0;
float v2 = 0;
float v3 = 90.0f;
Servo servo3;

void setup() {
  servo3.attach(9);
  startedAt=millis();
}

void loop() {
  const uint32_t now=uint32_t(millis()-startedAt); (void)now;
  #line 1 "eb_n1"
  // Analog input
  v1 = analogRead(A0);
  #line 1 "eb_n2"
  // Map range
  v2 = 0.0f + (v1 - 0.0f) * (180.0f - 0.0f) / (1023.0f - 0.0f);
  v2 = constrain(v2, 0.0f, 180.0f);
  #line 1 "eb_n3"
  // Servo
  if(isfinite(v2)) v3 = int(constrain(v2, 0.0f, 180.0f) + 0.5f);
  servo3.write(int(v3));
}
