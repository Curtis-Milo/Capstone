import RPi.GPIO as GPIO
from time import sleep
from multiprocessing import Lock
#https://github.com/modmypi/Rotary-Encoder/blob/master/rotary_encoder.py
class Encoder():
	def __init__(self,Clk,Dt,Sw, l, i):
		GPIO.setmode(GPIO.BCM)
		self.Clk  = Clk
		self.Dt  = Dt
		if Sw:
			self.Sw = -1.0
		else:
			self.Sw = 1.0
		self.l = l
		self.i = i

		GPIO.setmode(GPIO.BCM)
		GPIO.setup(self.Clk , GPIO.IN)    # input mode
		GPIO.setup(self.Dt , GPIO.IN)
		self.l[self.i]= 0
		self.clkLastState =0
		self.lock = Lock()

	def rotaryDeal(self):
		clkState = GPIO.input(self.Clk)
		dtState = GPIO.input(self.Dt)
		if clkState !=  self.clkLastState:
			with self.lock:
				if dtState != clkState:
					self.l[self.i] += 1
				else:
					self.l[self.i] -= 1
			   
		self.clkLastState = clkState

	def getEncoderCount(self):
		value = 0
		with self.lock:
			value = self.l[self.i]*self.Sw
		return value

	def resetEncoderCount(self):
		with self.lock:
			self.l[self.i] =0

	def test(self):
		while 1:
			self.rotaryDeal()
			print  self.getEncoderCount()
