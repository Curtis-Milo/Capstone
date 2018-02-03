class Order:
	def __init__(self, table_id, order_id):
		self.table_id = table_id
		self.order_id = order_id
		self.orders = []

	def getTableID():
		return self.table_id

	def viewOrders():
		return self.orders

	def addOrder(order):
		self.orders.push(order)

	def getNextOrder():
		self.orders.pop(order)

	def isDone():
		return len(self.orders) ==0