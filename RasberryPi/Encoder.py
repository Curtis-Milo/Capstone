import RPi.GPIO as GPIO
from time import sleep
class Encoder():
    def __init__(self,RoAPin,RoBPin,RoSPin):
        #encoder pins (TODO set pins)
        self.RoAPin  = RoAPin
        self.RoBPin  = RoBPin
        self.RoSPin = RoSPin
        

        GPIO.setmode(GPIO.BOARD)       # Numbers GPIOs by physical location
        GPIO.setup(elf.MotorA_RoAPin , GPIO.IN)    # input mode
        GPIO.setup(elf.MotorA_RoBPin , GPIO.IN)
        GPIO.setup(RoSPin,GPIO.IN,pull_up_down=GPIO.PUD_UP)

        self.encoderCount= 0
        self.flag = 0
        self.Last_RoB_Status = 0
        self.Current_RoB_Status = 0
        self.rotaryClear()


    def rotaryDeal():
        self.Last_RoB_Status = GPIO.input(RoBPin)
        while(not GPIO.input(RoAPin)):
            self.Current_RoB_Status = GPIO.input(RoBPin)
            self.flag = 1
        if self.flag == 1:
            self.flag = 0
            if (self.Last_RoB_Status == 0) and (self.Current_RoB_Status == 1):
                self.encoderCount = self.encoderCount + 1
                if (self.Last_RoB_Status == 1) and (self.Current_RoB_Status == 0):
                    self.encoderCount = self.encoderCount - 1


    def getEncoderCount():
        return self.encoderCount
    def clear(self):
        globalCounter = 0
