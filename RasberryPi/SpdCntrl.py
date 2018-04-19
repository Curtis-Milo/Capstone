def driveSpdCntrl(self):
		time_prev= time.time()
		GPIO.output(self.MotorL,GPIO.LOW)
		GPIO.output(self.MotorR,GPIO.HIGH)
		wasBlocked = False
		self.slewRateRight.Reset(self.MinOutStrtR)
		self.slewRateLeft.Reset(self.MinOutStrtL)
		self.Pi_R.Reset()
		self.Pi_L.Reset()
		self.EncoderL.resetEncoderCount()
		self.EncoderR.resetEncoderCount()
		self.pwmRight.start(self.MinOutStrtR)
		self.pwmLeft.start(self.MinOutStrtL)
		time_elapse  = 0 
		prevT = time.time()
		try:
			self.checkForCircle.value =0 
			while not self.checkForCircle.value:
				notBlocked = True #self.UltraSonic.nothingBlocking()
				if wasBlocked and notBlocked:
					self.pwmRight.start(self.MinOutStrtR)
					self.pwmLeft.start(self.MinOutStrtL)
					wasBlocked = False

				while (time.time()-prevT) <self.MIN_DELTA:
					pass
					
				if notBlocked:
					delta_t = time.time() - time_prev
					time_elapse += delta_t
					time_prev = time.time()
					speedFdbk_L = self.EncoderL.getEncoderCount() /delta_t
					speedFdbk_R = self.EncoderR.getEncoderCount() /delta_t
					print "Encoder R: " + str(self.EncoderR.getEncoderCount()) + " Encoder L: " + str(self.EncoderL.getEncoderCount())
					#print "Speed L: " + str(speedFdbk_L) + " Speed R: " + str(speedFdbk_R)
					#print "Right "
					errRight = self.Pi_R.PI_Calc(self.refSpeedFrwdR, speedFdbk_R)
					#print "Left "
					errLeft = self.Pi_L.PI_Calc(self.refSpeedFrwdL, speedFdbk_L)
					#print "Error L: " + str(errLeft) + " Error R: " + str(errRight)
					#Calculating Percentage
					
					duty_cycleR = self.slewRateRight.slewValue(100.0*(errRight/self.batteryMax))
					duty_cycleL = self.slewRateLeft.slewValue(100.0*(errLeft/self.batteryMax))
					
					#limiting the duty cycles
					duty_cycleR = self.limit(duty_cycleR, self.MinOutStrtR,self.MaxOutStrtR)
					duty_cycleL = self.limit(duty_cycleL, self.MinOutStrtL,self.MaxOutStrtL)
					#print "Duty L: " + str(duty_cycleL) + " Duty R: " + str(duty_cycleR)
					
					self.pwmRight.ChangeDutyCycle(duty_cycleR)
					self.pwmLeft.ChangeDutyCycle(duty_cycleL)
				else:
					self.pwmRight.ChangeDutyCycle(0)
					self.pwmLeft.ChangeDutyCycle(0)
					wasBlocked = True
					print "blocked"

				self.EncoderL.resetEncoderCount()
				self.EncoderR.resetEncoderCount()
				prevT = time.time()
				
		except Exception as e:
			print(e)
			self.runEconderThread = False

		finally:
			self.pwmRight.stop()
			self.pwmLeft.stop()

