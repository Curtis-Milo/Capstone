#http://www.instructables.com/id/Controlling-Direction-and-Speed-of-DC-Motor-Using-/
#https://www.sunfounder.com/learn/Super_Kit_V2_for_RaspberryPi/lesson-8-rotary-encoder-super-kit-for-raspberrypi.html
from Graph import *
import RPi.GPIO as GPIO
from time import *
from Encoder import *
import math
from ImageRec import *
from UltraSonicCheck import *
from PI import *
class DriveTrain():
	def __init__(self):
		#encoder pins (TODO set pins)
		GPIO.setmode(GPIO.BCM)
		self.currNode ="Base"
		self.EncoderA = Encoder(27,22)
		self.EncoderB = Encoder(10,9)
		self.circleChecker = ImageRec()
		self.UltraSonic = UltraSonic()
		#Motor H brige GPIO pins
		self.Motor1A = 18 # set GPIO-18 as Input 1 of the controller IC
		self.Motor1B = 24 # set GPIO-24 as Input 2 of the controller IC
		self.PWM_A = 23
		self.PWM_B = 25
		GPIO.setup(self.Motor1A,GPIO.OUT)
		GPIO.setup(self.Motor1B,GPIO.OUT)
		GPIO.setup(self.PWM_A,GPIO.OUT)
		GPIO.setup(self.PWM_B,GPIO.OUT)
		pwmRight=GPIO.PWM(self.PWM_A,100) # configuring Enable pin means GPIO-04 for PWM
		pwmLeft =GPIO.PWM(self.PWM_B,100) # configuring Enable pin means GPIO-04 for PWM
		#CALS
		self.encoderCountsMin =100;
		self.countPerDeg = 0.001; #Need to look up
		self.refSpeedFrwd = 300*(math.pi/30.0)
		self.refSpeedTurn = 100*(math.pi/30.0)
		self.batteryMax = 18.0;
		self.PiA = PI_Controller(1,1)
		self.PiB = PI_Controller(1,1)
	
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
			
		
	def turn(self, angle_deg):
		time_prev= time()
		self.circleChecker.captureImage()
		circles = self.circleChecker.checkForCircle()

		TargetAngle = int(angle_deg)/45
		currentAngle = 0
		pwmRight.start(0)
		pwmLeft.start(0)
		while currentAngle != TargetAngle:
			while self.EncoderA.getEncoderCount() < self.encoderCountsMin:
				delta_t = time() - time_prev
				time_prev = time()
				speedFdbk_A = self.EncoderA.getEncoderCount() /delta_t
				speedFdbk_B = self.EncoderA.getEncoderCount() /delta_t

				if(currentAngle < TargetAngle):
					signA = 1.0
					signB = -1.0
					GPIO.output(Motor1A,GPIO.HIGH)
					GPIO.output(Motor1B,GPIO.LOW)
				elif(TargetAngle < currentAngle):
					signA = -1.0
					signB = 1.0
					GPIO.output(Motor1A,GPIO.LOW)
					GPIO.output(Motor1B,GPIO.HIGH)
				
				GPIO.output(Motor1A,GPIO.HIGH)
				GPIO.output(Motor1B,GPIO.HIGH)
				errRight = self.PiA.PI_Calc(signA*self.refSpeedTurn, speedFdbk_A)
				errLeft = self.PiB.PI_Calc(signB*self.refSpeedTurn, speedFdbk_B)
				
				duty_cycleR = 100*(errRight/self.batteryMax)
				duty_cycleL = 100*(errLeft/self.batteryMax)
				pwmRight.ChangeDutyCycle(duty_cycleR)
				pwmLeft.ChangeDutyCycle(duty_cycleL)
				self.circleChecker.captureImage()
				circles = self.circleChecker.checkForCircle()

				if circles is not None:
					# convert the (x, y) coordinates and radius of the circles to integers
					circles = np.round(circles[0, :]).astype("int")
			 
					# loop over the (x, y) coordinates and radius of the circles
					for (x, y, r) in circles:
						dist = ((self.circleChecker.end_x -x)**2 + (self.circleChecker.end_y -y)**2)**0.5
						if  dist < self.hist:
							currentAngle =currentAngle + 1

		pwm.stop()

	def drive(self,distance_meters):
		time_prev= time()
		circlefound = False;
		GPIO.output(Motor1A,GPIO.HIGH)
		GPIO.output(Motor1B,GPIO.HIGH)
		pwm.start(0)
		while not circlefound:
			while self.EncoderA.getEncoderCount() < self.encoderCountsMin:
				delta_t = time() - time_prev
				time_prev = time()
				speedFdbk_A = self.EncoderA.getEncoderCount() /delta_t
				speedFdbk_B = self.EncoderB.getEncoderCount() /delta_t
				self.EncoderA.clear()
				self.EncoderB.clear()
				if self.UltraSonic.nothingBlocking():
					errRight = abs(self.PiA.PI_Calc(signA*self.refSpeedTurn, speedFdbk_A))
					errLeft = abs(self.PiB.PI_Calc(signB*self.refSpeedTurn, speedFdbk_B))
					
					duty_cycleR = max(100*(errRight/self.batteryMax),75)
					duty_cycleL =  max(100*(errLeft/self.batteryMax),75)
					pwmRight.ChangeDutyCycle(duty_cycleR)
					pwmLeft.ChangeDutyCycle(duty_cycleL)
				else:
					pwmRight.ChangeDutyCycle(0)
					pwmLeft.ChangeDutyCycle(0)

				self.circleChecker.captureImage()
				circles = self.circleChecker.checkForCircle()

				if circles is not None:
					# convert the (x, y) coordinates and radius of the circles to integers
					circles = np.round(circles[0, :]).astype("int")
			 
					# loop over the (x, y) coordinates and radius of the circles
					for (x, y, r) in circles:
						dist = ((self.circleChecker.mid_x -x)**2 + (self.circleChecker.mid_y -y)**2)**0.5
						if  dist < self.hist:
							circlefound =  True
							
		 
		pwm.stop()
