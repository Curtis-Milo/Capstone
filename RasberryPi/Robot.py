from Graph import *
from DriveTrain import *
import serial
import math
import time
from lib.lib import *
from server import *
from Order import *
import sys, os
import json

class Robot():
	def __init__(self, d):
		self.drivetrain = DriveTrain();
		self.order = None
		self.errors = 0
		self.time = 0
		self.timeoutCal = 10
		self.sleepTime =0
		self.tablesList ={}
		self.donePumping = False
		self.statesEnum= {"WaitingForRequest":0,
						  "RecevingMap":1,
						  "TimeoutError":2,
						  "Driving":3,
						  "Pumping":4}

		self.state= "WaitingForRequest"
		self.map = None
		self.d = d

	def main(self):
		while 1:
			self.determineState()
			self.perfomAction()
		

			
	def determineState(self):
		print self.state
		if (self.statesEnum[self.state] ==0):
			if self.order != None and self.time < self.timeoutCal:
				self.state = "RecevingMap"
			elif  self.order == None and self.timeoutCal <=self.time:
				self.state = "TimeoutError"
				self.time = 0
			else:
				self.state = "WaitingForRequest"
				self.time = 0
				
		elif(self.statesEnum[self.state] ==1):
			if self.map != None:
				self.state = "Driving"
			elif self.timeoutCal <= self.time:
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
			if self.donePumping:
				self.state = "WaitingForRequest"
			else:
				self.state = "Pumping"
				self.time = 0
				
	def perfomAction(self):
		if self.statesEnum[self.state] ==0:
			self.getOrder()
		elif self.statesEnum[self.state] ==1:
			self.getMap()
		elif self.statesEnum[self.state] ==2:
			time.sleep(1)
			self.sleepTime += 1
		elif self.statesEnum[self.state] ==3:
			table_ID =  self.order.getTableID()
			timeOutErrors = self.drivetrain.driveToLocation(self.map,self.tablesList, table_ID)
			self.errors = self.errors| timeOutErrors
			if timeOutErrors:
				sendErrorCode(self.d, self.errors)
				raise Exception

		elif self.statesEnum[self.state] ==4:
			self.communicateToArduino()
			self.donePumping = 1
			if (self.errors):
				sendErrorCode(self.d, self.errors)
				raise Exception
	
	def determinePassable(self, lines, node1, node2):
		
		node1Char = lines[node1[0]].strip().split(',')[node1[1]].strip()
		node2Char = lines[node2[0]].strip().split(',')[node2[1]].strip()
		isT =  node1Char == 'T' or node2Char == 'T'
		isX = node1Char == 'X' or node2Char == 'X'

		if isX:
			return False, False
		elif isT:
			return False,True
		else:
			return True, False

	def getMap(self):
		home_num = 0
		table_num = 0
		readInMap(self.d)
		information = open("map.txt", "r").read()

		self.tablesList = []
		self.map = Graph()
		#used to determine the previous line size
		pos = 0
		lines = information.split('\n')
		lines.pop(0)
		#Used so we dont inflate memory like crazy with replicas of the same object
		height = len(lines)
		for i in range(len(lines)):
			
			chars = lines[i].split(',')
			if (i == 0):
				width = len(chars)
			for j in range(len(chars)):
				self.map.add_node((i,j))

		for i in range(len(lines)):	
			chars = lines[i].strip().split(',')
			
			for j in range(len(chars)):
				
				cost = 1
				cur_Node = (i,j)
				#print chars[j] + str(cur_Node)
				#determining the starting and ending position
				if (chars[j] == "H"):
					#Setting the start position
					source = (i,j)
					home_num = home_num +1
				elif (chars[j] == "T"):
					#print cur_Node
					self.tablesList.append(cur_Node)
					table_num = table_num+1

				elif (chars[j] == "X"):
					continue

				#creating the edges and adding them to the graphs
				if (0 < j): 
					prev = (i,j-1)

					passable,table = self.determinePassable(lines,prev,cur_Node)
					if passable and not table:
						self.map.add_edge(cur_Node,prev, 1)
					elif table and not passable:
						self.map.add_edge(cur_Node,prev,float("inf"))
						
				if (j < len(chars)-1):
					nextN =(i,j+1)
					passable, table = self.determinePassable(lines,cur_Node,nextN)
					if passable and not table:
						self.map.add_edge(cur_Node, nextN, 1)
					elif table and not passable:
						self.map.add_edge(cur_Node, nextN, float("inf"))

				if (0 < i):
					prev = (i-1,j)
					#print "Node ", str(cur_Node), '->',str(prev),' = ', passable
					passable, table = self.determinePassable(lines,prev,cur_Node)
					if passable and not table:
						self.map.add_edge(cur_Node, prev,1)
					elif table and not passable:
						self.map.add_edge( cur_Node,prev, float("inf"))
						
				if (i < len(lines)-1):
					nextN =(i+1,j)
					passable, table= self.determinePassable(lines,cur_Node,nextN)
					if passable and not table:
						self.map.add_edge(cur_Node, nextN, 1)
					elif table and  not passable:
						self.map.add_edge(cur_Node, nextN, float("inf"))



		
	def getOrder(self):
		orderRaw =reqNextOrder(self.d) 
		
		#orderRaw ={"table_id": "2",
		#"order_id": 1,
		#"order":({
		#"type": "FAKEDRANK",
		#"tank_num": 0,
		#"size": "M",
		#"quantity": 3},	{
		#"type": "WATER",
		#"tank_num": 2,
		#"size": "M",
		#"quantity": 5})}
		print "ORDER_RAW:"
		print orderRaw
		if (orderRaw == None):
			self.order = None
		else:
			self.order = Order(int(orderRaw["table_id"])-1,orderRaw["order_id"])
			ordersList = orderRaw["order"]
			for x in range(len(ordersList)):
				for y in range(int(ordersList[x]['quantity'])):
					self.order.addOrder(ordersList[x]["tank_num"])

 
		
	def communicateToArduino(self):
		#https://oscarliang.com/raspberry-pi-and-arduino-connected-serial-gpio/
		bitdone = 0
		toArduino = ""
		while  not self.order.isDone():
			toArduino += "d" + str(self.order.getNextOrder())

		toArduino+="x"
		print "Sending "+ toArduino
		ser=serial.Serial(

		port='/dev/ttyUSB0',
		baudrate=9600,
		parity=serial.PARITY_NONE,
		stopbits=serial.STOPBITS_ONE,
		bytesize=serial.EIGHTBITS,
		timeout=1
		)
		sleep(5)

		done =ser.write(toArduino)
		while bitdone != 1:
			inData = ser.read()
			print inData
			if inData == '':
				continue
			input_number = ord(inData)-48
		
			if inData != '!':
				self.errors = self.errors| input_number
			else:
				bitdone =1

try:
	roboServer = Server()
	d = roboServer.startServer()
	robot = Robot(d)
	robot.main()
except Exception as e:
 	exc_type, exc_obj, exc_tb = sys.exc_info()
 	fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
 	print(exc_type, fname, exc_tb.tb_lineno)
 	print(e.message)
 	robot.drivetrain.destroy()
 	roboServer.stopServer()
 	GPIO.cleanup()
