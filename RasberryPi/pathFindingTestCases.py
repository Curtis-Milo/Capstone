import unittest
from pathFindingTest import *
class pathFindingTestCases(unittest.TestCase):
	def setup(self):
		pass
	
##      2x4 matrix with 2 tables at (0,2) and (1,3)
##	H,0,T,X
##  X,0,0,T
	def test_1(self):
		p =pathFindingTest("maps/map_1.txt")
		currNode = (0,0)
		visited, path = p.map.dijsktra(currNode)
		node = p.tablesList[0]
		nodesToTravel = []
		for table in p.tablesList:
			nodes = []
			node = table
			visited, path = p.map.dijsktra(currNode)
			while (node != currNode):
					nodes.insert(0,path[node]);
					node= path[node]
			if(len(nodes) >1):
				nodes.pop(0)
			nodesToTravel.append(nodes)
			currNode=nodes[len(nodes)-1]
		self.assertEqual(str(nodesToTravel),"[[(0, 1)], [(0, 2), (1, 2)]]")


##	3x3 matrix with 2 tables at (0,1) and (1,1)
##      H,X,T
##      0,T,0
##      0,0,0
	def test_2(self):
		p =pathFindingTest("maps/map_2.txt")
		currNode = (0,0)
		visited, path = p.map.dijsktra(currNode)
		node = p.tablesList[0]
		nodesToTravel = []
		for table in p.tablesList:
			nodes = []
			node = table
			visited, path = p.map.dijsktra(currNode)
			while (node != currNode):
					nodes.insert(0,path[node]);
					node= path[node]
			if(len(nodes) >1):
				nodes.pop(0)
			nodesToTravel.append(nodes)
			currNode=nodes[len(nodes)-1]
		self.assertEqual(str(nodesToTravel),"[[(1, 0), (2, 0), (2, 1), (2, 2), (1, 2)], [(1, 2)]]")

##	3x3 matrix with 1 table at (0,2), testing to see if really takes shortest path
##      H,0,0
##      0,X,T
##      0,0,0
	def test_3(self):
		p =pathFindingTest("maps/map_3.txt")
		currNode = (0,0)
		visited, path = p.map.dijsktra(currNode)
		node = p.tablesList[0]
		nodesToTravel = []
		for table in p.tablesList:
			nodes = []
			node = table
			visited, path = p.map.dijsktra(currNode)
			while (node != currNode):
					nodes.insert(0,path[node]);
					node= path[node]
			if(len(nodes) >1):
				nodes.pop(0)
			nodesToTravel.append(nodes)
			currNode=nodes[len(nodes)-1]
		self.assertEqual(str(nodesToTravel),"[[(0, 1), (0, 2)]]")


##        4x5 matrix with 3 tables at (0,4),(2,3) and (3,0)
##        H,0,0,0,T
##        X,0,0,X,X
##        X,X,0,T,X
##        T,0,0,X,X
	def test_4(self):
		p =pathFindingTest("maps/map_4.txt")
		currNode = (0,0)
		visited, path = p.map.dijsktra(currNode)
		node = p.tablesList[0]
		nodesToTravel = []
		for table in p.tablesList:
			nodes = []
			node = table
			visited, path = p.map.dijsktra(currNode)
			while (node != currNode):
					nodes.insert(0,path[node]);
					node= path[node]
			if(len(nodes) >1):
				nodes.pop(0)
			nodesToTravel.append(nodes)
			currNode=nodes[len(nodes)-1]
		self.assertEqual(str(nodesToTravel),"[[(0, 1), (0, 2), (0, 3)], [(0, 2), (1, 2), (2, 2)], [(3, 2), (3, 1)]]")


##        2x3 matrix with 1 unreachable table. Expect failure
##        H,X,T
##        0,0,X
	def test_5(self):
		p =pathFindingTest("maps/map_5.txt")
		currNode = (0,0)
		visited, path = p.map.dijsktra(currNode)
		node = p.tablesList[0]
		nodesToTravel = []
		for table in p.tablesList:
			nodes = []
			node = table
			visited, path = p.map.dijsktra(currNode)
			while (node != currNode):
					try:
						nodes.insert(0,path[node]);
						node= path[node]
					except KeyError:
						raise KeyError("could not reach table")
			if(len(nodes) >1):
				nodes.pop(0)
			nodesToTravel.append(nodes)
			currNode=nodes[len(nodes)-1]
		self.fail("table is not reachable")


##        4x6 matrix with 3 tables at (0,5),(1,1),(2,5)
##        H,X,0,0,0,T
##        0,T,0,0,X,X
##        0,0,0,X,0,T
##        X,X,0,0,0,X

	def test_6(self):
		p =pathFindingTest("maps/map_6.txt")
		currNode = (0,0)
		visited, path = p.map.dijsktra(currNode)
		node = p.tablesList[0]
		nodesToTravel = []
		for table in p.tablesList:
			nodes = []
			node = table
			visited, path = p.map.dijsktra(currNode)
			while (node != currNode):
					try:
						nodes.insert(0,path[node]);
						node= path[node]
					except KeyError:
						raise KeyError("could not reach table")
			if(len(nodes) >1):
				nodes.pop(0)
			nodesToTravel.append(nodes)
			currNode=nodes[len(nodes)-1]
		self.assertEqual(str(nodesToTravel),"[[(1, 0), (2, 0), (2, 1), (2, 2), (1, 2), (1, 3), (0, 3), (0, 4)], [(0, 3), (1, 3), (1, 2)], [(2, 2), (3, 2), (3, 3), (3, 4), (2, 4)]]")

##        TEST EXPECTED TO FAIL, BUG FIX TO BE IMPLEMENTED. PATH SHOWS ROBOT GOING THROUGH TABLES INSTEAD OF EMPTY PATH.
##        5X10 matrix with 6 tables at (0,6),(0,9),(1,5),(1,8),(1,9),(2,1)
##        H,0,X,X,0,0,T,0,0,0,T
##        0,0,X,0,X,T,0,0,T,0,T
##        0,T,X,0,X,0,X,0,X,X,0
##        0,X,0,0,0,0,0,0,X,X,X
##        0,0,0,X,X,X,X,0,0,0,X
	def test_7(self):
		p =pathFindingTest("maps/map_7.txt")
		currNode = (0,0)
		visited, path = p.map.dijsktra(currNode)
		node = p.tablesList[0]
		nodesToTravel = []
		for table in p.tablesList:
			nodes = []
			node = table
			visited, path = p.map.dijsktra(currNode)
			while (node != currNode):
					try:
						nodes.insert(0,path[node]);
						node= path[node]
					except KeyError:
						raise KeyError("could not reach table")
			if(len(nodes) >1):
				nodes.pop(0)
			nodesToTravel.append(nodes)
			currNode=nodes[len(nodes)-1]
		self.assertEqual(str(nodesToTravel),"[[(1, 0), (2, 0), (3, 0), (4, 0), (4, 1), (4, 2), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), 
			(3, 7), (2, 7), (1, 7), (0, 7)], [(0, 8), (0, 9)], [(1, 9)], [], [(0, 9), (0, 8), (0, 7), (1, 7), (1, 6)], [(1, 7), (2, 7), (3, 7), (3, 6), (3, 5), (3, 4), (3, 3), (3, 2), (4, 2), (4, 1), (4, 0), (3, 0), (2, 0)]]")

	

if __name__ == "__main__":
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(pathFindingTestCases)
    unittest.TextTestRunner().run(suite)
