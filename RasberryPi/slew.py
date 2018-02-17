class Slew: 
	def __init__(self,rate):
		self.rate = rate
		self.prev = 0

	def slewValue(self, value):
		if self.rate + self.prev < value:
			self.prev = self.rate + self.prev 
			return self.prev
		elif value < self.prev - self.rate:
			self.prev = self.prev -self.rate
			return self.prev
		else:
			self.prev = value
			return value