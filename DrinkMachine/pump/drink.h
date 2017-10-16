#ifndef _DRINKS_H_
#define _DRINKS_H_


typedef enum{
	Getting_Table = 0,
	Pouring_On = 1,
	Pouring_Off = 2,
	Drink_Done = 3,
	Table_Done = 4
} DrinkState;



//drinks stuff

typedef enum {
	NoErrors = 0x0000,
	NoResponseServer = 0x0001,
	EmptyTank = 0x0010
}DrinkErrors;

typedef struct{
	float onTime_sec;
	float offTime_sec;
	float totalFillTime_sec;
	int pin;
}DrinkCals;

typedef enum {
	Water=0,
	Coke=1,
	Diet_Coke=2
}DrinkTypes;

typedef struct{
	//public
	DrinkState state;
	DrinkErrors errors;
}Drink;

void initDrink(Drink * pDrink);
void processDrinkRequest(Drink * pDrink);
void resetDrink(Drink * pDrink);
#endif
