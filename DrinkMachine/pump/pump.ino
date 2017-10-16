#include "drink.h"
Drink drinkSt;
void setup() {
  Serial.begin(9600);
  initDrink(&drinkSt);

}

void loop() {
  processDrinkRequest(&drinkSt);
}
