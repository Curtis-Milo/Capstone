%https://www.edmundoptics.com/resources/application-notes/imaging/understanding-focal-length-and-field-of-view/
%https://www.raspberrypi.org/documentation/hardware/camera

classdef FieldOfView
   properties
      robot_h
      height_room
   end
   methods
    %Constructor to define constants
    function this = FieldOfView()
        this.robot_h = 27; %in inches
        this.height_room = 8*12;%in inches
    end
    %% Calculates the nessary angle
    function AFOV = Calc_AFOV(this, HFOV, WD)
        AFOV = 2*atan(HFOV/(2*WD))*(180/pi);
    end


    %% Calculates the horizontal field of view
    function HFOV = Calc_HFOV(this, AFOV, WD)
        HFOV = 2*WD*tan(AFOV/2);
    end

    %% Preforms an example calculation for field of view angle
    function PreformCalc_AFOV(this)
        HFOV = 1; %desired horizontal field of view
        WD  = (this.height_room-this.robot_h)*0.0254;

        Calc_AFOV(HFOV, WD )
    end

    %%  Preforms an example calculation for horizontal field of view
    function PreformCalc_HFOV(this)
        this.robot_h = 27; %in inches
        this.height_room = 8*12;%in inches
        AFOV = 62.2*(pi/180);
        WD  = (this.height_room-this.robot_h)*0.0254;

        Calc_HFOV(AFOV, WD )
    end
   end
end
