
#Step 1: Import necessary libraries 
#------------------------------------------------------------------------
#------------------------------------------------------------------------
import sys
import RPi.GPIO as gpio 
import time
#------------------------------------------------------------------------
#------------------------------------------------------------------------

def move(steps, direction):

#read the direction and number of steps; if steps are 0 exit 
	try: 
		steps = float(steps)
	except:
		steps = 0

#print which direction and how many steps 
	print("You told me to turn %s %s steps.") % (direction, steps)
#------------------------------------------------------------------------
#------------------------------------------------------------------------


#Step 3: Setup the raspberry pi's GPIOs
#------------------------------------------------------------------------
#------------------------------------------------------------------------
	#use the broadcom layout for the gpio
	gpio.setmode(gpio.BCM)
	
	#Motor 1: GPIO23, GPIO24
	#GPIO23 = Step
	#GPIO24 = Direction
	gpio.setup(23, gpio.OUT)
	gpio.setup(24, gpio.OUT)
	
	#Motor 2: GPIO14, GPIO15
	#GPIO14 = step
	#GPIO15 = Direction
	gpio.setup(14, gpio.OUT)
	gpio.setup(15, gpio.OUT)
	
#------------------------------------------------------------------------
#------------------------------------------------------------------------


#Step 4: Set direction of rotation
#------------------------------------------------------------------------
#------------------------------------------------------------------------
	#set the direction equal to the appropriate gpio pin
	if direction == 'forward':
		gpio.output(24, True)
		gpio.output(15, True)
	elif direction == 'back':
		gpio.output(24, False)
		gpio.output(15, False)
#------------------------------------------------------------------------
#------------------------------------------------------------------------


#Step 5: Setup step counter and speed control variables
#------------------------------------------------------------------------
#------------------------------------------------------------------------
#track the numebr of steps taken
	StepCounter = 0

#waittime controls speed
	WaitTime = 0.000001
#------------------------------------------------------------------------
#------------------------------------------------------------------------


#Step 6: Let the magic happen
#------------------------------------------------------------------------
#------------------------------------------------------------------------
# Start main loop
	while StepCounter < steps:

		#turning the gpio on and off tells the easy driver to take one step
		gpio.output(23, True)
		gpio.output(14, True)
		gpio.output(23, False)
		gpio.output(14, False)
		StepCounter += 1

		#Wait before taking the next step...this controls rotation speed
		time.sleep(WaitTime)
#------------------------------------------------------------------------
#------------------------------------------------------------------------


#Step 7: Clear the GPIOs so that some other program might enjoy them
#------------------------------------------------------------------------
#------------------------------------------------------------------------
#relase the GPIO
	gpio.cleanup()
#------------------------------------------------------------------------
#------------------------------------------------------------------------