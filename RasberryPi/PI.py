import time
class PI_Controller():

    def __init__(self,Kp,Ki):
        self.Kp =float(Kp)
        self.Ki = float(Ki)
        self.Integrator = float(0)
        self.t1 = time.time()

    def PI_Calc(self, ref, feedback):
        err =ref-feedback
        print "ref: " +str(ref) + " fdbk: " +str(feedback) +" Error: " + str(err)
        delta_t  = time.time()-self.t1
        self.Integrator = self.Integrator +err*delta_t
        self.t1 = time.time()
        return self.Kp*err + self.Integrator*self.Ki
    
    def Reset(self):
        self.Integrator =0
        self.t1 = time.time()
