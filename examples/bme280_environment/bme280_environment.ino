// ELECTRONBENCH 1.4.0-rc.1 | Arduino Uno R3
// FQBN: arduino:avr:uno | schema 2
// Canvas connections carry program signals; see the project pin map.
#include <Arduino.h>
#include <math.h>
#include <Adafruit_BME280.h>
#include <Wire.h>

uint32_t startedAt;
uint32_t lastReport = 0;
float v1 = NAN;
uint32_t sampleAt1=0; bool sampleFirst1=true, ready1=false;
Adafruit_BME280 sensor1;
float v2 = 0;
float v3 = NAN;
uint32_t sampleAt3=0; bool sampleFirst3=true, ready3=false;
float v4 = 0;
float v5 = NAN;
uint32_t sampleAt5=0; bool sampleFirst5=true, ready5=false;
float v6 = 0;

void setup() {
  Wire.begin();
  Wire.setClock(100000UL);
  #ifdef WIRE_HAS_TIMEOUT
  Wire.setWireTimeout(25000, true);
  #endif
  ready1=sensor1.begin(118);
  Serial.begin(115200);
  startedAt=millis();
}

void loop() {
  const uint32_t now=uint32_t(millis()-startedAt); (void)now;
  #line 1 "eb_n1"
  // BME280 environment
  if(sampleFirst1||uint32_t(now-sampleAt1)>=1000UL) { sampleFirst1=false; sampleAt1=now; Wire.beginTransmission(118); bool available=Wire.endTransmission()==0; v1=ready1&&available?sensor1.readTemperature():NAN;  }
  #line 1 "eb_n3"
  // BME280 environment
  if(sampleFirst3||uint32_t(now-sampleAt3)>=1000UL) { sampleFirst3=false; sampleAt3=now; Wire.beginTransmission(118); bool available=Wire.endTransmission()==0; v3=ready1&&available?sensor1.readHumidity():NAN;  }
  #line 1 "eb_n5"
  // BME280 environment
  if(sampleFirst5||uint32_t(now-sampleAt5)>=1000UL) { sampleFirst5=false; sampleAt5=now; Wire.beginTransmission(118); bool available=Wire.endTransmission()==0; v5=ready1&&available?sensor1.readPressure()/100.0f:NAN;  }
  #line 1 "eb_n2"
  // Serial value
  v2 = v1;
  #line 1 "eb_n4"
  // Serial value
  v4 = v3;
  #line 1 "eb_n6"
  // Serial value
  v6 = v5;
  #line 1 "electronbench_project.ino"
  if(uint32_t(now-lastReport)>=100UL) { lastReport=now; Serial.print(F("{\"ms\":")); Serial.print(now);
  Serial.print(F(",\"n1\":")); if(isfinite(float(v1))) Serial.print(float(v1)); else Serial.print(F("null"));
  Serial.print(F(",\"n2\":")); if(isfinite(float(v2))) Serial.print(float(v2)); else Serial.print(F("null"));
  Serial.print(F(",\"n3\":")); if(isfinite(float(v3))) Serial.print(float(v3)); else Serial.print(F("null"));
  Serial.print(F(",\"n4\":")); if(isfinite(float(v4))) Serial.print(float(v4)); else Serial.print(F("null"));
  Serial.print(F(",\"n5\":")); if(isfinite(float(v5))) Serial.print(float(v5)); else Serial.print(F("null"));
  Serial.print(F(",\"n6\":")); if(isfinite(float(v6))) Serial.print(float(v6)); else Serial.print(F("null"));
  Serial.println(F("}")); }
}
