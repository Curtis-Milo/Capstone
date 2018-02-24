#http://www.instructables.com/id/Controlling-Direction-and-Speed-of-DC-Motor-Using-/
#https://www.sunfounder.com/learn/Super_Kit_V2_for_RaspberryPi/lesson-8-rotary-encoder-super-kit-for-raspberrypi.html
from Graph import *
import RPi.GPIO as GPIO
import time
from Encoder import *
import math
from ImageRec import *
from UltraSonicCheck import *
from slew import *
from PI import *

class DriveTrain():
	def __init__(self):
		#encoder pins (TODO set pins)
		GPIO.setmode(GPIO.BCM)
		self.currNode ="Base"
		self.EncoderL = Encoder(27,22,0)
		self.EncoderR = Encoder(10,9,1)
		self.circleChecker = ImageRec()
		self.UltraSonic = UltraSonic()
		#Motor H brige GPIO pins
		self.MotorL = 18 # set GPIO-18 as Input 1 of the controller IC
		self.MotorR = 24 # set GPIO-24 as Input 2 of the controller IC
		self.PWM_L = 23
		self.PWM_R = 25
		GPIO.setup(self.MotorL,GPIO.OUT)
		GPIO.setup(self.MotorR,GPIO.OUT)
		GPIO.setup(self.PWM_L,GPIO.OUT)
		GPIO.setup(self.PWM_R,GPIO.OUT)
		self.pwmRight=GPIO.PWM(self.PWM_L,100) # configuring Enable pin means GPIO-04 for PWM
		self.pwmLeft =GPIO.PWM(self.PWM_R,100) # configuring Enable pin means GPIO-04 for PWM
		#CALS
		self.encoderCountsMin =20
		self.countPerDeg = (38.0/360.0)
		self.refSpeedFrwd = 20
		self.refSpeedTurn = 100*(math.pi/30.0)
		self.batteryMax = 18.0
		self.hist =100
		self.Pi_L = PI_Controller(0.4,0.01)
		self.Pi_R = PI_Controller(0.5,0.01)
		self.Pi_Angle = PI_Controller(1,1)

		self.MaxOutL = 15
		self.MinOutL = 10
		self.MaxOutR = 15
		self.MinOutR = 8
		self.slewRateRight = Slew(1,self.MinOutR)
		self.slewRateLeft = Slew(1,self.MinOutL)

	def driveToLocation(self,toNode):
		visited, path = self.map.dijsktra(self.currNode)
		node = toNode
		nodesToTravel = []

		while (node != self.currNode):
			nodesToTravel.insert(0,path[node]);
			node= path[node]

		prev =self.currNode
		for nextNode in nodesToTravel:
			x1 = prev[0]
			x2 = nextNode[0]
			y1= prev[1]
			y2 = nextNode[1]

			NewAngle = math.atan2(y2-y1,x2-x1)  

			turnAngle = (NewAngle-self.currAngle)

			if  turnAngle < 0:
				turnAngle = turnAngle+360    
			self.drivetrain.turn()
			self.currAngle  = NewAngle
			self.drivetrain.drive(self.map.distances[(prev, nextNode)])
			prev = nextNode
			
		self.currNode = toNode
			
	def limit(self,value,minV,maxV):
		value = min(value,maxV)
		value = max(value,minV)
		return value

	def checkEncoder(self):
		self.EncoderL.rotaryDeal()
		self.EncoderR.rotaryDeal()

	def turn(self, TargetAngle):
		time_prev= time.time()
		currentAngle = 0
		self.slewRateRight.Reset(self.MinOutR)
		self.slewRateLeft.Reset(self.MinOutL)
		self.Pi_R.Reset()
		self.Pi_L.Reset()
		self.pwmRight.start(5)
		self.pwmLeft.start(5)

		try:
			while 1 < abs(currentAngle -TargetAngle):
				self.checkEncoder()
				while self.encoderCountsMin<   abs(self.EncoderR.getEncoderCount()):
					currentAngle +=(self.EncoderL.getEncoderCount())*self.countPerDeg
					if(currentAngle < TargetAngle):
						sign_L = 1.0
						sign_R = -1.0
						GPIO.output(self.MotorL,GPIO.HIGH)
						GPIO.output(self.MotorR,GPIO.LOW)
					elif(TargetAngle < currentAngle):
						sign_L = -1.0
						sign_R = 1.0
						GPIO.output(self.MotorL,GPIO.LOW)
						GPIO.output(self.MotorR,GPIO.HIGH)
					
					err = abs(self.Pi_Angle.PI_Calc(TargetAngle, currentAngle))
					
					#Calculating Percentage
					duty_cycleR = self.slewRateRight.slewValue(100*(err/self.batteryMax))
					duty_cycleL = self.slewRateLeft.slewValue(100*(err/self.batteryMax))

					#limiting the duty cycles
					duty_cycleR = self.limit(duty_cycleR, self.MinOutR,self.MaxOutR)
					duty_cycleL = self.limit(duty_cycleL, self.MinOutL,self.MaxOutL)
					self.pwmRight.ChangeDutyCycle(duty_cycleR)
					self.pwmLeft.ChangeDutyCycle(duty_cycleL)
					self.EncoderL.resetEncoderCount()
					self.EncoderR.resetEncoderCount()
		except Exception as e:
			print(e)
			self.runEconderThread = False
		
		finally:
			self.pwmRight.ChangeDutyCycle(0)
			self.pwmLeft.ChangeDutyCycle(0)

	def drive(self):
		time_prev= time.time()
		circlefound = False
		GPIO.output(self.MotorL,GPIO.HIGH)
		GPIO.output(self.MotorR,GPIO.LOW)
		wasBlocked = False
		self.slewRateRight.Reset(self.MinOutR)
		self.slewRateLeft.Reset(self.MinOutL)
		self.Pi_R.Reset()
		self.Pi_L.Reset()
		self.pwmRight.start(self.MinOutR)
		self.pwmLeft.start(self.MinOutL)
		time_elapse  = 0 
		try:
			while not circlefound:
				self.checkEncoder()
				while self.encoderCountsMin<   abs(self.EncoderR.getEncoderCount()):

					delta_t = time.time() - time_prev
					time_elapse += delta_t
					time_prev = time.time()
					speedFdbk_L = self.EncoderL.getEncoderCount() /delta_t
					speedFdbk_R = self.EncoderR.getEncoderCount() /delta_t
					notBlocked = self.UltraSonic.nothingBlocking()
					if wasBlocked and notBlocked:
							self.pwmRight.start(self.MinOutR)
							self.pwmLeft.start(self.MinOutL)
							wasBlocked = False
					elif notBlocked:
						print "Right "
						errRight = self.Pi_R.PI_Calc(self.refSpeedFrwd, speedFdbk_R)
						print "Left "
						errLeft = self.Pi_L.PI_Calc(self.refSpeedFrwd, speedFdbk_L)
						print "Error L: " + str(errLeft) + " Error R: " + str(errRight)
						#Calculating Percentage
						
						duty_cycleR = self.slewRateRight.slewValue(100.0*(errRight/self.batteryMax))
						duty_cycleL = self.slewRateLeft.slewValue(100.0*(errLeft/self.batteryMax))
						
						#limiting the duty cycles
						duty_cycleR = self.limit(duty_cycleR, self.MinOutR,self.MaxOutR)
						duty_cycleL = self.limit(duty_cycleL, self.MinOutL,self.MaxOutL)

						print "Duty L: " + str(duty_cycleL) + " Duty R: " + str(duty_cycleR)
						
						self.pwmRight.ChangeDutyCycle(duty_cycleR)
						self.pwmLeft.ChangeDutyCycle(duty_cycleL)
					else:
						self.pwmRight.stop()
						self.pwmLeft.stop()
						wasBlocked = True
						print "blocked"

					self.EncoderL.resetEncoderCount()
					self.EncoderR.resetEncoderCount()
					self.circleChecker.captureImage()
					if 1< time_elapse:
						time_elapse =0
						circles = self.circleChecker.checkForCircle()

						if circles is not None:
							print "circles found " + str(len(circles))
							# convert the (x, y) coordinates and radius of the circles to integers
							circles = np.round(circles[0, :]).astype("int")
					 
							# loop over the (x, y) coordinates and radius of the circles
							for (x, y, r) in circles:
									circlefound =  True
						else:
							print "No circles"
		except Exception as e:
			print(e)
			self.runEconderThread = False

		finally:
			self.pwmRight.stop()
			self.pwmLeft.stop()
