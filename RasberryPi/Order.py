class Order:
	def __init__(self, table_id, order_id):
		self.table_id = table_id
		self.order_id = order_id
		self.orders = []

	def getTableID(self):
		return self.table_id

	def viewOrders(self):
		return self.orders

	def addOrder(self,order):
		self.orders.append(order)

	def getNextOrder(self):
		return self.orders.pop(0)

	def isDone(self):
		return len(self.orders) ==0