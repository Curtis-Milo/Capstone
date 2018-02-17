from Graph import *

class pathFindingTest:
	def __init__(self):
		home_num = 0
		table_num = 0
		information = open("map.txt", "r").read()
		self.tablesList = []
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
				self.map.add_node((j,i))

		for i in range(len(lines)):	
			chars = lines[i].strip().split(',')
			
			for j in range(len(chars)):
				cost = 1
				cur_Node = (j,i)
				#print chars[j] + str(cur_Node)
				#determining the starting and ending position
				if (chars[j] == "H"):
					#Setting the start position
					source = (j,i)
					home_num = home_num +1
				elif (chars[j] == "T"):
					self.tablesList.append(cur_Node)
					table_num = table_num+1

				elif (chars[j] == "X"):
					continue
			

				#creating the edges and adding them to the graphs
				
				if (0 < j): 
					prev = (j-1, i)
					passable = self.determinePassable(lines,prev,cur_Node)
					if passable:
						self.map.add_edge(cur_Node, prev, 1)

				if (j < len(chars) - 1):
					nextN =(j + 1, i)
					passable = self.determinePassable(lines,cur_Node,nextN)
					if passable:
						self.map.add_edge(cur_Node, nextN, 1)

				if (0 < i):
					prev = (j, i-1)
					passable = self.determinePassable(lines,prev,cur_Node)
					if passable:
						self.map.add_edge(cur_Node, prev, 1)
					
				if (i < len(lines) - 1):
					nextN =(j + 1, i)
					passable = self.determinePassable(lines,cur_Node,nextN)
					if passable:
						self.map.add_edge(cur_Node, nextN, 1)

	def determinePassable(self, lines, node1, node2):
		node1Char = lines[node1[1]].strip().split(',')[node1[0]].strip()
		node2Char = lines[node2[1]].strip().split(',')[node2[0]].strip()

		isT = node1Char == 'T' or node2Char == 'T'
		isX = node1Char == 'X' or node2Char == 'X'

		if isT or isX:
			return False
		else:
			return True

p =pathFindingTest()
currNode = (0,0)
visited, path = p.map.dijsktra(currNode)
node = p.tablesList[0]
nodesToTravel = []

while (node != currNode):
	nodesToTravel.insert(0,path[node]);
	node= path[node]

print nodesToTravel