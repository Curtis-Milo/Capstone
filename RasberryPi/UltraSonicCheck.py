#https://www.modmypi.com/blog/hc-sr04-ultrasonic-range-sensor-on-the-raspberry-pi
import RPi.GPIO as GPIO
import time
class UltraSonic():#ONLY LOOKING AT FRONT SENSOR FOR NOW

    def __init__(self):
        GPIO.setmode(GPIO.BCM)
        self.TRIG = 8
        self.ECHO = 7
        
        GPIO.setup(self.TRIG,GPIO.OUT)
        GPIO.setup(self.ECHO,GPIO.IN)

        #CALS

        self.mindist = 200;
        
    def nothingBlocking(self):
        
        GPIO.output(self.TRIG, False)
        #print "waiting for SENSOR to settle"
        #time.sleep(.02)

        # set Trigger to HIGH
        GPIO.output(self.TRIG, True)
        
        # set Trigger after 0.01ms to LOW
        time.sleep(0.001)
        GPIO.output(self.TRIG, False)

        pulse_start =time.time()
        pulse_end = time.time()

        while GPIO.input(self.ECHO)==0:
            pulse_start = time.time()

        while GPIO.input(self.ECHO)==1:
            pulse_end = time.time()

        pulse_duration = pulse_end - pulse_start
        distance = pulse_duration * (17150.0)
        # print "distance: ",distance

        if distance <  self.mindist:
            return False
        else:
            return True
        
    def reset(self):
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.TRIG,GPIO.OUT)
        GPIO.setup(self.ECHO,GPIO.IN)
