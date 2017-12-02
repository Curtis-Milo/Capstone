#https://www.modmypi.com/blog/hc-sr04-ultrasonic-range-sensor-on-the-raspberry-pi
import RPi.GPIO as GPIO
import time
class UltraSonic():#ONLY LOOKING AT FRONT SENSOR FOR NOW

    def __init__(self):
        GPIO.setmode(GPIO.BCM)
        self.TRIG = 23 
        self.ECHO = 24
        
        GPIO.setup(self.TRIG,GPIO.OUT)
        GPIO.setup(self.ECHO,GPIO.IN)

        #CALS
        self.mindist =5;
        
    def nothingBlocking(self):
        GPIO.output(TRIG, False)

        time.sleep(2)

        GPIO.output(TRIG, True)
        time.sleep(0.00001)
        GPIO.output(TRIG, False)

        while GPIO.input(ECHO)==0:
            pulse_start = time.time()

        while GPIO.input(ECHO)==1:
            pulse_end = time.time()

        pulse_duration = pulse_end - pulse_start
        distance = pulse_duration * 17150
        distance = round(distance, 2)

        if distance <  self.mindist:
            return False
        else:
            return True
        
