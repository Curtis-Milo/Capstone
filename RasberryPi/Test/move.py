import RPi.GPIO as GPIO
import time
from UltraSonicCheck import *
from slew import *
GPIO.setmode(GPIO.BCM)
Motor1A = 18 # set GPIO-18 as Input 1 of the controller IC
Motor1B = 24 # set GPIO-24 as Input 2 of the controller IC
PWM_A = 23
PWM_B = 25
GPIO.setup(Motor1A,GPIO.OUT)
GPIO.setup(Motor1B,GPIO.OUT)
GPIO.setup(PWM_A,GPIO.OUT)
GPIO.setup(PWM_B,GPIO.OUT)
pwmRight=GPIO.PWM(PWM_A,100) # configuring Enable pin means GPIO-04 for PWM
pwmLeft =GPIO.PWM(PWM_B,100) # configuring Enable pin means GPIO-04 for PWM
UltraSonic = UltraSonic()
slewRate = slew(0.05)

def drive(time_Delay,duty):
    GPIO.output(Motor1A,GPIO.HIGH)
    GPIO.output(Motor1B,GPIO.HIGH)
    pwmRight.start(0)
    pwmLeft.start(0) # configuring Enable pin means GPIO-04 for PWM
    s = time.time()
    while time.time()-s < time_Delay:
    	dutySlewed = slewRate.slewValue(duty)
    	pwmRight.ChangeDutyCycle(dutySlewed)
		pwmLeft.ChangeDutyCycle(dutySlewed)
    	time.sleep(0.01)
    
    pwmRight.stop()
    pwmLeft.stop()


def turn(time_Delay,duty, turnRight):
    circlefound = False;
    GPIO.output(Motor1A,GPIO.HIGH)
    GPIO.output(Motor1B,GPIO.HIGH)

    if(turnRight):
   		GPIO.output(Motor1A,GPIO.HIGH)
		GPIO.output(Motor1B,GPIO.LOW)
    else:
        GPIO.output(Motor1A,GPIO.LOW)
        GPIO.output(Motor1B,GPIO.HIGH)
    
    pwmRight.start(0)
    pwmLeft.start(0) # configuring Enable pin means GPIO-04 for PWM
    s = time.time()
    while time.time()-s < time_Delay:
    	dutySlewed = slewRate.slewValue(duty)
    	pwmRight.ChangeDutyCycle(dutySlewed)
		pwmLeft.ChangeDutyCycle(dutySlewed)
    	time.sleep(0.01)
    pwmRight.stop()
    pwmLeft.stop()