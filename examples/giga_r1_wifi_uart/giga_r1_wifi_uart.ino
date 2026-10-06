// ELECTRONBENCH 1.4.0-rc.1 | Arduino GIGA R1 WiFi · M7
// FQBN: arduino:mbed_giga:giga:target_core=cm7,split=100_0 | schema 2
// Canvas connections carry program signals; see the project pin map.
#include <Arduino.h>
#include <math.h>
#include <stdlib.h>

uint32_t startedAt;
uint32_t lastReport = 0;
float v1 = NAN;
char uartBuffer1[32]; uint8_t uartLength1=0; bool uartOverflow1=false;
float v2 = 0;
float v3 = NAN;
char uartBuffer3[32]; uint8_t uartLength3=0; bool uartOverflow3=false;
float v4 = 0;
float v5 = NAN;
char uartBuffer5[32]; uint8_t uartLength5=0; bool uartOverflow5=false;
float v6 = 0;
float v7 = NAN;
char uartBuffer7[32]; uint8_t uartLength7=0; bool uartOverflow7=false;
float v8 = 0;

void setup() {
  Serial1.begin(9600);
  Serial2.begin(9600);
  Serial3.begin(9600);
  Serial4.begin(9600);
  Serial.begin(115200);
  startedAt=millis();
}

void loop() {
  const uint32_t now=uint32_t(millis()-startedAt); (void)now;
  #line 1 "eb_n1"
  // UART number input
  for(uint8_t budget=0;budget<32&&Serial1.available();budget++) { char c=char(Serial1.read()); if(c=='\n') { uartBuffer1[uartLength1]=0; char *end; float value=float(strtod(uartBuffer1,&end)); v1=!uartOverflow1&&uartLength1&&*end==0&&isfinite(value)?value:NAN; uartLength1=0; uartOverflow1=false; } else if(c!='\r') { if(uartLength1<31) uartBuffer1[uartLength1++]=c; else uartOverflow1=true; } }
  #line 1 "eb_n3"
  // UART number input
  for(uint8_t budget=0;budget<32&&Serial2.available();budget++) { char c=char(Serial2.read()); if(c=='\n') { uartBuffer3[uartLength3]=0; char *end; float value=float(strtod(uartBuffer3,&end)); v3=!uartOverflow3&&uartLength3&&*end==0&&isfinite(value)?value:NAN; uartLength3=0; uartOverflow3=false; } else if(c!='\r') { if(uartLength3<31) uartBuffer3[uartLength3++]=c; else uartOverflow3=true; } }
  #line 1 "eb_n5"
  // UART number input
  for(uint8_t budget=0;budget<32&&Serial3.available();budget++) { char c=char(Serial3.read()); if(c=='\n') { uartBuffer5[uartLength5]=0; char *end; float value=float(strtod(uartBuffer5,&end)); v5=!uartOverflow5&&uartLength5&&*end==0&&isfinite(value)?value:NAN; uartLength5=0; uartOverflow5=false; } else if(c!='\r') { if(uartLength5<31) uartBuffer5[uartLength5++]=c; else uartOverflow5=true; } }
  #line 1 "eb_n7"
  // UART number input
  for(uint8_t budget=0;budget<32&&Serial4.available();budget++) { char c=char(Serial4.read()); if(c=='\n') { uartBuffer7[uartLength7]=0; char *end; float value=float(strtod(uartBuffer7,&end)); v7=!uartOverflow7&&uartLength7&&*end==0&&isfinite(value)?value:NAN; uartLength7=0; uartOverflow7=false; } else if(c!='\r') { if(uartLength7<31) uartBuffer7[uartLength7++]=c; else uartOverflow7=true; } }
  #line 1 "eb_n2"
  // Serial value
  v2 = v1;
  #line 1 "eb_n4"
  // Serial value
  v4 = v3;
  #line 1 "eb_n6"
  // Serial value
  v6 = v5;
  #line 1 "eb_n8"
  // Serial value
  v8 = v7;
  #line 1 "electronbench_project.ino"
  if(uint32_t(now-lastReport)>=100UL) { lastReport=now; Serial.print(F("{\"ms\":")); Serial.print(now);
  Serial.print(F(",\"n2\":")); if(isfinite(float(v2))) Serial.print(float(v2)); else Serial.print(F("null"));
  Serial.print(F(",\"n4\":")); if(isfinite(float(v4))) Serial.print(float(v4)); else Serial.print(F("null"));
  Serial.print(F(",\"n6\":")); if(isfinite(float(v6))) Serial.print(float(v6)); else Serial.print(F("null"));
  Serial.print(F(",\"n8\":")); if(isfinite(float(v8))) Serial.print(float(v8)); else Serial.print(F("null"));
  Serial.println(F("}")); }
}
