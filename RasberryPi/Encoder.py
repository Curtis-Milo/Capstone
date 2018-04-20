import RPi.GPIO as GPIO
from time import sleep
from multiprocessing import Lock
#https://github.com/modmypi/Rotary-Encoder/blob/master/rotary_encoder.py
class Encoder():
	def __init__(self,Clk,Dt,Sw, encVal):
		GPIO.setmode(GPIO.BCM)
		self.Clk  = Clk
		self.Dt  = Dt
		if Sw:
			self.Sw = -1.0
		else:
			self.Sw = 1.0
		self.encVal = encVal

		GPIO.setmode(GPIO.BCM)
		GPIO.setup(self.Clk , GPIO.IN)    # input mode
		GPIO.setup(self.Dt , GPIO.IN)

		self.clkLastState = 0
		self.lock = Lock()

	def rotaryDeal(self):
		clkState = GPIO.input(self.Clk)
		dtState = GPIO.input(self.Dt)
		if clkState !=  self.clkLastState:
			with self.lock:
				if dtState != clkState:
					self.encVal.value += 1
				else:
					self.encVal.value -= 1
			   
		self.clkLastState = clkState

	def getEncoderCount(self):
		value = 0
		with self.lock:
			value = self.encVal.value*self.Sw
		return value

	def resetEncoderCount(self):
		with self.lock:
			self.encVal.value = 0

	def reset(self):
		GPIO.setmode(GPIO.BCM)
		GPIO.setmode(GPIO.BCM)
		GPIO.setup(self.Clk , GPIO.IN)    # input mode
		GPIO.setup(self.Dt , GPIO.IN)

	def test(self):
		while 1:
			self.rotaryDeal()
			print  self.getEncoderCount()
