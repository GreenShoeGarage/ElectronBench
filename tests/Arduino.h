// Host-only Arduino API test double. Not a board emulator or toolchain.
#pragma once
#include <cstdint>
#include <algorithm>
#include <string>
using std::uint32_t;
using std::min; using std::max;
constexpr int HIGH=1, LOW=0, INPUT_PULLUP=2, OUTPUT=1;
constexpr int A0=14,A1=15,A2=16,A3=17,A4=18,A5=19;
inline uint32_t testMillis=0;
inline int digitalInputs[20]={1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1};
inline int analogInputs[20]={};
inline int digitalOutputs[20]={}, pwmOutputs[20]={}, servoOutputs[20]={};
inline uint32_t millis(){return testMillis;}
inline void pinMode(int,int){}
inline int digitalRead(int p){return digitalInputs[p];}
inline int analogRead(int p){return analogInputs[p];}
inline void digitalWrite(int p,int v){digitalOutputs[p]=v;}
inline void analogWrite(int p,int v){pwmOutputs[p]=v;}
template<class T> T constrain(T x,T lo,T hi){return std::max(lo,std::min(hi,x));}
#define F(x) x
struct SerialMock {std::string incoming; void begin(int){} template<class T>void print(T){} template<class T>void println(T){} int available(){return incoming.size();} int read(){char c=incoming.front();incoming.erase(0,1);return c;}};
inline SerialMock Serial, Serial1, Serial2, Serial3;
