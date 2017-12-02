from Graph import *
from DriveTrain import *
import serial
class Robot():
    def __init__(self):
        self.drivetrain = DriveTrain();
        GetMap();
        self.toOrder = "Base"
        self.currNode ="Base"
        self.Mode = "Get Order"
        
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
                height = len(chars)

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
                    goal = (j,i)
                    table_num = table_num+1

                elif (chars[j] == "X" or chars[j] == "X\r"):
                    cost = float("inf")
			

		#creating the edges and adding them to the graphs
                if (0 < j): 
                    prev = (j-1,i)
                    self.map.add_edge(cur_Node, prev, cost)
                if (j < len(chars) - 1):
                    nextN =(j + 1, i)
                    self.map.add_edge(cur_Node, nextN, cost)
                if (0 < i):
                    prev = (j,i-1)
                    self.map.add_edge(cur_Node, prev, cost)
                if (i < lines.size() - 1):
                    nextN =(j + 1, i)
                    self.map.add_edge(cur_Node, nextN, cost)


    def getOrder(self):
        print "TODO get order"
        

    def driveToLocation(self,toNode):
        visited, path = self.map.dijsktra(self.currNode)
        node = toNode
        nodesToTravel = []
        while (node != self.currNode):
            nodesToTravel.insert(0,path[node]);
            node= path[node]

        prev =self.currNode
        for nextNode in nodesToTravel:
            this.drivetrain.turn(self.map.angles[(prev, nextNode)])
            this.drivetrain.drive(self.map.distances[(prev, nextNode)])
            prev = nextNode
            
        self.currNode = toNode
            
        
    def communicateToArduino(self):
        #https://oscarliang.com/raspberry-pi-and-arduino-connected-serial-gpio/
        ser = serial.Serial('/dev/ttyAMA0', 9600, timeout=1)
        ser.open()

        ser.write("d0x")
        try:
            while 1:
                response = ser.readline()
                print response
        except KeyboardInterrupt:
            ser.close()

    def preformAction(self):

        if self.Mode == "Get Order":
            getOrder(self)
        elif self.Mode == "Drive":
            driveToLocation(self,self.toNode)
        elif self.Mode == "Pour":
            communicateToArduino(self)


##MAIN 
robot = Robot()
while 1:
    robot.preformAction()
		
			
