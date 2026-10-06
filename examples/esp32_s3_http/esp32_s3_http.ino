// ELECTRONBENCH 1.4.0-rc.1 | ESP32-S3 DevKitC-1 · N8/N8R8
// FQBN: esp32:esp32:esp32s3:FlashSize=8M,PSRAM=disabled,CDCOnBoot=default | schema 2
// Canvas connections carry program signals; see the project pin map.
#include <Arduino.h>
#include <math.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <freertos/queue.h>
#include <WiFi.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "electronbench_secrets.h"
#include <HTTPClient.h>

uint32_t startedAt;

// Networking is isolated from graph evaluation in a FreeRTOS worker.
static portMUX_TYPE ebNetMux=portMUX_INITIALIZER_UNLOCKED;
static float ebNetInput[3],ebNetOutput[3];
static uint32_t ebNetUpdated[3];
static QueueHandle_t ebNetLogQueue=nullptr;
static void ebLog(const char *text){if(!ebNetLogQueue)return;char line[96];snprintf(line,sizeof(line),"%s",text);xQueueSend(ebNetLogQueue,line,0);}
static void ebLogValue(const char *label,int value){char line[96];snprintf(line,sizeof(line),"%s %d",label,value);ebLog(line);}
static void ebPrintNetworkLog(){if(!ebNetLogQueue)return;char line[96];while(xQueueReceive(ebNetLogQueue,line,0)==pdTRUE)Serial.println(line);}
static float ebNetFreshRead(int i,uint32_t age){portENTER_CRITICAL(&ebNetMux);float v=ebNetOutput[i];uint32_t at=ebNetUpdated[i];portEXIT_CRITICAL(&ebNetMux);return uint32_t(millis()-at)>=age?NAN:v;}

static bool ebWifi=false,ebMqtt=false;
static float ebNetRead(int i){portENTER_CRITICAL(&ebNetMux);float v=ebNetOutput[i];portEXIT_CRITICAL(&ebNetMux);return v;}
static float ebNetValue(int i){portENTER_CRITICAL(&ebNetMux);float v=ebNetInput[i];portEXIT_CRITICAL(&ebNetMux);return v;}
static void ebNetInputSet(int i,float v){portENTER_CRITICAL(&ebNetMux);ebNetInput[i]=v;portEXIT_CRITICAL(&ebNetMux);}
static void ebNetOutputSet(int i,float v){portENTER_CRITICAL(&ebNetMux);ebNetOutput[i]=v;ebNetUpdated[i]=millis();portEXIT_CRITICAL(&ebNetMux);}
static void ebNetFlags(bool wifi,bool mqtt){portENTER_CRITICAL(&ebNetMux);ebWifi=wifi;ebMqtt=mqtt;portEXIT_CRITICAL(&ebNetMux);}
static float ebNetConnected(bool mqtt){portENTER_CRITICAL(&ebNetMux);bool result=mqtt?ebMqtt:ebWifi;portEXIT_CRITICAL(&ebNetMux);return result?1.0f:0.0f;}
static float ebParseNumber(const char *data,size_t len){if(!len||len>64||memchr(data,0,len))return NAN;char text[65];memcpy(text,data,len);text[len]=0;char *end;float v=float(strtod(text,&end));if(end==text)return NAN;while(*end&&isspace(static_cast<unsigned char>(*end)))end++;return *end||!isfinite(v)?NAN:v;}


class EBResponse:public Stream{public:char data[65]={};size_t length=0;bool overflow=false;int available()override{return 0;}int read()override{return -1;}int peek()override{return -1;}void flush()override{}size_t write(uint8_t v)override{return write(&v,1);}size_t write(const uint8_t *v,size_t size)override{if(length+size>64){overflow=true;return 0;}memcpy(data+length,v,size);length+=size;data[length]=0;return size;}};
static float ebHttp(const char *url,bool post,float input,bool statusOnly,int &code){
 if(WiFi.status()!=WL_CONNECTED){code=-1000;return statusOnly?float(code):NAN;}
 if(post&&!isfinite(input)){code=-1001;return float(code);}
 WiFiClient plain;
 NetworkClient *client=&plain;
 client->setConnectionTimeout(2000);HTTPClient request;request.setConnectTimeout(2000);request.setTimeout(2000);request.setFollowRedirects(HTTPC_DISABLE_FOLLOW_REDIRECTS);request.useHTTP10(true);
 if(!request.begin(*client,String(url))){code=-1003;return statusOnly?float(code):NAN;}
 if(strncmp(url,"https:",6)==0&&strlen(EB_HTTP_BEARER))request.addHeader("Authorization",String("Bearer ")+EB_HTTP_BEARER);
 if(post){request.addHeader("Content-Type","text/plain");code=request.POST(String(input,6));}else code=request.GET();
 float result=NAN;if(statusOnly)result=float(code);else if(code>=200&&code<300){EBResponse response;if(request.getSize()>64)code=-1002;else if(request.writeToStream(&response)>=0&&!response.overflow){result=ebParseNumber(response.data,response.length);if(!isfinite(result))code=-1001;}else code=-1002;}
 request.end();return result;
}
static void ebNetworkTask(void*){WiFi.persistent(false);WiFi.mode(WIFI_STA);WiFi.setAutoReconnect(true);WiFi.begin("YOUR_WIFI_SSID",EB_WIFI_PASSWORD);
uint32_t wifiAttempt=millis();int oldWifi=-1;
uint32_t at0=0;bool first0=true;int oldHttp0=-999;
uint32_t at1=0;bool first1=true;int oldHttp1=-999;
for(;;){uint32_t now=millis();bool wifi=WiFi.status()==WL_CONNECTED;bool clockReady=true;if(int(wifi)!=oldWifi){oldWifi=wifi;ebLog(wifi?"NET Wi-Fi connected":"NET Wi-Fi disconnected");}if(!wifi&&uint32_t(now-wifiAttempt)>=10000UL){wifiAttempt=now;WiFi.reconnect();}
ebNetFlags(wifi,false);
if(first0||uint32_t(millis()-at0)>=5000UL){first0=false;at0=millis();int code;float value;if(!clockReady&&false){code=-1004;value=float(code);}else value=ebHttp("http://192.168.1.10/value",true,ebNetValue(0),true,code);ebNetOutputSet(0,value);if(code!=oldHttp0){oldHttp0=code;ebLogValue("NET HTTP n2 status",code);}}
if(first1||uint32_t(millis()-at1)>=5000UL){first1=false;at1=millis();int code;float value;if(!clockReady&&false){code=-1004;value=NAN;}else value=ebHttp("http://192.168.1.10/value",false,0,false,code);ebNetOutputSet(1,value);if(code!=oldHttp1){oldHttp1=code;ebLogValue("NET HTTP n3 status",code);}}
(void)clockReady;vTaskDelay(pdMS_TO_TICKS(20));}}

uint32_t lastReport = 0;
float v1 = 0;
float v2 = 0;
float v3 = NAN;
float v4 = 0;
float v5 = NAN;

void setup() {
  Serial.begin(115200);
  ebNetLogQueue=xQueueCreate(8,96);for(int i=0;i<3;i++){ebNetInput[i]=NAN;ebNetOutput[i]=NAN;} if(xTaskCreate(ebNetworkTask,"eb-network",12288,nullptr,1,nullptr)!=pdPASS) Serial.println("NET worker allocation failed");
  startedAt=millis();
}

void loop() {
  const uint32_t now=uint32_t(millis()-startedAt); (void)now;
  ebPrintNetworkLog();
  #line 1 "eb_n1"
  // Constant
  v1 = 22.5f;
  #line 1 "eb_n3"
  // HTTP GET number
  v3=ebNetRead(1);
  #line 1 "eb_n5"
  // Network connected
  v5=ebNetConnected(false);
  #line 1 "eb_n2"
  // HTTP POST number
  ebNetInputSet(0,v1); v2=ebNetRead(0);
  #line 1 "eb_n4"
  // Serial value
  v4 = v3;
  #line 1 "electronbench_project.ino"
  if(uint32_t(now-lastReport)>=100UL) { lastReport=now; Serial.print(F("{\"ms\":")); Serial.print(now);
  Serial.print(F(",\"n1\":")); if(isfinite(float(v1))) Serial.print(float(v1)); else Serial.print(F("null"));
  Serial.print(F(",\"n2\":")); if(isfinite(float(v2))) Serial.print(float(v2)); else Serial.print(F("null"));
  Serial.print(F(",\"n3\":")); if(isfinite(float(v3))) Serial.print(float(v3)); else Serial.print(F("null"));
  Serial.print(F(",\"n4\":")); if(isfinite(float(v4))) Serial.print(float(v4)); else Serial.print(F("null"));
  Serial.print(F(",\"n5\":")); if(isfinite(float(v5))) Serial.print(float(v5)); else Serial.print(F("null"));
  Serial.println(F("}")); }
}
