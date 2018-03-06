#ifndef _DRINKS_H_
#define _DRINKS_H_

#define DRINK_BUFF 20
typedef enum{
	Getting_Table = 0,
	Pouring_On = 1,
	Pouring_Off = 2,
	Drink_Done = 3,
	Table_Done = 4
} DrinkState;


typedef enum {
  Water=0,
  Coke=1,
  Diet_Coke=2
}DrinkTypes;


typedef enum {
  NoErrors = 0x0000,
  NoResponseServer = 0x0001,
  EmptyTank = 0x0010,
  DrinkOverTemp = 0x0100
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
