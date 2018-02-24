class Slew: 
	def __init__(self,rate,minV=0):
		self.rate = rate
		self.prev = minV

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

	def Reset(self,prev):
		self.prev = prev