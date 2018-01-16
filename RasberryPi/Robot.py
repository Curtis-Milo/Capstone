from Graph import *
from DriveTrain import *
import serial
import Math
import time
class Robot():
    def __init__(self):
        self.drivetrain = DriveTrain();
        GetMap();
        self.currAngle = 0
        self.toOrder = "Base"
        self.order = None
        self.errors = 0
        self.time = 0
        self.timeoutCal = 1000

        self.tablesList ={};
        
        self.statesEnum= {"WaitingForRequest":0,
                          "RecevingMap":1,
                          "TimeoutError":2,
                          "Driving":3,
                          "Pumping":4}

        self.state= "WaitingForRequest"

    def main():
          try:
            while 1:
                determineState()
                perfomAction()
        except KeyboardInterrupt:
            print "cancelled"

            
    def determineState():
        if (self.statesEnum[self.state] ==0):
            if self.order == None and self.time < self.timeoutCal:
                self.state = "WaitingForRequest"
            elif  self.order == None:
                self.state = "TimeoutError"
                self.time = 0
            else:
                self.state = "RecevingMap"
                self.time = 0
                
        elif(self.statesEnum[self.state] ==1):
            if self.map == None and self.time < self.timeoutCal:
                self.state = "RecevingMap"
            elif  self.map == None:
                self.state = "TimeoutError"
                self.time = 0
            else:
                self.state = "RecevingMap"
        elif self.statesEnum[self.state] ==2:
            if self.timeoutCal < self.time:
                self.state = "WaitingForRequest"
                self.time = 0
            else:
                self.state = "TimeoutError"
                
        elif(self.statesEnum[self.state] ==3):
            if self.errors == 0:
                self.state = "Pumping"
            else:
                self.state = "WaitingForRequest"
                self.time = 0
                
        elif(self.statesEnum[self.state] ==4):
            if self.errors == 0:
                self.state = "WaitingForRequest"
            else:
                self.state = "WaitingForRequest"
                self.time = 0
                
    def perfomAction():
        if self.statesEnum[self.state] ==0:
            self.getOrder()
        elif self.statesEnum[self.state] ==1:
            self.getMap()
        elif self.statesEnum[self.state] ==2:
            time.sleep(100)
            self.sleepTime += 100
        elif self.statesEnum[self.state] ==3:
            self.errors = self.errors| self.drivetrain.driveToLocation(self.toOrder)
        elif self.statesEnum[self.state] ==4:
            self.communicateToArduino()
            
    def getMap(self):
        home_num = 0
        table_num = 0
        information = open("map.txt", "r")

        self.map = Graph()
	#used to determine the previous line size
        pos = 0
        lines = information.split('\n')
	#Used so we done inflate memory like crazy with replicas of the same object
        height = len(lines)
        for i in range(len(lines)):
            chars = lines[i].split(',')
            if (i == 0):
                width = len(chars)

            for j in range(len(chars)):
                graph.add_node((j,i))


        for i in range(len(lines)):	
            chars = lines[i].split(',')
            
            for j in range(len(chars)):
                cost = 1
                cur_Node = (j,i)
                #determining the starting and ending position
                if (chars[j] == "H" or chars[j] == "H\r"):
                    #Setting the start position
                    source = (j,i)
                    home_num = home_num +1
                elif (chars[j] == "T" or chars[j] == "T\r"):
                    self.tablesList[table_num] = (j,i)
                    table_num = table_num+1

                elif (chars[j] == "X" or chars[j] == "X\r"):
                    cost = float("inf")
			

		#creating the edges and adding them to the graphs
                if (0 < j): 
                    prev = (j-1, i)
                    self.map.add_edge(cur_Node, prev, cost)
                if (j < len(chars) - 1):
                    nextN =(j + 1, i)
                    self.map.add_edge(cur_Node, nextN, cost)
                if (0 < i):
                    prev = (j, i-1)
                    self.map.add_edge(cur_Node, prev, cost)
                if (i < lines.size() - 1):
                    nextN =(j + 1, i)
                    self.map.add_edge(cur_Node, nextN, cost)


        
    def getOrder(self):
        print "TODO get order"
        

 
        
    def communicateToArduino(self):
        #https://oscarliang.com/raspberry-pi-and-arduino-connected-serial-gpio/
        ser = serial.Serial('/dev/ttyAMA0', 9600, timeout=1)
        ser.open()
        bitdone = 0
        try:
            while !bitdone or self.errors:
                ser.write(self.order.toString())
                response = ser.readline()
                bitdone = response&0x00000001
                self.errors = self.errors| response>>2
        except KeyboardInterrupt:
            ser.close()

 


 
robot = Robot()
robot.main()
		
			
