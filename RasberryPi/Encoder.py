import RPi.GPIO as GPIO
from time import sleep
#https://github.com/modmypi/Rotary-Encoder/blob/master/rotary_encoder.py
class Encoder():
    def __init__(self,Clk,Dt):
        GPIO.setmode(GPIO.BCM)
        self.Clk  = Clk
        self.Dt  = Dt
        

        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.Clk , GPIO.IN)    # input mode
        GPIO.setup(self.Dt , GPIO.IN)

        self.encoderCount= 0
        self.clkLastState =0

    def rotaryDeal(self):
        clkState = GPIO.input(self.Clk)
        dtState = GPIO.input(self.Dt)
        if clkState !=  self.clkLastState:
            if dtState != clkState:
                self.encoderCount += 1
            else:
                self.encoderCount -= 1
        self.clkLastState = clkState

    def getEncoderCount(self):
        return self.encoderCount

    def test(self):
    	while 1:
    		self.rotaryDeal()
    		print  self.getEncoderCount()
