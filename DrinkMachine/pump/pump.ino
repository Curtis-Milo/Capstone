#include "drink.h"
#include "sensors.h"
#include "time.h"
Drink drinkSt;
void setup() {
  Serial.begin(9600);
  Serial1.begin(9600);
  Serial2.begin(9600);
  initDrink(&drinkSt);

}

void loop() {
  //processDrinkRequest();
  Serial2.write("d1d0d2x");
  getTableData(&drinkSt);

  delay(1000.0);
}
