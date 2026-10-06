// ELECTRONBENCH 1.3.1-rc.1 | ESP32 DevKitC · WROOM-32
// FQBN: esp32:esp32:esp32 | schema 2
// Canvas connections carry program signals; see the project pin map.
#include <Arduino.h>
#include <math.h>
#include <Adafruit_BME280.h>
#include <Wire.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <freertos/queue.h>
#include <WiFi.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "electronbench_secrets.h"
#include <PubSubClient.h>

uint32_t startedAt;

// Networking is isolated from graph evaluation in a FreeRTOS worker.
static portMUX_TYPE ebNetMux=portMUX_INITIALIZER_UNLOCKED;
static float ebNetInput[4],ebNetOutput[4];
static uint32_t ebNetUpdated[4];
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

WiFiClient ebMqttTransport; PubSubClient ebMqttClient(ebMqttTransport);
static uint32_t ebReceived1=0; static bool ebSeen1=false;
static void ebReceive(char *topic,byte *payload,unsigned int length){(void)topic;(void)payload;(void)length;
if(strcmp(topic,"electronbench/command")==0){ebNetOutputSet(1,ebParseNumber(reinterpret_cast<const char*>(payload),length));ebReceived1=millis();ebSeen1=true;}
}
static void ebNetworkTask(void*){WiFi.persistent(false);WiFi.mode(WIFI_STA);WiFi.setAutoReconnect(true);WiFi.begin("YOUR_WIFI_SSID",EB_WIFI_PASSWORD);
ebMqttTransport.setConnectionTimeout(2000);ebMqttClient.setServer("192.168.1.10",1883);ebMqttClient.setCallback(ebReceive);ebMqttClient.setSocketTimeout(2);ebMqttClient.setKeepAlive(60);bool mqttBuffer=ebMqttClient.setBufferSize(512);uint64_t mac=ESP.getEfuseMac();char clientId[64];snprintf(clientId,sizeof(clientId),"%s-%08lx%08lx","electronbench",static_cast<unsigned long>(mac>>32),static_cast<unsigned long>(mac));uint32_t mqttAttempt=0;bool mqttFirst=true;int oldMqttState=-999;
uint32_t wifiAttempt=millis();int oldWifi=-1;
uint32_t at0=0;bool first0=true;
for(;;){uint32_t now=millis();bool wifi=WiFi.status()==WL_CONNECTED;bool clockReady=true;if(int(wifi)!=oldWifi){oldWifi=wifi;ebLog(wifi?"NET Wi-Fi connected":"NET Wi-Fi disconnected");}if(!wifi&&uint32_t(now-wifiAttempt)>=10000UL){wifiAttempt=now;WiFi.reconnect();}
if(!wifi&&ebMqttClient.connected())ebMqttClient.disconnect();if(wifi&&true&&mqttBuffer&&!ebMqttClient.connected()&&(mqttFirst||uint32_t(now-mqttAttempt)>=10000UL)){mqttFirst=false;mqttAttempt=now;bool connected=strlen(EB_MQTT_USERNAME)?ebMqttClient.connect(clientId,EB_MQTT_USERNAME,EB_MQTT_PASSWORD):ebMqttClient.connect(clientId);if(connected){bool subscribed=true;subscribed=ebMqttClient.subscribe("electronbench/command",0)&&subscribed;if(!subscribed)ebMqttClient.disconnect();}}ebMqttClient.loop();bool mqttUp=wifi&&ebMqttClient.connected();if(ebMqttClient.state()!=oldMqttState){oldMqttState=ebMqttClient.state();ebLogValue("NET MQTT state",oldMqttState);}ebNetFlags(wifi,mqttUp);
if(!mqttUp||!ebSeen1||uint32_t(millis()-ebReceived1)>=10000UL)ebNetOutputSet(1,NAN);
if(!mqttUp)ebNetOutputSet(0,0);if(first0||uint32_t(millis()-at0)>=1000UL){first0=false;at0=millis();float value=ebNetValue(0);bool sent=false;if(mqttUp&&isfinite(value)){char payload[48];snprintf(payload,sizeof(payload),"%.9g",double(value));sent=ebMqttClient.publish("electronbench/temperature",payload,false);}ebNetOutputSet(0,sent?1:0);}
(void)clockReady;vTaskDelay(pdMS_TO_TICKS(20));}}

uint32_t lastReport = 0;
float v1 = NAN;
uint32_t sampleAt1=0; bool sampleFirst1=true, ready1=false;
Adafruit_BME280 sensor1;
float v2 = 0;
float v3 = NAN;
float v4 = 0;
float v5 = NAN;
float v6 = NAN;
float v7 = 0;

void setup() {
  Wire.begin(21, 22);
  Wire.setClock(100000UL);
  ready1=sensor1.begin(118);
  ledcAttach(25, 1000, 8); ledcWrite(25, 0);
  Serial.begin(115200);
  ebNetLogQueue=xQueueCreate(8,96);for(int i=0;i<4;i++){ebNetInput[i]=NAN;ebNetOutput[i]=NAN;} if(xTaskCreate(ebNetworkTask,"eb-network",12288,nullptr,1,nullptr)!=pdPASS) Serial.println("NET worker allocation failed");
  startedAt=millis();
}

void loop() {
  const uint32_t now=uint32_t(millis()-startedAt); (void)now;
  ebPrintNetworkLog();
  #line 1 "eb_n1"
  // BME280 environment
  if(sampleFirst1||uint32_t(now-sampleAt1)>=1000UL) { sampleFirst1=false; sampleAt1=now; Wire.beginTransmission(118); bool available=Wire.endTransmission()==0; v1=ready1&&available?sensor1.readTemperature():NAN;  }
  #line 1 "eb_n3"
  // MQTT number input
  v3=ebNetFreshRead(1,10000UL);
  #line 1 "eb_n5"
  // Network connected
  v5=ebNetConnected(false);
  #line 1 "eb_n6"
  // Network connected
  v6=ebNetConnected(true);
  #line 1 "eb_n2"
  // MQTT number output
  ebNetInputSet(0,v1); v2=ebNetRead(0);
  #line 1 "eb_n4"
  // PWM output
  v4 = isfinite(v3) ? int(constrain(v3, 0.0f, 255.0f) + 0.5f) : 0;
  ledcWrite(25, uint32_t(v4));
  #line 1 "eb_n7"
  // Serial value
  v7 = v3;
  #line 1 "electronbench_project.ino"
  if(uint32_t(now-lastReport)>=100UL) { lastReport=now; Serial.print(F("{\"ms\":")); Serial.print(now);
  Serial.print(F(",\"n1\":")); if(isfinite(float(v1))) Serial.print(float(v1)); else Serial.print(F("null"));
  Serial.print(F(",\"n2\":")); if(isfinite(float(v2))) Serial.print(float(v2)); else Serial.print(F("null"));
  Serial.print(F(",\"n3\":")); if(isfinite(float(v3))) Serial.print(float(v3)); else Serial.print(F("null"));
  Serial.print(F(",\"n4\":")); if(isfinite(float(v4))) Serial.print(float(v4)); else Serial.print(F("null"));
  Serial.print(F(",\"n5\":")); if(isfinite(float(v5))) Serial.print(float(v5)); else Serial.print(F("null"));
  Serial.print(F(",\"n6\":")); if(isfinite(float(v6))) Serial.print(float(v6)); else Serial.print(F("null"));
  Serial.print(F(",\"n7\":")); if(isfinite(float(v7))) Serial.print(float(v7)); else Serial.print(F("null"));
  Serial.println(F("}")); }
}
