// ELECTRONBENCH 1.4.0-rc.1 | Arduino Uno R3
// FQBN: arduino:avr:uno | schema 2
// Canvas connections carry program signals; see the project pin map.
#include <Arduino.h>
#include <math.h>
#include <Wire.h>
#include <Adafruit_MCP9808.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

uint32_t startedAt;
uint32_t lastReport = 0;
float v1 = NAN;
uint32_t sampleAt1=0; bool sampleFirst1=true, ready1=false;
Adafruit_MCP9808 sensor1;
float v2 = 0;
uint32_t sampleAt2=0; bool sampleFirst2=true, ready2=false;
Adafruit_SSD1306 display2(128,32,&Wire,-1);

void setup() {
  Wire.begin();
  Wire.setClock(100000UL);
  #ifdef WIRE_HAS_TIMEOUT
  Wire.setWireTimeout(25000, true);
  #endif
  ready1=sensor1.begin(24);
  ready2=display2.begin(SSD1306_SWITCHCAPVCC,60);
  if(ready2) { display2.clearDisplay(); display2.setTextSize(1); display2.setTextColor(SSD1306_WHITE); display2.display(); }
  Serial.begin(115200);
  startedAt=millis();
}

void loop() {
  const uint32_t now=uint32_t(millis()-startedAt); (void)now;
  #line 1 "eb_n1"
  // MCP9808 temperature
  if(sampleFirst1||uint32_t(now-sampleAt1)>=250UL) { sampleFirst1=false; sampleAt1=now; v1=ready1?sensor1.readTempC():NAN; }
  #line 1 "eb_n2"
  // OLED numeric display
  v2=v1;
  if(ready2&&(sampleFirst2||uint32_t(now-sampleAt2)>=200UL)) { sampleFirst2=false; sampleAt2=now; display2.clearDisplay(); display2.setCursor(0,0); display2.println(F("Reading")); if(isfinite(v2)) display2.println(v2); else display2.println(F("ERR")); display2.display(); }
  #line 1 "electronbench_project.ino"
  if(uint32_t(now-lastReport)>=100UL) { lastReport=now; Serial.print(F("{\"ms\":")); Serial.print(now);
  Serial.print(F(",\"n1\":")); if(isfinite(float(v1))) Serial.print(float(v1)); else Serial.print(F("null"));
  Serial.print(F(",\"n2\":")); if(isfinite(float(v2))) Serial.print(float(v2)); else Serial.print(F("null"));
  Serial.println(F("}")); }
}
