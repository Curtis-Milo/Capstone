import numpy as np
import argparse
import cv2
import math
import picamera
#https://www.raspberrypi.org/documentation/usage/camera/python/README.md
#https://www.pyimagesearch.com/2014/07/21/detecting-circles-images-using-opencv-hough-circles/

class ImageRec():
    
    def __init__(self):
        self.camera = picamera.PiCamera()

        #CALS
        self.mid_x = 1920.0/2.0
        self.mid_y = 1080.0/2.0
        self.end_x = 1920*(0.8)
        self.end_y = 1080*(0.8)
        self.before_x = 1920*(0.2)
        self.before_y = 1080*(0.2)
        self.hist = 100.0

    def captureImage(self):
        self.camera.capture('ceiling.jpg')

    def checkForCircle(self):
        img = cv2.imread('ceiling.jpg',0)
        # detect circles in the image
        circles = cv2.HoughCircles(img, cv2.cv.CV_HOUGH_GRADIENT, 1.2, 100)
        return circles

print "Capturing Image... "
i = ImageRec()
i.captureImage()
circles = i.checkForCircle()

if circles is not None:
    # convert the (x, y) coordinates and radius of the circles to integers
    circles = np.round(circles[0, :]).astype("int")
             
    # loop over the (x, y) coordinates and radius of the circles
    for (x, y, r) in circles:
        print "Circle At: " + str(x) +", "+ str(y)
        print "Radius of: " + str(r)