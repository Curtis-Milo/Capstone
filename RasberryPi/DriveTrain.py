#http://www.instructables.com/id/Controlling-Direction-and-Speed-of-DC-Motor-Using-/
#https://www.sunfounder.com/learn/Super_Kit_V2_for_RaspberryPi/lesson-8-rotary-encoder-super-kit-for-raspberrypi.html
from Graph import *
import RPi.GPIO as GPIO
from time import *
from Encoder import *
import Math
class DriveTrain():
    def __init__(self):
        #encoder pins (TODO set pins)
        self.EncoderA = Encoder(7,8,9)
        self.EncoderB = Encoder(10,11,12)
	    self.circleChecker = ImageRec()
        self.UltraSonic = UltraSonic()
        #Motor H brige GPIO pins
        self.Motor1A = 02 # set GPIO-02 as Input 1 of the controller IC
        self.Motor1B = 03 # set GPIO-03 as Input 2 of the controller IC
        GPIO.setup(Motor1A,GPIO.OUT)
        GPIO.setup(Motor1B,GPIO.OUT)
        pwm=GPIO.PWM(04,100) # configuring Enable pin means GPIO-04 for PWM

        #CALS
        self.encoderCountsMin =100;
        self.countPerDeg = 0.001; #Need to look up
        self.refSpeedFrwd = 300*(Math.pi/30.0)
        self.refSpeedTurn = 100*(Math.pi/30.0)
        self.batteryMax = 18.0;
        self.PiA = PI_Controller(1,1)
        self.PiB = PI_Controller(1,1)
    

        
    def turn(self, angle_deg):
        time_prev= time()
        circlefound = False;
        GPIO.output(Motor1A,GPIO.HIGH)
        GPIO.output(Motor1B,GPIO.HIGH)
        TotalCount =0;
        pwm.start(0)
        while self.countPerDeg*TotalCount < angle_deg:
            while self.EncoderA.getEncoderCount() < self.encoderCountsMin:
                delta_t = time() = time_prev
                time_prev = time()
                speedFdbk_A = self.EncoderA.getEncoderCount() /delta_t
                speedFdbk_B = self.EncoderA.getEncoderCount() /delta_t

                err = self.PiA.PI_Calc(self.refSpeedTurn, speedFdbk_A)
                err = err + self.PiB.PI_Calc(self.refSpeedTurn, speedFdbk_B)
                err = err/2.0
                duty_cycle = 100*err/self.batteryMax)
                pwm.ChangeDutyCycle(duty_cycle)

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
                    err = self.PiA.PI_Calc(self.refSpeedFrwd, speedFdbk_A)
                    err = err + self.PiB.PI_Calc(self.refSpeedFrwd, speedFdbk_B)
                    err = err/2.0
                    duty_cycle = 100*(err/self.batteryMax)
                    pwm.ChangeDutyCycle(duty_cycle)
                else:
                    pwm.ChangeDutyCycle(0)

                self.circleChecker.captureImage()
                self.circleChecker.checkForCircle()
        pwm.stop()
                

                
                
        
