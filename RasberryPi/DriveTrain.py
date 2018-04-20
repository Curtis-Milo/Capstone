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
from multiprocessing import *
import picamera

class DriveTrain():
	def __init__(self):
		#encoder pins (TODO set pins)
		GPIO.setmode(GPIO.BCM)
		# Shared memory between processes
		# self.manager = Manager()
		# self.l = self.manager.list([0, 0])
		rEncVal = Value('i', 0)
		lEncVal = Value('i', 0)
		self.checkForCirclesFlag = Value('i', 0)
		self.checkForCircle = Value('i', 0)
		self.isAlive = Value('i', 1)

		self.currNode =(0,0)
		self.EncoderL = Encoder(27,22,1,rEncVal)
		self.EncoderR = Encoder(10,9,0,lEncVal)
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
		self.currAngle = 0
		self.pwmRight=GPIO.PWM(self.PWM_L,100) # configuring Enable pin means GPIO-04 for PWM
		self.pwmLeft =GPIO.PWM(self.PWM_R,100) # configuring Enable pin means GPIO-04 for PWM
		#CALS
		self.encoderCountsMin =10
		self.countPerRad = 2*(38.0/math.pi)
		self.refSpeedFrwdL = 15
		self.refSpeedFrwdR = 10
		self.refSpeedTurn = 100*(math.pi/30.0)
		self.batteryMax = 18.0

		self.Pi_L = PI_Controller(0.06, 0.04)
		self.Pi_R = PI_Controller(0.06,0)
		self.Pi_Angle = PI_Controller(0.8,0.01)

		self.MaxOutStrtL = 50
		self.MinOutStrtL = 12
		self.MaxOutStrtR = 50
		self.MinOutStrtR = 10

		self.MaxOutTrnL = 60
		self.MinOutTrnL = 45
		self.MaxOutTrnR = 60
		self.MinOutTrnR = 45

		self.WheelRad = 0.09
		self.RobotRad = 0.12
		self.TIME_OUT = 10
		self.MIN_DELTA = 0.1
		self.slewRateRight = Slew(2,self.MinOutStrtR)
		self.slewRateLeft = Slew(5,self.MinOutStrtL)


	def driveToLocation(self,map,tablesList, TableID):
		visited, path = map.dijsktra(self.currNode)
		toNode = tablesList[TableID]
		nodesToTravel = []
		currNode = self.currNode
		while (toNode != currNode):
			nodesToTravel.insert(0,path[toNode]);
			toNode= path[toNode]

		nodesToTravel.pop(0)
		prev =self.currNode
		for nextNode in nodesToTravel:
			x1 = prev[0]
			x2 = nextNode[0]
			y1= prev[1]
			y2 = nextNode[1]

			NewAngle = self.getDesiredAng(x1,x2,y1,y2)

			turnAngle = (NewAngle- self.currAngle)

			##self.drivetrain.turn(turnAngle)
			print "Turn: ",turnAngle
			self.currAngle  = NewAngle
			##error = self.drivetrain.drive()
			error= 0
			print "Forward"
			if error !=0:
				return 0x00001000

			prev = nextNode
			
		self.currNode = toNode
		return 0

	def getDesiredAng(self, x1,x2,y1,y2):
		if (x2-x1)== -1 and (y2-y1)==0:
			return 0
		elif (x2-x1)== -1 and (y2-y1)==1:
			return math.pi/4
		elif (x2-x1)== 0 and (y2-y1)==1:
			return math.pi/2
		elif (x2-x1)== 1 and (y2-y1)==1:
			return (3.0*math.pi)/4
		elif (x2-x1)== 1 and (y2-y1)==0:
			return math.pi
		elif (x2-x1)== 1 and (y2-y1)==-1:
			return (5.0*math.pi)/4
		elif (x2-x1)== 0 and (y2-y1)==-1:
			return (3.0*math.pi)/2
		elif (x2-x1)== -1 and (y2-y1)==-1:
			return (7.0*math.pi)/4

	def limit(self,value,minV,maxV):
		value = min(value,maxV)
		value = max(value,minV)
		return value

	def checkEncoder(self):
		while self.isAlive.value:
			self.EncoderL.rotaryDeal()
			self.EncoderR.rotaryDeal()

	def turn(self, TargetAngle):
		self.encProcess = Process(target = self.checkEncoder)
		self.encProcess.start()

		time_prev= time.time()
		currentAngle = 0
		if(0 < TargetAngle):
			GPIO.output(self.MotorL,GPIO.HIGH)
			GPIO.output(self.MotorR,GPIO.HIGH)
			mult = -1.0
		else:
			GPIO.output(self.MotorL,GPIO.LOW)
			GPIO.output(self.MotorR,GPIO.LOW)
			mult = -1.0

		self.slewRateRight.Reset(self.MinOutTrnR)
		self.slewRateLeft.Reset(self.MinOutTrnL)
		self.Pi_R.Reset()
		self.Pi_L.Reset()
		self.pwmRight.start(self.MinOutTrnR)
		self.pwmLeft.start(self.MinOutTrnL)
		distances =0 
		num_rotations = 0
		start= time.time()
		try:
			prevT = time.time()
			while 0.25  < abs(currentAngle - TargetAngle):
				if  self.TIME_OUT < time.time()-start:
					raise Exception
				while (time.time()-prevT) <self.MIN_DELTA:
					pass
				
				distances += self.WheelRad*(self.EncoderR.getEncoderCount()/self.countPerRad)
				print "distance: "+ str(distances)
				currentAngle = mult*(distances/self.RobotRad)
				print "CurrAng: ", str(currentAngle),"TargetAng: ", str(TargetAngle)

				print "Encoder L: " + str(self.EncoderL.getEncoderCount()) +" Encoder R: " + str(self.EncoderR.getEncoderCount()) 
					

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
				
				print "err", err
				#Calculating Percentage
				duty_cycleR = self.slewRateRight.slewValue(100*(err/self.batteryMax))
				duty_cycleL = self.slewRateLeft.slewValue(100*(err/self.batteryMax))

				#limiting the duty cycles
				duty_cycleR = self.limit(duty_cycleR, self.MinOutTrnR,self.MaxOutTrnR)
				duty_cycleL = self.limit(duty_cycleL, self.MinOutTrnL,self.MaxOutTrnL)

				print "Duty L: " + str(duty_cycleL) + " Duty R: " + str(duty_cycleR)
				self.pwmRight.ChangeDutyCycle(duty_cycleR)
				self.pwmLeft.ChangeDutyCycle(duty_cycleL)
				self.EncoderL.resetEncoderCount()
				self.EncoderR.resetEncoderCount()
				prevT = time.time()
		except Exception as e:
			print(e)
		except KeyboardInterrupt as k:
			self.destroy()
			GPIO.cleanup()
		finally:
			self.pwmRight.stop()
			self.pwmLeft.stop()
			self.destroy()
			self.encProcess.join()
			self.imgProcess.join()
			self._reset()

	def drive(self):
		self.encProcess = Process(target = self.checkEncoder)
		self.encProcess.start()

		self.imgProcess = Process(target=self.checkForNode)
		self.imgProcess.start()

		time_prev= time.time()
		GPIO.output(self.MotorL,GPIO.LOW)
		GPIO.output(self.MotorR,GPIO.HIGH)
		wasBlocked = False
		self.slewRateRight.Reset(self.MinOutStrtR)
		self.slewRateLeft.Reset(self.MinOutStrtL)
		self.Pi_R.Reset()
		self.Pi_L.Reset()
		self.pwmRight.start(self.MinOutStrtR)
		self.pwmLeft.start(self.MinOutStrtL)
		self.EncoderL.resetEncoderCount()
		self.EncoderR.resetEncoderCount()
		self.checkForCirclesFlag.value = 1
		time_elapse  = 0 
		blockCount = 0
		prevT = time.time()
		try:
			self.checkForCircle.value =0 
			while not self.checkForCircle.value:
				notBlocked = self.UltraSonic.nothingBlocking()
				if wasBlocked and notBlocked:
					self.pwmRight.start(self.MinOutStrtR)
					self.pwmLeft.start(self.MinOutStrtL)
					wasBlocked = False

				while (time.time()-prevT) <self.MIN_DELTA:
					pass
					
				if notBlocked:
					blockCount = 0
					delta_t = time.time() - time_prev
					time_elapse += delta_t
					time_prev = time.time()
					encderFdbk_L = self.EncoderL.getEncoderCount()
					encderFdbk_R = self.EncoderR.getEncoderCount()
					print "Encoder L: " + str(encderFdbk_L) +" Encoder R: " + str(encderFdbk_R) 
					posn_R  = self.refSpeedFrwdR*time_elapse
					posn_L  = self.refSpeedFrwdL*time_elapse
					print "Position L:",posn_L," Position R:",posn_R
					

					errRight = self.Pi_R.PI_Calc(posn_R, encderFdbk_R)
					errLeft = self.Pi_L.PI_Calc(posn_L, encderFdbk_L)
					print "Error L: " + str(errLeft) + " Error R: " + str(errRight)
					#Calculating Percentage
					
					duty_cycleR = self.slewRateRight.slewValue(100.0*(errRight/self.batteryMax))
					duty_cycleL = self.slewRateLeft.slewValue(100.0*(errLeft/self.batteryMax))
					
					#limiting the duty cycles
					duty_cycleR = self.limit(duty_cycleR, self.MinOutStrtR,self.MaxOutStrtR)
					duty_cycleL = self.limit(duty_cycleL, self.MinOutStrtL,self.MaxOutStrtL)
					print "Duty L: " + str(duty_cycleL) + " Duty R: " + str(duty_cycleR)
					
					self.pwmRight.ChangeDutyCycle(duty_cycleR)
					self.pwmLeft.ChangeDutyCycle(duty_cycleL)
				else:
					blockCount += 1
					time_prev = time.time()
					if blockCount >= 3:
						self.pwmRight.ChangeDutyCycle(0)
						self.pwmLeft.ChangeDutyCycle(0)
						wasBlocked = True

						self.slewRateRight.Reset(self.MinOutStrtR)
						self.slewRateLeft.Reset(self.MinOutStrtL)
						self.EncoderL.resetEncoderCount()
						self.EncoderR.resetEncoderCount()
						self.Pi_R.Reset()
						self.Pi_L.Reset()
						time_elapse = 0

						# print "blocked"

				
				prevT = time.time()
			
			self.EncoderL.resetEncoderCount()
			self.EncoderR.resetEncoderCount()
			self.checkForCirclesFlag.value = 0		
		except Exception as e:
			print(e)
		except KeyboardInterrupt as k:
			self.destroy()
			GPIO.cleanup()
		finally:
			self.pwmRight.stop()
			self.pwmLeft.stop()
			print "DONE"
			self.destroy()
			self.encProcess.join()
			self.imgProcess.join()
			self._reset()

	def checkForNode(self):
		camera = picamera.PiCamera()
		circleChecker = ImageRec(camera)
		time.sleep(4)
		while self.isAlive.value:
			imgName = circleChecker.captureImage()
			circles = circleChecker.checkForCircle(imgName)
			if circles is not None:
				# print "circles found " + str(len(circles)
				# loop over the (x, y) coordinates and radius of the circles
				for (x, y, r) in circles:
					print "x: "+ str(x) +  " y: "+ str(y) + " r: "+str(r)
					if circleChecker.isInHist(x, y) and 5 < r:
						print circleChecker.getImgCounter()
						self.checkForCircle.value =  1
		camera.close()

	def _reset(self):
		GPIO.cleanup()
		GPIO.setmode(GPIO.BCM)
		GPIO.setup(self.MotorL,GPIO.OUT)
		GPIO.setup(self.MotorR,GPIO.OUT)
		GPIO.setup(self.PWM_L,GPIO.OUT)
		GPIO.setup(self.PWM_R,GPIO.OUT)
		self.pwmRight=GPIO.PWM(self.PWM_L,100) # configuring Enable pin means GPIO-04 for PWM
		self.pwmLeft =GPIO.PWM(self.PWM_R,100) # configuring Enable pin means GPIO-04 for PWM

		self.EncoderR.reset()
		self.EncoderL.reset()
		self.UltraSonic.reset()

		self.isAlive.value = 1

	def destroy(self):
		self.isAlive.value = 0
		# self.manager.shutdown()
		# self.manager.join()
						
#d = DriveTrain()
#d.drive()
#time.sleep(1)
#d.turn(0.45)
#time.sleep(1)
#d.drive()