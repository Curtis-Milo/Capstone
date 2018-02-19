from Graph import *

class pathFindingTest:
	def __init__(self,pathToMap):
		home_num = 0
		table_num = 0
		information = open(pathToMap, "r").read()
		self.tablesList = []
		self.map = Graph()
	#used to determine the previous line size
		pos = 0
		lines = information.split('\n')
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
				
##				print chars
				
				if (0 < j): 
					prev = (i,j-1)
					table,passable = self.determinePassable(lines,prev,cur_Node)
					if passable and not table:
						self.map.add_edge(prev,cur_Node, 1)
					elif table and not passable:
						self.map.add_edge(prev, cur_Node,float("inf"))
						
				if (j < len(chars)):
					nextN =(i,j)
					table, passable = self.determinePassable(lines,cur_Node,nextN)
					if passable and not table:
						self.map.add_edge(cur_Node, nextN, 1)
					elif table and not passable:
						self.map.add_edge(cur_Node, nextN, float("inf"))

				if (0 < i):
					prev = (i-1,j)
					table, passable = self.determinePassable(lines,prev,cur_Node)
					if passable and not table:
						self.map.add_edge(prev, cur_Node, 1)
					elif table and not passable:
						self.map.add_edge(prev, cur_Node, float("inf"))
						
				if (i < len(lines)):
					nextN =(i,j)
					table, passable = self.determinePassable(lines,cur_Node,nextN)
					if passable and not table:
						self.map.add_edge(cur_Node, nextN, 1)
					elif table and  not passable:
						self.map.add_edge(cur_Node, nextN, float("inf"))


	def determinePassable(self, lines, node1, node2):
		
		node1Char = lines[node1[0]].strip().split(',')[node1[1]].strip()
		node2Char = lines[node2[0]].strip().split(',')[node2[1]].strip()

		
		isT = node2Char == 'T'
		isX = node1Char == 'X' or node2Char == 'X'

		if isX:
			return False, False
		elif isT:
			return False,True
		else:
			return True, False

       
##
##p =pathFindingTest("maps/map_2.txt")
##currNode = (0,0)
##visited, path = p.map.dijsktra(currNode)
##node = p.tablesList[0]
##nodesToTravel = []
##for table in p.tablesList:
##	nodes = []
##	node = table
##	visited, path = p.map.dijsktra(currNode)
##	while (node != currNode):
##			nodes.insert(0,path[node]);
##			node= path[node]
##	nodesToTravel.append(nodes)
##	currNode=nodes[len(nodes)-1]
##	if(len(nodes) >1):
##		nodes.pop(0)
##	print table, nodesToTravel
