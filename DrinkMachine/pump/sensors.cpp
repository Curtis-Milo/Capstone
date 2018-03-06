#include "sensors.h"
#include "Arduino.h"
//#https://learn.adafruit.com/thermistor/using-a-thermistor
// resistance at 25 degrees C
#define THERMISTORNOMINAL 3500     
// temp. for nominal resistance (almost always 25 C)
#define TEMPERATURENOMINAL 25   
// The beta coefficient of the thermistor (usually 3000-4000)
#define BCOEFFICIENT 3950
// the value of the 'other' resistor
#define SERIESRESISTOR 10000      
float getTempature(int pin)
{
  float voltage=  (analogRead(pin));
  float temp = 0.0f;
  //Serial.print("Analog reading "); 
  //Serial.println(voltage);
  // convert the value to resistance
  voltage = 1023 / voltage - 1;
  voltage = SERIESRESISTOR / voltage;


  //Serial.print("Thermistor resistance "); 
  //Serial.println(voltage);

  
  temp = voltage / THERMISTORNOMINAL;     // (R/Ro)
  temp = log(temp);                  // ln(R/Ro)
  temp /= BCOEFFICIENT;                   // 1/B * ln(R/Ro)
  temp += 1.0 / (TEMPERATURENOMINAL + 273.15); // + (1/To)
  temp = 1.0 / temp;                 // Invert
  temp -= 273.15;                         // convert to C
 
  //Serial.print("Temperature "); 
  //Serial.print(temp);
  //Serial.println(" *C");
  return temp;
 
}



float getWeight(int pin)
{
  //TODO: Actually convert voltage to kg
  return (analogRead(pin)); 
}
