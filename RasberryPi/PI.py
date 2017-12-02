import time
class PI_Controller():

    def __init__(self,Kp,Ki):
        self.Kp =Kp
        self.Ki = Ki
        self.Integrator = 0
        self.t1 = time.time()

    def PI_Calc(self, ref, feedback):
        err =ref-feedback
        delta_t  = time.time()-self.t1
        self.Integrator = self.Integrator +self.err*delta_t
        self.t1 = time.time()
        return self.Kp*err + self.Integrator*self.Ki
    
