 Motor1A = 02 # set GPIO-02 as Input 1 of the controller IC
 Motor1B = 03 # set GPIO-03 as Input 2 of the controller IC
GPIO.setup(Motor1A,GPIO.OUT)
GPIO.setup(Motor1B,GPIO.OUT)
pwmRight=GPIO.PWM(04,100) # configuring Enable pin means GPIO-04 for PWM
pwmLeft =GPIO.PWM(05,100) # configuring Enable pin means GPIO-04 for PWM



def drive(time_Delay):
    start= time()
    circlefound = False;
    GPIO.output(Motor1A,GPIO.HIGH)
    GPIO.output(Motor1B,GPIO.HIGH)
    pwmRight.start(0.2)
    pwmLeft.start(0.2) # configuring Enable pin means GPIO-04 for PWM
    time.sleep(time_Delay)
    pwm.stop()


def turn(time_Delay, turnRight):
    start= time()
    circlefound = False;
    GPIO.output(Motor1A,GPIO.HIGH)
    GPIO.output(Motor1B,GPIO.HIGH)

    if(turnRight):
   		GPIO.output(Motor1A,GPIO.HIGH)
		GPIO.output(Motor1B,GPIO.LOW)
	else:
        GPIO.output(Motor1A,GPIO.LOW)
        GPIO.output(Motor1B,GPIO.HIGH)

        
    pwmRight.start(0.2)
    pwmLeft.start(0.2) # configuring Enable pin means GPIO-04 for PWM
    time.sleep(time_Delay)
    pwm.stop()