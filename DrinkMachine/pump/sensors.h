#ifndef _SENSORS_H_
#define _SENSORS_H_

float getTempature(int pin);
float getWeight(int pin);


typedef struct{
  float maxTemp;
  int pinA;
  int pinB;
}TempCals;

typedef struct{
  float minWeight;
  int pinA;
  int pinB;
}WeightCals;

#endif