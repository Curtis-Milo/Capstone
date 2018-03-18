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
		self.EncoderL = Encoder(27,22,1)
		self.EncoderR = Encoder(10,9,0)
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
		self.encoderCountsMin =10
		self.countPerRad = 2*(38.0/math.pi)
		self.refSpeedFrwdL = 19
		self.refSpeedFrwdR = 15
		self.refSpeedTurn = 100*(math.pi/30.0)
		self.batteryMax = 18.0
		self.hist =100
		self.Pi_L = PI_Controller(0.5, 0.2)
		self.Pi_R = PI_Controller(0.2,0.01)
		self.Pi_Angle = PI_Controller(1,1)

		self.MaxOutStrtL = 30
		self.MinOutStrtL = 20
		self.MaxOutStrtR = 30
		self.MinOutStrtR = 20

		self.MaxOutTrnL = 60
		self.MinOutTrnL = 50
		self.MaxOutTrnR = 60
		self.MinOutTrnR = 50

		self.WheelRad = 0.2
		self.RobotRad = 0.3

		self.slewRateRight = Slew(5,self.MinOutStrtR)
		self.slewRateLeft = Slew(5,self.MinOutStrtL)

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
				turnAngle = turnAngle+2*Math.pi    
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
		if(currentAngle < TargetAngle):
			GPIO.output(self.MotorL,GPIO.HIGH)
			GPIO.output(self.MotorR,GPIO.HIGH)
		elif(TargetAngle < currentAngle):
			GPIO.output(self.MotorL,GPIO.LOW)
			GPIO.output(self.MotorR,GPIO.LOW)
		self.slewRateRight.Reset(self.MinOutTrnR)
		self.slewRateLeft.Reset(self.MinOutTrnL)
		self.Pi_R.Reset()
		self.Pi_L.Reset()
		self.pwmRight.start(self.MinOutTrnR)
		self.pwmLeft.start(self.MinOutTrnL)
		distances =0 
		num_rotations = 0
		try:
			while 0.2 < abs(currentAngle -TargetAngle):
				self.checkEncoder()
				while self.encoderCountsMin<   abs(self.EncoderR.getEncoderCount()): 
					distances += self.WheelRad*(self.EncoderR.getEncoderCount()/self.countPerRad)
					print "distance: "+ str(distances)
					currentAngle = -1*(distances/self.RobotRad)
					print "CurrAng: ", str(currentAngle),"TargetAng: ", str(TargetAngle)
					if(currentAngle < TargetAngle):
						sign_L = 1.0
						sign_R = -1.0
						GPIO.output(self.MotorL,GPIO.HIGH)
						GPIO.output(self.MotorR,GPIO.HIGH)
					elif(TargetAngle < currentAngle):
						sign_L = -1.0
						sign_R = 1.0
						GPIO.output(self.MotorL,GPIO.LOW)
						GPIO.output(self.MotorR,GPIO.LOW)
					
					err = abs(self.Pi_Angle.PI_Calc(TargetAngle, currentAngle))
					

					
					#Calculating Percentage
					duty_cycleR = self.slewRateRight.slewValue(100*(err/self.batteryMax))
					duty_cycleL = self.slewRateLeft.slewValue(100*(err/self.batteryMax))

					#limiting the duty cycles
					duty_cycleR = self.limit(duty_cycleR, self.MinOutTrnR,self.MaxOutTrnR)
					duty_cycleL = self.limit(duty_cycleL, self.MinOutTrnL,self.MaxOutTrnL)
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
		GPIO.output(self.MotorL,GPIO.LOW)
		GPIO.output(self.MotorR,GPIO.HIGH)
		wasBlocked = False
		self.slewRateRight.Reset(self.MinOutStrtR)
		self.slewRateLeft.Reset(self.MinOutStrtL)
		self.Pi_R.Reset()
		self.Pi_L.Reset()
		self.pwmRight.start(self.MinOutStrtR)
		self.pwmLeft.start(self.MinOutStrtL)
		time_elapse  = 0 
		
		try:
			while not circlefound:
				self.checkEncoder()
				notBlocked = True #self.UltraSonic.nothingBlocking()
				if wasBlocked and notBlocked:
					self.pwmRight.start(self.MinOutStrtR)
					self.pwmLeft.start(self.MinOutStrtL)
					wasBlocked = False

				while self.encoderCountsMin<   abs(self.EncoderR.getEncoderCount()):

					delta_t = time.time() - time_prev
					time_elapse += delta_t
					time_prev = time.time()
					speedFdbk_L = self.EncoderL.getEncoderCount() /delta_t
					speedFdbk_R = self.EncoderR.getEncoderCount() /delta_t
					
					if notBlocked:
						#print "Right "
						errRight = self.Pi_R.PI_Calc(self.refSpeedFrwdR, speedFdbk_R)
						#print "Left "
						errLeft = self.Pi_L.PI_Calc(self.refSpeedFrwdL, speedFdbk_L)
						#print "Error L: " + str(errLeft) + " Error R: " + str(errRight)
						#Calculating Percentage
						
						duty_cycleR = self.slewRateRight.slewValue(100.0*(errRight/self.batteryMax))
						duty_cycleL = self.slewRateLeft.slewValue(100.0*(errLeft/self.batteryMax))
						
						#limiting the duty cycles
						duty_cycleR = self.limit(duty_cycleR, self.MinOutStrtR,self.MaxOutStrtR)
						duty_cycleL = self.limit(duty_cycleL, self.MinOutStrtL,self.MaxOutStrtL)

						#print "Duty L: " + str(duty_cycleL) + " Duty R: " + str(duty_cycleR)
						
						self.pwmRight.ChangeDutyCycle(duty_cycleR)
						self.pwmLeft.ChangeDutyCycle(duty_cycleL)
					else:
						self.pwmRight.ChangeDutyCycle(0)
						self.pwmLeft.ChangeDutyCycle(0)
						wasBlocked = True
						print "blocked"

					self.EncoderL.resetEncoderCount()
					self.EncoderR.resetEncoderCount()
					self.circleChecker.captureImage()
					if 1< time_elapse:
						time_elapse =0
						circles = self.circleChecker.checkForCircle()

						if circles is not None:
							#print "circles found " + str(len(circles)
							# loop over the (x, y) coordinates and radius of the circles
							for (x, y, r) in circles:
								#print "x: "+ str(x) +  " y: "+ str(y)
								if abs(self.circleChecker.mid_x - x) < self.circleChecker.hist and abs(self.circleChecker.mid_y - y) < self.circleChecker.hist:
									circlefound =  True
						else:
							pass
							#print "No circles"
		except Exception as e:
			print(e)
			self.runEconderThread = False

		finally:
			self.pwmRight.stop()
			self.pwmLeft.stop()
