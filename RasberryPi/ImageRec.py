import numpy as np
import argparse
import cv2
import Math
#https://www.raspberrypi.org/documentation/usage/camera/python/README.md
#https://www.pyimagesearch.com/2014/07/21/detecting-circles-images-using-opencv-hough-circles/

class ImageRec():
    
    def __init__(self):
        self.camera = picamera.PiCamera()

        #CALS
        self.mid_x = 1920.0/2.0;
        self.mid_y = 1080.0/2.0;
        self.end_x = 1920*(0.8);
        self.end_y = 1080*(0.8);
        self.before_x = 1920*(0.2);
        self.before_y = 1080*(0.2);
        self.hist = 100.0;
    def captureImage(self):
        self.camera.capture('ceiling.jpg')

    def checkForCircle(self)
        # construct the argument parser and parse the arguments
        ap = argparse.ArgumentParser()
        ap.add_argument("-i", "--image", required = True, help = "ceiling.jpg")
        args = vars(ap.parse_args())
        # load the image, clone it for output, and then convert it to grayscale
        image = cv2.imread(args["image"])
        output = image.copy()
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        # detect circles in the image
        circles = cv2.HoughCircles(gray, cv2.cv.CV_HOUGH_GRADIENT, 1.2, 100)
         
    
        return circles
