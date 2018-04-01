#ifndef _DRINKS_H_
#define _DRINKS_H_

#define DRINK_BUFF 20
typedef enum{
  Waiting_For_Button = 0,
	Getting_Table = 1,
	Pouring_On = 2,
	Pouring_Off = 3,
	Drink_Done = 4,
	Table_Done = 5
} DrinkState;


typedef enum {
  Water=0,
  Coke=1,
  Diet_Coke=2
}DrinkTypes;


typedef enum {
  NoErrors = 0x0000,
  EmptyTank = 0x0001,
  TankLeak = 0x00010,
  Timeout = 0x00100,
  DrinkOverTemp = 0x01000
}DrinkErrors;

typedef struct{
	float onTime_sec;
	float offTime_sec;
	float totalFillTime_sec;
	int pin;
}DrinkCals;





typedef struct{
	//public
	DrinkState state;
	DrinkErrors errors;
}Drink;


//drinks stuff
typedef struct
{
  DrinkTypes drinksList[DRINK_BUFF];
  int totalDrinks;
  int currentDrink;
  bool drinkFilled;
  float currentOnTime;
} Table_Info;
void initDrink(Drink * pDrink);
void processDrinkRequest(Drink * pDrink);
void resetDrink(Drink * pDrink);
void getTableData(Drink * pDrink);
#endif
