#include "drink.h"
#include "Arduino.h"
#include "time.h"

#define MOSFET_ON 1
#define MOSFET_OFF 0
#define DRINK_BUFF 20
//Internal Struct
typedef struct
{
  DrinkTypes drinksList[DRINK_BUFF];
  int totalDrinks;
  int currentDrink;
  bool drinkFilled;
  float currentOnTime;
} Drink_Private;

//static Calibrations
static DrinkCals WATER_CALS;
static DrinkCals COKE_CALS;
static DrinkCals DIET_COKE_CALS;

//static variables for internal use
Drink_Private tableStat;

static bool isDrinkTaken() {
  return true;
}

static void getTableData() {
  //HARDCODED
  tableStat.drinksList[0] = Water;
  tableStat.drinksList[1] = Water;
  tableStat.totalDrinks = 1;
}

static DrinkCals * getDrinkCals() {
  if (tableStat.drinksList[tableStat.currentDrink] == Water) {
     //Serial.println("Water");
     return &WATER_CALS;
  } else if (tableStat.drinksList[tableStat.currentDrink] == Coke) {
    //Serial.println("Coke");
     return &COKE_CALS;
  } else {
     //Serial.println("Diet");
     return &DIET_COKE_CALS;
  }
}
static void determineState(Drink * pDrink) {
  switch (pDrink->state) {
    case Getting_Table:
      //Serial.print("Getting Table\n");
      if (tableStat.totalDrinks != 0) {
        //reset parameters and begin to poor the first drink
        tableStat.currentDrink = 0;
        tableStat.drinkFilled = false;
        tableStat.currentOnTime = 0.0f;
        pDrink->state = Pouring_On;
      }
      break;
    case Pouring_On:
      pDrink->state = Pouring_Off;
      break;

    case Pouring_Off:
      if (tableStat.drinkFilled) {
        pDrink->state = Drink_Done;
      } else if (!pDrink->errors) {
        pDrink->state = Pouring_On;
      }
      break;
    case Drink_Done:
      if (tableStat.currentDrink >= tableStat.totalDrinks) {
        pDrink->state = Table_Done;
      } else if (isDrinkTaken()) {
        //wait 10 seconds for the person to get out of the way
        delay(1000.0*10);
        //reset parameters and move to the next drink
        tableStat.currentOnTime = 0.0f;
        tableStat.currentDrink++;
        tableStat.drinkFilled = false;
        pDrink->state = Pouring_On;
      }
      break;
    case Table_Done:
      pDrink->state = Table_Done;
      break;
  }
}


static void processState(Drink * pDrink) {
  DrinkCals * pDrinkData;
  switch (pDrink->state) {
    case Getting_Table:
      getTableData();
      break;
    case Pouring_On:
      //Setup pointer to the calibrations
      pDrinkData = getDrinkCals();
      //Turn on the pump
      digitalWrite(pDrinkData->pin, MOSFET_ON);
      
      //Serial.println(pDrinkData->pin);
      //sleep while the pump does its thing
      //if the drink on time is -1 then pour to completion, else we need to use on time;
      
      if (pDrinkData->onTime_sec < 0.0f) {
        Serial.println("Pouring On Water\n");
        delay(1000.0*pDrinkData->totalFillTime_sec);
        tableStat.currentOnTime = pDrinkData->totalFillTime_sec;
      } else {
        Serial.print("Pouring On Pop\n");
        delay(1000.0*pDrinkData->onTime_sec);
        tableStat.currentOnTime += pDrinkData->onTime_sec;
      }
      //check for if its complete
      if (pDrinkData->totalFillTime_sec <= tableStat.currentOnTime) {
        tableStat.drinkFilled = true;
        Serial.println("Done");
      }
      break;

    case Pouring_Off:
      Serial.print("Action Pouring Off\n");
      //Setup pointer to the calibrations
      pDrinkData = getDrinkCals();
      //Turn on the pump
      digitalWrite(pDrinkData->pin, MOSFET_OFF);
      //sleep to wait for fizz
      delay(1000.0*pDrinkData->offTime_sec);
      break;
    case Drink_Done:
      Serial.print("Drink Done\n");
      break;
    case Table_Done:

      break;
  }

}

void initDrink(Drink * pDrink) {
  
  //Cals
  WATER_CALS.onTime_sec = -1.0f;
  WATER_CALS.offTime_sec =  0.0f;
  WATER_CALS.totalFillTime_sec = 15.0f;
  WATER_CALS.pin = 7;

  COKE_CALS.onTime_sec = -1.0f;
  COKE_CALS.offTime_sec =  0.0f;
  COKE_CALS.totalFillTime_sec = 15.0f;
  COKE_CALS.pin = 8;

  DIET_COKE_CALS.onTime_sec = -1.0f;
  DIET_COKE_CALS.offTime_sec =  0.0f;
  DIET_COKE_CALS.totalFillTime_sec = 15.0f;
  DIET_COKE_CALS.pin = 9;
  
  pinMode(WATER_CALS.pin, OUTPUT);
  pinMode(COKE_CALS.pin, OUTPUT);
  pinMode(DIET_COKE_CALS.pin, OUTPUT);
  digitalWrite(WATER_CALS.pin, MOSFET_OFF);
  digitalWrite(COKE_CALS.pin, MOSFET_OFF);
  digitalWrite(DIET_COKE_CALS.pin, MOSFET_OFF);
  //Serial.println("Init");
  tableStat.totalDrinks = 0;
  tableStat.currentDrink = 0;
  tableStat.drinkFilled = false;
  tableStat.currentOnTime = 0.0f;
  pDrink->state = Getting_Table;
  pDrink->errors = NoErrors;



}

void processDrinkRequest(Drink * pDrink) {
  determineState(pDrink);
  processState(pDrink);
}

void resetDrink(Drink * pDrink) {
  initDrink(pDrink);
}
