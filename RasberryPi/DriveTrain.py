#http://www.instructables.com/id/Controlling-Direction-and-Speed-of-DC-Motor-Using-/
#https://www.sunfounder.com/learn/Super_Kit_V2_for_RaspberryPi/lesson-8-rotary-encoder-super-kit-for-raspberrypi.html
from Graph import *
import RPi.GPIO as GPIO
from time import *
from Encoder import *
import Math
from ImageRec import *
class DriveTrain():
    def __init__(self):
        #encoder pins (TODO set pins)
        self.currNode ="Base"
        self.EncoderA = Encoder(7,8,9)
        self.EncoderB = Encoder(10,11,12)
	self.circleChecker = ImageRec()
        self.UltraSonic = UltraSonic()
        #Motor H brige GPIO pins
        self.Motor1A = 02 # set GPIO-02 as Input 1 of the controller IC
        self.Motor1B = 03 # set GPIO-03 as Input 2 of the controller IC
        GPIO.setup(Motor1A,GPIO.OUT)
        GPIO.setup(Motor1B,GPIO.OUT)
        pwmRight=GPIO.PWM(04,100) # configuring Enable pin means GPIO-04 for PWM
        pwmLeft =GPIO.PWM(05,100) # configuring Enable pin means GPIO-04 for PWM
        #CALS
        self.encoderCountsMin =100;
        self.countPerDeg = 0.001; #Need to look up
        self.refSpeedFrwd = 300*(Math.pi/30.0)
        self.refSpeedTurn = 100*(Math.pi/30.0)
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

            NewAngle = Math.atan2(y2-y1,x2-x1)  

            turnAngle = (NewAngle-self.currAngle)

            if  turnAngle < 0:
                turnAngle = turnAngle+360    
            this.drivetrain.turn()
            self.currAngle  = NewAngle
            this.drivetrain.drive(self.map.distances[(prev, nextNode)])
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
                delta_t = time() = time_prev
                time_prev = time()
                speedFdbk_A = self.EncoderA.getEncoderCount() /delta_t
                speedFdbk_B = self.EncoderA.getEncoderCount() /delta_t

                if(currentAngle< TargetAngle):
                    signA = 1.0f
                    signB = -1.0f
                    GPIO.output(Motor1A,GPIO.HIGH)
        	    	GPIO.output(Motor1B,GPIO.LOW)
                else if (TargetAngle < currentAngle):
                    signA = -1.0f
                    signB = 1.0f
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
        while circlefound:
            while self.EncoderA.getEncoderCount() < self.encoderCountsMin:
                delta_t = time() = time_prev
                time_prev = time()
                speedFdbk_A = self.EncoderA.getEncoderCount() /delta_t
                speedFdbk_B = self.EncoderB.getEncoderCount() /delta_t
                self.EncoderA.clear()
                self.EncoderB.clear()
                if self.UltraSonic.nothingBlocking():
                    errRight = self.PiA.PI_Calc(signA*self.refSpeedTurn, speedFdbk_A)
	                errLeft = self.PiB.PI_Calc(signB*self.refSpeedTurn, speedFdbk_B)
	                
	                duty_cycleR = 100*(errRight/self.batteryMax)
	                duty_cycleL = 100*(errLeft/self.batteryMax)
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
                

                
                
        
