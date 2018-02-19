import unittest
from pathFindingTest import *
class pathFindingTestCases(unittest.TestCase):
	def setup(self):
		pass
	
	def test_1(self):
		p =pathFindingTest("maps/map_1.txt")
		currNode = (0,0)
		visited, path = p.map.dijsktra(currNode)
		node = p.tablesList[0]
		nodesToTravel = []
		for table in p.tablesList:
			nodes = []
			node = table
			while (node != currNode):
					nodes.insert(0,path[node]);
					node= path[node]
			nodes.pop(0)
			nodesToTravel.append(nodes)
			currNode=nodes[len(nodes)-1]
		self.assertEqual(str(nodesToTravel),"[[(0, 1)], [(1, 1), (1, 2)]]")

if __name__ == "__main__":
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(pathFindingTestCases)
    unittest.TextTestRunner().run(suite)
