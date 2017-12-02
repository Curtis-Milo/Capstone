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
        self.mid_x = 1920/2.0;
        self.mid_y = 1080/2.0;
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
         
        # ensure at least some circles were found
        if circles is not None:
                # convert the (x, y) coordinates and radius of the circles to integers
                circles = np.round(circles[0, :]).astype("int")
         
                # loop over the (x, y) coordinates and radius of the circles
                for (x, y, r) in circles:
                    dist = ((self.mid_x -x)**2 + (self.mid_y -y)**2)**0.5
                    if  dist < self.hist:
                        return True
                        
         
        return False
