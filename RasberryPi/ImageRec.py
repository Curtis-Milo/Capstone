import numpy as np
import argparse
import cv2
import math
import picamera
#https://www.raspberrypi.org/documentation/usage/camera/python/README.md
#https://www.pyimagesearch.com/2014/07/21/detecting-circles-images-using-opencv-hough-circles/
Global_Camera = picamera.PiCamera()
class ImageRec():
	
	def __init__(self):
		#CALS
		self.mid_x = 1920.0/2.0
		self.mid_y = 1080.0/2.0
		self.end_x = 1920*(0.8)
		self.end_y = 1080*(0.8)
		self.before_x = 1920*(0.2)
		self.before_y = 1080*(0.2)
		self.hist = 100.0
		self.imgCounter=0

	def captureImage(self):
		Global_Camera.capture('images/ceiling'+str(self.imgCounter)+'.jpg')
		self.imgCounter +=1

	def checkForCircle(self):

		original = cv2.imread('images/ceiling'+str(self.imgCounter)+'.jpg', cv2.CV_LOAD_IMAGE_GRAYSCALE)
		retval, image = cv2.threshold(original, 50, 255, cv2.cv.CV_THRESH_BINARY)

		el = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
		image = cv2.dilate(image, el, iterations=6)

		cv2.imwrite("dilated.png", image)

		contours, hierarchy = cv2.findContours(
			image,
			cv2.cv.CV_RETR_LIST,
			cv2.cv.CV_CHAIN_APPROX_SIMPLE
		)

		drawing = cv2.imread('images/ceiling'+str(self.imgCounter)+'.jpg')

		circles = []
		for contour in contours:
			area = cv2.contourArea(contour)

			# there is one contour that contains all others, filter it out
			if area > 500:
				continue

			br = cv2.boundingRect(contour)

			m = cv2.moments(contour)
			center = [int(m['m10'] / m['m00']), int(m['m01'] / m['m00']),br[2]]
			circles.append(center)

		return circles

	def test(self):
		print "Capturing Image... "
		#i = ImageRec()
		#i.captureImage()
		circles = self.checkForCircle()

		if circles is not None:
			# convert the (x, y) coordinates and radius of the circles to integers
	 
			# loop over the (x, y) coordinates and radius of the circles
			for (x, y, r) in circles:
				print "Circle At: " + str(x) +", "+ str(y)
				print "Radius of: " + str(r)