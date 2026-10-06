#pragma once
#include "Arduino.h"
struct Servo {int pin=0;void attach(int p){pin=p;}void write(int value){servoOutputs[pin]=value;}};
