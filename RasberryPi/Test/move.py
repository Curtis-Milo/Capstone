import RPi.GPIO as GPIO
import time
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


def drive(time_Delay,duty):
    GPIO.output(Motor1A,GPIO.HIGH)
    GPIO.output(Motor1B,GPIO.HIGH)
    pwmRight.start(duty)
    pwmLeft.start(duty) # configuring Enable pin means GPIO-04 for PWM
    time.sleep(time_Delay)
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

    pwmRight.start(duty)
    pwmLeft.start(duty) # configuring Enable pin means GPIO-04 for PWM
    time.sleep(time_Delay)
    pwmRight.stop()
    pwmLeft.stop()