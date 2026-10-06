// ELECTRONBENCH 1.3.1-rc.1 | Arduino Mega 2560
// FQBN: arduino:avr:mega:cpu=atmega2560 | schema 2
// Canvas connections carry program signals; see the project pin map.
#include <Arduino.h>
#include <math.h>
#include <stdlib.h>

uint32_t startedAt;
uint32_t lastReport = 0;
float v1 = NAN;
char uartBuffer1[32]; uint8_t uartLength1=0; bool uartOverflow1=false;
float v2 = 0;

void setup() {
  Serial1.begin(9600);
  Serial.begin(115200);
  startedAt=millis();
}

void loop() {
  const uint32_t now=uint32_t(millis()-startedAt); (void)now;
  #line 1 "eb_n1"
  // UART number input
  for(uint8_t budget=0;budget<32&&Serial1.available();budget++) { char c=char(Serial1.read()); if(c=='\n') { uartBuffer1[uartLength1]=0; char *end; float value=float(strtod(uartBuffer1,&end)); v1=!uartOverflow1&&uartLength1&&*end==0&&isfinite(value)?value:NAN; uartLength1=0; uartOverflow1=false; } else if(c!='\r') { if(uartLength1<31) uartBuffer1[uartLength1++]=c; else uartOverflow1=true; } }
  #line 1 "eb_n2"
  // Serial value
  v2 = v1;
  #line 1 "electronbench_project.ino"
  if(uint32_t(now-lastReport)>=100UL) { lastReport=now; Serial.print(F("{\"ms\":")); Serial.print(now);
  Serial.print(F(",\"n2\":")); if(isfinite(float(v2))) Serial.print(float(v2)); else Serial.print(F("null"));
  Serial.println(F("}")); }
}
