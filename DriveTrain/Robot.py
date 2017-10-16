from Graph import *
from DriveTrain import *
class Robot():
    def __init__(self):
        this.drivetrain = DriveTrain();
        GetMap();
        self.toOrder = "Base"
        self.currNode ="Base"
        
def getMap(self):
    f = open("Map.txt","r")
    lines= f.readlines()
    self.map =  Graph()
    for l in lines[0].split(","):
        self.map.add_node(l)

    for l in lines[1:]:
        from_node, to_node, distance, angle = l.split(",")
        self.map.add_edge(from_node, to_node, distance, angle)


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
            
        

    
