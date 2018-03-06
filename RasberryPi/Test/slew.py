class Slew: 

	def __init__(self,rate):
		self.rate = rate
		self.prev = 0

	def slewValue(value):
		if self.rate + prev < value:
			prev = self.rate + prev 
			return prev
		elif value < prev - self.rate
			prev = prev -self.rate
			return prev
		else:
			prev = value
			return value